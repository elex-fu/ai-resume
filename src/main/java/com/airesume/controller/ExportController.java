package com.airesume.controller;

import com.airesume.service.ExportService;
import com.itextpdf.text.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/export")
public class ExportController {
    
    @Autowired
    private ExportService exportService;
    
    @PostMapping("/pdf")
    public ResponseEntity<byte[]> exportToPDF(@RequestBody ExportRequest request) {
        try {
            byte[] pdfBytes = exportService.exportToPDF(request.getHtml());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", request.getFilename());
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
        } catch (Exception  e) {
            return ResponseEntity.status(500)
                .body(("导出PDF失败: " + e.getMessage()).getBytes());
        }
    }
    
    @PostMapping("/word")
    public ResponseEntity<byte[]> exportToWord(@RequestBody ExportRequest request) {
        try {
            byte[] wordBytes = exportService.exportToWord(request.getHtml());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", request.getFilename());
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(wordBytes);
        } catch (IOException e) {
            return ResponseEntity.status(500)
                .body(("导出Word失败: " + e.getMessage()).getBytes());
        }
    }
    
    public static class ExportRequest {
        private String html;
        private String filename;
        
        public String getHtml() {
            return html;
        }
        
        public void setHtml(String html) {
            this.html = html;
        }
        
        public String getFilename() {
            return filename;
        }
        
        public void setFilename(String filename) {
            this.filename = filename;
        }
    }
} 