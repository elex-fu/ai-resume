package com.airesume.bo;

import com.airesume.controller.vo.ResumeVO;
import lombok.Data;

@Data
public class OptimizeResumeBO {
    private ResumeVO originalResume;    // 原始简历
    private ResumeVO optimizedResume;   // 优化后的简历
    private String optimizeDescription; // 优化说明
    private String optimizeResult;      // 优化结果
    private String optimizeTime;        // 优化时间
}
