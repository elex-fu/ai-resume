package com.airesume.repository.impl;

import com.airesume.model.ResumePO;
import com.airesume.model.UserPO;
import com.airesume.repository.ResumeRepository;
import org.springframework.stereotype.Repository;

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
