package com.airesume.bo;

import com.airesume.model.ResumePO;

import lombok.Data;

/**
 * 简历优化结果业务对象
 */
@Data
public class OptimizeResult {
    private ResumePO optimizedResume;    // 优化后的简历，如果没有修改则为null
    private String[] suggestions;         // 其他建议
    private boolean hasChanges;           // 是否有修改
    private String optimizeExplanation;   // 优化说明
    private Long optimizeTime;          // 优化时间
} 
