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
public interface DeepseekInterface {
	
	@PostMapping("/chat/deepseek")
	String chat(@RequestBody Map<String, String> body);
	
	@PostMapping("/analyze/deepseek")
	String analyze(@RequestParam("file") MultipartFile multipartFile, @RequestParam("jobDescription") String jobDesc) throws Exception;
	
	@GetMapping("/clear/deepseek")
	void clear(@RequestBody Map<String, String> body);

}
