package com.resume.analyzer.services;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resume.analyzer.controller.OllamaInterface;
import static com.resume.analyzer.utilities.Prompts.OLLAMA_RESUME_ANALYSIS_PROMPT;
import static com.resume.analyzer.utilities.Prompts.OLLAMA_RESUME_REWRITE_PROMPT;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class OllamaServices implements OllamaInterface {

	private final ChatClient ollamaChatClient;
	private final MessageWindowChatMemory chatMemory;
	private final ExecutorService executor;
	private final ObjectMapper objmapper;

	public OllamaServices(@Autowired @Qualifier("ollama") ChatClient ollamaChatClient,
			@Autowired MessageWindowChatMemory chatMemory, @Autowired ExecutorService executor,
			@Autowired ObjectMapper objmapper) {
		this.ollamaChatClient = ollamaChatClient;
		this.chatMemory = chatMemory;
		this.executor = executor;
		this.objmapper = objmapper;
	}

	@Override
	public String chat(Map<String, String> body) {

		String prompt = body.get("message");
		String conversationId = body.get("conversationId");
		if (prompt == null || prompt.isBlank()) {
			return "Error: message is required";
		}
		if (conversationId == null || conversationId.isBlank()) {
			return "Error: conversationId is required for chat history";
		}
		try {
			Future<String> future = executor.submit(() -> {
				log.info("Started at: {}", System.currentTimeMillis());
				String response = ollamaChatClient.prompt().user(prompt)
						.advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId)).call().content();
				log.info("Ended at: {}", System.currentTimeMillis());
				return response;
			});
			return future.get(60, TimeUnit.SECONDS);
		} catch (Exception e) {
			log.error("Chat failed", e);
			return "Error: " + e.getMessage();
		}
	}

	@Override
	public String analyze(MultipartFile multipartFile, String jobDesc) throws Exception {
		String finalResp = null;
		try {
			String conversationId = UUID.randomUUID().toString();
			log.info("Started Time in Milliseconds: " + System.currentTimeMillis());
			Map<String, String> result = new ConcurrentHashMap<>();
			String extractedText;
			try (InputStream inputStream = multipartFile.getInputStream();
					XWPFDocument document = new XWPFDocument(inputStream);
					XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
				extractedText = extractor.getText();
			} catch (IOException e) {
				log.info("" + multipartFile.getOriginalFilename());
				throw new IOException("Failed to extract text from Word file", e);
			}
			Future<?> futureReview = executor.submit(() -> {
				try {
					log.info("Started p1: " + System.currentTimeMillis());
					String prompt = OLLAMA_RESUME_ANALYSIS_PROMPT.replace("{JOB_DESCRIPTION}", jobDesc)
							.replace("{RESUME}", extractedText);
					String resp = ollamaChatClient.prompt().user(prompt)
							.advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId)).call().content();
					result.put("HonestReview", objmapper.writeValueAsString(resp));
					log.info("Ended p1: " + System.currentTimeMillis());
				} catch (JsonProcessingException e) {
					e.printStackTrace();
				}
			});
			Future<?> futureSuggestion = executor.submit(() -> {
				try {
					log.info("Started p3: " + System.currentTimeMillis());
					String prompt2 = OLLAMA_RESUME_REWRITE_PROMPT.replace("{JOB_DESCRIPTION}", jobDesc)
							.replace("{RESUME}", extractedText);
					String resp2 = ollamaChatClient.prompt().user(prompt2)
							.advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId)).call().content();
					result.put("Suggestions", objmapper.writeValueAsString(resp2));

					log.info("Ended p3: " + System.currentTimeMillis());
				} catch (JsonProcessingException e) {
					e.printStackTrace();
				}
			});
			futureReview.get(120, TimeUnit.SECONDS);
			futureSuggestion.get(120, TimeUnit.SECONDS);
			result.put("conversationId", conversationId);

			log.info("Ended Time in Milliseconds" + System.currentTimeMillis());
			finalResp = objmapper.writeValueAsString(result);
		} catch (Exception e) {
			log.error("Analysis failed", e);
			Map<String, String> errorMap = new HashMap<>();
			errorMap.put("error", e.getMessage());
			return objmapper.writeValueAsString(errorMap);
		}
		return finalResp;
	}

	@Override
	public void clear(Map<String, String> body) throws Exception{
		try {
			log.info("Started Time in Milliseconds: " + System.currentTimeMillis());
			String conversationId = body.get("conversationId");
			if (conversationId == null || conversationId.isBlank()) {
				log.warn("Clear called without conversationId");
				return;
			}
			chatMemory.clear(conversationId);
			log.info("Ended : " + System.currentTimeMillis());
		}  catch (Exception e) {
			log.error("Exception when clearing chat: "+ e.getLocalizedMessage(), e);
			throw e;
		}
	}
}
