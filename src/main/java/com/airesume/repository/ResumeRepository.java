package com.airesume.repository;

import com.airesume.model.ResumePO;
import com.airesume.model.UserPO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 简历数据访问接口
 */
public interface ResumeRepository  {
    
    /**
     * 根据用户查询简历列表
     * @param userPO 用户对象
     * @return 简历列表
     */
    List<ResumePO> findByUser(UserPO userPO);

    ResumePO save(ResumePO resumePO);

    ResumePO findById(Long id);

    List<ResumePO> findAll();

    void deleteById(Long id);

}