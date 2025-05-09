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
    
    private BasicInfo basicInfo = new BasicInfo();

    private String summary;

    private JobIntention jobIntention = new JobIntention();    
    
    private List<Education> educationList = new ArrayList<>();
    
    private List<WorkExperience> workList = new ArrayList<>();
    
    private List<Project> projectList = new ArrayList<>();
    
    private List<CampusExperience> campusList = new ArrayList<>();
    
    private List<Award> awardList = new ArrayList<>();
    
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