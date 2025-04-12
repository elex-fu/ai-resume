/**
 * template-manager.js
 * 负责简历模板的加载、渲染和切换功能
 */

// 模板管理器类
export class TemplateManager {
    constructor(options = {}) {
        // 配置项
        this.options = {
            previewContainer: '#resumePreview', // 预览容器选择器
            templateSelector: '.template-item', // 模板选择器元素
            colorSelector: '.color-option',     // 颜色选择器元素
            templatesPath: '/templates',        // 模板存放路径
            templatesDataUrl: '/templates/templates.json', // 模板元数据文件
            defaultTemplate: null,              // 默认不选中模板
            defaultColor: '#1a73e8',            // 默认主题颜色
            mockDataPath: '/mock/resume-mock-data.json',
            useMockData: true,                  // 默认使用mock数据
            isTemplateEnabled: false,           // 默认不启用模板
            ...options
        };

        // 状态变量
        this.templates = [];                    // 存储所有模板信息
        this.currentTemplate = null;            // 当前选中的模板
        this.currentColor = this.options.defaultColor; // 当前主题颜色
        this.resumeData = null;                 // 简历数据
        this.previewContainer = document.querySelector(this.options.previewContainer);
        this.isUsingTemplate = false;           // 默认不使用模板

        // 初始化
        this.init();
    }

    /**
     * 初始化模板管理器
     */
    async init() {
        try {
            // 加载模板元数据
            await this.loadTemplatesData();
            
            // 初始化事件监听
            this.initEventListeners();
            
            // 初始化时使用默认编辑页风格
            this.resetToDefaultStyle();
            
            console.log('模板管理器初始化完成');
        } catch (error) {
            console.error('模板管理器初始化失败:', error);
        }
    }

    /**
     * 重置为默认样式
     */
    resetToDefaultStyle() {
        console.log('重置为默认样式（不使用模板）');
        
        // 确保预览容器存在
        this.previewContainer = document.querySelector(this.options.previewContainer);
        
        if (!this.previewContainer) {
            // 如果预览容器不存在，可能是选择器不正确或者还没有创建
            // 尝试检查ID是否正确
            console.error(`预览容器不存在: ${this.options.previewContainer}`);
            
            // 检查ID而不带#的情况
            const idOnly = this.options.previewContainer.replace('#', '');
            this.previewContainer = document.getElementById(idOnly);
            
            if (!this.previewContainer) {
                // 如果还是找不到，尝试创建一个
                console.log('尝试创建预览容器');
                const mainContent = document.querySelector('.main-content') || document.body;
                this.previewContainer = document.createElement('div');
                this.previewContainer.id = idOnly;
                this.previewContainer.className = 'resume-preview';
                mainContent.appendChild(this.previewContainer);
            }
        }
        
        if (this.previewContainer) {
            // 保留预览容器中已有内容，只更改样式类
            // 注意：这里不要清空innerHTML，避免影响原有页面结构
            
            // 保留原来的类名resume-preview，移除其他模板相关的类名
            const originalClassNames = Array.from(this.previewContainer.classList);
            this.previewContainer.className = 'resume-preview';
            // 添加回原来非模板相关的类名
            originalClassNames
                .filter(className => 
                    className !== 'resume-preview' && 
                    !className.startsWith('template-') && 
                    !this.templates.some(t => t.id === className)
                )
                .forEach(className => this.previewContainer.classList.add(className));
            
            // 移除模板样式
            const templateStyle = document.getElementById('template-style');
            if (templateStyle) {
                templateStyle.remove();
            }
            
            // 更新标志
            this.isUsingTemplate = false;
            this.options.isTemplateEnabled = false;
            
            console.log('已重置为默认样式');
        }
    }

