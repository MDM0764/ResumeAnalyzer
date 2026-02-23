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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/v1")
public class Analyzer {

	@Autowired
	private OllamaChatModel chatClient;

	@GetMapping("/analyze")
	String analyze(@RequestParam("file") MultipartFile multipartFile) {

		System.out.println("" + multipartFile.getName());

		return null;

	}

	@PostMapping("/chat")
	String chat(@RequestBody Map<String,String> body) {

		try {
		System.out.println("Started Time in Milliseconds: " + System.currentTimeMillis());
		Prompt prompt = new Prompt(body.get("message"));
		ChatResponse resp = chatClient.call(prompt);
		System.out.println("Ended : " + System.currentTimeMillis());
		resp.getResult().getOutput().getText();
		System.out.println("response "+ resp.getResult().getOutput().getText());
		return  resp.getResult().getOutput().getText();
		
		} catch (ResourceAccessException e) { // TODO: handle exception
			e.printStackTrace();
			return e.getMessage();

		} catch (Exception e) {
			e.printStackTrace();
			return e.getMessage();
		}

	}

	@PostMapping("/analyze/Ollama")
	String analyzeOllama(@RequestParam("file") MultipartFile multipartFile,
			@RequestParam("jobDescription") String jobDesc) throws Exception {
		String finalResp = null;
		try {
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
			Prompt prompt = new Prompt(
					" Act as a recruiter for given job description role. Review my resume highlight weak areas, overused buzzwords, and missing metrics. Be brutally honest. :\n\n "
							+ extractedText + "\n\n JobDescription " + jobDesc);
			ChatResponse resp = chatClient.call(prompt);

			result.put("HonestReview", extractTextContent(resp.toString()));
			System.out.println("Ended p1: " + System.currentTimeMillis()
			+ objmapper.writeValueAsString(resp.toString().replaceAll("=", ";")));

			System.out.println("Started p2: " + System.currentTimeMillis());
			Prompt prompt2 = new Prompt(
					"Extract the keywords from the resume and jobDescription and give me an analytic comparison and an ATS Score."
							+ extractedText + "\n\n JobDescription " + jobDesc);
			ChatResponse resp2 = chatClient.call(prompt2);
			result.put("KeyWords", extractTextContent(resp2.toString()));
			System.out.println("Ended p2: " + System.currentTimeMillis());

			System.out.println("Started p3: " + System.currentTimeMillis());
			Prompt prompt3 = new Prompt(
					"Suggest Changes for my resume for making it more compliant with the job description."
							+ extractedText + "\n\n JobDescription " + jobDesc);
			ChatResponse resp3 = chatClient.call(prompt3);
			result.put("Suggestions", extractTextContent(resp3.toString()));
			System.out.println("Ended p3: " + System.currentTimeMillis());

			System.out.println("Ended Time in Milliseconds" + System.currentTimeMillis());
			finalResp = objmapper.writeValueAsString(result);
		} catch (ResourceAccessException e) { // TODO: handle exception
			e.printStackTrace();
			finalResp = "	{ res_code: 200, payload :{ \"suggestions\": \"Based on the job description, here are some suggested changes to make your resume more compliant=\\n\\n**Change 1= Highlight relevant experience**\\n\\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\\n\\n**Change 2= Emphasize technical skills**\\n\\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\\n\\n* \\\"Developed responsive financial dashboards using ReactJS...\\\"\\n* \\\"Designed and implemented API Gateways with Springboot...\\\"\\n* \\\"Streamlined data processing using Kafka...\\\"\\n\\n**Change 3= Use keywords from the job description**\\n\\nIncorporate keywords like \\\"Frontend and back-end dev,\\\" \\\"Kafka, Streaming,\\\" \\\"Microservices,\\\" \\\"CI/CD,\\\" and \\\"AWS/Azure\\\" to demonstrate your familiarity with these technologies.\\n\\n**Change 4= Highlight strong communication skills**\\n\\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\\n\\nHere's an example of how you could revise your Professional Experience section=\\n\\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\\n\\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\\n\\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager.\",\r\n"
					+ "				 \"suggestions\": \"Based on the job description, here are some suggested changes to make your resume more compliant=\\n\\n**Change 1= Highlight relevant experience**\\n\\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\\n\\n**Change 2= Emphasize technical skills**\\n\\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\\n\\n* \\\"Developed responsive financial dashboards using ReactJS...\\\"\\n* \\\"Designed and implemented API Gateways with Springboot...\\\"\\n* \\\"Streamlined data processing using Kafka...\\\"\\n\\n**Change 3= Use keywords from the job description**\\n\\nIncorporate keywords like \\\"Frontend and back-end dev,\\\" \\\"Kafka, Streaming,\\\" \\\"Microservices,\\\" \\\"CI/CD,\\\" and \\\"AWS/Azure\\\" to demonstrate your familiarity with these technologies.\\n\\n**Change 4= Highlight strong communication skills**\\n\\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\\n\\nHere's an example of how you could revise your Professional Experience section=\\n\\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\\n\\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\\n\\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager.\",\r\n"
					+ "				 \"KeyWords\" : \"Based on the job description, here are some suggested changes to make your resume more compliant=\\n\\n**Change 1= Highlight relevant experience**\\n\\nWhile you have experience as a Software Engineer and Java Developer, focus on highlighting projects or experiences that demonstrate strong skills in Frontend and back-end development, Kafka, microservices, Springboot, and AWS/Azure. Specifically, mention the S-NOC project where you led migration from monolith to microservices.\\n\\n**Change 2= Emphasize technical skills**\\n\\nIn addition to listing your technical skills, use specific examples or phrases that demonstrate expertise in ReactJS, Core Java/Advanced Java, Springboot, Kafka, and CI/CD. For example=\\n\\n* \\\"Developed responsive financial dashboards using ReactJS...\\\"\\n* \\\"Designed and implemented API Gateways with Springboot...\\\"\\n* \\\"Streamlined data processing using Kafka...\\\"\\n\\n**Change 3= Use keywords from the job description**\\n\\nIncorporate keywords like \\\"Frontend and back-end dev,\\\" \\\"Kafka, Streaming,\\\" \\\"Microservices,\\\" \\\"CI/CD,\\\" and \\\"AWS/Azure\\\" to demonstrate your familiarity with these technologies.\\n\\n**Change 4= Highlight strong communication skills**\\n\\nAs mentioned in the job description, strong communications and stakeholder management skills are essential. Emphasize any experiences where you've effectively communicated technical information to non-technical stakeholders or team members.\\n\\nHere's an example of how you could revise your Professional Experience section=\\n\\n**Software Engineer | Enhancesys Technologies - Bangalore, Karnataka**\\n\\n* Led migration from monolith to microservices in S-NOC project, improving system scalability by 25% and enabling higher transaction throughput.\\n* Designed and implemented API Gateways with Springboot, reducing MTTR by 15% and improving API reliability.\\n* Successfully communicated technical information to non-technical stakeholders, ensuring smooth integration of multiple third-party APIs.\\n\\nBy making these changes, your resume will be more aligned with the job description and increase your chances of passing through the applicant tracking system (ATS) and catching the eye of the hiring manager.\",\r\n"
					+ "				 }\r\n" + "				 }";

		} catch (Exception e) {
			e.printStackTrace();
			finalResp = e.getMessage();
			throw e;
		}

		return finalResp;
	}

	private String extractTextContent(String outputStr) {
		String txtPtrn = "textContent=(.*?), metadata";
		Pattern pattern = Pattern.compile(txtPtrn);
		Matcher match = pattern.matcher(outputStr);
		if (match.find()) {
			return match.group(1).trim();
		} else {
			return outputStr;
		}

	}

}
