package com.airesume.util;

import com.airesume.model.ResumePO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
public class MockUtil {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 从mock数据文件加载简历数据
     */
    public static ResumePO loadMockResume() {
        try {
            ClassPathResource resource = new ClassPathResource("static/mock/resume-mock-data.json");
            InputStream is = resource.getInputStream();
            return objectMapper.readValue(is, ResumePO.class);
        } catch (IOException e) {
            log.error("加载mock数据失败: ", e);
            return createEmptyResume();
        }
    }
    
    /**
     * 创建一个空的简历对象
     */
    private static ResumePO createEmptyResume() {
        return new ResumePO();
    }
} 