# AI简历生成器

AI简历生成器是一个基于人工智能的简历创建和管理平台，帮助求职者快速生成、编辑和优化专业简历。通过智能分析和模板应用，让您的简历脱颖而出。

![AI简历生成器预览](src/main/resources/static/images/resume.png)
![AI简历编辑器预览](src/main/resources/static/images/edit_resume.png)


## 功能特点

### 1. 智能简历生成
- 通过AI分析用户输入的经历描述，自动生成结构化简历
- 支持简历文件上传（PDF、Word格式），智能解析和编辑
- 多种预设行业模板（后端开发、销售、行政、财务等）

### 2. 专业简历编辑
- 直观的可视化编辑界面
- 支持在线编辑简历的各个部分（基本信息、教育经历、工作经历等）
- 头像上传和管理功能
- 实时预览简历效果

### 3. AI智能优化
- 简历内容智能分析和评分
- 提供专业化表达、行业关键词添加等优化建议
- 针对不同岗位的简历内容推荐

### 4. 多样化模板
- 提供多种风格的简历模板（标准、现代、经典、创意）
- 支持自定义模板颜色和样式
- 响应式设计，确保在各种设备上良好显示

### 5. 便捷工具
- 简历导出为PDF格式
- 手写输入功能，快速添加和修改简历内容
- 一键保存和云端同步

## 技术栈

### 前端
- HTML5/CSS3/JavaScript
- Jest 测试框架
- Babel 转译器
- 响应式设计
- 模块化CSS

### 后端
- Java 8
- Spring Boot 2.3.12
- Spring Security 安全框架
- Spring Data JPA
- JWT 认证 (jjwt 0.11.5)
- RESTful API设计
- Lombok 简化开发

### 数据存储
- MySQL 数据库
- H2 数据库（测试环境）
- 文件存储系统

### AI/机器学习
- OpenAI API集成 (openai-gpt3-java)
- 内容分析和优化算法

### 文档处理
- iText PDF (5.5.13.3) - PDF生成
- PDFBox (2.0.27) - PDF解析
- Apache POI (5.2.3) - Word文档处理
- Flying Saucer (9.1.22) - HTML转PDF
- Jsoup (1.15.4) - HTML解析

## 项目结构
```
ai-resume/
├── src/                # 源代码目录
│   ├── main/          # 主要代码
│   └── test/          # 测试代码
├── target/            # 编译输出目录
├── pom.xml           # Maven配置文件
├── package.json      # Node.js配置文件
├── .babelrc         # Babel配置
├── jest.config.cjs  # Jest测试配置
└── README.md        # 项目文档
```

## 使用说明

### 1. 首页功能
1. 输入简历内容或经历描述
2. 点击"上传简历"按钮上传已有简历文件
3. 点击"生成简历"按钮，AI将自动生成结构化简历
4. 选择预设模板快速开始（后端开发、销售、行政、财务）

### 2. 编辑页功能
1. 在左侧简历预览区域，点击各个部分进行编辑
2. 使用右侧工具栏：
   - 简历模板(T)：选择不同模板样式和颜色
   - 智能分析(A)：获取简历评分和优化建议
   - 一键优化(O)：AI自动优化简历内容
3. 使用底部手写输入区域快速添加内容
4. 点击上方的保存按钮或导出PDF按钮

### 3. 关键操作流程
- **创建新简历**：首页输入基本描述 → 生成 → 编辑完善 → 保存导出
- **上传已有简历**：首页上传文件 → 自动解析 → 编辑调整 → 保存导出
- **使用模板**：选择合适的行业模板 → 基于模板修改 → 保存导出

## 安装与部署

### 环境要求
- JDK 8+
- Maven 3.6+
- MySQL 5.7+
- Node.js 14+
- npm 6+

### 本地运行
1. 克隆项目
   ```bash
   git clone https://github.com/elex-fu/ai-resume
   cd ai-resume
   ```

