package com.airesume.vo;

import lombok.Data;
import java.util.List;

/**
 * 简历展示数据模型
 */
@Data
public class ResumeVO {
    private Long id;
    private BasicInfo basic;
    private String avatar;
    private JobIntention intention;
    private List<Education> education;
    private List<WorkExperience> work;
    private List<ProjectExperience> project;
    private List<CampusExperience> campus;
    private List<Award> awards;
    private List<Skill> skills;
    private Analysis analysis;
    private Template template;

    @Data
    public static class BasicInfo {
        private String name;
        private String gender;
        private String age;
        private String political;
        private String location;
        private String educationLevel;
        private String experience;
        private String status;
        private String email;
        private String phone;
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
        private String degree;
        private String eduTime;
        private String gpa;
        private String rank;
        private String major;
    }

    @Data
    public static class WorkExperience {
        private String company;
        private String position;
        private String department;
        private String workTime;
        private String description;
    }

    @Data
    public static class ProjectExperience {
        private String projectName;
        private String projectRole;
        private String projectTime;
        private String projectLink;
        private String description;
    }

    @Data
    public static class CampusExperience {
        private String campusOrg;
        private String campusRole;
        private String campusTime;
        private String campusType;
        private String description;
    }

    @Data
    public static class Award {
        private String awardName;
        private String awardDate;
    }

    @Data
    public static class Skill {
        private String skillName;
        private String skillDetail;
    }

    @Data
    public static class Analysis {
        private int score;
        private List<AnalysisItem> items;
    }

    @Data
    public static class AnalysisItem {
        private String title;
        private int score;
        private String advice;
    }

    @Data
    public static class Template {
        private String current;
        private String color;
    }
}
