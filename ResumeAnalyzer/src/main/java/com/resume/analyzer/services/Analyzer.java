package com.resume.analyzer.services;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/v1")
public class Analyzer {
	
	@Autowired
	private OllamaChatModel chatClient;
	
	@PostMapping("/analyze")
	String analyze(@RequestParam("file") MultipartFile multipartFile) {
		
		System.out.println("" + multipartFile.getName());
		
		return null;
		
	}

	@PostMapping("/analyze/Ollama")
	String analyzeOllama(@RequestParam("file") MultipartFile multipartFile, @RequestParam("jobDescription") String jobDesc ) throws IOException {
		
		System.out.println("" + multipartFile.getOriginalFilename());
		System.out.println("jobDesc " + jobDesc);
		System.out.println("Started Time in Milliseconds: " + System.currentTimeMillis());
		Map<String, String> result = new HashMap<>();
		String extractedText = "";
		try (InputStream inputStream = multipartFile.getInputStream();
	          XWPFDocument document = new XWPFDocument(inputStream);
	          XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
	            extractedText = extractor.getText();
	        } catch (IOException e) {
	            e.printStackTrace();
	            throw new IOException("Failed to extract text from Word file", e);
	        }
		ObjectMapper objmapper = new ObjectMapper();
		System.out.println("Started p1: " + System.currentTimeMillis());
		Prompt prompt = new Prompt(" Act as a recruiter for given job description role. Review my resume highlight weak areas, overused buzzwords, and missing metrics. Be brutally honest. :\n\n " + extractedText + "\n\n JobDescription " + jobDesc);
		ChatResponse resp = chatClient.call(prompt);
		
		result.put("HonestReview", extractTextContent(resp.toString()));
		System.out.println("Ended p1: " + System.currentTimeMillis() + objmapper.writeValueAsString(resp.toString().replaceAll("=", ";")));
		
		System.out.println("Started p2: " + System.currentTimeMillis());
		Prompt prompt2 = new Prompt("Extract the keywords from the resume and jobDescription and give me an analytic comparison and an ATS Score." + extractedText + "\n\n JobDescription " + jobDesc); 
		ChatResponse resp2 = chatClient.call(prompt2);
		result.put("KeyWords",  extractTextContent(resp2.toString()));
		System.out.println("Ended p2: " + System.currentTimeMillis());
		
		System.out.println("Started p3: " + System.currentTimeMillis());
		Prompt prompt3 = new Prompt("Suggest Changes for my resume for making it more compliant with the job description."  + extractedText + "\n\n JobDescription " + jobDesc);
		ChatResponse resp3 = chatClient.call(prompt3);
		result.put("suggestions",  extractTextContent(resp3.toString()));
		System.out.println("Ended p3: " + System.currentTimeMillis());
		
		System.out.println("Ended Time in Milliseconds" + System.currentTimeMillis());
		return objmapper.writeValueAsString(result);
		
	}

	private String extractTextContent(String outputStr) {
		
		String txtPtrn ="textContent=(.*?), metadata";
		Pattern pattern = Pattern.compile(txtPtrn);
		Matcher match = pattern.matcher(outputStr); 
		if (match.find()) {
			return match.group(1).trim();
		} else {
			return outputStr;
		}
		
	}

}
