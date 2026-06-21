package com.resume.analyzer.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1")
public interface OllamaInterface {
	
	@PostMapping("/chat/Ollama")
	String chat(@RequestBody Map<String, String> body);
	
	@PostMapping("/analyze/Ollama")
	String analyze(@RequestParam("file") MultipartFile multipartFile, @RequestParam("jobDescription") String jobDesc) throws Exception;
	
	@GetMapping("/clear/Ollama")
	void clear();

}
