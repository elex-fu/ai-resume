// 导入API服务
import ApiService from './api-service.js';
// 导入模板管理器
import { TemplateManager } from './template-manager.js';

// 简历数据结构定义
const RESUME_DATA_SCHEMA = {
    basic: {
        name: '',
        gender: '',
        age: '',
        phone: '',
        email: '',
        location: '',
        educationLevel: '',
        experience: '',
        status: '',
        avatar: ''
    },
    intention: {
        position: '',
        city: '',
        salary: '',
        entryTime: ''
    },
    education: [{
        school: '',
        major: '',
        degree: '',
        time: '',
        gpa: '',
        rank: '',
        description: ''
    }],
    work: [{
        company: '',
        position: '',
        time: '',
        description: ''
    }],
    project: [{
        name: '',
        role: '',
        time: '',
        description: ''
    }],
    campus: [{
        organization: '',
        role: '',
        time: '',
        description: ''
    }],
    awards: [{
        name: '',
        date: ''
    }],
    skills: [{
        name: '',
        level: ''
    }]
};

// 从URL获取简历ID
function getResumeIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 初始化应用
        await initApp();
    } catch (error) {
        console.error('应用初始化失败:', error);
    }
});

// 初始化应用
async function initApp() {
    try {
        // 先初始化模板管理器
        await initTemplateManager();
        
        // 加载简历数据
        const resumeId = getResumeIdFromUrl();
        if (resumeId) {
            await loadResumeData(resumeId);
        } else {
            console.log('未指定简历ID，加载默认mock数据');
            await loadDefaultMockData();
        }
    } catch (error) {
        console.error('初始化简历数据失败:', error);
        showToast('初始化简历数据失败');
    }
    
    // 初始化组件
    await initComponents();
}

// 加载默认mock数据
async function loadDefaultMockData() {
    try {
        const response = await fetch('/mock/resume-mock-data.json');
        if (!response.ok) {
            throw new Error(`加载默认mock数据失败: ${response.status}`);
        }
        
        const data = await response.json();
        window.resumeData = validateResumeData(data);
        
        // 渲染数据到模板
        await renderResumeData(window.resumeData);
    } catch (error) {
        console.error('加载默认mock数据失败:', error);
        showToast('加载默认数据失败');
    }
}

