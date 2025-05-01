package com.airesume.service.impl;

import com.airesume.bo.OptimizeResult;
import com.airesume.bo.OptimizeResumeBO;
import com.airesume.factory.ResumeVOFactory;
import com.airesume.llm.LLMService;
import com.airesume.model.ResumePO;
import com.airesume.model.UserPO;
import com.airesume.repository.ResumeRepository;
import com.airesume.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class ResumeServiceImpl implements ResumeService {
    
    @Autowired
    private ResumeRepository resumeRepository;
    
    @Autowired
    private LLMService llmService;
    
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
        ResumePO resumePO = new ResumePO();
        
        // 设置基本信息
        ResumePO.BasicInfo basicInfo = new ResumePO.BasicInfo();
        basicInfo.setName("Generated Resume");
        resumePO.setBasicInfo(basicInfo);
        
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
                String fileName = file.getOriginalFilename();
                if (fileName != null) {
                    if (fileName.endsWith(".txt") || fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
                        fileContent = new String(file.getBytes());
                    } else if (fileName.endsWith(".pdf")) {
                        fileContent = "PDF文件内容: " + fileName;
                    }
                }
            }
            
            // 合并描述和文件内容
            String combinedContent = description;
            if (fileContent != null && !fileContent.isEmpty()) {
                combinedContent += "\n\n文件内容:\n" + fileContent;
            }
            
            // 创建简历对象
            ResumePO resumePO = new ResumePO();
            
            // 设置基本信息
            ResumePO.BasicInfo basicInfo = new ResumePO.BasicInfo();
            basicInfo.setName("张三");
            basicInfo.setEmail("zhangsan@example.com");
            basicInfo.setPhone("13800138000");
            resumePO.setBasicInfo(basicInfo);
            
            // 添加教育经历
            ResumePO.Education education = new ResumePO.Education();
            education.setSchool("北京大学");
            education.setMajor("计算机科学");
            education.setDegree("学士");
            education.setStartDate("2015");
            education.setEndDate("2019");
            resumePO.getEducationList().add(education);
            
            // 添加工作经历
            ResumePO.WorkExperience work = new ResumePO.WorkExperience();
            work.setCompany("科技有限公司");
            work.setPosition("软件工程师");
            work.setStartDate("2019");
            work.setEndDate("至今");
            work.setDescription("负责后端开发，使用Java和Spring框架");
            resumePO.getWorkList().add(work);
            
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


    /**
     * 简历智能优化
     * 根据简历id、优化描述进行简历优化
     * 调用大模型进行优化
     * 返回优化后的简历，并提供新老简历对比，不需要保存，需要让用户确认后才能保存
     */
    @Override
    public OptimizeResumeBO optimizeResume(Long resumeId, String optimizeDescription) {
        // 获取原始简历
        ResumePO originalResume = getResumeById(resumeId);
        
        // 调用大模型服务进行优化
        OptimizeResult optimizeResult = llmService.optimizeResume(originalResume, optimizeDescription);
        
        // 构建返回结果
        OptimizeResumeBO result = new OptimizeResumeBO();
        result.setOriginalResume(ResumeVOFactory.createResumeVO(originalResume));
        result.setOptimizedResume(optimizeResult.isHasChanges() ?
                ResumeVOFactory.createResumeVO(optimizeResult.getOptimizedResume()) : null);
        result.setOptimizeDescription(optimizeDescription);
        result.setOptimizeResult(optimizeResult.getOptimizeExplanation());
        result.setOptimizeTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        return result;
    }
} 