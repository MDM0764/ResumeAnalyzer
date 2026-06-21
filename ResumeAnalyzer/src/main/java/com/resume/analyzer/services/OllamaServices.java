package com.resume.analyzer.services;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resume.analyzer.controller.OllamaInterface;
import com.resume.analyzer.utilities.LlmUtilities;

import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
public class OllamaServices implements OllamaInterface {
	
	private final ChatClient ollamaChatClient;
	private final InMemoryChatMemoryRepository chatMemory;
	private final ExecutorService executor;
	private final ObjectMapper objmapper;

	public OllamaServices(@Autowired @Qualifier("ollama") ChatClient ollamaChatClient,
			@Autowired InMemoryChatMemoryRepository chatMemory
			, @Autowired ExecutorService executor
			, @Autowired ObjectMapper objmapper) {
		this.ollamaChatClient = ollamaChatClient;
		this.chatMemory = chatMemory;
		this.executor = executor;
		this.objmapper = objmapper;

	}
	
	@Override
	public String chat(Map<String, String> body) {

		String prompt = body.get("message");
		if (prompt == null || prompt.isBlank()) {
			return "Error: message is required";
		}
		try {
			// Use a Callable<String> instead of Runnable
			Future<String> future = executor.submit(() -> {
				log.info("Started at: {}", System.currentTimeMillis());
				String response = ollamaChatClient.prompt().user(prompt).call().content();
				log.info("Ended at: {}", System.currentTimeMillis());
				log.info("Response: {}", response);
				return response;
			});
			// Block with a timeout to avoid indefinite hangs
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
			log.info("" + multipartFile.getOriginalFilename());
			log.info("jobDesc " + jobDesc);
			log.info("Started Time in Milliseconds: " + System.currentTimeMillis());
			Map<String, String> result = new ConcurrentHashMap<>();
			String extractedText;
			try (InputStream inputStream = multipartFile.getInputStream();
					XWPFDocument document = new XWPFDocument(inputStream);
					XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
				extractedText = extractor.getText();
			} catch (IOException e) {
				e.printStackTrace();
				throw new IOException("Failed to extract text from Word file", e);
			}
			Future<?> futureReview = executor.submit(() -> {
				try {
					log.info("Started p1: " + System.currentTimeMillis());
					String prompt = " Act as a recruiter for given job description role. Review my resume highlight weak areas, overused buzzwords, and missing metrics. Be brutally honest. :\n\n "
							+ extractedText + "\n\n JobDescription " + jobDesc;
					String resp = ollamaChatClient.prompt().user(prompt).call().content();
					log.info("RAW: " +resp);
					result.put("HonestReview", objmapper.writeValueAsString(LlmUtilities.extractTextContent(resp)));
					log.info("Ended p1: " + System.currentTimeMillis() + result.get("HonestReview"));
				} catch (JsonProcessingException e) {
					e.printStackTrace();
				}
			});
			Future<?> futureSuggestion = executor.submit(() -> {
				try {
					log.info("Started p3: " + System.currentTimeMillis());
					String prompt2 = "Suggest Changes for my resume for making it more compliant with the job description."
							+ extractedText + "\n\n JobDescription " + jobDesc;
					String resp2 = ollamaChatClient.prompt().user(prompt2).call().content();
					log.info("RAW2: " +resp2);
					result.put("Suggestions", objmapper.writeValueAsString(resp2));

					log.info("Ended p3: " + System.currentTimeMillis() + result.get("Suggestions"));
				} catch (JsonProcessingException e) {
					e.printStackTrace();
				}
			});
			futureReview.get(60, TimeUnit.SECONDS);
			futureSuggestion.get(60, TimeUnit.SECONDS);
			
			log.info("Ended Time in Milliseconds" + System.currentTimeMillis());
			finalResp = objmapper.writeValueAsString(result);
		} catch (Exception e) {
			e.printStackTrace();
			finalResp = e.getMessage();
			throw e;
		}

		return finalResp;
	}

	@Override
	public void clear() {
		try {
			log.info("Started Time in Milliseconds: " + System.currentTimeMillis());
			List<String> convorsations = chatMemory.findConversationIds();
			convorsations.forEach(x -> chatMemory.deleteByConversationId(x));
			log.info("Ended : " + System.currentTimeMillis());
		} catch (ResourceAccessException e) { // TODO: handle exception
			e.printStackTrace();

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

}