// 验证简历数据结构
function validateResumeData(data) {
    const validatedData = JSON.parse(JSON.stringify(RESUME_DATA_SCHEMA));
    
    // 递归验证数据
    function validateObject(target, source) {
        for (const key in target) {
            if (source && source[key] !== undefined) {
                if (Array.isArray(target[key])) {
                    target[key] = source[key].map(item => {
                        const validatedItem = validateObject({...target[key][0]}, item);
                        // 处理时间字段
                        if (item.startDate && item.endDate) {
                            validatedItem.time = `${item.startDate} - ${item.endDate}`;
                        }
                        return validatedItem;
                    });
                } else if (typeof target[key] === 'object') {
                    target[key] = validateObject(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }
    
    return validateObject(validatedData, data);
}

// 加载简历数据
async function loadResumeData(resumeId) {
    try {
        showLoading('加载简历数据...');
        
        let data;
        try {
            data = await ApiService.resume.getResumeById(resumeId);
            console.log('从API获取简历数据成功');
        } catch (error) {
            console.warn('API获取数据失败，使用mock数据', error);
            const response = await fetch('/mock/resume-mock-data.json');
            if (!response.ok) {
                throw new Error(`加载mock数据失败: ${response.status}`);
            }
            data = await response.json();
        }
        
        // 验证并保存数据
        const validatedData = validateResumeData(data);
        window.resumeData = validatedData;
        
        // 初始化模板管理器并传入简历数据
        await initTemplateManager(validatedData);
        
        hideLoading();
        return validatedData;
    } catch (error) {
        console.error('加载简历数据失败:', error);
        showToast('加载简历数据失败');
        hideLoading();
        return null;
    }
}

// 初始化组件
async function initComponents() {
    // 初始化工具栏
    initToolbar();
    
    // 初始化可编辑内容监听器
    initEditableContentListeners();
}

// 初始化模板管理器
async function initTemplateManager(resumeData) {
    try {
        window.templateManager = new TemplateManager({
            previewContainer: '#resumePreview',
            templatesPath: '/templates',
            defaultTemplate: 'default',
            resumeData: resumeData // 添加简历数据
        });

        // 如果有简历数据，立即渲染
        if (resumeData) {
            await window.templateManager.renderResumeData(resumeData);
        }
    } catch (error) {
        console.error('初始化模板管理器失败:', error);
        throw error;
    }
}

// 初始化工具栏
function initToolbar() {
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;
    
    const toolbarButtons = [
        { class: 'save-btn', icon: 'save', text: '保存', click: saveResume },
        { class: 'export-btn', icon: 'export', text: '导出', click: exportResumePDF },
        { class: 'optimize-btn', icon: 'optimize', text: 'AI优化', click: () => openAIEditModal() }
    ];
    
    toolbarButtons.forEach(btn => {
        const button = document.createElement('button');
        button.className = btn.class;
        button.innerHTML = `<i class="icon-${btn.icon}"></i>${btn.text}`;
        button.addEventListener('click', btn.click);
        toolbar.appendChild(button);
    });
}

// 初始化可编辑内容监听器
function initEditableContentListeners() {
    const editableSections = document.querySelectorAll('.editable-section');
    editableSections.forEach(section => {
        section.addEventListener('click', function() {
            const sectionType = this.getAttribute('data-section');
            if (sectionType === 'avatar') {
                document.getElementById('avatar-upload').click();
                return;
            }
            fillModalWithExistingData(sectionType);
        });
    });
}

// 填充模态框数据
function fillModalWithExistingData(sectionType) {
    if (!window.resumeData) {
        console.error('没有简历数据');
        return;
    }
    
    // 根据区域类型打开不同的编辑模态框
    switch (sectionType) {
        case 'basic':
            openBasicInfoModal(window.resumeData.basic);
            break;
        case 'intention':
            openJobIntentionModal(window.resumeData.intention);
            break;
        case 'education':
            openEducationModal(window.resumeData.education);
            break;
        case 'work':
            openWorkExperienceModal(window.resumeData.work);
            break;
        case 'project':
            openProjectExperienceModal(window.resumeData.project);
            break;
        case 'campus':
            openCampusExperienceModal(window.resumeData.campus);
            break;
        case 'awards':
            openAwardsModal(window.resumeData.awards);
            break;
        case 'skills':
            openSkillsModal(window.resumeData.skills);
            break;
        default:
            console.log(`未知的区域类型: ${sectionType}`);
            break;
    }
}

// 保存简历
async function saveResume() {
    try {
        showLoading('正在保存...');
        
        // 从URL获取简历ID
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('id') || 1;
        
        // 调用API保存简历
        await ApiService.resume.updateResume(resumeId, window.resumeData);
        
        hideLoading();
        showToast('简历已保存');
    } catch (error) {
        console.error('保存简历失败:', error);
        hideLoading();
        showToast('保存失败，请重试');
    }
}

// 导出简历为PDF
async function exportResumePDF() {
    try {
        showLoading('正在生成PDF...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('id') || 1;
        
        const pdfBlob = await ApiService.resume.generatePDF(resumeId);
        
        const downloadLink = document.createElement('a');
        const url = URL.createObjectURL(pdfBlob);
        downloadLink.href = url;
        downloadLink.download = `简历_${new Date().getTime()}.pdf`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 100);
        
        hideLoading();
        showToast('PDF已生成，正在下载...');
    } catch (error) {
        console.error('生成PDF失败:', error);
        hideLoading();
        showToast('生成PDF失败，请重试');
    }
}

// 显示加载状态
function showLoading(message) {
    let loading = document.getElementById('loading-indicator');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading-indicator';
        loading.className = 'loading-indicator';
        loading.innerHTML = `
            <div class="spinner"></div>
            <p class="loading-text">${message || '加载中...'}</p>
        `;
        document.body.appendChild(loading);
    }
    loading.classList.add('show');
}

// 隐藏加载状态
function hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
        loading.classList.remove('show');
    }
}

// 显示提示消息
function showToast(message, duration = 3000) {
    let toast = document.getElementById('toast-message');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.className = 'toast-message';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 渲染简历数据到模板
async function renderResumeData(data) {
    if (!window.templateManager) {
        console.error('模板管理器未初始化');
        return;
    }

    try {
        // 获取当前模板
        const currentTemplate = window.templateManager.getCurrentTemplate();
        
        // 如果没有当前模板，使用默认模板
        if (!currentTemplate) {
            console.log('未找到当前模板，使用默认模板');
            await window.templateManager.setTemplate('default');
        }

        // 渲染数据到模板
        await window.templateManager.renderResumeData(data);

        // 更新可编辑区域的内容
        updateEditableSections(data);

    } catch (error) {
        console.error('渲染简历数据失败:', error);
        showToast('渲染简历数据失败');
    }
}

// 更新可编辑区域的内容
function updateEditableSections(data) {
    // 基本信息
    updateSectionContent('.basic-info-section', {
        name: data.basic.name,
        gender: data.basic.gender,
        age: data.basic.age,
        phone: data.basic.phone,
        email: data.basic.email,
        location: data.basic.location,
        educationLevel: data.basic.educationLevel,
        experience: data.basic.experience,
        status: data.basic.status
    });

    // 求职意向
    updateSectionContent('.job-intention-section', {
        position: data.intention.position,
        city: data.intention.city,
        salary: data.intention.salary,
        entryTime: data.intention.entryTime
    });

    // 教育经历
    updateListSection('.education-list', data.education, (item) => ({
        school: item.school,
        major: item.major,
        degree: item.degree,
        time: item.time,
        gpa: item.gpa,
        rank: item.rank,
        description: item.description
    }));

    // 工作经历
    updateListSection('.work-experience-list', data.work, (item) => ({
        company: item.company,
        position: item.position,
        time: item.time,
        description: item.description
    }));

    // 项目经历
    updateListSection('.project-experience-list', data.project, (item) => ({
        name: item.name,
        role: item.role,
        time: item.time,
        description: item.description
    }));

    // 校园经历
    updateListSection('.campus-experience-list', data.campus, (item) => ({
        organization: item.organization,
        role: item.role,
        time: item.time,
        description: item.description
    }));

    // 获奖情况
    updateListSection('.awards-list', data.awards, (item) => ({
        name: item.name,
        date: item.date
    }));

    // 技能特长
    updateListSection('.skills-list', data.skills, (item) => ({
        name: item.name,
        level: item.level
    }));
}

// 更新单个区域的内容
function updateSectionContent(selector, data) {
    const section = document.querySelector(selector);
    if (!section) return;

    for (const [key, value] of Object.entries(data)) {
        const elements = section.querySelectorAll(`.field-${key}`);
        elements.forEach(element => {
            element.textContent = value || '';
            // 添加数据属性以便于后续操作
            element.setAttribute('data-field', key);
        });
    }
}

// 更新列表区域的内容
function updateListSection(selector, items, dataMapper) {
    const container = document.querySelector(selector);
    if (!container) return;

    // 清空现有内容
    container.innerHTML = '';

    // 添加新的项目
    items.forEach(item => {
        const itemData = dataMapper(item);
        const itemElement = document.createElement('div');
        itemElement.className = 'list-item editable-section';
        
        for (const [key, value] of Object.entries(itemData)) {
            const fieldElement = document.createElement('div');
            fieldElement.className = `field-${key} editable-field`;
            fieldElement.setAttribute('data-field', key);
            fieldElement.textContent = value || '';
            itemElement.appendChild(fieldElement);
        }
        
        container.appendChild(itemElement);
    });
}