2. 配置数据库
   - 修改`src/main/resources/application.properties`中的数据库连接信息

3. 编译运行
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. 访问应用
   - 打开浏览器访问 http://localhost:8080

## 未来规划

### 近期计划
- [ ] 增强AI分析功能，提供更精准的简历优化建议
- [ ] 添加更多行业特定简历模板
- [ ] 完善用户账户系统和简历存储功能
- [ ] 添加简历版本管理功能

### 中期计划
- [ ] 开发针对特定岗位的简历自动匹配功能
- [ ] 集成求职平台，支持一键投递
- [ ] 提供简历面试反馈分析
- [ ] 增加多语言支持

### 长期目标
- [ ] 建立简历效果评估系统
- [ ] 开发移动端应用
- [ ] 提供API接口，支持第三方集成
- [ ] 建立用户社区，分享简历优化经验

## 贡献指南

我们欢迎各种形式的贡献，包括但不限于：

### 如何贡献
1. Fork 项目到您的GitHub账号
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个Pull Request

### 贡献类型
- 提交Bug报告
- 提出新功能建议
- 改进文档
- 提交代码修复或新功能
- 完善测试用例
- 改进项目结构

### 提交规范
- 使用清晰的提交信息
- 保持代码风格一致
- 添加必要的测试
- 更新相关文档

## 版本发布记录

### v1.0.0 (2024-02)
- 初始版本发布
- 基本简历生成功能
- AI内容优化
- 多种简历模板

### v1.1.0 (计划中)
- 增强AI分析功能
- 新增行业模板
- 完善用户系统
- 版本管理功能

## 许可证

本项目采用 MIT 许可证。查看 [LICENSE](LICENSE) 文件了解更多详细信息。

## 致谢

- [OpenAI](https://openai.com/) - AI能力支持
- [Spring Boot](https://spring.io/projects/spring-boot) - 后端框架
- [iText](https://itextpdf.com/) - PDF处理
- [Apache POI](https://poi.apache.org/) - Office文档处理

## 联系方式

- 项目主页: https://github.com/elex-fu/ai-resume
- 问题反馈: https://github.com/elex-fu/ai-resume/issues
- 电子邮件: elex.fou@gmail.com

## 开发指南

### 开发环境设置
1. 安装必要的开发工具
   ```bash
   # 安装Node.js依赖
   npm install
   
   # 安装Maven依赖
   mvn install
   ```

2. 配置数据库
   - 创建MySQL数据库：ai_resume
   - 修改`src/main/resources/application.properties`配置：
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/ai_resume?useSSL=false
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     ```

3. 配置OpenAI API
   - 在`application.properties`中添加您的OpenAI API密钥：
     ```properties
     openai.api.key=your_api_key
     ```

### 代码规范
- 使用Google Java代码风格
- 提交前运行单元测试：`mvn test`
- 使用Lombok注解简化代码
- RESTful API遵循标准命名规范

### 分支管理
- main: 主分支，用于生产环境
- develop: 开发分支，用于功能集成
- feature/*: 新功能开发
- bugfix/*: 问题修复
- release/*: 版本发布

### 测试
1. 单元测试
   ```bash
   # 运行后端测试
   mvn test
   
   # 运行前端测试
   npm test
   ```

2. 集成测试
   - 使用H2内存数据库进行测试
   - 测试配置位于`src/test/resources/`

### 部署
1. 构建项目
   ```bash
   # 构建后端
   mvn clean package
   
   # 构建前端
   npm run build
   ```

2. 部署到服务器
   ```bash
   java -jar target/ai-resume-1.0-SNAPSHOT.jar
   ```

3. 配置Nginx（可选）
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;
       
       location / {
           proxy_pass http://localhost:8080;
       }
   }
   ```

## 安全注意事项
- 所有API请求需要JWT认证
- 密码使用BCrypt加密存储
- 文件上传限制大小和类型
- 定期更新依赖包版本
- 使用环境变量存储敏感信息

