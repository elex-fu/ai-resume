package com.airesume.factory;

import com.airesume.model.ResumePO;
import com.airesume.vo.ResumeVO;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.compress.utils.Lists;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ResumeVOFactory {

    /**
     * ResumeVO创建工厂方法
     *
     * resumePO 转为ResumeVO
     * @param resumePO 简历持久化对象
     * @return 简历展示对象
     */
    public static ResumeVO createResumeVO(ResumePO resumePO) {
        if (resumePO == null) {
            return null;
        }
        
        ResumeVO resumeVO = new ResumeVO();
        resumeVO.setId(resumePO.getId());
        
        // 设置基本信息
        ResumeVO.BasicInfo basicInfo = new ResumeVO.BasicInfo();
        basicInfo.setName(resumePO.getName());
        basicInfo.setAge(resumePO.getAge() != null ? resumePO.getAge() + "岁" : "");
        basicInfo.setPhone(resumePO.getPhone());
        basicInfo.setEmail(resumePO.getEmail());
        basicInfo.setEducationLevel(resumePO.getEducation());
        basicInfo.setExperience(resumePO.getExperience());
        // 设置默认值
        basicInfo.setGender("未设置");
        basicInfo.setStatus("求职中");
        basicInfo.setPolitical("群众");
        basicInfo.setLocation("未设置");
        
        resumeVO.setBasic(basicInfo);
        
        // 设置默认头像
        resumeVO.setAvatar("/images/default-avatar.png");
        
        // 设置求职意向
        ResumeVO.JobIntention intention = new ResumeVO.JobIntention();
        intention.setPosition("未设置");
        intention.setCity("未设置");
        intention.setSalary("面议");
        intention.setEntryTime("随时到岗");
        resumeVO.setIntention(intention);
        
        // 转换教育经历
        List<ResumeVO.Education> educationList = new ArrayList<>();
        if (CollectionUtils.isNotEmpty(resumePO.getEducationList())) {
            for (ResumePO.Education edu : resumePO.getEducationList()) {
                ResumeVO.Education education = new ResumeVO.Education();
                education.setSchool(edu.getSchool());
                education.setMajor(edu.getMajor());
                education.setDegree(edu.getDegree());
                education.setEduTime(edu.getPeriod());
                education.setGpa(""); // 默认空值
                education.setRank(""); // 默认空值
                educationList.add(education);
            }
        }
        resumeVO.setEducation(educationList);
        
        // 转换工作经验
        List<ResumeVO.WorkExperience> workList = new ArrayList<>();
        if (CollectionUtils.isNotEmpty(resumePO.getExperienceList())) {
            for (ResumePO.Experience exp : resumePO.getExperienceList()) {
                ResumeVO.WorkExperience work = new ResumeVO.WorkExperience();
                work.setCompany(exp.getCompany());
                work.setPosition(exp.getPosition());
                work.setWorkTime(exp.getPeriod());
                work.setDescription(exp.getDescription());
                work.setDepartment(""); // 默认空值
                workList.add(work);
            }
        }
        resumeVO.setWork(workList);
        
        // 创建空列表避免空指针
        resumeVO.setProject(new ArrayList<>());
        resumeVO.setCampus(new ArrayList<>());
        resumeVO.setAwards(new ArrayList<>());
        resumeVO.setSkills(new ArrayList<>());
        
        // 设置分析数据
        ResumeVO.Analysis analysis = new ResumeVO.Analysis();
        analysis.setScore(0);
        analysis.setItems(new ArrayList<>());
        resumeVO.setAnalysis(analysis);
        
        // 设置模板
        ResumeVO.Template template = new ResumeVO.Template();
        template.setCurrent("standard");
        template.setColor("#1a73e8");
        resumeVO.setTemplate(template);
        
        return resumeVO;
    }

    /**
     * ResumePO创建工厂方法
     *
     * ResumeVO 转为 ResumePO
     * @param resumeVO 简历展示对象
     * @return 简历持久化对象
     */
    public static ResumePO createResumePO(ResumeVO resumeVO) {
        if (resumeVO == null) {
            return null;
        }
        
        ResumePO resumePO = new ResumePO();
        resumePO.setId(resumeVO.getId());
        
        // 设置基本信息
        if (resumeVO.getBasic() != null) {
            ResumeVO.BasicInfo basicInfo = resumeVO.getBasic();
            resumePO.setName(basicInfo.getName());
            // 处理年龄字符串
            String ageStr = basicInfo.getAge();
            if (ageStr != null && ageStr.endsWith("岁")) {
                try {
                    resumePO.setAge(Integer.parseInt(ageStr.substring(0, ageStr.length() - 1)));
                } catch (NumberFormatException e) {
                    resumePO.setAge(0);
                }
            } else {
                resumePO.setAge(0);
            }
            resumePO.setPhone(basicInfo.getPhone());
            resumePO.setEmail(basicInfo.getEmail());
            resumePO.setEducation(basicInfo.getEducationLevel());
            resumePO.setExperience(basicInfo.getExperience());
        }
        
        // 转换教育经历
        List<ResumePO.Education> educationList = new ArrayList<>();
        if (CollectionUtils.isNotEmpty(resumeVO.getEducation())) {
            for (ResumeVO.Education edu : resumeVO.getEducation()) {
                ResumePO.Education education = new ResumePO.Education();
                education.setSchool(edu.getSchool());
                education.setMajor(edu.getMajor());
                education.setDegree(edu.getDegree());
                education.setPeriod(edu.getEduTime());
                education.setResumePO(resumePO);
                educationList.add(education);
            }
        }
        resumePO.setEducationList(educationList);
        
        // 转换工作经验
        List<ResumePO.Experience> experienceList = new ArrayList<>();
        if (CollectionUtils.isNotEmpty(resumeVO.getWork())) {
            for (ResumeVO.WorkExperience work : resumeVO.getWork()) {
                ResumePO.Experience experience = new ResumePO.Experience();
                experience.setCompany(work.getCompany());
                experience.setPosition(work.getPosition());
                experience.setPeriod(work.getWorkTime());
                experience.setDescription(work.getDescription());
                experience.setResumePO(resumePO);
                experienceList.add(experience);
            }
        }
        resumePO.setExperienceList(experienceList);
        
        return resumePO;
    }

    /**
     * 创建简历展示对象列表
     * @param resumePOs 简历持久化对象列表
     * @return 简历展示对象列表
     */
    public static List<ResumeVO> createResumeVOList(List<ResumePO> resumePOs) {
        if(CollectionUtils.isEmpty(resumePOs)){
            return Lists.newArrayList();
        }

        return resumePOs.stream()
                .map(ResumeVOFactory::createResumeVO)
                .collect(Collectors.toList());
    }
}