    /**
     * 加载模板元数据
     */
    async loadTemplatesData() {
        try {
            const response = await fetch(this.options.templatesDataUrl);
            if (!response.ok) {
                throw new Error(`加载模板数据失败: ${response.status}`);
            }
            
            const data = await response.json();
            this.templates = data.templates || [];
            
            // 渲染模板选择器
            this.renderTemplateSelector();
            
            return this.templates;
        } catch (error) {
            console.error('加载模板数据失败:', error);
            throw error;
        }
    }

    /**
     * 渲染模板选择器
     */
    renderTemplateSelector() {
        const templateListContainer = document.querySelector('.template-list');
        if (!templateListContainer) return;
        
        // 清空现有内容
        templateListContainer.innerHTML = '';
        
        // 添加每个模板选项
        this.templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.templateId = template.id;
            
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = `template-preview ${template.id}`;
            if (template.thumbnail) {
                thumbnailDiv.style.backgroundImage = `url(${template.thumbnail})`;
            }
            
            const templateName = document.createElement('span');
            templateName.textContent = template.name;
            
            templateItem.appendChild(thumbnailDiv);
            templateItem.appendChild(templateName);
            templateListContainer.appendChild(templateItem);
            
            // 添加点击事件
            templateItem.addEventListener('click', () => {
                this.setTemplate(template.id);
            });
        });
    }

    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 模板选择事件
        document.querySelectorAll(this.options.templateSelector).forEach(item => {
            item.addEventListener('click', (e) => {
                const templateId = e.currentTarget.dataset.templateId;
                if (templateId) {
                    this.setTemplate(templateId);
                }
            });
        });
        
        // 颜色选择事件
        document.querySelectorAll(this.options.colorSelector).forEach(item => {
            item.addEventListener('click', (e) => {
                const color = e.currentTarget.style.backgroundColor;
                if (color) {
                    this.setColor(color);
                }
            });
        });
    }

    /**
     * 设置是否启用模板
     * @param {boolean} enabled - 是否启用模板
     */
    setTemplateEnabled(enabled) {
        this.options.isTemplateEnabled = enabled;
        if (!enabled) {
            this.resetToDefaultStyle();
        }
    }

    /**
     * 设置当前模板
     * @param {string} templateId - 模板ID
     */
    async setTemplate(templateId) {
        if (!this.options.isTemplateEnabled) {
            console.log('模板功能未启用，正在自动启用...');
            this.options.isTemplateEnabled = true;
        }

        try {
            const template = this.templates.find(t => t.id === templateId);
            if (!template) {
                throw new Error(`未找到模板: ${templateId}`);
            }
            
            console.log(`正在切换到模板: ${template.name}`);
            
            // 保存当前状态
            this.currentTemplate = template;
            this.isUsingTemplate = true;
            
            // 保存当前的resumeData
            if (window.resumeData && !this.resumeData) {
                this.resumeData = window.resumeData;
            }
            
            // 加载并应用模板
            await this.loadTemplateFiles(template);
            
            // 设置模板主题色
            this.setColor(template.primaryColor);
            
            console.log(`模板应用完成: ${template.name}`);
            return template;
        } catch (error) {
            console.error('设置模板失败:', error);
            throw error;
        }
    }

    /**
     * 加载模板文件
     * @param {Object} template - 模板对象
     */
    async loadTemplateFiles(template) {
        try {
            console.log(`开始加载模板文件: ${template.name}`);
            
            // 确保预览容器存在
            if (!this.previewContainer) {
                this.previewContainer = document.querySelector(this.options.previewContainer);
                if (!this.previewContainer) {
                    throw new Error('预览容器不存在');
                }
            }
            
            // 保存原始结构
            const originalClasses = Array.from(this.previewContainer.classList);
            
            // 保持resume-preview类，添加模板特定类
            this.previewContainer.classList.add(template.id);
            
            // 处理CSS样式
            const existingStyleEl = document.getElementById('template-style');
            if (existingStyleEl) {
                existingStyleEl.remove();
            }
            
            const styleEl = document.createElement('style');
            styleEl.id = 'template-style';
            
            // 保持必要容器尺寸的CSS
            const containerSizeCSS = `
                /* 保持原始容器尺寸 */
                .preview-panel {
                    width: 800px !important;
                    margin: 0 auto !important;
                    height: 100% !important;
                    overflow: hidden !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                
                .resume-preview {
                    flex: 1 !important;
                    overflow-y: auto !important;
                    padding: 5px !important;
                }
                
                .resume-container {
                    max-width: 100% !important;
                    margin: 0 auto !important;
                }
            `;
            
            if (this.options.useMockData) {
                // 应用模板基本样式 + 容器尺寸保持
                styleEl.textContent = `
                    ${containerSizeCSS}
                    
                    /* ${template.name}模板样式 */
                    .${template.id} .resume-name {
                        color: ${template.primaryColor};
                        font-weight: bold;
                    }
                    
                    .${template.id} .section-title {
                        color: ${template.primaryColor};
                        border-bottom: 2px solid ${template.primaryColor};
                        padding-bottom: 5px;
                    }
                    
                    /* 其他模板特定样式 */
                    .${template.id} .resume-header-flex {
                        display: flex;
                        align-items: center;
                    }
                `;
            } else {
                // 对于外部CSS文件，加载并与容器尺寸CSS结合
                try {
                    const cssResponse = await fetch(`${this.options.templatesPath}/${template.id}/style.css`);
                    if (!cssResponse.ok) {
                        throw new Error(`加载模板CSS失败: ${cssResponse.status}`);
                    }
                    
                    // 获取模板CSS
                    let cssContent = await cssResponse.text();
                    
                    // 组合CSS
                    styleEl.textContent = containerSizeCSS + cssContent;
                } catch (cssError) {
                    console.error('加载模板CSS失败，使用基本样式', cssError);
                    
                    // 使用基本样式
                    styleEl.textContent = `
                        ${containerSizeCSS}
                        
                        /* ${template.name}基本样式 */
                        .${template.id} .resume-name {
                            color: ${template.primaryColor};
                        }
                        
                        .${template.id} .section-title {
                            color: ${template.primaryColor};
                            border-bottom: 2px solid ${template.primaryColor};
                        }
                    `;
                }
            }
            
            // 添加样式到页面
            document.head.appendChild(styleEl);
            
            // 备份当前简历数据
            const currentResumeData = window.resumeData;
            
            // 如果window.resumeData已存在，使用它来重新渲染内容
            if (currentResumeData && typeof window.renderResumePreview === 'function') {
                window.renderResumePreview(currentResumeData);
            }
            
            console.log(`模板 ${template.name} 加载完成`);
        } catch (error) {
            console.error('加载模板文件失败:', error);
            throw error;
        }
    }

    /**
     * 设置模板主题颜色
     * @param {string} color - 颜色值
     */
    setColor(color) {
        this.currentColor = color;
        
        // 更新颜色选择器UI
        document.querySelectorAll(this.options.colorSelector).forEach(item => {
            if (item.style.backgroundColor === color) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 动态创建或更新CSS变量
        let styleEl = document.getElementById('theme-color-style');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'theme-color-style';
            document.head.appendChild(styleEl);
        }
        
        styleEl.textContent = `
            :root {
                --primary-color: ${color};
            }
            
            .${this.currentTemplate.id}-resume-name, 
            .${this.currentTemplate.id}-section-title {
                color: ${color};
            }
        `;
        
        console.log(`主题颜色已更新为: ${color}`);
    }

    /**
     * 渲染简历数据到当前模板
     * @param {Object} data - 简历数据
     */
    renderResumeData(data) {
        if (!data) return;
        
        this.resumeData = data;
        console.log('渲染简历数据:', data);
        
        if (!this.previewContainer) return;
        
        try {
            // 填充单个数据字段
            const fillField = (fieldName, value) => {
                const elements = this.previewContainer.querySelectorAll(`[data-field="${fieldName}"]`);
                elements.forEach(el => {
                    if (el.tagName === 'IMG') {
                        el.src = value || el.src;
                    } else {
                        el.textContent = value || '';
                    }
                });
            };
            
            // 处理基本信息
            if (data.basic) {
                fillField('name', data.basic.name);
                fillField('title', data.basic.position || '求职者');
                fillField('phone', data.basic.phone);
                fillField('email', data.basic.email);
                fillField('location', data.basic.location);
                
                // 组合基本信息文本
                const basicInfo = `${data.basic.gender || ''} | ${data.basic.age || ''} | ${data.basic.educationLevel || ''} | ${data.basic.experience || ''} | ${data.basic.status || ''}`;
                fillField('basicInfo', basicInfo);
                
                // 组合联系信息文本
                const contact = `联系电话：${data.basic.phone || ''} | 邮箱：${data.basic.email || ''}`;
                fillField('contact', contact);
            }
            
            // 处理头像
            if (data.avatar) {
                fillField('avatar', data.avatar);
            }
            
            // 处理求职意向
            if (data.intention) {
                fillField('position', data.intention.position);
                fillField('city', data.intention.city);
                fillField('salary', data.intention.salary);
                fillField('entryTime', data.intention.entryTime);
            }
            
            // 处理个人简介
            if (data.summary) {
                fillField('summary', data.summary);
            }
            
            // 处理列表类数据（教育经历、工作经历等）
            this.renderListData('education', data.education);
            this.renderListData('work', data.work);
            this.renderListData('project', data.project);
            this.renderListData('campus', data.campus);
            this.renderListData('skills', data.skills);
            this.renderListData('awards', data.awards);
            
            console.log('简历数据渲染完成');
        } catch (error) {
            console.error('渲染简历数据失败:', error);
        }
    }

    /**
     * 渲染列表类数据
     * @param {string} listType - 列表类型
     * @param {Array} items - 列表数据项
     */
    renderListData(listType, items) {
        if (!items || !items.length) return;
        
        // 查找列表容器
        const listContainer = this.previewContainer.querySelector(`[data-list="${listType}"]`);
        if (!listContainer) return;
        
        // 获取列表项模板
        const templateItem = listContainer.children[0];
        if (!templateItem) return;
        
        // 清空列表容器，保留模板项
        const template = templateItem.cloneNode(true);
        listContainer.innerHTML = '';
        
        // 根据数据添加列表项
        items.forEach(item => {
            const newItem = template.cloneNode(true);
            
            // 填充数据字段
            for (const [key, value] of Object.entries(item)) {
                const elements = newItem.querySelectorAll(`[data-field="${key}"]`);
                elements.forEach(el => {
                    if (el.tagName === 'IMG') {
                        el.src = value || el.src;
                    } else {
                        el.textContent = value || '';
                    }
                });
            }
            
            // 特殊处理各类型数据
            switch (listType) {
                case 'education':
                    // 处理学校和专业组合
                    const schoolEl = newItem.querySelector('[data-field="school"]');
                    if (schoolEl && item.major) {
                        schoolEl.textContent = `${item.school || ''}·${item.major || ''}`;
                    }
                    break;
                    
                case 'work':
                    // 处理部门和职位组合
                    const roleEl = newItem.querySelector('[data-field="role"]');
                    if (roleEl && item.department && item.position) {
                        roleEl.textContent = `${item.department} ${item.position}`;
                    }
                    break;
                    
                case 'awards':
                    // 处理奖项信息组合
                    const awardInfoEl = newItem.querySelector('[data-field="awardInfo"]');
                    if (awardInfoEl && item.awardDate && item.awardName) {
                        awardInfoEl.textContent = `${item.awardDate} ${item.awardName}`;
                    }
                    break;
                    
                case 'skills':
                    // 处理技能信息组合
                    const skillInfoEl = newItem.querySelector('[data-field="skillInfo"]');
                    if (skillInfoEl && item.skillName && item.skillDetail) {
                        skillInfoEl.textContent = `${item.skillName}: ${item.skillDetail}`;
                    }
                    
                    // 处理技能进度条
                    const progressEl = newItem.querySelector('[data-progress]');
                    if (progressEl && item.skillLevel) {
                        progressEl.style.width = `${item.skillLevel}%`;
                        progressEl.setAttribute('data-progress', item.skillLevel);
                    }
                    break;
            }
            
            // 将新列表项添加到容器
            listContainer.appendChild(newItem);
        });
    }

    /**
     * 获取当前渲染的HTML内容（用于导出）
     * @param {boolean} inlineStyles - 是否内联样式
     * @returns {string} HTML内容
     */
    getRenderedHTML(inlineStyles = true) {
        if (!this.previewContainer) return '';
        
        // 克隆当前预览容器内容
        const content = this.previewContainer.cloneNode(true);
        
        if (inlineStyles) {
            // 获取当前模板的样式表
            const styleSheet = document.getElementById('template-style');
            const themeStyleSheet = document.getElementById('theme-color-style');
            
            // 如果找到样式表，将其内联到导出内容中
            if (styleSheet) {
                // 获取样式内容
                fetch(styleSheet.href)
                    .then(response => response.text())
                    .then(cssText => {
                        const styleElement = document.createElement('style');
                        styleElement.textContent = cssText;
                        
                        // 如果有主题样式，也添加进去
                        if (themeStyleSheet) {
                            styleElement.textContent += '\n' + themeStyleSheet.textContent;
                        }
                        
                        // 添加内联样式标签
                        content.prepend(styleElement);
                    })
                    .catch(error => console.error('内联样式失败:', error));
            }
        }
        
        return content.innerHTML;
    }

    /**
     * 导出为PDF
     */
    async exportToPDF() {
        try {
            console.log('正在准备导出PDF...');
            
            // 获取渲染的HTML内容
            const htmlContent = this.getRenderedHTML(true);
            
            // 调用后端API生成PDF
            const response = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    html: htmlContent,
                    templateId: this.currentTemplate.id,
                    filename: `简历_${new Date().getTime()}.pdf`
                })
            });

            if (!response.ok) {
                throw new Error(`导出PDF失败: ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // 创建下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = `简历_${new Date().getTime()}.pdf`;
            a.click();

            // 清理资源
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('导出PDF失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有可用模板
     * @returns {Promise<Array>} 模板列表
     */
    async getTemplates() {
        try {
            if (this.options.useMockData) {
                // 使用mock数据
                this.templates = [
                    {
                        id: 'standard',
                        name: '标准模板',
                        description: '简洁大方的标准简历模板',
                        htmlPath: '/templates/standard/template.html',
                        cssPath: '/templates/standard/template.css',
                        primaryColor: '#2196F3'
                    },
                    {
                        id: 'modern',
                        name: '现代模板',
                        description: '时尚现代的简历模板',
                        htmlPath: '/templates/modern/template.html',
                        cssPath: '/templates/modern/template.css',
                        primaryColor: '#4CAF50'
                    },
                    {
                        id: 'classic',
                        name: '经典模板',
                        description: '传统经典的简历模板',
                        htmlPath: '/templates/classic/template.html',
                        cssPath: '/templates/classic/template.css',
                        primaryColor: '#9C27B0'
                    },
                    {
                        id: 'creative',
                        name: '创意模板',
                        description: '富有创意的简历模板',
                        htmlPath: '/templates/creative/template.html',
                        cssPath: '/templates/creative/template.css',
                        primaryColor: '#FF9800'
                    }
                ];
                return this.templates;
            }

            const response = await fetch(this.options.templatesDataUrl);
            if (!response.ok) {
                throw new Error(`加载模板数据失败: ${response.status}`);
            }
            
            const data = await response.json();
            this.templates = data.templates || [];
            
            return this.templates;
        } catch (error) {
            console.error('获取模板列表失败:', error);
            return [];
        }
    }
}