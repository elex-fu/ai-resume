package com.airesume.util.file;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.usermodel.Picture;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFPictureData;
import org.bytedeco.javacpp.BytePointer;
import org.bytedeco.javacpp.Loader;
import org.bytedeco.opencv.opencv_java;
import org.bytedeco.opencv.opencv_objdetect.CascadeClassifier;
import org.bytedeco.opencv.opencv_core.Mat;
import org.bytedeco.opencv.opencv_core.RectVector;

import static org.bytedeco.opencv.global.opencv_imgcodecs.IMREAD_COLOR;
import static org.bytedeco.opencv.global.opencv_imgcodecs.imdecode;
import static org.bytedeco.opencv.global.opencv_imgproc.COLOR_BGR2GRAY;
import static org.bytedeco.opencv.global.opencv_imgproc.cvtColor;
import static org.bytedeco.opencv.global.opencv_imgcodecs.imwrite;
import static org.bytedeco.opencv.global.opencv_imgcodecs.imread;

import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.awt.image.DataBufferInt;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.io.BufferedInputStream;

@Slf4j
public class AvatarExtractor {
    
    private static final String FACE_CASCADE_PATH = "src/main/resources/data/haarcascade_frontalface_default.xml";
    private static final String IMG_DIR = "src/main/resources/data/img";
    
    static {
        // 加载OpenCV本地库
        Loader.load(opencv_java.class);
        // 确保图片保存目录存在
        createImageDirectory();
    }
    
    /**
     * 创建图片保存目录
     */
    private static void createImageDirectory() {
        File directory = new File(IMG_DIR);
        if (!directory.exists()) {
            if (!directory.mkdirs()) {
                log.error("无法创建图片保存目录: {}", IMG_DIR);
            }
        }
    }
    
    /**
     * 生成唯一的图片文件名
     * @param sourcePath PDF文件路径
     * @param index 图片索引
     * @return 唯一的文件名
     */
    private static String generateUniqueImageName(String sourcePath, int index) {
        if (sourcePath == null) {
            return "unknown_source_img_" + index + ".png";
        }
        String baseName = new File(sourcePath).getName();
        baseName = baseName.substring(0, baseName.lastIndexOf('.'));
        return baseName + "_img_" + index + ".png";
    }
    
    /**
     * 将图片保存到本地文件系统
     * @param images 要保存的图片列表
     * @param sourcePath 源文件路径
     */
    private static void saveImagesToLocal(List<PDImageXObject> images, String sourcePath) {
        if (images == null || images.isEmpty()) {
            return;
        }
        
        for (int i = 0; i < images.size(); i++) {
            PDImageXObject image = images.get(i);
            try {
                String imgPath = IMG_DIR + File.separator + generateUniqueImageName(sourcePath, i);
                BufferedImage bufferedImage = image.getImage();
                javax.imageio.ImageIO.write(bufferedImage, "PNG", new File(imgPath));
                log.info("图片已保存到: {}", imgPath);
            } catch (IOException e) {
                log.error("保存图片失败: {}", e.getMessage());
            }
        }
    }
    
    @Data
    public static class ImageInfo {
        private byte[] imageData;
        private int width;
        private int height;
        private float positionY;
        private float pageHeight;
        private String fileName;
        private String format;
        private String tag;
    }
    
    /**
     * 综合判断图片是否可能是头像
     * @param imageInfo 图片信息
     * @return 是否可能是头像
     */
    private static boolean isLikelyAvatar(ImageInfo imageInfo) {
        int score = 0;
        StringBuilder tagBuilder = new StringBuilder();
        
        // 1. 尺寸特征判断
        if (imageInfo.getWidth() >= 80 && imageInfo.getWidth() <= 500 && 
            imageInfo.getHeight() >= 80 && imageInfo.getHeight() <= 500) {
            score += 30;
            tagBuilder.append("size_ok_");
        }
        
        // 2. 宽高比判断
        float aspectRatio = (float) imageInfo.getWidth() / imageInfo.getHeight();
        if (aspectRatio > 0.8 && aspectRatio < 1.2) {
            score += 20;
            tagBuilder.append("ratio_ok_");
        }
        
        // 3. 位置特征判断
        if (imageInfo.getPositionY() > imageInfo.getPageHeight() * 0.7) {
            score += 20;
            tagBuilder.append("pos_ok_");
        }
        
        // 4. 文件名特征判断
        if (imageInfo.getFileName() != null && 
            (imageInfo.getFileName().toLowerCase().contains("avatar") || 
             imageInfo.getFileName().toLowerCase().contains("photo"))) {
            score += 15;
            tagBuilder.append("name_ok_");
        }
        
        // 5. OpenCV人脸检测
        if (hasFace(imageInfo.getImageData(), imageInfo.getFileName(), 0)) {
            score += 60;
            tagBuilder.append("face_ok_");
        }
        
        boolean isAvatar = score >= 60;
        if (isAvatar) {
            // 设置标签信息
            tagBuilder.insert(0, "score_" + score + "_");
            imageInfo.setTag(tagBuilder.toString());
        }

             
        // 打印命中信息
        log.info("找到可能的头像: 标签={}, 尺寸={}x{}, 格式={}, 得分={}", 
                    imageInfo.getTag(),
                    imageInfo.getWidth(), 
                    imageInfo.getHeight(),
                    imageInfo.getFormat(),
                    score);
        return isAvatar;
    }
    
