package com.airesume.llm.proxy;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.airesume.llm.proxy.OneLlmProxy.ChatResult;

@Service
public class OneLlmService {

    @Value("${llm.api.key}")
    private String apiKey;

    @Value("${llm.api.url}")
    private String apiUrl;

    @Value("${llm.api.model}")
    private String model;

    public String chat(String prompt) {
        ChatResult result = OneLlmProxy.chat(apiUrl, apiKey, model, prompt);
        return result.getContent();
    }
}
