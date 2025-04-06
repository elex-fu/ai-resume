package com.airesume.service;

import com.airesume.model.ResumePO;
import com.airesume.model.UserPO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 简历服务接口
 */
public interface ResumeService {

    /**
     * 保存简历
     *
     * @param resumePO 简历对象
     * @return 保存后的简历
     */
    ResumePO saveResume(ResumePO resumePO);

    /**
     * 根据ID获取简历
     *
     * @param id 简历ID
     * @return 简历对象
     */
    ResumePO getResumeById(Long id);

    /**
     * 获取所有简历
     *
     * @return 简历列表
     */
    List<ResumePO> getAllResumes();

    /**
     * 根据用户获取简历列表
     *
     * @param userPO 用户对象
     * @return 简历列表
     */
    List<ResumePO> getResumesByUser(UserPO userPO);

    /**
     * 删除简历
     *
     * @param id 简历ID
     */
    void deleteResume(Long id);

    /**
     * 使用AI生成简历
     *
     * @param content 简历内容描述
     * @return 生成的简历对象
     */
    ResumePO generateResume(String content);


    /**
     * 使用AI生成简历
     * String description, MultipartFile file
     *
     * @param description
     * @return
     */
    ResumePO generateResume(String description, MultipartFile file);
    /**
     * 生成简历PDF
     *
     * @param id 简历ID
     * @return PDF文件的字节数组
     */
    byte[] generatePDF(Long id);
    /**
     *
     * @param id
     * @param template
     * @return
     */
    ResumePO changeTemplate(String id, String template);

    public byte[] downloadResume(String id, String format);

    String[] generateInterviewSuggestions(String id);

    String optimizeContent(String id, String content, String type);

} 