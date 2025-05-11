package com.airesume.util.file;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;

public class FileConversionUtil {
    
    /**
     * PDF转Word
     * @param pdfPath PDF文件路径
     * @param outputPath 输出文件路径
     * @return 转换后的文件路径
     */
    public static String pdfToWord(String pdfPath, String outputPath) throws IOException {
        if (outputPath == null) {
            outputPath = pdfPath.substring(0, pdfPath.lastIndexOf(".")) + ".docx";
        }
        
        PDDocument doc = PDDocument.load(new File(pdfPath));
        int pageCount = doc.getNumberOfPages();
        
        FileOutputStream fos = new FileOutputStream(outputPath);
        Writer writer = new OutputStreamWriter(fos, "UTF-8");
        PDFTextStripper stripper = new PDFTextStripper();
        
        stripper.setSortByPosition(true);
        stripper.setStartPage(1);
        stripper.setEndPage(pageCount);
        stripper.writeText(doc, writer);
        
        writer.close();
        doc.close();
        
        return outputPath;
    }
    
    /**
     * PDF转文本
     * @param pdfPath PDF文件路径
     * @return 转换后的文本内容
     */
    public static String pdfToText(String pdfPath) throws IOException {
        PDDocument doc = PDDocument.load(new File(pdfPath));
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(doc);
        doc.close();
        return text;
    }
    
    /**
     * Word转文本
     * @param wordPath Word文件路径
     * @return 转换后的文本内容
     */
    public static String wordToText(String wordPath) throws IOException {
        String text;
        if (wordPath.toLowerCase().endsWith(".docx")) {
            try (FileInputStream fis = new FileInputStream(wordPath);
                 XWPFDocument document = new XWPFDocument(fis)) {
                XWPFWordExtractor extractor = new XWPFWordExtractor(document);
                text = extractor.getText();
            }
        } else if (wordPath.toLowerCase().endsWith(".doc")) {
            try (FileInputStream fis = new FileInputStream(wordPath);
                 HWPFDocument document = new HWPFDocument(fis)) {
                WordExtractor extractor = new WordExtractor(document);
                text = extractor.getText();
            }
        } else {
            throw new IllegalArgumentException("不支持的Word文件格式: " + wordPath);
        }
        return text;
    }
} 