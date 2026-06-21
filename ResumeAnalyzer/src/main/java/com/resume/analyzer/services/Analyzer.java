/*
 * package com.resume.analyzer.services;
 * 
 * import java.io.IOException; import java.io.InputStream; import
 * java.util.HashMap; import java.util.List; import java.util.Map; import
 * java.util.concurrent.ConcurrentHashMap; import
 * java.util.concurrent.ExecutorService; import java.util.concurrent.Executors;
 * import java.util.concurrent.Future; import java.util.concurrent.TimeUnit;
 * import java.util.regex.Matcher; import java.util.regex.Pattern;
 * 
 * import org.apache.poi.xwpf.extractor.XWPFWordExtractor; import
 * org.apache.poi.xwpf.usermodel.XWPFDocument; import
 * org.springframework.ai.chat.client.ChatClient; import
 * org.springframework.ai.chat.memory.InMemoryChatMemoryRepository; import
 * org.springframework.beans.factory.annotation.Autowired; import
 * org.springframework.beans.factory.annotation.Qualifier; import
 * org.springframework.web.bind.annotation.PostMapping; import
 * org.springframework.web.bind.annotation.RequestBody; import
 * org.springframework.web.bind.annotation.RequestMapping; import
 * org.springframework.web.bind.annotation.RequestParam; import
 * org.springframework.web.bind.annotation.RestController; import
 * org.springframework.web.client.ResourceAccessException; import
 * org.springframework.web.multipart.MultipartFile;
 * 
 * import com.fasterxml.jackson.core.JsonProcessingException; import
 * com.fasterxml.jackson.databind.ObjectMapper;
 * 
 * @RestController
 * 
 * @RequestMapping("/v1") public class Analyzer {
 * 
 * private final ChatClient ollamaChatClient;
 * 
 * private final ChatClient geminiChatClient;
 * 
 * private final InMemoryChatMemoryRepository chatMemory;
 * 
 * private final ExecutorService executor =
 * Executors.newVirtualThreadPerTaskExecutor();
 * 
 * private final static ObjectMapper objmapper = new ObjectMapper();
 * 
 * public Analyzer(@Autowired ChatClient
 * ollamaChatClient, @Autowired @Qualifier("gemini") ChatClient
 * geminiChatClient,
 * 
 * @Autowired InMemoryChatMemoryRepository chatMemory) { this.ollamaChatClient =
 * ollamaChatClient; this.geminiChatClient = geminiChatClient; this.chatMemory =
 * chatMemory;
 * 
 * }
 * 
 * @PostMapping("/chat") String chat(@RequestBody Map<String, String> body) {
 * 
 * try { System.out.println("Started Time in Milliseconds: " +
 * System.currentTimeMillis()); String prompt = body.get("message"); String resp
 * = ollamaChatClient.prompt().user(prompt).call().content();
 * System.out.println("Ended : " + System.currentTimeMillis());
 * System.out.println("response " + resp); return resp;
 * 
 * } catch (ResourceAccessException e) { e.printStackTrace(); return
 * e.getMessage();
 * 
 * } catch (Exception e) { e.printStackTrace(); return e.getMessage(); }
 * 
 * }
 * 
 * @PostMapping("/analyze/Ollama") String analyzeOllama(@RequestParam("file")
 * MultipartFile multipartFile,
 * 
 * @RequestParam("jobDescription") String jobDesc) throws Exception { String
 * finalResp = null; try {
 * 
 * System.out.println("" + multipartFile.getOriginalFilename());
 * System.out.println("jobDesc " + jobDesc);
 * System.out.println("Started Time in Milliseconds: " +
 * System.currentTimeMillis()); Map<String, String> result = new HashMap<>();
 * String extractedText; try (InputStream inputStream =
 * multipartFile.getInputStream(); XWPFDocument document = new
 * XWPFDocument(inputStream); XWPFWordExtractor extractor = new
 * XWPFWordExtractor(document)) { extractedText = extractor.getText(); } catch
 * (IOException e) { e.printStackTrace(); throw new
 * IOException("Failed to extract text from Word file", e); }
 * System.out.println("Started p1: " + System.currentTimeMillis());
 * 
 * executor.submit(() -> { try { String prompt =
 * " Act as a recruiter for given job description role. Review my resume highlight weak areas, overused buzzwords, and missing metrics. Be brutally honest. :\n\n "
 * + extractedText + "\n\n JobDescription " + jobDesc; String resp =
 * ollamaChatClient.prompt().user(prompt).call().content();
 * 
 * result.put("HonestReview",
 * objmapper.writeValueAsString(extractTextContent(resp)));
 * System.out.println("Ended p1: " + System.currentTimeMillis() +
 * result.get("HonestReview")); } catch (JsonProcessingException e) { // TODO
 * Auto-generated catch block e.printStackTrace(); } });
 * 
 * executor.submit(() -> { try { System.out.println("Started p3: " +
 * System.currentTimeMillis()); String prompt2 =
 * "Suggest Changes for my resume for making it more compliant with the job description."
 * + extractedText + "\n\n JobDescription " + jobDesc; String resp2 =
 * ollamaChatClient.prompt().user(prompt2).call().content();
 * 
 * result.put("Suggestions", objmapper.writeValueAsString(resp2));
 * System.out.println("Ended p3: " + System.currentTimeMillis() +
 * result.get("Suggestions")); } catch (JsonProcessingException e) { // TODO
 * Auto-generated catch block e.printStackTrace(); } });
 * System.out.println("Ended Time in Milliseconds" +
 * System.currentTimeMillis()); finalResp =
 * objmapper.writeValueAsString(result); } catch (Exception e) {
 * e.printStackTrace(); finalResp = e.getMessage(); throw e; } return finalResp;
 * }
 * 
 * @PostMapping("/clear") void clear() { try {
 * System.out.println("Started Time in Milliseconds: " +
 * System.currentTimeMillis()); List<String> convorsations =
 * chatMemory.findConversationIds(); convorsations.forEach(x ->
 * chatMemory.deleteByConversationId(x)); System.out.println("Ended : " +
 * System.currentTimeMillis()); } catch (ResourceAccessException e) { // TODO:
 * handle exception e.printStackTrace();
 * 
 * } catch (Exception e) { e.printStackTrace(); } }
 * 
 * private String extractTextContent(String outputStr) { String txtPtrn =
 * "textContent=(.*?), metadata"; Pattern pattern = Pattern.compile(txtPtrn);
 * Matcher match = pattern.matcher(outputStr); if (match.find()) { return
 * match.group(1).trim(); } else { return outputStr; }
 * 
 * }
 * 
 * @PostMapping("/analyze/Gemini") String analyzeGemini(@RequestParam("file")
 * MultipartFile multipartFile,
 * 
 * @RequestParam("jobDescription") String jobDesc) throws Exception { String
 * finalResp = null; try { System.out.println("" +
 * multipartFile.getOriginalFilename()); System.out.println("jobDesc " +
 * jobDesc); System.out.println("Started Time in Milliseconds: " +
 * System.currentTimeMillis()); Map<String, String> result = new
 * ConcurrentHashMap<>(); String extractedText; try (InputStream inputStream =
 * multipartFile.getInputStream(); XWPFDocument document = new
 * XWPFDocument(inputStream); XWPFWordExtractor extractor = new
 * XWPFWordExtractor(document)) { extractedText = extractor.getText(); } catch
 * (IOException e) { e.printStackTrace(); throw new
 * IOException("Failed to extract text from Word file", e); } Future<?>
 * futureReview = executor.submit(() -> { try {
 * System.out.println("Started p1: " + System.currentTimeMillis()); String
 * prompt =
 * " Act as a recruiter for given job description role. Review my resume highlight weak areas, overused buzzwords, and missing metrics. Be brutally honest. :\n\n "
 * + extractedText + "\n\n JobDescription " + jobDesc; String resp =
 * geminiChatClient.prompt().user(prompt).call().content();
 * System.out.println("RAW: " +resp); result.put("HonestReview",
 * objmapper.writeValueAsString(extractTextContent(resp)));
 * System.out.println("Ended p1: " + System.currentTimeMillis() +
 * result.get("HonestReview")); } catch (JsonProcessingException e) {
 * e.printStackTrace(); } }); Future<?> futureSuggestion = executor.submit(() ->
 * { try { System.out.println("Started p3: " + System.currentTimeMillis());
 * String prompt2 =
 * "Suggest Changes for my resume for making it more compliant with the job description."
 * + extractedText + "\n\n JobDescription " + jobDesc; String resp2 =
 * geminiChatClient.prompt().user(prompt2).call().content();
 * System.out.println("RAW2: " +resp2); result.put("Suggestions",
 * objmapper.writeValueAsString(resp2));
 * 
 * System.out.println("Ended p3: " + System.currentTimeMillis() +
 * result.get("Suggestions")); } catch (JsonProcessingException e) {
 * e.printStackTrace(); } }); futureReview.get(60, TimeUnit.SECONDS);
 * futureSuggestion.get(60, TimeUnit.SECONDS);
 * 
 * System.out.println("Ended Time in Milliseconds" +
 * System.currentTimeMillis()); finalResp =
 * objmapper.writeValueAsString(result); } catch (Exception e) {
 * e.printStackTrace(); finalResp = e.getMessage(); throw e; }
 * 
 * return finalResp; }
 * 
 * }
 */