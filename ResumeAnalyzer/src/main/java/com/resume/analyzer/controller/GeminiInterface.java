package com.resume.analyzer.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RequestMapping("/v1")
public interface GeminiInterface {
	
	@PostMapping("/chat/Gemini")
	String chat(@RequestBody Map<String, String> body);
	
	@PostMapping("/analyze/Gemini")
	String analyze(@RequestParam("file") MultipartFile multipartFile, @RequestParam("jobDescription") String jobDesc) throws Exception;
	
	@PostMapping("/clear/Gemini")
	void clear(@RequestBody Map<String, String> body) throws Exception;
	
	@GetMapping("/chat/test")
	String test();

}
