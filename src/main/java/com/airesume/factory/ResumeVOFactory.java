package com.airesume.factory;

import com.airesume.model.ResumePO;
import com.airesume.controller.vo.ResumeVO;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;

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
        resumeVO.setSummary(StringUtils.defaultString(resumePO.getSummary(), ""));
        
        // 转换基本信息
        resumeVO.setBasicInfo(convertBasicInfo(resumePO.getBasicInfo()));
        
        // 转换求职意向
        resumeVO.setJobIntention(convertJobIntention(resumePO.getJobIntention()));
        
        // 转换教育经历
        resumeVO.setEducationList(convertEducationList(resumePO.getEducationList()));
        
        // 转换工作经历
        resumeVO.setWorkList(convertWorkList(resumePO.getWorkList()));
        
        // 转换项目经历
        resumeVO.setProjectList(convertProjectList(resumePO.getProjectList()));
        
        // 转换校园经历
        resumeVO.setCampusList(convertCampusList(resumePO.getCampusList()));
        
        // 转换获奖经历
        resumeVO.setAwardList(convertAwardList(resumePO.getAwardList()));
        
        // 转换技能特长
        resumeVO.setSkillList(convertSkillList(resumePO.getSkillList()));
        
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
        resumePO.setSummary(StringUtils.defaultString(resumeVO.getSummary(), ""));
        
        // 转换基本信息
        resumePO.setBasicInfo(convertBasicInfoToPO(resumeVO.getBasicInfo()));
        
        // 转换求职意向
        resumePO.setJobIntention(convertJobIntentionToPO(resumeVO.getJobIntention()));
        
        // 转换教育经历
        resumePO.setEducationList(convertEducationListToPO(resumeVO.getEducationList()));
        
        // 转换工作经历
        resumePO.setWorkList(convertWorkListToPO(resumeVO.getWorkList()));
        
        // 转换项目经历
        resumePO.setProjectList(convertProjectListToPO(resumeVO.getProjectList()));
        
        // 转换校园经历
        resumePO.setCampusList(convertCampusListToPO(resumeVO.getCampusList()));
        
        // 转换获奖经历
        resumePO.setAwardList(convertAwardListToPO(resumeVO.getAwardList()));
        
        // 转换技能特长
        resumePO.setSkillList(convertSkillListToPO(resumeVO.getSkillList()));
        
        return resumePO;
    }

    /**
     * 创建简历展示对象列表
     * @param resumePOs 简历持久化对象列表
     * @return 简历展示对象列表
     */
    public static List<ResumeVO> createResumeVOList(List<ResumePO> resumePOs) {
        if(CollectionUtils.isEmpty(resumePOs)){
            return new ArrayList<>();
        }

        return resumePOs.stream()
                .map(ResumeVOFactory::createResumeVO)
                .collect(Collectors.toList());
    }

    private static ResumeVO.BasicInfo convertBasicInfo(ResumePO.BasicInfo poInfo) {
        if (poInfo == null) {
            return new ResumeVO.BasicInfo();
        }
        ResumeVO.BasicInfo voInfo = new ResumeVO.BasicInfo();
        BeanUtils.copyProperties(poInfo, voInfo);
        
        // 处理年龄格式
        if (StringUtils.isNotBlank(poInfo.getAge()) && !poInfo.getAge().endsWith("岁")) {
            voInfo.setAge(poInfo.getAge() + "岁");
        }
        
        // 设置默认值
        voInfo.setName(StringUtils.defaultString(voInfo.getName(), ""));
        voInfo.setAvatar(StringUtils.defaultString(voInfo.getAvatar(), ""));
        voInfo.setPosition(StringUtils.defaultString(voInfo.getPosition(), ""));
        voInfo.setGender(StringUtils.defaultString(voInfo.getGender(), ""));
        voInfo.setPolitical(StringUtils.defaultString(voInfo.getPolitical(), ""));
        voInfo.setEducationLevel(StringUtils.defaultString(voInfo.getEducationLevel(), ""));
        voInfo.setExperience(StringUtils.defaultString(voInfo.getExperience(), ""));
        voInfo.setStatus(StringUtils.defaultString(voInfo.getStatus(), ""));
        voInfo.setPhone(StringUtils.defaultString(voInfo.getPhone(), ""));
        voInfo.setEmail(StringUtils.defaultString(voInfo.getEmail(), ""));
        voInfo.setLocation(StringUtils.defaultString(voInfo.getLocation(), ""));
        
        return voInfo;
    }

    private static ResumePO.BasicInfo convertBasicInfoToPO(ResumeVO.BasicInfo voInfo) {
        if (voInfo == null) {
            return new ResumePO.BasicInfo();
        }
        ResumePO.BasicInfo poInfo = new ResumePO.BasicInfo();
        BeanUtils.copyProperties(voInfo, poInfo);
        
        // 处理年龄格式
        if (StringUtils.isNotBlank(voInfo.getAge()) && voInfo.getAge().endsWith("岁")) {
            poInfo.setAge(voInfo.getAge().substring(0, voInfo.getAge().length() - 1));
        }
        
        return poInfo;
    }

    private static ResumeVO.JobIntention convertJobIntention(ResumePO.JobIntention poIntention) {
        if (poIntention == null) {
            return new ResumeVO.JobIntention();
        }
        ResumeVO.JobIntention voIntention = new ResumeVO.JobIntention();
        BeanUtils.copyProperties(poIntention, voIntention);
        
        // 设置默认值
        voIntention.setPosition(StringUtils.defaultString(voIntention.getPosition(), ""));
        voIntention.setCity(StringUtils.defaultString(voIntention.getCity(), ""));
        voIntention.setSalary(StringUtils.defaultString(voIntention.getSalary(), "面议"));
        voIntention.setEntryTime(StringUtils.defaultString(voIntention.getEntryTime(), "随时到岗"));
        
        return voIntention;
    }

    private static ResumePO.JobIntention convertJobIntentionToPO(ResumeVO.JobIntention voIntention) {
        if (voIntention == null) {
            return new ResumePO.JobIntention();
        }
        ResumePO.JobIntention poIntention = new ResumePO.JobIntention();
        BeanUtils.copyProperties(voIntention, poIntention);
        return poIntention;
    }

    private static List<ResumeVO.Education> convertEducationList(List<ResumePO.Education> poList) {
        if (CollectionUtils.isEmpty(poList)) {
            return new ArrayList<>();
        }
        return poList.stream().map(po -> {
            ResumeVO.Education vo = new ResumeVO.Education();
            BeanUtils.copyProperties(po, vo);
            // 设置默认值
            vo.setSchool(StringUtils.defaultString(vo.getSchool(), ""));
            vo.setMajor(StringUtils.defaultString(vo.getMajor(), ""));
            vo.setDegree(StringUtils.defaultString(vo.getDegree(), ""));
            vo.setStartDate(StringUtils.defaultString(vo.getStartDate(), ""));
            vo.setEndDate(StringUtils.defaultString(vo.getEndDate(), ""));
            vo.setDescription(StringUtils.defaultString(vo.getDescription(), ""));
            vo.setGpa(StringUtils.defaultString(vo.getGpa(), ""));
            vo.setRank(StringUtils.defaultString(vo.getRank(), ""));
            return vo;
        }).collect(Collectors.toList());
    }

    private static List<ResumePO.Education> convertEducationListToPO(List<ResumeVO.Education> voList) {
        if (CollectionUtils.isEmpty(voList)) {
            return new ArrayList<>();
        }
        return voList.stream().map(vo -> {
            ResumePO.Education po = new ResumePO.Education();
            BeanUtils.copyProperties(vo, po);
            return po;
        }).collect(Collectors.toList());
    }

    private static List<ResumeVO.WorkExperience> convertWorkList(List<ResumePO.WorkExperience> poList) {
        if (CollectionUtils.isEmpty(poList)) {
            return new ArrayList<>();
        }
        return poList.stream().map(po -> {
            ResumeVO.WorkExperience vo = new ResumeVO.WorkExperience();
            BeanUtils.copyProperties(po, vo);
            // 设置默认值
            vo.setCompany(StringUtils.defaultString(vo.getCompany(), ""));
            vo.setDepartment(StringUtils.defaultString(vo.getDepartment(), ""));
            vo.setPosition(StringUtils.defaultString(vo.getPosition(), ""));
            vo.setStartDate(StringUtils.defaultString(vo.getStartDate(), ""));
            vo.setEndDate(StringUtils.defaultString(vo.getEndDate(), ""));
            vo.setDescription(StringUtils.defaultString(vo.getDescription(), ""));
            return vo;
        }).collect(Collectors.toList());
    }

    private static List<ResumePO.WorkExperience> convertWorkListToPO(List<ResumeVO.WorkExperience> voList) {
        if (CollectionUtils.isEmpty(voList)) {
            return new ArrayList<>();
        }
        return voList.stream().map(vo -> {
            ResumePO.WorkExperience po = new ResumePO.WorkExperience();
            BeanUtils.copyProperties(vo, po);
            return po;
        }).collect(Collectors.toList());
    }

    private static List<ResumeVO.Project> convertProjectList(List<ResumePO.Project> poList) {
        if (CollectionUtils.isEmpty(poList)) {
            return new ArrayList<>();
        }
        return poList.stream().map(po -> {
            ResumeVO.Project vo = new ResumeVO.Project();
            BeanUtils.copyProperties(po, vo);
            // 设置默认值
            vo.setName(StringUtils.defaultString(vo.getName(), ""));
            vo.setRole(StringUtils.defaultString(vo.getRole(), ""));
            vo.setStartDate(StringUtils.defaultString(vo.getStartDate(), ""));
            vo.setEndDate(StringUtils.defaultString(vo.getEndDate(), ""));
            vo.setDescription(StringUtils.defaultString(vo.getDescription(), ""));
            return vo;
        }).collect(Collectors.toList());
    }

    private static List<ResumePO.Project> convertProjectListToPO(List<ResumeVO.Project> voList) {
        if (CollectionUtils.isEmpty(voList)) {
            return new ArrayList<>();
        }
        return voList.stream().map(vo -> {
            ResumePO.Project po = new ResumePO.Project();
            BeanUtils.copyProperties(vo, po);
            return po;
        }).collect(Collectors.toList());
    }

    private static List<ResumeVO.CampusExperience> convertCampusList(List<ResumePO.CampusExperience> poList) {
        if (CollectionUtils.isEmpty(poList)) {
            return new ArrayList<>();
        }
        return poList.stream().map(po -> {
            ResumeVO.CampusExperience vo = new ResumeVO.CampusExperience();
            BeanUtils.copyProperties(po, vo);
            // 设置默认值
            vo.setOrganization(StringUtils.defaultString(vo.getOrganization(), ""));
            vo.setPosition(StringUtils.defaultString(vo.getPosition(), ""));
            vo.setStartDate(StringUtils.defaultString(vo.getStartDate(), ""));
            vo.setEndDate(StringUtils.defaultString(vo.getEndDate(), ""));
            vo.setDescription(StringUtils.defaultString(vo.getDescription(), ""));
            return vo;
        }).collect(Collectors.toList());
    }

    private static List<ResumePO.CampusExperience> convertCampusListToPO(List<ResumeVO.CampusExperience> voList) {
        if (CollectionUtils.isEmpty(voList)) {
            return new ArrayList<>();
        }
        return voList.stream().map(vo -> {
            ResumePO.CampusExperience po = new ResumePO.CampusExperience();
            BeanUtils.copyProperties(vo, po);
            return po;
        }).collect(Collectors.toList());
    }

    private static List<ResumeVO.Award> convertAwardList(List<ResumePO.Award> poList) {
        if (CollectionUtils.isEmpty(poList)) {
            return new ArrayList<>();
        }
        return poList.stream().map(po -> {
            ResumeVO.Award vo = new ResumeVO.Award();
            BeanUtils.copyProperties(po, vo);
            // 设置默认值
            vo.setName(StringUtils.defaultString(vo.getName(), ""));
            vo.setDate(StringUtils.defaultString(vo.getDate(), ""));
            vo.setDescription(StringUtils.defaultString(vo.getDescription(), ""));
            return vo;
        }).collect(Collectors.toList());
    }

    private static List<ResumePO.Award> convertAwardListToPO(List<ResumeVO.Award> voList) {
        if (CollectionUtils.isEmpty(voList)) {
            return new ArrayList<>();
        }
        return voList.stream().map(vo -> {
            ResumePO.Award po = new ResumePO.Award();
            BeanUtils.copyProperties(vo, po);
            return po;
        }).collect(Collectors.toList());
    }

    private static List<ResumeVO.Skill> convertSkillList(List<ResumePO.Skill> poList) {
        if (CollectionUtils.isEmpty(poList)) {
            return new ArrayList<>();
        }
        return poList.stream().map(po -> {
            ResumeVO.Skill vo = new ResumeVO.Skill();
            BeanUtils.copyProperties(po, vo);
            // 设置默认值
            vo.setName(StringUtils.defaultString(vo.getName(), ""));
            vo.setLevel(StringUtils.defaultString(vo.getLevel(), ""));
            vo.setDescription(StringUtils.defaultString(vo.getDescription(), ""));
            return vo;
        }).collect(Collectors.toList());
    }

    private static List<ResumePO.Skill> convertSkillListToPO(List<ResumeVO.Skill> voList) {
        if (CollectionUtils.isEmpty(voList)) {
            return new ArrayList<>();
        }
        return voList.stream().map(vo -> {
            ResumePO.Skill po = new ResumePO.Skill();
            BeanUtils.copyProperties(vo, po);
            return po;
        }).collect(Collectors.toList());
    }
}
