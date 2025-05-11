package com.airesume.util.file;

import lombok.extern.slf4j.Slf4j;
import org.junit.Test;
import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
public class FileConversionUtilTest {
    
    private static final String PDF_PATH = "src/main/resources/data/cv_demo.pdf";
    private static final String DOC_PATH = "src/main/resources/data/demo.doc";
    
    @Test
    public void testPdfToWord() throws IOException {
        log.info("开始测试：PDF转Word");
        log.info("输入PDF文件：{}", PDF_PATH);
        String wordPath = FileConversionUtil.pdfToWord(PDF_PATH, null);
        log.info("输出Word文件：{}", wordPath);
        
        File wordFile = new File(wordPath);
        assertTrue("Word文件应该被创建", wordFile.exists());
        assertTrue("Word文件大小应该大于0", wordFile.length() > 0);
        log.info("Word文件大小：{} 字节", wordFile.length());
        
        Files.deleteIfExists(Paths.get(wordPath));
        log.info("测试完成，已清理输出文件。\n");
    }
    
    @Test
    public void testPdfToText() throws IOException {
        log.info("开始测试：PDF转文本");
        log.info("输入PDF文件：{}", PDF_PATH);
        String text = FileConversionUtil.pdfToText(PDF_PATH);
        
        assertNotNull("文本内容不应该为null", text);
        assertFalse("文本内容不应该为空", text.trim().isEmpty());
        log.info("文本内容长度：{} 字符", text.length());
        log.info("文本内容预览：{}", text.substring(0, Math.min(100, text.length())).replaceAll("\n", " ") + (text.length() > 100 ? "..." : ""));
        
        log.info("测试完成。\n");
    }
    
    @Test
    public void testWordToText() throws IOException {
        log.info("开始测试：Word转文本");
        log.info("输入Word文件：{}", DOC_PATH);
        String text = FileConversionUtil.wordToText(DOC_PATH);
        
        assertNotNull("文本内容不应该为null", text);
        assertFalse("文本内容不应该为空", text.trim().isEmpty());
        log.info("文本内容长度：{} 字符", text.length());
        log.info("文本内容预览：{}", text.substring(0, Math.min(100, text.length())).replaceAll("\n", " ") + (text.length() > 100 ? "..." : ""));
        
        log.info("测试完成。\n");
    }
} 