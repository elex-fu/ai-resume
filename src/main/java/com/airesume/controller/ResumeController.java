package com.airesume.controller;

import com.airesume.bo.OptimizeResumeBO;
import com.airesume.controller.vo.OptimizeResumeRequestVO;
import com.airesume.factory.ResumeVOFactory;
import com.airesume.model.ResumePO;
import com.airesume.service.ResumeService;
import com.airesume.service.UserService;
import com.airesume.controller.vo.ResumeVO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ResumeVO> createResume(@RequestBody ResumeVO resumeVO) {
        // 暂时不使用用户认证，后续可以添加
        ResumePO resumePO = ResumeVOFactory.createResumePO(resumeVO);
        resumePO = resumeService.saveResume(resumePO);
        ResumeVO respResume = ResumeVOFactory.createResumeVO(resumePO);
        return ResponseEntity.ok(respResume);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResumeVO> updateResume(@PathVariable Long id,
                                                 @RequestBody ResumePO resumePO) {
        // 暂时不使用用户认证，后续可以添加
        ResumePO existingResumePO = resumeService.getResumeById(id);
        resumePO.setId(id);

        existingResumePO = resumeService.saveResume(resumePO);
        ResumeVO respResume = ResumeVOFactory.createResumeVO(existingResumePO);
        return ResponseEntity.ok(respResume);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeVO> getResume(@PathVariable Long id) {
        // 暂时不使用用户认证，后续可以添加
        ResumePO resumePO = resumeService.getResumeById(id);

        ResumeVO respResume = ResumeVOFactory.createResumeVO(resumePO);
        return ResponseEntity.ok(respResume);
    }

    @GetMapping
    public ResponseEntity<List<ResumeVO>> getUserResumes() {
        // 暂时不使用用户认证，后续可以添加
        List<ResumePO> resumePOs = resumeService.getAllResumes();
        List<ResumeVO> resumeList = ResumeVOFactory.createResumeVOList(resumePOs);
        return ResponseEntity.ok(resumeList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable Long id) {
        // 暂时不使用用户认证，后续可以添加
        resumeService.deleteResume(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateResume(@RequestParam(value = "content", required = false) String content,
                                           @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            // 检查是否有内容或文件
            if ((content == null || content.trim().isEmpty()) && (file == null || file.isEmpty())) {
                return ResponseEntity.badRequest().body("简历内容或文件不能为空");
            }
            
            // 调用AI服务生成简历
            ResumePO resumePO;
            if (file != null && !file.isEmpty()) {
                // 如果有文件，使用带文件的生成方法
                resumePO = resumeService.generateResume(content, file);
            } else {
                // 如果只有内容，使用原来的方法
                resumePO = resumeService.generateResume(content);
            }
            
            return ResponseEntity.ok(resumePO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("生成简历失败：" + e.getMessage());
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadResume(@PathVariable Long id) {
        try {
            byte[] pdfContent = resumeService.generatePDF(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "resume.pdf");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfContent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("生成PDF失败：" + e.getMessage());
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // 创建上传目录
            String uploadDir = "uploads/";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            // 生成唯一文件名
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            
            // 保存文件
            Files.write(filePath, file.getBytes());
            
            // 返回文件信息
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("filePath", filePath.toString());
            response.put("content", "文件内容预览..."); // 这里可以添加文件内容解析逻辑
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("文件上传失败：" + e.getMessage());
        }
    }
    /**
     * 简历智能优化
     * 根据简历id、优化描述进行简历优化
     * 调用大模型进行优化
     * 返回优化后的简历，并提供新老简历对比。
     */
    @PostMapping("/optimize")
    public ResponseEntity<?> optimizeResume(@RequestBody OptimizeResumeRequestVO requestVO) {
        // 检查resumeId是否存在
        ResumePO resumePO = resumeService.getResumeById(requestVO.getResumeId());
        if (resumePO == null) {
            return ResponseEntity.badRequest().body("简历不存在");
        }
        // 检查optimizeDescription是否为空
        if (requestVO.getOptimizeDescription() == null || requestVO.getOptimizeDescription().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("优化描述不能为空");
        }
                                            // 调用大模型进行优化
        OptimizeResumeBO optimizedResume = resumeService.optimizeResume(requestVO.getResumeId(), requestVO.getOptimizeDescription());
        return ResponseEntity.ok(optimizedResume);
    }
} 