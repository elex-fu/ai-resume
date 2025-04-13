import { TemplateManager } from '../template-manager.js';

describe('TemplateManager', () => {
    let templateManager;
    let mockContainer;
    let mockData;

    beforeEach(() => {
        // 创建模拟容器
        mockContainer = document.createElement('div');
        mockContainer.id = 'resumePreview';
        document.body.appendChild(mockContainer);

        // 添加模板内容
        mockContainer.innerHTML = `
            <div class="resume-container">
                <div class="basic-info">
                    <div class="avatar-container">
                        <img data-bind="basic.avatar" alt="头像">
                    </div>
                    <div class="info-content">
                        <h1 data-bind="basic.name"></h1>
                        <p data-bind="basic.gender"></p>
                        <p data-bind="basic.phone"></p>
                        <p data-bind="basic.email"></p>
                    </div>
                </div>
                <div class="education">
                    <h2>教育经历</h2>
                    <div data-bind="education.map(item => \`
                        <div class='education-item'>
                            <h3>\${item.school}</h3>
                            <p>\${item.major}</p>
                            <p>\${item.degree}</p>
                            <p>\${item.time}</p>
                        </div>
                    \`)"></div>
                </div>
                <div class="skills">
                    <h2>技能特长</h2>
                    <div data-bind="skills.map(item => \`
                        <div class='skill-item'>
                            <span>\${item.name}</span>
                            <div class='skill-progress' style='width: \${item.level}%'></div>
                        </div>
                    \`)"></div>
                </div>
            </div>
        `;

        // 创建模拟数据
        mockData = {
            basic: {
                name: '张三',
                gender: '男',
                age: '25',
                phone: '13800138000',
                email: 'zhangsan@example.com',
                location: '北京',
                avatar: '/images/avatar.jpg'
            },
            intention: {
                position: '前端开发工程师',
                city: '北京',
                salary: '15k-20k',
                entryTime: '随时到岗'
            },
            education: [
                {
                    school: '北京大学',
                    major: '计算机科学与技术',
                    degree: '本科',
                    time: '2018-2022',
                    gpa: '3.8',
                    rank: '前10%',
                    description: '主修课程：数据结构、算法、计算机网络等'
                }
            ],
            work: [
                {
                    company: '某科技公司',
                    position: '前端开发工程师',
                    time: '2022-至今',
                    description: '负责公司核心产品的前端开发工作'
                }
            ],
            project: [
                {
                    name: '在线简历系统',
                    role: '前端开发',
                    time: '2023',
                    description: '使用Vue.js开发的在线简历编辑系统'
                }
            ],
            skills: [
                {
                    name: 'JavaScript',
                    level: '80'
                },
                {
                    name: 'Vue.js',
                    level: '70'
                }
            ]
        };

        // 初始化模板管理器
        templateManager = new TemplateManager({
            previewContainer: '#resumePreview',
            templatesPath: '/templates',
            defaultTemplate: 'default'
        });

        // 设置模板管理器的预览容器
        templateManager.previewContainer = mockContainer;
    });

    afterEach(() => {
        // 清理DOM
        document.body.removeChild(mockContainer);
    });

    describe('renderResumeData', () => {
        it('应该正确渲染基本数据', () => {
            // 渲染数据
            templateManager.renderResumeData(mockData);

            // 验证基本数据渲染
            expect(mockContainer.querySelector('[data-bind="basic.name"]').textContent).toBe('张三');
            expect(mockContainer.querySelector('[data-bind="basic.gender"]').textContent).toBe('男');
            expect(mockContainer.querySelector('[data-bind="basic.phone"]').textContent).toBe('13800138000');
            expect(mockContainer.querySelector('[data-bind="basic.avatar"]').src).toContain('/images/avatar.jpg');
        });

        it('应该正确渲染数组数据', () => {
            // 渲染数据
            templateManager.renderResumeData(mockData);

            // 验证教育经历渲染
            const educationItems = mockContainer.querySelectorAll('.education-item');
            expect(educationItems.length).toBe(1);
            expect(educationItems[0].querySelector('h3').textContent).toBe('北京大学');
            expect(educationItems[0].querySelector('p').textContent).toBe('计算机科学与技术');

            // 验证技能渲染
            const skillItems = mockContainer.querySelectorAll('.skill-item');
            expect(skillItems.length).toBe(2);
            expect(skillItems[0].querySelector('span').textContent).toBe('JavaScript');
            expect(skillItems[0].querySelector('.skill-progress').style.width).toBe('80%');
        });

        it('应该处理空数据', () => {
            // 渲染空数据
            templateManager.renderResumeData({});

            // 验证所有绑定元素都为空
            const boundElements = mockContainer.querySelectorAll('[data-bind]');
            boundElements.forEach(element => {
                if (element.tagName === 'IMG') {
                    expect(element.src).toContain('/images/default-avatar.png');
                } else if (!element.getAttribute('data-bind').includes('map')) {
                    expect(element.textContent).toBe('');
                }
            });
        });

        it('应该处理无效的表达式', () => {
            // 添加一个无效的绑定
            const invalidElement = document.createElement('div');
            invalidElement.setAttribute('data-bind', 'invalid.expression');
            mockContainer.appendChild(invalidElement);

            // 渲染数据
            templateManager.renderResumeData(mockData);

            // 验证无效表达式不会导致错误
            expect(invalidElement.textContent).toBe('');
        });
    });
}); 