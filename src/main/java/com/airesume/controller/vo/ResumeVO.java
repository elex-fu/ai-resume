package com.airesume.controller.vo;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

/**
 * 简历展示数据模型
 */
@Data
public class ResumeVO {
    private Long id;
    
    // 基本信息
    private BasicInfo basicInfo;
    
    // 求职意向
    private JobIntention jobIntention;
    
    // 个人总结
    private String summary;
    
    // 教育经历
    private List<Education> educationList = new ArrayList<>();
    
    // 工作经历
    private List<WorkExperience> workList = new ArrayList<>();
    
    // 项目经历
    private List<Project> projectList = new ArrayList<>();
    
    // 校园经历
    private List<CampusExperience> campusList = new ArrayList<>();
    
    // 获奖经历
    private List<Award> awardList = new ArrayList<>();
    
    // 技能特长
    private List<Skill> skillList = new ArrayList<>();
    
    @Data
    public static class BasicInfo {
        private String name;
        private String avatar;
        private String position;
        private String gender;
        private String age;
        private String political;
        private String educationLevel;
        private String experience;
        private String status;
        private String phone;
        private String email;
        private String location;
    }
    
    @Data
    public static class JobIntention {
        private String position;
        private String city;
        private String salary;
        private String entryTime;
    }
    
    @Data
    public static class Education {
        private String school;
        private String major;
        private String degree;
        private String startDate;
        private String endDate;
        private String description;
        private String gpa;
        private String rank;
    }
    
    @Data
    public static class WorkExperience {
        private String company;
        private String department;
        private String position;
        private String startDate;
        private String endDate;
        private String description;
    }
    
    @Data
    public static class Project {
        private String name;
        private String role;
        private String startDate;
        private String endDate;
        private String description;
    }
    
    @Data
    public static class CampusExperience {
        private String organization;
        private String position;
        private String startDate;
        private String endDate;
        private String description;
    }
    
    @Data
    public static class Award {
        private String name;
        private String date;
        private String description;
    }
    
    @Data
    public static class Skill {
        private String name;
        private String level;
        private String description;
    }
}
