package com.resume.analyzer.config;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.deepseek.DeepSeekChatModel;
import org.springframework.ai.deepseek.DeepSeekChatOptions;
import org.springframework.ai.deepseek.api.DeepSeekApi;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.ai.model.tool.ToolCallingManager;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;

@Configuration
public class ResumeChatConfig {

	@Value("${spring.ai.google.genai.api-key}")
	private String geminiApiKey;

	@Value("${spring.ai.google.genai.chat.options.model}")
	private String geminiModel;

	@Value("${spring.ai.deepseek.api-key}")
	private String deepseekApiKey;

	@Value("${spring.ai.deepseek.chat.model}")
	private String deepseekModel;

	@Bean
	InMemoryChatMemoryRepository chatMemory() {
		return new InMemoryChatMemoryRepository();
	}

	@Bean
	ObjectMapper objectMapper() {
		return new ObjectMapper();
	}

	@Bean
	ExecutorService getExecutorService() {
		return Executors.newVirtualThreadPerTaskExecutor();
	}

	@Bean
	MessageWindowChatMemory msgChatMemory(@Autowired InMemoryChatMemoryRepository chatMemory) {
		return MessageWindowChatMemory.builder().chatMemoryRepository(chatMemory).maxMessages(10).build();
	}

	@Bean
	MessageChatMemoryAdvisor advisor(@Autowired MessageWindowChatMemory msgChatMemory) {
		return MessageChatMemoryAdvisor.builder(msgChatMemory).build();
	}

	@Bean("ollama")
	@Primary
	ChatClient ollamaChatClient(@Autowired OllamaChatModel chatModel, @Autowired MessageChatMemoryAdvisor msgChatAdv) {
		ChatClient chatClient = ChatClient.builder(chatModel).defaultAdvisors(msgChatAdv).build();
		return chatClient;
	}

	@Bean("gemini")
	ChatClient geminiChatClient(@Autowired GoogleGenAiChatModel chatModel,
			@Autowired MessageChatMemoryAdvisor msgChatAdv) {
		ChatClient chatClient = ChatClient.builder(chatModel).defaultAdvisors(msgChatAdv).build();
		return chatClient;
	}

	@Bean
	GoogleGenAiChatModel geminiChatModel() {
		GoogleGenAiChatOptions options = GoogleGenAiChatOptions.builder().model(geminiModel).temperature(0.7)
				.maxOutputTokens(60000).build();
		return GoogleGenAiChatModel.builder().defaultOptions(options)
				.genAiClient(Client.builder().apiKey(geminiApiKey).build()).build();
	}

	@Bean("deepseek")
	ChatClient deepseekChatClient(@Autowired DeepSeekChatModel chatModel,
			@Autowired MessageChatMemoryAdvisor msgChatAdv) {
		ChatClient chatClient = ChatClient.builder(chatModel).defaultAdvisors(msgChatAdv).build();
		return chatClient;
	}

	@Bean
	DeepSeekChatModel deepseekChatModel() {
		DeepSeekApi deepSeekApi = DeepSeekApi.builder().apiKey(deepseekApiKey).build();
		DeepSeekChatOptions options = DeepSeekChatOptions.builder().model(deepseekModel).temperature(0.7).maxTokens(60000)
				.build();
		return DeepSeekChatModel.builder().deepSeekApi(deepSeekApi).defaultOptions(options)
				.toolCallingManager(ToolCallingManager.builder().build()).build();
	}

}
