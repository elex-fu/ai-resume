document.addEventListener('DOMContentLoaded', function() {
    const resumeContainer = document.getElementById('resumeContainer');
    const editInput = document.getElementById('editInput');
    const templateItems = document.querySelectorAll('.template-item');
    const interviewSuggestions = document.getElementById('interviewSuggestions');
    const resumeInput = document.getElementById('resumeInput');
    const fileUpload = document.getElementById('fileUpload');
    const startBtn = document.getElementById('startBtn');
    const exampleItems = document.querySelectorAll('.example-item');
    
    // 获取URL参数中的简历ID
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    
    // 示例简历数据
    const exampleData = {
        '软件工程师简历': {
            name: '瞿世模',
            age: '28',
            phone: '13030256409',
            email: '598959770@qq.com',
            school: '华中师范大学',
            qq: '598959770',
            education: [
                {
                    school: '华中师范大学',
                    degree: '（南京农业学士学位）',
                    time: '2015-09 ~ 2019-06',
                    details: '易路同行设计研究院后端开发'
                }
            ],
            projects: [
                {
                    name: '深圳市建筑设计研究院-后端开发',
                    time: '2023-01 ~ 2024-11',
                    details: [
                        '了解基本的深度学习原理，应用darknet框架、Yolo算法，对数据进行分类。',
                        '项目：地下金融AI Master-地下金库布局的智能生成设计-项目介绍为用户提供了7各种类型的建筑（住宅、公共）智能生成机制和建议。',
                        '工作作业及为项目提供基础技术支持，领导关键功能模块的开发，确保关键金库设计的效率和可用性。',
                        '持续维护，补充和优化内部部分处理，扩展模型数量；维护工具工作功能的稳定性和持续优化。',
                        '事物数据模块以及服务器性能和系统性能；积累常用算法文件；',
                        '承担一些后端技术指导工作，负责管理开发人员在欧美这代码的工作文档，组织内部技术分享等；',
                        '在技术栈的分析阶段，使用C++，在后期，使用Python+Shapely来实现设计评价和图面图形操作，并研究和实现了相关的图形算法；',
                        '基于FastAPI框架（前期使用Flask），实现服务接口，为前端提供数据支撑；',
                        '使用Celery实现异步任务管理（如文件生成、文件解析等等）；',
                        '使用Redis作为异步队列，实现基础数据的缓存（如令牌、短信验证等）；',
                        '使用MongoDB数据库存储模型数据。'
                    ]
                },
                {
                    name: '腾讯WXG微信阅读开发',
                    time: '2021-07 ~ 2022-09',
                    details: [
                        '项目：微信群/微信朋友圈/微信群-工作内容是负责快速检测以及动作识别；使用NodeJs+Jest设计并编写自动化测试用例，并使用NodeJs+Express+MySQL构建自动化测试服务。',
                        '后续以及力量测试：基于接口设计计划测试数据，使用Golang编写测试工具，使用Go协程并发请求接口，并计算QPS。',
                        'UI自动化测试：使用Kotlin+UIAutomator（Android）和Swift+XCTest（iOS）编写自动化测试用例。'
                    ]
                }
            ]
        },
        '产品经理简历': {
            // ... 产品经理的示例数据
        },
        '市场营销简历': {
            // ... 市场营销的示例数据
        },
        '设计师简历': {
            // ... 设计师的示例数据
        }
    };
    
    // 加载简历内容
    async function loadResume() {
        try {
            const response = await fetch(`/api/resume/${resumeId}`);
            if (!response.ok) throw new Error('加载简历失败');
            const data = await response.json();
            renderResume(data);
        } catch (error) {
            alert(error.message);
        }
    }
    
    // 渲染简历内容
    function renderResume(data) {
        resumeContainer.innerHTML = `
            <h1>${data.name}</h1>
            <div class="contact-info">
                <p>${data.email} | ${data.phone}</p>
            </div>
            <div class="section">
                <h2>个人简介</h2>
                <p>${data.summary}</p>
            </div>
            <div class="section">
                <h2>教育背景</h2>
                ${data.education.map(edu => `
                    <div class="education-item">
                        <h3>${edu.school}</h3>
                        <p>${edu.degree} | ${edu.major}</p>
                        <p>${edu.startDate} - ${edu.endDate}</p>
                    </div>
                `).join('')}
            </div>
            <div class="section">
                <h2>工作经历</h2>
                ${data.experience.map(exp => `
                    <div class="experience-item">
                        <h3>${exp.company}</h3>
                        <p>${exp.position}</p>
                        <p>${exp.startDate} - ${exp.endDate}</p>
                        <p>${exp.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // 模板切换
    templateItems.forEach(item => {
        item.addEventListener('click', async function() {
            const template = this.dataset.template;
            templateItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            try {
                const response = await fetch(`/api/resume/${resumeId}/template`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ template })
                });
                if (!response.ok) throw new Error('切换模板失败');
                const data = await response.json();
                renderResume(data);
            } catch (error) {
                alert(error.message);
            }
        });
    });
    
    // 内容优化
    async function optimizeContent(type) {
        const content = editInput.value.trim();
        if (!content) {
            alert('请先输入要修改的内容');
            return;
        }
        
        try {
            const response = await fetch(`/api/resume/${resumeId}/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content, type })
            });
            if (!response.ok) throw new Error('优化失败');
            const data = await response.json();
            editInput.value = data.optimizedContent;
        } catch (error) {
            alert(error.message);
        }
    }
    
    // 下载简历
    async function downloadResume(format) {
        try {
            const response = await fetch(`/api/resume/${resumeId}/download?format=${format}`);
            if (!response.ok) throw new Error('下载失败');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resume.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            alert(error.message);
        }
    }
    
    // 获取面试建议
    async function getInterviewSuggestions() {
        try {
            const response = await fetch(`/api/resume/${resumeId}/interview-suggestions`);
            if (!response.ok) throw new Error('获取面试建议失败');
            const data = await response.json();
            interviewSuggestions.innerHTML = data.suggestions.map(suggestion => 
                `<div class="suggestion-item">${suggestion}</div>`
            ).join('');
        } catch (error) {
            alert(error.message);
        }
    }
    
    // 更新简历预览区域
    function updateResumePreview(data) {
        // 更新基本信息
        document.getElementById('resumeName').textContent = data.name || '';
        document.getElementById('resumeAge').textContent = `年龄：${data.age || ''}`;
        document.getElementById('resumePhone').textContent = `电话：${data.phone || ''}`;
        document.getElementById('resumeEmail').textContent = `邮箱：${data.email || ''}`;
        document.getElementById('resumeSchool').textContent = `学校：${data.school || ''}`;
        document.getElementById('resumeQQ').textContent = `QQ：${data.qq || ''}`;

        // 更新教育经历
        const educationContent = document.getElementById('educationContent');
        educationContent.innerHTML = data.education?.map(edu => `
            <div class="education-item">
                <h3>${edu.school} ${edu.degree}</h3>
                <p>${edu.time}</p>
                <p>${edu.details}</p>
            </div>
        `).join('') || '';

        // 更新项目经验
        const projectContent = document.getElementById('projectContent');
        projectContent.innerHTML = data.projects?.map(proj => `
            <div class="project-item">
                <h3>${proj.name}</h3>
                <p class="project-time">${proj.time}</p>
                <ul>
                    ${proj.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
            </div>
        `).join('') || '';
    }

    // 处理示例点击
    exampleItems.forEach(item => {
        item.addEventListener('click', function() {
            const exampleType = this.textContent;
            const data = exampleData[exampleType];
            if (data) {
                updateResumePreview(data);
                resumeInput.value = `请基于以下简历内容进行优化：\n\n${JSON.stringify(data, null, 2)}`;
            }
        });
    });

    // 处理文件上传
    fileUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                resumeInput.value = e.target.result;
            };
            reader.readAsText(file);
        }
    });

    // 处理生成按钮点击
    startBtn.addEventListener('click', async function() {
        const content = resumeInput.value.trim();
        if (!content) {
            alert('请输入简历内容或选择示例简历');
            return;
        }

        try {
            startBtn.disabled = true;
            startBtn.innerHTML = '<span>正在优化...</span>';

            const response = await fetch('/api/generate-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('生成失败');
            }

            const data = await response.json();
            updateResumePreview(data);
        } catch (error) {
            console.error('Error:', error);
            alert('简历优化失败，请稍后重试');
        } finally {
            startBtn.disabled = false;
            startBtn.innerHTML = '<span>优化简历</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>';
        }
    });
    
    // 绑定事件
    document.getElementById('optimizeBtn').addEventListener('click', () => optimizeContent('optimize'));
    document.getElementById('expandBtn').addEventListener('click', () => optimizeContent('expand'));
    document.getElementById('simplifyBtn').addEventListener('click', () => optimizeContent('simplify'));
    document.getElementById('interviewBtn').addEventListener('click', getInterviewSuggestions);
    document.getElementById('downloadWord').addEventListener('click', () => downloadResume('docx'));
    document.getElementById('downloadPdf').addEventListener('click', () => downloadResume('pdf'));
    
    // 初始加载
    loadResume();
    getInterviewSuggestions();
}); 