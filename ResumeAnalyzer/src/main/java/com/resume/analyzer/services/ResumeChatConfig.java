package com.resume.analyzer.services;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ResumeChatConfig {
	
	
	@Bean 
	InMemoryChatMemoryRepository chatMemory() {
		return new InMemoryChatMemoryRepository();
	}
	
	@Bean
	MessageWindowChatMemory msgChatMemory(@Autowired InMemoryChatMemoryRepository chatMemory) {
	    return MessageWindowChatMemory.builder()
	        .chatMemoryRepository(chatMemory)
	        .maxMessages(10)
	        .build();
	}
	
	@Bean
	MessageChatMemoryAdvisor advisor(@Autowired MessageWindowChatMemory msgChatMemory) {
		return MessageChatMemoryAdvisor.builder(msgChatMemory).build();
	}
	
	@Bean
	ChatClient chatClient(@Autowired OllamaChatModel chatModel, @Autowired MessageChatMemoryAdvisor msgChatAdv) {
		ChatClient chatClient = ChatClient.builder(chatModel).defaultAdvisors(msgChatAdv).build();
		return chatClient;
	}
	

}
