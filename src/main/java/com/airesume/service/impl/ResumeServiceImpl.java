package com.airesume.service.impl;

import com.airesume.model.ResumePO;
import com.airesume.model.UserPO;
import com.airesume.repository.ResumeRepository;
import com.airesume.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;

@Service
public class ResumeServiceImpl implements ResumeService {
    
    @Autowired
    private ResumeRepository resumeRepository;
    
    @Override
    public ResumePO saveResume(ResumePO resumePO) {
        return resumeRepository.save(resumePO);
    }
    
    @Override
    public ResumePO getResumeById(Long id) {
        ResumePO resumePO = resumeRepository.findById(id);
        if (resumePO == null) {
            throw new EntityNotFoundException("简历不存在: " + id);
        }
        return resumePO;
    }
    
    @Override
    public List<ResumePO> getAllResumes() {
        return resumeRepository.findAll();
    }
    
    @Override
    public List<ResumePO> getResumesByUser(UserPO userPO) {
        return resumeRepository.findByUser(userPO);
    }
    
    @Override
    public void deleteResume(Long id) {
        resumeRepository.deleteById(id);
    }
    
    @Override
    public ResumePO generateResume(String content) {
        // TODO: 调用AI服务生成简历
        ResumePO resumePO = new ResumePO();
        // 设置基本信息
        resumePO.setName("Generated Resume");
        // 其他字段设置...
        return saveResume(resumePO);
    }
    
    @Override
    public byte[] generatePDF(Long id) {
        ResumePO resumePO = getResumeById(id);
        // TODO: 生成PDF文件
        return new byte[0]; // 临时返回空数组
    }
    
    @Override
    public ResumePO generateResume(String description, MultipartFile file) {
        try {
            // 解析文件内容
            String fileContent = "";
            if (file != null && !file.isEmpty()) {
                // 根据文件类型解析内容
                String fileName = file.getOriginalFilename();
                if (fileName != null) {
                    if (fileName.endsWith(".txt") || fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
                        // 简单处理文本文件，实际项目中应该使用更复杂的解析库
                        fileContent = new String(file.getBytes());
                    } else if (fileName.endsWith(".pdf")) {
                        // PDF文件需要特殊处理，这里简单返回提示
                        fileContent = "PDF文件内容: " + fileName;
                    }
                }
            }
            
            // 合并描述和文件内容
            String combinedContent = description;
            if (fileContent != null && !fileContent.isEmpty()) {
                combinedContent += "\n\n文件内容:\n" + fileContent;
            }
            
            // 调用AI服务生成简历
            // 这里使用模拟数据，实际项目中应该调用AI服务
            ResumePO resumePO = new ResumePO();
            resumePO.setName("张三");
            resumePO.setEmail("zhangsan@example.com");
            resumePO.setPhone("13800138000");
            
            // 添加教育经历
            ResumePO.Education education = new ResumePO.Education();
            education.setSchool("北京大学");
            education.setMajor("计算机科学");
            education.setDegree("学士");
            education.setPeriod("2015-2019");
            resumePO.getEducationList().add(education);
            
            // 添加工作经验
            ResumePO.Experience experience = new ResumePO.Experience();
            experience.setCompany("科技有限公司");
            experience.setPosition("软件工程师");
            experience.setPeriod("2019-至今");
            experience.setDescription("负责后端开发，使用Java和Spring框架");
            resumePO.getExperienceList().add(experience);
            
            // 存储简历
            return saveResume(resumePO);
        } catch (Exception e) {
            throw new RuntimeException("处理文件失败: " + e.getMessage());
        }
    }
    
    @Override
    public ResumePO changeTemplate(String id, String template) {
        ResumePO resumePO = getResumeById(Long.valueOf(id));
        // TODO: 根据模板重新生成简历内容
        return resumePO;
    }
    
    @Override
    public String optimizeContent(String id, String content, String type) {
        // TODO: 调用AI模型优化内容
        switch (type) {
            case "optimize":
                return "优化后的内容: " + content;
            case "expand":
                return "扩展后的内容: " + content + " (更多详细信息...)";
            case "simplify":
                return "精简后的内容: " + content.substring(0, Math.min(content.length(), 50)) + "...";
            default:
                throw new RuntimeException("不支持的优化类型");
        }
    }
    
    @Override
    public byte[] downloadResume(String id, String format) {
        ResumePO resumePO = getResumeById(Long.valueOf(id));
        // TODO: 根据简历内容和模板生成对应格式的文件
        return new byte[0];
    }
    
    @Override
    public String[] generateInterviewSuggestions(String id) {
        ResumePO resumePO = getResumeById(Long.valueOf(id));
        // TODO: 调用AI模型生成面试建议
        return new String[]{
            "请详细描述您在项目中使用Spring Boot的经验",
            "您如何处理团队协作中的技术分歧？",
            "请分享一个您解决过的技术难题"
        };
    }
} 