package com.airesume.llm.impl;

import com.airesume.llm.LLMService;
import com.airesume.llm.PromptTemplateService;
import com.airesume.llm.proxy.OneLlmService;
import com.airesume.bo.OptimizeResult;
import com.airesume.model.ResumePO;
import com.airesume.util.JsonUtil;

import javax.annotation.Resource;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class LLMServiceImpl implements LLMService {

    @Resource
    private OneLlmService oneLlmService;

    @Resource
    private PromptTemplateService promptTemplateService;
    
    @Override
    public OptimizeResult optimizeResume(ResumePO resume, String optimizeDescription) {
        OptimizeResult result = new OptimizeResult();
        
        try {
            // 创建简历副本用于优化
            ResumePO optimizedResume = new ResumePO();
            BeanUtils.copyProperties(resume, optimizedResume);
            
            // 1. 构建提示词
            String prompt = buildOptimizePrompt(resume, optimizeDescription);
            
            // 2. 调用大模型API
            String response = callLLMApi(prompt);
            
            // 3. 解析响应，更新简历内容
            updateResumeContent(result, response);
            
        } catch (Exception e) {
            // 处理异常情况
            result.setHasChanges(false);
            result.setOptimizeExplanation("优化过程中发生错误: " + e.getMessage());
        }
        
        return result;
    }
    

    private String buildOptimizePrompt(ResumePO resume, String optimizeDescription) {
        String prompt = promptTemplateService.buildOptimizePrompt(resume, optimizeDescription);
        return prompt;
    }

    /**
     * 调用大模型API
     */
    private String callLLMApi(String prompt) {
        return oneLlmService.chat(prompt);
    }
    
    /**
     * 解析大模型响应并更新简历内容
     */
    private void updateResumeContent(OptimizeResult resume, String llmResponse) {
        OptimizeResult result = JsonUtil.parseObj(llmResponse,OptimizeResult.class);
        resume.setHasChanges(result.isHasChanges());
        resume.setOptimizedResume(result.getOptimizedResume());
        resume.setOptimizeExplanation(result.getOptimizeExplanation());
        resume.setSuggestions(result.getSuggestions());
        resume.setOptimizeTime(System.currentTimeMillis());
    }
} 