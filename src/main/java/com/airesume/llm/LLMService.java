package com.airesume.llm;

import com.airesume.model.ResumePO;
import com.airesume.bo.OptimizeResult;

/**
 * 大模型服务接口
 */
public interface LLMService {
    
    /**
     * 优化简历内容
     *
     * @param resume 原始简历
     * @param optimizeDescription 优化需求描述
     * @return 优化结果
     */
    OptimizeResult optimizeResume(ResumePO resume, String optimizeDescription);
}