    /**
     * 保存图像数据到本地文件
     * @param imageData 图像数据
     * @param filePath 文件路径
     */
    private static void saveImageToLocal(byte[] imageData, String filePath) {
        if (imageData == null || imageData.length == 0) {
            log.error("图像数据为空");
            return;
        }
        
        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(imageData);
            fos.flush();
        } catch (IOException e) {
            log.error("保存图像失败: {}", e.getMessage());
        }
    }
    
    /**
     * 使用OpenCV检测图片中是否包含人脸
     * @param imageData 图片数据
     * @param sourcePath 源文件路径
     * @param imageIndex 图片索引
     * @return 是否包含人脸
     */
    private static boolean hasFace(byte[] imageData, String sourcePath, int imageIndex) {
        CascadeClassifier faceDetector = null;
        Mat image = null;
        Mat grayImage = null;
        RectVector faceDetections = null;
        
        try {
            // 加载人脸检测器
            faceDetector = new CascadeClassifier(FACE_CASCADE_PATH);
            if (faceDetector.isNull()) {
                log.error("人脸检测器加载失败: {}", FACE_CASCADE_PATH);
                return false;
            }
            
            // 将字节数组转换为Mat对象
            try {
                // 先将图像数据保存为临时文件
                String tempImagePath = IMG_DIR + File.separator + generateUniqueImageName(sourcePath, imageIndex);
                saveImageToLocal(imageData, tempImagePath);
                
                log.info("临时图像路径: {}, 数据长度: {}", tempImagePath, imageData.length);
                
                // 从文件加载图像
                image = imread(tempImagePath, IMREAD_COLOR);
                
                if (image == null || image.empty()) {
                    log.warn("无法解码图像数据，数据长度: {}", imageData.length);
                    return false;
                }
                
                // 验证加载的图像
                log.info("成功加载图像，尺寸: {}x{}", image.cols(), image.rows());
                
            } catch (Exception e) {
                log.error("图像处理失败", e);
                return false;
            }
            
            // 保存解码后的图像用于调试
            String debugPath = IMG_DIR + File.separator + "debug_decoded_" + generateUniqueImageName(sourcePath, imageIndex);
            imwrite(debugPath, image);
            log.debug("保存解码后的图像到: {}", debugPath);
            
            // 转换为灰度图
            grayImage = new Mat();
            cvtColor(image, grayImage, COLOR_BGR2GRAY);
            
            // 检测人脸
            faceDetections = new RectVector();
            faceDetector.detectMultiScale(grayImage, faceDetections);
            
            boolean hasFace = faceDetections.size() > 0;
            if (hasFace) {
                log.debug("检测到{}个人脸", faceDetections.size());
            }
            return hasFace;
        } catch (Exception e) {
            log.error("人脸检测失败: {}", e.getMessage(), e);
            return false;
        } finally {
            // 释放资源
            if (image != null) {
                image.release();
            }
            if (grayImage != null) {
                grayImage.release();
            }
            if (faceDetections != null) {
                faceDetections.close();
            }
            if (faceDetector != null) {
                faceDetector.close();
            }
        }
    }
    
    /**
     * 从PDF页面中获取所有图片
     * @param page PDF页面
     * @return 图片列表
     */
    private static List<PDImageXObject> getImagesFromPage(PDPage page) {
        List<PDImageXObject> images = new ArrayList<>();
        try {
            // 获取页面的资源字典
            PDResources resources = page.getResources();
            if (resources == null) {
                return images;
            }

            // 遍历所有XObject资源
            for (COSName name : resources.getXObjectNames()) {
                try {
                    // 获取XObject对象
                    org.apache.pdfbox.pdmodel.graphics.PDXObject xObject = resources.getXObject(name);
                    // 检查是否为图片对象
                    if (xObject instanceof PDImageXObject) {
                        images.add((PDImageXObject) xObject);
                    }
                } catch (IOException e) {
                    log.warn("提取图片时发生错误: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("从PDF页面提取图片失败", e);
        }
        return images;
    }
    
    /**
     * 从PDF文件中提取可能的头像
     * @param pdfPath PDF文件路径
     * @return 可能的头像图片信息列表
     */
    public static List<ImageInfo> extractFromPDF(String pdfPath) throws IOException {
        log.info("开始从PDF文件中提取头像：{}", pdfPath);
        List<ImageInfo> possibleAvatars = new ArrayList<>();
        
        try (PDDocument document = PDDocument.load(new File(pdfPath))) {
            for (int pageIndex = 0; pageIndex < document.getNumberOfPages(); pageIndex++) {
                PDPage page = document.getPage(pageIndex);
                float pageHeight = page.getMediaBox().getHeight();
                
                // 获取页面中的所有图片
                List<PDImageXObject> images = getImagesFromPage(page);
                saveImagesToLocal(images, pdfPath);
                
                for (PDImageXObject image : images) {
                    ImageInfo imageInfo = new ImageInfo();
                    imageInfo.setWidth((int) image.getWidth());
                    imageInfo.setHeight((int) image.getHeight());
                    imageInfo.setPositionY(0);
                    imageInfo.setPageHeight(pageHeight);
                    
                    // 将图片转换为字节数组
                    BufferedImage bufferedImage = image.getImage();
                    
                    // 保存原始BufferedImage用于调试
                    String originalImagePath = IMG_DIR + File.separator + "original_" + generateUniqueImageName(pdfPath, images.indexOf(image));
                    try {
                        javax.imageio.ImageIO.write(bufferedImage, "PNG", new File(originalImagePath));
                        log.info("保存原始图像到: {}", originalImagePath);
                    } catch (IOException e) {
                        log.error("保存原始图像失败: {}", e.getMessage());
                    }
                    
                    byte[] imageData;
                    if (bufferedImage.getData().getDataBuffer() instanceof DataBufferByte) {
                        imageData = ((DataBufferByte) bufferedImage.getData().getDataBuffer()).getData();
                        log.info("使用DataBufferByte，数据长度: {}", imageData.length);
                    } else if (bufferedImage.getData().getDataBuffer() instanceof DataBufferInt) {
                        // 对于DataBufferInt类型，使用ImageIO将BufferedImage转换为字节数组
                        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                            javax.imageio.ImageIO.write(bufferedImage, "PNG", baos);
                            imageData = baos.toByteArray();
                            log.info("使用DataBufferInt，转换后数据长度: {}", imageData.length);
                            
                            // 保存转换后的图像数据用于调试
                            String convertedImagePath = IMG_DIR + File.separator + "converted_" + generateUniqueImageName(pdfPath, images.indexOf(image));
                            try (FileOutputStream fos = new FileOutputStream(convertedImagePath)) {
                                fos.write(imageData);
                                fos.flush();
                                log.info("保存转换后的图像数据到: {}", convertedImagePath);
                            } catch (IOException e) {
                                log.error("保存转换后的图像数据失败: {}", e.getMessage());
                            }
                        }
                    } else {
                        log.warn("不支持的图像数据类型: {}", bufferedImage.getData().getDataBuffer().getClass().getName());
                        continue;
                    }
                    
                    imageInfo.setImageData(imageData);
                    imageInfo.setFormat(image.getSuffix());
                    imageInfo.setFileName(pdfPath);
                    
                    if (isLikelyAvatar(imageInfo)) {
                        possibleAvatars.add(imageInfo);
                    }
                }
            }
        }
        
        log.info("PDF头像提取完成，找到{}个可能的头像", possibleAvatars.size());
        return possibleAvatars;
    }
    
    /**
     * 从图片数据中获取图片尺寸
     * @param imageData 图片数据
     * @return 包含宽度和高度的数组，如果无法获取则返回null
     */
    private static int[] getImageDimensions(byte[] imageData) {
        try {
            // 将字节数组转换为BufferedImage
            BufferedImage bufferedImage = javax.imageio.ImageIO.read(new java.io.ByteArrayInputStream(imageData));
            if (bufferedImage != null) {
                return new int[]{bufferedImage.getWidth(), bufferedImage.getHeight()};
            }
        } catch (Exception e) {
            log.error("获取图片尺寸失败: {}", e.getMessage());
        }
        return null;
    }

    /**
     * 从Word文件中提取所有图片
     * @param wordPath Word文件路径
     * @return 图片信息列表
     */
    private static List<ImageInfo> extractAllImagesFromWord(String wordPath) throws IOException {
        log.info("开始从Word文件中提取图片：{}", wordPath);
        List<ImageInfo> allImages = new ArrayList<>();
        
        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(wordPath))) {
            // 设置mark位置，确保有足够的缓冲区
            bis.mark(8);
            
            // 尝试检测文件类型
            byte[] header = new byte[8];
            int bytesRead = bis.read(header);
            if (bytesRead == 8) {
                bis.reset(); // 重置流位置
                
                // 检查是否为OLE2格式（旧版Word）
                if (header[0] == (byte) 0xD0 && header[1] == (byte) 0xCF) {
                    // 处理旧版Word文档
                    try (HWPFDocument document = new HWPFDocument(bis)) {
                        List<Picture> pictures = document.getPicturesTable().getAllPictures();
                        log.info("从旧版Word文档中找到{}张图片", pictures.size());
                        
                        for (Picture picture : pictures) {
                            ImageInfo imageInfo = new ImageInfo();
                            byte[] content = picture.getContent();
                            imageInfo.setImageData(content);
                            imageInfo.setFormat(picture.suggestFileExtension());
                            imageInfo.setFileName(wordPath);
                            
                            // 获取图片尺寸
                            int[] dimensions = getImageDimensions(content);
                            if (dimensions != null) {
                                imageInfo.setWidth(dimensions[0]);
                                imageInfo.setHeight(dimensions[1]);
                            } else {
                                // 如果无法从图片数据获取尺寸，使用Picture对象中的尺寸
                                imageInfo.setWidth(picture.getWidth());
                                imageInfo.setHeight(picture.getHeight());
                            }
                            
                            allImages.add(imageInfo);
                        }
                    }
                } else {
                    // 处理新版Word文档
                    try (XWPFDocument document = new XWPFDocument(bis)) {
                        List<XWPFPictureData> pictures = document.getAllPictures();
                        log.info("从新版Word文档中找到{}张图片", pictures.size());
                        
                        for (XWPFPictureData picture : pictures) {
                            ImageInfo imageInfo = new ImageInfo();
                            byte[] data = picture.getData();
                            imageInfo.setImageData(data);
                            imageInfo.setFormat(picture.suggestFileExtension());
                            imageInfo.setFileName(wordPath);
                            
                            // 获取图片尺寸
                            int[] dimensions = getImageDimensions(data);
                            if (dimensions != null) {
                                imageInfo.setWidth(dimensions[0]);
                                imageInfo.setHeight(dimensions[1]);
                                log.info("成功获取图片尺寸: {}x{}", dimensions[0], dimensions[1]);
                            } else {
                                log.warn("无法获取图片尺寸，使用默认值");
                                imageInfo.setWidth(100);
                                imageInfo.setHeight(100);
                            }
                            
                            allImages.add(imageInfo);
                        }
                    }
                }
            } else {
                log.error("无法读取文件头，实际读取字节数: {}", bytesRead);
            }
        }
        
        return allImages;
    }

    /**
     * 从Word文件中提取可能的头像
     * @param wordPath Word文件路径
     * @return 可能的头像图片信息列表
     */
    public static List<ImageInfo> extractFromWord(String wordPath) throws IOException {
        // 先获取所有图片
        List<ImageInfo> allImages = extractAllImagesFromWord(wordPath);
        log.info("Word文件中共有{}张图片", allImages.size());
        
        // 对每张图片进行头像识别
        List<ImageInfo> possibleAvatars = new ArrayList<>();
        for (int i = 0; i < allImages.size(); i++) {
            ImageInfo imageInfo = allImages.get(i);
            log.info("正在处理第{}张图片，尺寸: {}x{}, 格式: {}", 
                    i + 1, imageInfo.getWidth(), imageInfo.getHeight(), imageInfo.getFormat());
            
            if (isLikelyAvatar(imageInfo)) {
                log.info("第{}张图片可能是头像", i + 1);
                possibleAvatars.add(imageInfo);
            }
        }
        
        log.info("Word头像提取完成，找到{}个可能的头像", possibleAvatars.size());
        return possibleAvatars;
    }
} 