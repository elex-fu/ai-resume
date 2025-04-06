// 简历模板数据
const resumeTemplates = {
    backend: {
        title: '后端开发',
        content: `我是一名后端开发工程师，主要使用Java和Spring框架进行开发。
具有3年以上的后端开发经验，熟悉微服务架构、分布式系统和高并发编程。
主要技术栈：
- Java, Spring Boot, Spring Cloud
- MySQL, Redis, MongoDB
- Docker, Kubernetes
- 消息队列（Kafka/RabbitMQ）
擅长系统设计和性能优化，有大型项目经验。`
    },
    sales: {
        title: '销售',
        content: `我是一名销售专员，有4年B2B销售经验。
擅长客户开发和维护，具有优秀的沟通能力和谈判技巧。
主要成就：
- 连续两年超额完成销售目标
- 成功开发多个大客户，年度合同额超过1000万
- 团队最佳销售奖获得者
具有良好的商业敏锐度和执行力。`
    },
    admin: {
        title: '行政',
        content: `我是一名行政主管，有5年行政管理经验。
负责公司日常运营、人事管理、办公用品采购等工作。
主要职责：
- 负责公司各项行政事务的统筹和管理
- 组织公司活动，建设企业文化
- 人事档案管理，员工关系维护
工作细致认真，有较强的组织协调能力。`
    },
    finance: {
        title: '财务',
        content: `我是一名高级财务分析师，有6年财务工作经验。
精通财务分析、预算管理和财务报表编制。
专业技能：
- 财务分析和财务建模
- 预算编制和成本控制
- 税务筹划和风险管理
持有注册会计师证书，熟悉国际会计准则。`
    }
};

// 简历生成API调用
async function generateResume(content, file = null) {
    try {
        // 创建FormData对象，用于发送文件和文本数据
        const formData = new FormData();
        formData.append('content', content);
        
        // 如果有文件，添加到FormData中
        if (file) {
            formData.append('file', file);
        }
        
        const response = await fetch('/api/resume/generate', {
            method: 'POST',
            body: formData // 直接发送FormData，不需要设置Content-Type，浏览器会自动设置
        });

        if (!response.ok) {
            throw new Error('简历生成失败');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('生成简历时出错:', error);
        throw error;
    }
}

// 初始化页面事件
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.querySelector('.action-btn.primary');
    const uploadBtn = document.querySelector('.action-btn:not(.primary)');
    const textarea = document.querySelector('.main-input');
    const templateButtons = document.querySelectorAll('.template-btn');
    let uploadedFile = null;
    
    // 为每个模板按钮添加点击事件
    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除其他按钮的active类
            templateButtons.forEach(btn => btn.classList.remove('active'));
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 获取模板内容并填充到输入框
            const template = this.dataset.template;
            if (textarea && resumeTemplates[template]) {
                textarea.value = resumeTemplates[template].content;
                // 触发input事件以调整高度
                textarea.dispatchEvent(new Event('input'));
            }
        });
    });
    
    // 自动调整文本框高度
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    // 上传文件按钮点击事件
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            // 创建隐藏的文件输入框
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf,.doc,.docx';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
            
            // 监听文件选择事件
            fileInput.addEventListener('change', function(e) {
                if (e.target.files.length > 0) {
                    uploadedFile = e.target.files[0];
                    // 显示文件名在输入框中
                    textarea.value = `已上传文件: ${uploadedFile.name}\n\n${textarea.value}`;
                    // 触发input事件以调整高度
                    textarea.dispatchEvent(new Event('input'));
                }
                // 移除文件输入框
                document.body.removeChild(fileInput);
            });
            
            // 触发文件选择对话框
            fileInput.click();
        });
    }
    
    // 生成按钮点击事件
    if (generateBtn) {
        generateBtn.addEventListener('click', async function() {
            const content = textarea.value.trim();
            
            if (!content) {
                alert('请输入简历内容或选择模板');
                return;
            }

            // 显示加载状态
            generateBtn.disabled = true;
            generateBtn.innerHTML = `
                <svg class="loading" width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
            `;

            try {
                const result = await generateResume(content, uploadedFile);
                
                // 生成成功，跳转到简历编辑页面
                if (result && result.id) {
                    window.location.href = `/edit.html?id=${result.id}`;
                } else {
                    throw new Error('未获取到简历ID');
                }
            } catch (error) {
                alert('生成简历失败：' + error.message);
                // 恢复按钮状态
                generateBtn.disabled = false;
                generateBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                        <path d="M1 8l14-7-7 14-2-5-5-2z" stroke-width="2" stroke-linejoin="round"/>
                    </svg>
                `;
            }
        });
    }
});

// 添加加载动画样式
const style = document.createElement('style');
style.textContent = `
    .loading {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .action-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style); 