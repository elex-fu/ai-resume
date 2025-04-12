package com.airesume.model;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * 简历实体类
 */
@Data
public class ResumePO {
    private Long id;

    private String name;

    private Integer age;

    private String phone;

    private String email;

    private String education;
    
    private String experience;

    private UserPO userPO;

    private List<Education> educationList = new ArrayList<>();

    private List<Experience> experienceList = new ArrayList<>();

    /**
     * 教育经历内部类
     */
    @Data
    public static class Education {
        private Long id;

        private String school;
        private String major;
        private String degree;
        private String period;
        private ResumePO resumePO;
    }

    /**
     * 工作经验内部类
     */
    @Data
    public static class Experience {
        private Long id;
        private String company;
        private String position;
        private String period;
        private String description;
        private ResumePO resumePO;
    }
} 