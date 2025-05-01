/**
 * template-manager.js
 * 负责简历模板的加载、渲染和切换功能
 */

import { editModal } from './edit-modal.js';

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
            isTemplateEnabled: false,           // 默认不启用模板
            resumeData: null,                   // 简历数据
            ...options
        };

        // 添加样式管理相关配置
        this.styleConfig = {
            preventStyleOverride: options.preventStyleOverride || true,
            styleVariables: options.styleVariables || {},
            styleCache: new Map(),
            currentStyleSheet: null
        };

        // 添加编辑功能相关配置
        this.editConfig = {
            editableFields: ['company', 'role', 'workTime', 'description', 
                           'projectName', 'projectRole', 'projectTime',
                           'school', 'major', 'educationTime',
                           'skillName', 'skillDetail', 'skillLevel'],
            editableClass: 'editable-field'
        };

        // 状态变量
        this.templates = [];                    // 存储所有模板信息
        this.currentTemplate = null;            // 当前选中的模板
        this.currentColor = this.options.defaultColor; // 当前主题颜色
        this.resumeData = this.options.resumeData;     // 简历数据
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
            
            // 如果指定了默认模板，则应用它
            if (this.options.defaultTemplate) {
                console.log('正在应用默认模板:', this.options.defaultTemplate);
                await this.setTemplate(this.options.defaultTemplate);
            } else {
                // 否则使用默认样式
                this.resetToDefaultStyle();
                // 如果有简历数据且没有使用模板，仍需要渲染
                if (this.resumeData) {
                    await this.renderResumeData(this.resumeData);
                }
            }
            
            // 初始化样式管理
            this.initStyleManagement();
            
            console.log('模板管理器初始化完成');
        } catch (error) {
            console.error('模板管理器初始化失败:', error);
            throw error;
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
            
            // 如果有简历数据，重新渲染
            if (this.resumeData) {
                this.renderResumeData(this.resumeData);
            }
            
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
            
            // 清空预览容器的内容
            this.previewContainer.innerHTML = '';
            
            // 移除所有模板相关的类名
            const classNames = Array.from(this.previewContainer.classList);
            classNames.forEach(className => {
                if (className.startsWith('template-') || this.templates.some(t => t.id === className)) {
                    this.previewContainer.classList.remove(className);
                }
            });
            
            // 添加当前模板的类名
            this.previewContainer.classList.add('resume-preview');
            this.previewContainer.classList.add(`template-${template.id}`);
            
            // 加载并应用模板样式
            await this.loadTemplateStyle(template);
            
            // 初始化编辑功能
            this.initEditFunctionality();
            
            // 从templates.json获取模板文件路径
            const templateConfig = this.templates.find(t => t.id === template.id);
            if (!templateConfig) {
                throw new Error(`未找到模板配置: ${template.id}`);
            }

            // 加载模板HTML
            try {
                const htmlUrl = new URL(`${this.options.templatesPath}/${template.id}/${templateConfig.templateFile}`, window.location.origin);
                const htmlResponse = await fetch(htmlUrl.toString());
                
                if (!htmlResponse.ok) {
                    throw new Error(`加载模板HTML失败: ${htmlResponse.status}`);
                }
                
                const htmlContent = await htmlResponse.text();
                this.previewContainer.innerHTML = htmlContent;
                
                console.log(`模板 ${template.name} 加载完成`);
            } catch (htmlError) {
                console.error('加载模板HTML失败:', htmlError);
                this.previewContainer.innerHTML = `
                    <div class="default-template">
                        <h1>${template.name}</h1>
                        <p>模板加载失败，使用默认布局</p>
                        <div class="content-placeholder"></div>
                    </div>
                `;
            }
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
     * 渲染简历数据到模板
     * @param {Object} data - 简历数据
     */
    renderResumeData(data) {
        if (!this.previewContainer) {
            console.error('预览容器不存在');
            return;
        }

        // 保存数据到实例
        this.resumeData = data;
        // console.log('开始渲染简历数据:', data);

        try {
            // 获取所有带有data-bind属性的元素
            const elements = this.previewContainer.querySelectorAll('[data-bind]');
            
            elements.forEach(element => {
                try {
                    const bindExpression = element.getAttribute('data-bind');
                    if (!bindExpression) return;

                    // console.log('处理绑定表达式:', bindExpression);

                    // 处理数组映射表达式
                    if (bindExpression.includes('map(')) {
                        this.handleArrayMapping(element, bindExpression, data);
                        return;
                    }

                    // 处理普通表达式
                    const value = this.getNestedValue(data, bindExpression);

                    // 如果value没有值，打印日志
                    if (!value) {
                        console.warn(`字段 ${bindExpression} 没有值:`, data);
                    }
                    this.updateElementValue(element, value);
                } catch (elementError) {
                    console.error(`处理元素绑定失败: ${elementError.message}`, element);
                }
            });
        } catch (error) {
            console.error('渲染简历数据失败:', error);
        }
    }

    /**
     * 处理数组映射表达式
     * @private
     */
    handleArrayMapping(element, expression, data) {
        try {
            // 提取数组路径和模板
            const matches = expression.match(/([a-zA-Z]+)\.map\((.*)\)/s);
            if (!matches) {
                console.warn('处理数组映射失败:', expression);
                return;
            }

            const [_, arrayPath, template] = matches;
            
            // 修正数组路径名称
            const pathMap = {
                'education': 'educationList',
                'work': 'workList',
                'project': 'projectList',
                'campus': 'campusList',
                'awards': 'awardList',
                'skills': 'skillList'
            };
            
            const actualPath = pathMap[arrayPath] || arrayPath;
            
            // 获取数组数据
            const array = this.getNestedValue(data, actualPath) || [];
            
            if (!Array.isArray(array)) {
                console.warn(`${actualPath} 不是一个数组`);
                return;
            }

            // 清空容器
            element.innerHTML = '';

            // 映射数组
            array.forEach((item, index) => {
                try {
                    // 处理模板字符串
                    let html = template
                        .replace(/&gt;/g, '>')
                        .replace(/&lt;/g, '<')
                        .replace(/&amp;/g, '&')
                        .trim();

                    // 替换模板中的变量
                    const itemHtml = html.replace(/\${(.*?)}/g, (match, expr) => {
                        try {
                            // 处理时间字段
                            if (expr.includes('time') && item.startDate && item.endDate) {
                                return `${item.startDate} - ${item.endDate}`;
                            }
                            
                            // 处理普通字段
                            const field = expr.trim().replace('item.', '');
                            const value = item[field];
                            if (!value) {
                                console.log(`字段 ${field} 没有值:`, item);
                            }
                            return value || '';
                        } catch (exprError) {
                            console.warn(`表达式求值失败: ${expr}`, exprError);
                            return '';
                        }
                    });

                    if (!itemHtml) {
                        console.warn('itemHtml没有值:', item);
                    }

                    const div = document.createElement('div');
                    div.innerHTML = itemHtml;
                    const newElement = div.firstElementChild;
                    
                    if (newElement) {
                        element.appendChild(newElement);
                    }
                } catch (itemError) {
                    console.error(`处理数组项失败: ${itemError.message}`, item);
                }
            });

            // 如果没有数据，显示提示信息
            if (array.length === 0) {
                const emptyMessage = this.getEmptyMessage(actualPath);
                if (emptyMessage) {
                    const emptyDiv = document.createElement('div');
                    emptyDiv.className = 'empty-message';
                    emptyDiv.textContent = emptyMessage;
                    element.appendChild(emptyDiv);
                }
            }
        } catch (error) {
            console.error('处理数组映射失败:', error);
        }
    }

    /**
     * 获取空数据提示信息
     * @private
     */
    getEmptyMessage(arrayPath) {
        const messages = {
            'educationList': '暂无教育经历',
            'workList': '暂无工作经历',
            'projectList': '暂无项目经历',
            'campusList': '暂无校园经历',
            'awardList': '暂无获奖经历',
            'skillList': '暂无技能特长'
        };
        return messages[arrayPath] || '暂无数据';
    }

    /**
     * 安全地获取嵌套对象的值
     * @private
     */
    getNestedValue(obj, path) {
        try {
            return path.split('.').reduce((current, part) => {
                if (current === null || current === undefined) return undefined;
                return current[part];
            }, obj);
        } catch (error) {
            console.warn(`获取路径 ${path} 的值失败:`, error);
            return undefined;
        }
    }

    /**
     * 计算表达式的值
     * @private
     */
    evaluateExpression(expression, context) {
        try {
            // 处理特殊情况：avatar路径
            if (expression.includes('avatar')) {
                return context.basic?.avatar || '/images/default-avatar.png';
            }

            // 创建一个安全的执行环境
            const safeContext = { ...context };
            const func = new Function('context', `
                with (context) {
                    try {
                        return ${expression};
                    } catch (error) {
                        return '';
                    }
                }
            `);

            return func(safeContext) || '';
        } catch (error) {
            console.warn(`表达式求值失败: ${expression}`, error);
            return '';
        }
    }

    /**
     * 更新元素的值
     * @private
     */
    updateElementValue(element, value) {
        try {
            if (element.tagName === 'IMG') {
                // 处理图片元素
                if (value) {
                    element.src = value;
                    element.onerror = () => {
                        element.src = '/images/default-avatar.png';
                    };
                }
            } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                // 处理输入元素
                element.value = value || '';
            } else {
                // 处理其他元素
                element.textContent = value || '';
            }
        } catch (error) {
            console.error(`更新元素值失败: ${error.message}`, element);
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

    /**
     * 获取当前选中的模板
     * @returns {Object|null} 当前模板对象，如果没有选中模板则返回null
     */
    getCurrentTemplate() {
        return this.currentTemplate;
    }

    /**
     * 加载模板
     * @param {Object} template - 模板对象
     */
    async loadTemplate(template) {
        try {
            if (!template) {
                throw new Error('模板对象不能为空');
            }

            console.log(`开始加载模板: ${template.name}`);
            
            // 保存当前模板
            this.currentTemplate = template;
            
            // 加载模板文件
            await this.loadTemplateFiles(template);
            
            // 如果有简历数据，重新渲染
            if (this.resumeData) {
                this.renderResumeData(this.resumeData);
            }
            
            console.log(`模板加载完成: ${template.name}`);
            return template;
        } catch (error) {
            console.error('加载模板失败:', error);
            throw error;
        }
    }

    /**
     * 初始化样式管理
     */
    initStyleManagement() {
        if (this.styleConfig.preventStyleOverride) {
            this.protectStyles();
        }
        
        // 初始化样式变量
        this.initStyleVariables();
    }
    
    /**
     * 保护现有样式不被覆盖
     */
    protectStyles() {
        const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
        styleElements.forEach(style => {
            if (!style.hasAttribute('data-protected')) {
                style.setAttribute('data-protected', 'true');
            }
        });
    }
    
    /**
     * 初始化样式变量
     */
    initStyleVariables() {
        const styleEl = document.createElement('style');
        styleEl.id = 'template-variables';
        document.head.appendChild(styleEl);
        
        this.updateStyleVariables();
    }
    
    /**
     * 更新样式变量
     * @param {Object} variables - 新的样式变量
     */
    updateStyleVariables(variables = {}) {
        this.styleConfig.styleVariables = {
            ...this.styleConfig.styleVariables,
            ...variables
        };
        
        const styleEl = document.getElementById('template-variables');
        if (styleEl) {
            const cssVariables = Object.entries(this.styleConfig.styleVariables)
                .map(([key, value]) => `--${key}: ${value};`)
                .join('\n');
            
            styleEl.textContent = `:root { ${cssVariables} }`;
        }
    }
    
    /**
     * 应用模板样式
     * @param {string} templateId - 模板ID
     * @param {string} cssContent - CSS内容
     */
    async applyTemplateStyle(templateId, cssContent) {
        return new Promise((resolve) => {
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this._applyStyle(templateId, cssContent);
                    resolve();
                });
            } else {
                this._applyStyle(templateId, cssContent);
                resolve();
            }
        });
    }

    /**
     * 实际应用样式的内部方法
     * @private
     */
    _applyStyle(templateId, cssContent) {
        // 先检查并移除已存在的同id样式表
        const existingStyle = document.getElementById(`template-style-${templateId}`);
        if (existingStyle) {
            existingStyle.remove();
        }

        // 创建新的样式表
        const styleEl = document.createElement('style');
        styleEl.id = `template-style-${templateId}`;
        styleEl.setAttribute('data-protected', 'true');
        styleEl.textContent = cssContent;
        
        // 确保样式表被正确添加到head中
        if (!document.head) {
            console.error('document.head不存在');
            return;
        }
        
        document.head.appendChild(styleEl);
        this.styleConfig.currentStyleSheet = styleEl;
        
        console.log(`样式应用成功: ${templateId}`);
    }

    /**
     * 移除所有模板相关的样式表
     */
    removeAllTemplateStyles() {
        // 移除所有模板样式表
        const templateStyles = document.querySelectorAll('style[id^="template-style-"]');
        templateStyles.forEach(style => {
            console.log(`移除样式表: ${style.id}`);
            style.remove();
        });
        
        // 移除主题样式表
        const themeStyle = document.getElementById('theme-color-style');
        if (themeStyle) {
            themeStyle.remove();
        }
        
        // 清除当前样式表引用
        this.styleConfig.currentStyleSheet = null;
    }

    /**
     * 加载模板样式
     * @param {Object} template - 模板对象
     */
    async loadTemplateStyle(template) {
        try {
            // 移除所有模板相关的样式表
            this.removeAllTemplateStyles();
            
            // 检查缓存
            if (this.styleConfig.styleCache.has(template.id)) {
                console.log(`使用缓存的样式: ${template.id}`);
                const cachedStyle = this.styleConfig.styleCache.get(template.id);
                await this.applyTemplateStyle(template.id, cachedStyle);
                return cachedStyle;
            }
            
            // 从templates.json获取样式文件路径
            const templateConfig = this.templates.find(t => t.id === template.id);
            if (!templateConfig) {
                throw new Error(`未找到模板配置: ${template.id}`);
            }
            
            // 构建样式URL
            const cssUrl = new URL(`${this.options.templatesPath}/${template.id}/${templateConfig.styleFile}`, window.location.origin);
            console.log(`正在加载样式: ${cssUrl.toString()}`);
            
            const response = await fetch(cssUrl.toString());
            
            if (!response.ok) {
                throw new Error(`加载模板样式失败: ${response.status}`);
            }
            
            const cssContent = await response.text();
            
            // 缓存样式
            this.styleConfig.styleCache.set(template.id, cssContent);
            
            // 应用样式
            await this.applyTemplateStyle(template.id, cssContent);
            
            console.log(`样式加载成功: ${template.id}`);
            return cssContent;
        } catch (error) {
            console.error('加载模板样式失败:', error);
            // 使用默认样式
            await this.applyDefaultStyle();
            return null;
        }
    }
    
    /**
     * 应用默认样式
     */
    async applyDefaultStyle() {
        const defaultStyle = `
            .resume-preview {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
        `;
        
        await this.applyTemplateStyle('default', defaultStyle);
        console.log('默认样式应用成功');
    }
    
    /**
     * 清除样式缓存
     */
    clearStyleCache() {
        this.styleConfig.styleCache.clear();
    }

    /**
     * 初始化编辑功能
     */
    initEditFunctionality() {
        // 添加可编辑字段的样式
        const style = document.createElement('style');
        style.textContent = `
            .editable-field {
                position: relative;
                transition: background-color 0.2s;
                padding: 4px 8px;
                border-radius: 4px;
            }
            
            .editable-field:hover {
                background-color: rgba(26, 115, 232, 0.1);
            }
            
            .editable-field::after {
                content: '✎';
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                opacity: 0;
                transition: opacity 0.2s;
                color: #1a73e8;
                font-size: 12px;
            }
            
            .editable-field:hover::after {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
        
        // 为所有可编辑字段添加点击事件
        this.editConfig.editableFields.forEach(field => {
            const elements = this.previewContainer.querySelectorAll(`[data-field="${field}"]`);
            elements.forEach(element => {
                // 确保元素不是只读的
                if (!element.hasAttribute('readonly')) {
                    element.classList.add(this.editConfig.editableClass);
                    element.style.cursor = 'pointer';
                    
                    // 移除可能存在的旧事件监听器
                    const newElement = element.cloneNode(true);
                    element.parentNode.replaceChild(newElement, element);
                    
                    // 添加新的事件监听器
                    newElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        editModal.show(newElement, field);
                    });
                }
            });
        });
    }
}