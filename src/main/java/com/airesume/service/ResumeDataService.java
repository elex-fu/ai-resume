package com.airesume.service;

import com.airesume.vo.ResumeVO;
import java.util.List;

/**
 * 简历数据服务接口
 */
public interface ResumeDataService {

    /**
     * 获取所有简历数据
     * @return 简历数据列表
     */
    List<ResumeVO> getAllResumeData();

    /**
     * 根据ID获取简历数据
     * @param id 简历ID
     * @return 简历数据对象
     */
    ResumeVO getResumeDataById(Long id);

    /**
     * 保存简历数据
     * @param resumeVO 简历数据对象
     * @return 保存后的简历数据
     */
    ResumeVO saveResumeData(ResumeVO resumeVO);
} 