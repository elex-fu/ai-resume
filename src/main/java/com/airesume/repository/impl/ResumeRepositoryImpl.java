package com.airesume.repository.impl;

import com.airesume.model.ResumePO;
import com.airesume.model.UserPO;
import com.airesume.repository.ResumeRepository;
import com.airesume.vo.ResumeVO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class ResumeRepositoryImpl implements ResumeRepository {
    
    // 使用内存存储简历数据，实际项目中应该使用数据库
    private final Map<Long, ResumePO> resumeMap = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 在初始化时从mock数据文件加载数据
     */
    @PostConstruct
    public void init() {
        try {
            loadMockData();
        } catch (Exception e) {
            // 如果加载失败，创建一个空的简历数据
            ResumePO emptyResume = createEmptyResume();
            resumeMap.put(emptyResume.getId(), emptyResume);
        }
    }
    
    /**
     * 从JSON文件加载mock数据
     */
    private void loadMockData() throws IOException {
        try {
            // 从静态资源目录加载mock数据文件
            ClassPathResource resource = new ClassPathResource("static/js/resume-mock-data.json");
            InputStream is = resource.getInputStream();
            
            // 解析JSON
            Map<String, Object> rootNode = objectMapper.readValue(is, Map.class);
            Map<String, Object> resumeData = (Map<String, Object>) rootNode.get("resumeData");
            
            if (resumeData != null) {
                // 转换为ResumePO对象
                ResumePO resumePO = convertToResumePO(resumeData);
                
                // 确保ID生成器值大于已有最大ID
                if (resumePO.getId() == null) {
                    resumePO.setId(idGenerator.getAndIncrement());
                } else {
                    idGenerator.getAndUpdate(currentId -> 
                        Math.max(currentId, resumePO.getId() + 1));
                }
                
                // 存储到内存中
                resumeMap.put(resumePO.getId(), resumePO);
                
                System.out.println("成功从mock数据文件加载简历数据: ID=" + resumePO.getId());
            }
        } catch (IOException e) {
            System.err.println("加载mock数据失败: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * 将JSON数据转换为ResumePO对象
     */
    private ResumePO convertToResumePO(Map<String, Object> resumeData) {
        ResumePO resumePO = new ResumePO();
        
        // 设置基本属性
        Object idObj = resumeData.get("id");
        if (idObj != null) {
            resumePO.setId(Long.valueOf(idObj.toString()));
        }
        
        // 获取基本信息
        Map<String, Object> basicInfo = (Map<String, Object>) resumeData.get("basic");
        if (basicInfo != null) {
            resumePO.setName((String) basicInfo.get("name"));
            String ageStr = (String) basicInfo.get("age");
            if (ageStr != null && ageStr.endsWith("岁")) {
                try {
                    resumePO.setAge(Integer.parseInt(ageStr.substring(0, ageStr.length() - 1)));
                } catch (NumberFormatException e) {
                    // 解析失败时设置默认值
                    resumePO.setAge(0);
                }
            }
            resumePO.setPhone((String) basicInfo.get("phone"));
            resumePO.setEmail((String) basicInfo.get("email"));
            resumePO.setEducation((String) basicInfo.get("educationLevel"));
            resumePO.setExperience((String) basicInfo.get("experience"));
        }
        
        // 获取教育经历
        List<Map<String, Object>> educationList = (List<Map<String, Object>>) resumeData.get("education");
        if (educationList != null) {
            for (Map<String, Object> edu : educationList) {
                ResumePO.Education education = new ResumePO.Education();
                education.setSchool((String) edu.get("school"));
                education.setMajor((String) edu.get("major"));
                education.setDegree((String) edu.get("degree"));
                education.setPeriod((String) edu.get("eduTime"));
                education.setResumePO(resumePO);
                resumePO.getEducationList().add(education);
            }
        }
        
        // 获取工作经验
        List<Map<String, Object>> workList = (List<Map<String, Object>>) resumeData.get("work");
        if (workList != null) {
            for (Map<String, Object> work : workList) {
                ResumePO.Experience experience = new ResumePO.Experience();
                experience.setCompany((String) work.get("company"));
                experience.setPosition((String) work.get("position"));
                experience.setPeriod((String) work.get("workTime"));
                experience.setDescription((String) work.get("description"));
                experience.setResumePO(resumePO);
                resumePO.getExperienceList().add(experience);
            }
        }
        
        return resumePO;
    }
    
    /**
     * 创建一个空的简历对象
     */
    private ResumePO createEmptyResume() {
        ResumePO resumePO = new ResumePO();
        resumePO.setId(idGenerator.getAndIncrement());
        resumePO.setName("新简历");
        resumePO.setAge(0);
        resumePO.setPhone("");
        resumePO.setEmail("");
        resumePO.setEducation("");
        resumePO.setExperience("");
        return resumePO;
    }
    
    @Override
    public List<ResumePO> findByUser(UserPO userPO) {
        // 实际项目中应该根据用户ID查询
        return new ArrayList<>(resumeMap.values());
    }

    @Override
    public ResumePO save(ResumePO resumePO) {
        if (resumePO.getId() == null) {
            // 新简历，生成ID
            resumePO.setId(idGenerator.getAndIncrement());
        }
        // 保存简历
        resumeMap.put(resumePO.getId(), resumePO);
        return resumePO;
    }

    @Override
    public ResumePO findById(Long id) {
        return resumeMap.get(id);
    }

    @Override
    public List<ResumePO> findAll() {
        return new ArrayList<>(resumeMap.values());
    }

    @Override
    public void deleteById(Long id) {
        resumeMap.remove(id);
    }
}
