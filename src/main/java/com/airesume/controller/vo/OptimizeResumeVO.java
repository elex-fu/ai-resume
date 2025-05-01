package com.airesume.controller.vo;

import com.airesume.model.ResumePO;

import lombok.Data;

@Data
public class OptimizeResumeVO {

    private ResumePO oldResume;

    private ResumePO newResume;

    private String optimizeDescription;

    private String optimizeResult;

    private String optimizeTime;

    private String suggestions;

}
