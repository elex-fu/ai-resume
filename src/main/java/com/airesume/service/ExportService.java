package com.airesume.service;

import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import com.itextpdf.text.pdf.BaseFont;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
public class ExportService {
    
    private static final String FONT_PATH = "/static/fonts/";
    private static final String BASE_CSS_PATH = "/css/resume-base.css";
    
    /**
     * 导出HTML为PDF
     * @param html HTML内容
     * @return PDF字节数组
     */
    public byte[] exportToPDF(String html) throws IOException, com.lowagie.text.DocumentException {
        // 创建PDF渲染器
        ITextRenderer renderer = new ITextRenderer();
        
        // 设置中文字体
        String fontPath = getClass().getResource(FONT_PATH).getPath();
        renderer.getFontResolver().addFont(fontPath + "simsun.ttf", 
            BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
        
        // 加载HTML内容
        Document doc = Jsoup.parse(html);
        doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        
        // 添加基础样式
        Element styleElement = doc.head().appendElement("style");
        styleElement.attr("type", "text/css");
        styleElement.text(loadBaseCSS());
        
        // 添加导出优化类
        doc.body().addClass("export-optimized");
        
        // 优化图片
        optimizeImages(doc);
        
        // 渲染PDF
        renderer.setDocumentFromString(doc.html());
        renderer.layout();
        
        // 生成PDF
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        renderer.createPDF(outputStream);
        renderer.finishPDF();
        
        return outputStream.toByteArray();
    }
    
    /**
     * 导出HTML为Word
     * @param html HTML内容
     * @return Word字节数组
     */
    public byte[] exportToWord(String html) throws IOException {
        // 创建Word文档
        XWPFDocument document = new XWPFDocument();
        
        // 解析HTML
        Document doc = Jsoup.parse(html);
        
        // 添加基础样式
        Element styleElement = doc.head().appendElement("style");
        styleElement.attr("type", "text/css");
        styleElement.text(loadBaseCSS());
        
        // 添加导出优化类
        doc.body().addClass("export-optimized");
        
        // 优化图片
        optimizeImages(doc);
        
        // 转换HTML内容到Word
        Elements paragraphs = doc.select("p, h1, h2, h3, h4, h5, h6");
        for (Element element : paragraphs) {
            XWPFParagraph paragraph = document.createParagraph();
            XWPFRun run = paragraph.createRun();
            
            // 设置文本样式
            String tagName = element.tagName();
            if (tagName.startsWith("h")) {
                run.setBold(true);
                run.setFontSize(16);
            }
            
            run.setText(element.text());
        }
        
        // 生成Word
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        
        return outputStream.toByteArray();
    }
    
    /**
     * 加载基础CSS
     */
    private String loadBaseCSS() throws IOException {
        return new String(Files.readAllBytes(
            Paths.get(getClass().getResource(BASE_CSS_PATH).getPath())
        ));
    }
    
    /**
     * 优化图片
     */
    private void optimizeImages(Document doc) {
        Elements images = doc.select("img");
        for (Element img : images) {
            // 确保图片有最大宽度
            img.attr("style", "max-width: 100%; height: auto;");
            
            // 添加alt属性（如果缺失）
            if (!img.hasAttr("alt")) {
                img.attr("alt", "图片");
            }
        }
    }
} 