package com.airesume.llm;

import org.springframework.stereotype.Service;

import com.airesume.model.ResumePO;
import com.airesume.util.JsonUtil;

@Service
public class PromptTemplateService {


    /**
     * 构建优化提示词
     * 1. 根据要求优化简历
     * 2. 原始简历内容
     * 3. 优化要求
     * 4. 返回优化后的简历，并提供优化说明，及优化建议数组格式
     * 5. 返回格式为json 格式为：
     * {
     *  "hasChanges": true, // 是否修改
     *  "optimizedResume": "优化后的简历",
     *  "optimizeExplanation": "优化说明",
     *  "suggestions": ["优化建议1", "优化建议2", "优化建议3"]
     * }
     */
    public String buildOptimizePrompt(ResumePO resume, String optimizeDescription) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请根据以下要求优化这份简历\n");
        prompt.append("优化要求：").append(optimizeDescription).append("\n");
        prompt.append("严格按照要求修改，如果在要求中没有体现不要修改，需要严格遵守优化要求。\n");
        prompt.append("原始简历内容：\n ");
        String resumeContent =  JsonUtil.toJsonString(resume);
        if (resumeContent != null) {
            prompt.append(resumeContent);
        }
        prompt.append("###返回格式为json 格式为：\n");
        prompt.append("```json{");
        prompt.append("  \"hasChanges\": true, // 是否修改");
        prompt.append("  \"optimizedResume\": \"优化后的简历，格式参考原简历内容\",");
        prompt.append("  \"optimizeExplanation\": \"调整说明\",");
        prompt.append("  \"suggestions\": [\"优化建议1\", \"优化建议2\", \"优化建议3\"]");
        prompt.append("}```");
        prompt.append("其中optimizedResume中如果没有变化的字段可以不用在返回结果中体现，只返回有变化的字段\n");
        prompt.append("其中optimizeExplanation是对调整内容的说明，只对诉求中的调整进行解释说明\n");
        prompt.append("其中suggestions需要简化简历内容给出3个建议，让用户参考后续进行修改！");
        return prompt.toString();
    }



}
