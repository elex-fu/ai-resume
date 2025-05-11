package com.airesume.util.file;

import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import static org.junit.Assert.*;


import java.io.IOException;


import java.util.List;

@Slf4j
public class AvatarExtractorTest {
    
    private static final String PDF_PATH = "src/main/resources/data/cv_demo.pdf";
    private static final String DOC_PATH = "src/main/resources/data/demo.doc";
    
    @Test
    public void testExtractFromPDF() throws IOException {
        log.info("开始测试：从PDF中提取头像");

        //增加try catch 
        try {
            List<AvatarExtractor.ImageInfo> avatars = AvatarExtractor.extractFromPDF(PDF_PATH);
            
            assertNotNull("头像列表不应该为null", avatars);
            log.info("找到{}个可能的头像", avatars.size());
            
            for (int i = 0; i < avatars.size(); i++) {
                AvatarExtractor.ImageInfo avatar = avatars.get(i);
                log.info("头像 #{}: 尺寸={}x{}, 格式={}, 文件名={}", 
                        i + 1, avatar.getWidth(), avatar.getHeight(), 
                        avatar.getFormat(), avatar.getFileName());
            }
        } catch (Exception e) {
            log.error("测试失败", e);
        }
    }
    
    @Test
    public void testExtractFromWord() throws IOException {
        log.info("开始测试：从Word中提取头像");
        List<AvatarExtractor.ImageInfo> avatars = AvatarExtractor.extractFromWord(DOC_PATH);
        
        assertNotNull("头像列表不应该为null", avatars);
        log.info("找到{}个可能的头像", avatars.size());
        
        for (int i = 0; i < avatars.size(); i++) {
            AvatarExtractor.ImageInfo avatar = avatars.get(i);
            log.info("头像 #{}: 尺寸={}x{}, 格式={}, 文件名={}", 
                    i + 1, avatar.getWidth(), avatar.getHeight(), 
                    avatar.getFormat(), avatar.getFileName());
        }
    }
} 