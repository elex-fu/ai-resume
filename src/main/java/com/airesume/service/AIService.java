package com.airesume.service;

import com.airesume.model.ResumePO;
import com.theokanning.openai.completion.CompletionRequest;
import com.theokanning.openai.completion.CompletionResult;
import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AIService {

    @Autowired
    private OpenAiService openAiService;

    public ResumePO generateResume(String content) {
        String prompt = buildPrompt(content);
        String response = generateCompletion(prompt);
        return parseResponse(response);
    }

    private String buildPrompt(String content) {
        return String.format(
            "请根据以下内容生成一份专业的简历，包含以下部分：\n" +
            "1. 基本信息（姓名、年龄、电话、邮箱）\n" +
            "2. 教育经历（学校、专业、学位、时间）\n" +
            "3. 工作经历（公司、职位、时间、工作内容）\n" +
            "4. 技能特长\n\n" +
            "内容：\n%s\n\n" +
            "请以JSON格式返回，格式如下：\n" +
            "{\n" +
            "  \"name\": \"姓名\",\n" +
            "  \"age\": 年龄,\n" +
            "  \"phone\": \"电话\",\n" +
            "  \"email\": \"邮箱\",\n" +
            "  \"education\": [\n" +
            "    {\n" +
            "      \"school\": \"学校名称\",\n" +
            "      \"major\": \"专业\",\n" +
            "      \"degree\": \"学位\",\n" +
            "      \"startDate\": \"开始时间\",\n" +
            "      \"endDate\": \"结束时间\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"experience\": [\n" +
            "    {\n" +
            "      \"company\": \"公司名称\",\n" +
            "      \"position\": \"职位\",\n" +
            "      \"startDate\": \"开始时间\",\n" +
            "      \"endDate\": \"结束时间\",\n" +
            "      \"description\": \"工作内容\"\n" +
            "    }\n" +
            "  ],\n" +
            "  \"skills\": [\"技能1\", \"技能2\"]\n" +
            "}",
            content
        );
    }

    private String generateCompletion(String prompt) {
        CompletionRequest request = CompletionRequest.builder()
                .prompt(prompt)
                .model("text-davinci-003")
                .maxTokens(2000)
                .temperature(0.7)
                .build();

        CompletionResult result = openAiService.createCompletion(request);
        return result.getChoices().get(0).getText();
    }

    private ResumePO parseResponse(String response) {
        // TODO: 实现JSON解析逻辑
        return new ResumePO();
    }
} 