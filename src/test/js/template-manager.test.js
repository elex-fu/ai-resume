import { TemplateManager } from '../../main/resources/static/js/template-manager.js';

describe('TemplateManager', () => {
    let templateManager;
    let mockData;

    beforeEach(() => {
        // 创建测试容器
        const container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // 初始化模板管理器
        templateManager = new TemplateManager({
            previewContainer: '#test-container',
            templatesPath: '/templates',
            useMockData: true
        });

        // 模拟数据
        mockData = {
            basic: {
                name: '张三',
                avatar: '/images/avatar.jpg',
                phone: '13800138000',
                email: 'zhangsan@example.com'
            },
            education: [
                {
                    school: '清华大学',
                    major: '计算机科学',
                    degree: '本科',
                    time: '2018-2022'
                }
            ],
            work: [
                {
                    company: '阿里巴巴',
                    position: '前端工程师',
                    time: '2022-至今'
                }
            ],
            project: [
                {
                    name: '简历生成系统',
                    role: '前端开发',
                    time: '2023'
                }
            ],
            skills: [
                {
                    name: 'JavaScript',
                    level: '90'
                }
            ]
        };

        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('mock template content')
            })
        );
    });

    afterEach(() => {
        // 清理测试容器
        const container = document.getElementById('test-container');
        if (container) {
            container.remove();
        }
        // 清理mock
        jest.restoreAllMocks();
    });

    describe('renderResumeData', () => {
        test('应该正确渲染基本数据', async () => {
            const template = `
                <div class="basic-info">
                    <h1 data-bind="basic.name"></h1>
                    <img data-bind="basic.avatar">
                    <p data-bind="basic.phone"></p>
                    <p data-bind="basic.email"></p>
                </div>
            `;
            
            templateManager.previewContainer.innerHTML = template;
            await templateManager.renderResumeData(mockData);
            
            expect(templateManager.previewContainer.querySelector('h1').textContent).toBe('张三');
            expect(templateManager.previewContainer.querySelector('img').src).toContain('avatar.jpg');
            expect(templateManager.previewContainer.querySelector('p').textContent).toBe('13800138000');
        });

        test('应该处理数组映射表达式', async () => {
            const template = `
                <div class="education-list" data-bind="education.map(item => \`
                    <div class='education-item'>
                        <h3>\${item.school}</h3>
                        <p>\${item.major} - \${item.degree}</p>
                        <span>\${item.time}</span>
                    </div>
                \`)"></div>
            `;
            
            templateManager.previewContainer.innerHTML = template;
            await templateManager.renderResumeData(mockData);
            
            const items = templateManager.previewContainer.querySelectorAll('.education-item');
            expect(items.length).toBe(1);
            expect(items[0].querySelector('h3').textContent).toBe('清华大学');
            expect(items[0].querySelector('p').textContent).toBe('计算机科学 - 本科');
        });

        test('应该处理HTML编码的字符', async () => {
            const template = `
                <div class="test" data-bind="education.map(item =&gt; \`
                    <div class='education-item'>
                        <h3>\${item.school}</h3>
                    </div>
                \`)"></div>
            `;
            
            templateManager.previewContainer.innerHTML = template;
            await templateManager.renderResumeData(mockData);
            
            const items = templateManager.previewContainer.querySelectorAll('.education-item');
            expect(items.length).toBe(1);
            expect(items[0].querySelector('h3').textContent).toBe('清华大学');
        });

        test('应该处理空数据', async () => {
            const template = `
                <div class="basic-info">
                    <h1 data-bind="basic.name"></h1>
                    <img data-bind="basic.avatar">
                </div>
            `;
            
            templateManager.previewContainer.innerHTML = template;
            await templateManager.renderResumeData({});
            
            expect(templateManager.previewContainer.querySelector('h1').textContent).toBe('');
            expect(templateManager.previewContainer.querySelector('img').src).toContain('default-avatar.png');
        });

        test('应该处理无效的表达式', async () => {
            const template = `
                <div class="test">
                    <p data-bind="invalid.expression"></p>
                    <div data-bind="invalid.map(item => \`<div>\${item}</div>\`)"></div>
                </div>
            `;
            
            templateManager.previewContainer.innerHTML = template;
            await templateManager.renderResumeData(mockData);
            
            expect(templateManager.previewContainer.querySelector('p').textContent).toBe('');
            expect(templateManager.previewContainer.querySelector('div').innerHTML).toBe('');
        });

        test('应该处理嵌套对象', async () => {
            const template = `
                <div class="work-list" data-bind="work.map(item => \`
                    <div class='work-item'>
                        <h3>\${item.company}</h3>
                        <p>\${item.position}</p>
                        <span>\${item.time}</span>
                    </div>
                \`)"></div>
            `;
            
            templateManager.previewContainer.innerHTML = template;
            await templateManager.renderResumeData(mockData);
            
            const items = templateManager.previewContainer.querySelectorAll('.work-item');
            expect(items.length).toBe(1);
            expect(items[0].querySelector('h3').textContent).toBe('阿里巴巴');
            expect(items[0].querySelector('p').textContent).toBe('前端工程师');
        });

        test('应该处理特殊字符和HTML标签', async () => {
            const template = `
                <div class="skills-list" data-bind="skills.map(item => \`
                    <div class='skill-item'>
                        <span>\${item.name}</span>
                        <div class='progress' style='width: \${item.level}%'></div>
                    </div>
                \`)"></div>
            `;
            
            templateManager.previewContainer.innerHTML = template;
            await templateManager.renderResumeData(mockData);
            
            const items = templateManager.previewContainer.querySelectorAll('.skill-item');
            expect(items.length).toBe(1);
            expect(items[0].querySelector('span').textContent).toBe('JavaScript');
            expect(items[0].querySelector('.progress').style.width).toBe('90%');
        });
    });
}); 