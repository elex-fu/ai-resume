// 导入API服务
import ApiService from './api-service.js';
// 导入模板管理器
import { TemplateManager } from './template-manager.js';

// 简历数据结构定义
const RESUME_DATA_SCHEMA = {
    basicInfo: {
        name: '',
        avatar: '',
        position: '',
        gender: '',
        age: '',
        political: '',
        educationLevel: '',
        experience: '',
        status: '',
        phone: '',
        email: '',
        location: ''
    },
    jobIntention: {
        position: '',
        city: '',
        salary: '',
        entryTime: ''
    },
    summary: '',
    educationList: [{
        school: '',
        major: '',
        degree: '',
        startDate: '',
        endDate: '',
        description: '',
        gpa: '',
        rank: ''
    }],
    workList: [{
        company: '',
        department: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
    }],
    projectList: [{
        name: '',
        role: '',
        startDate: '',
        endDate: '',
        description: ''
    }],
    campusList: [{
        organization: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
    }],
    awardList: [{
        name: '',
        date: '',
        description: ''
    }],
    skillList: [{
        name: '',
        level: '',
        description: ''
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
        // await initTemplateManager();
        
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
                        return validateObject({...target[key][0]}, item);
                    });
                } else if (typeof target[key] === 'object') {
                    target[key] = validateObject(target[key], source[key]);
                } else {
                    // 特殊字段验证
                    if (key === 'phone') {
                        target[key] = validatePhone(source[key]);
                    } else if (key === 'email') {
                        target[key] = validateEmail(source[key]);
                    } else if (key === 'age') {
                        target[key] = validateAge(source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    }
    
    return validateObject(validatedData, data);
}

// 验证手机号
function validatePhone(phone) {
    if (!phone) return phone;
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
        console.warn('手机号格式不正确:', phone);
    }
    return phone;
}

// 验证邮箱
function validateEmail(email) {
    if (!email) return email;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        console.warn('邮箱格式不正确:', email);
    }
    return email;
}

// 验证年龄
function validateAge(age) {
    if (!age) return age;
    if (!/^\d+岁?$/.test(age)) {
        console.warn('年龄格式不正确:', age);
    }
    return age;
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
    // initEditableContentListeners();
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
    // 绑定保存按钮事件
    document.querySelector('#saveBtn')?.addEventListener('click', saveResume);
    
    // 绑定导出PDF按钮事件
    document.querySelector('#exportPdfBtn')?.addEventListener('click', exportResumePDF);
    
    // 绑定应用修改按钮事件
    const optimizeBtn = document.querySelector('.optimize-btn');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', async () => {
            // 获取选中的优化选项
            const options = {
                professional: document.getElementById('opt-professional').checked,
                keywords: document.getElementById('opt-keywords').checked,
                quantify: document.getElementById('opt-quantify').checked,
                grammar: document.getElementById('opt-grammar').checked
            };
            
            // 构建优化描述
            const optimizeDescription = buildOptimizeDescription(options);
            
            // 调用优化函数
            await applyOptimize(optimizeDescription);
        });
    } else {
        console.warn('未找到优化按钮');
    }
}

// 构建优化描述
function buildOptimizeDescription(options) {
    const descriptions = [];
    if (options.professional) descriptions.push('使用更专业的表达方式');
    if (options.keywords) descriptions.push('添加行业关键词');
    if (options.quantify) descriptions.push('量化描述工作成果');
    if (options.grammar) descriptions.push('优化语法和拼写');
    
    return descriptions.join('，') || '优化简历内容';
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

// 填充编辑框数据
function fillModalWithExistingData(sectionType) {
    if (!window.resumeData) {
        console.error('没有简历数据');
        return;
    }
    
    // 根据区域类型打开不同的编辑模态框
    switch (sectionType) {
        case 'basic':
            openBasicInfoModal(window.resumeData.basicInfo);
            break;
        case 'jobIntention':
            openJobIntentionModal(window.resumeData.jobIntention);
            break;
        case 'education':
            openEducationModal(window.resumeData.educationList);
            break;
        case 'workList':
            openWorkExperienceModal(window.resumeData.workList);
            break;
        case 'projectList':
            openProjectExperienceModal(window.resumeData.projectList);
            break;
        case 'campusList':
            openCampusExperienceModal(window.resumeData.campusList);
            break;
        case 'awardList':
            openAwardsModal(window.resumeData.awardList);
            break;
        case 'skillList':
            openSkillsModal(window.resumeData.skillList);
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
        name: data.basicInfo.name,
        avatar: data.basicInfo.avatar,
        position: data.basicInfo.position,
        gender: data.basicInfo.gender,
        age: data.basicInfo.age,
        political: data.basicInfo.political,
        educationLevel: data.basicInfo.educationLevel,
        experience: data.basicInfo.experience,
        status: data.basicInfo.status,
        phone: data.basicInfo.phone,
        email: data.basicInfo.email,
        location: data.basicInfo.location
    });

    // 求职意向
    updateSectionContent('.job-intention-section', {
        position: data.jobIntention.position,
        city: data.jobIntention.city,
        salary: data.jobIntention.salary,
        entryTime: data.jobIntention.entryTime
    });

    // 教育经历
    updateListSection('.education-list', data.educationList, (item) => ({
        school: item.school,
        major: item.major,
        degree: item.degree,
        startDate: item.startDate,
        endDate: item.endDate,
        gpa: item.gpa,
        rank: item.rank,
        description: item.description
    }));

    // 工作经历
    updateListSection('.work-experience-list', data.workList, (item) => ({
        company: item.company,
        department: item.department,
        position: item.position,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description
    }));

    // 项目经历
    updateListSection('.project-experience-list', data.projectList, (item) => ({
        name: item.name,
        role: item.role,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description
    }));

    // 校园经历
    updateListSection('.campus-experience-list', data.campusList, (item) => ({
        organization: item.organization,
        position: item.position,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description
    }));

    // 获奖情况
    updateListSection('.awards-list', data.awardList, (item) => ({
        name: item.name,
        date: item.date,
        description: item.description
    }));

    // 技能特长
    updateListSection('.skills-list', data.skillList, (item) => ({
        name: item.name,
        level: item.level,
        description: item.description
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

/**
 * 合并简历数据
 * @param {Object} originalResume - 原始简历数据
 * @param {Object} optimizedResume - 优化后的简历数据（可能只包含修改的字段）
 * @returns {Object} 合并后的简历数据
 */
function mergeResumeData(originalResume, optimizedResume) {
    if (!optimizedResume) return originalResume;
    
    const mergedResume = { ...originalResume };
    
    // 遍历优化后的简历数据的所有字段
    Object.keys(optimizedResume).forEach(key => {
        const optimizedValue = optimizedResume[key];
        
        // 如果字段存在且不为null且不为空字符串，则更新
        if (optimizedValue !== null && optimizedValue !== undefined && 
            !(typeof optimizedValue === 'string' && optimizedValue.trim() === '')) {
            if (Array.isArray(optimizedValue)) {
                // 如果是数组类型（如教育经历、工作经历等），需要逐项合并
                if (optimizedValue.length > 0) {  // 只在数组不为空时进行合并
                    mergedResume[key] = optimizedValue.map((item, index) => {
                        const originalItem = (originalResume[key] && originalResume[key][index]) || {};
                        return mergeResumeItem(originalItem, item);
                    });
                }
            } else if (typeof optimizedValue === 'object') {
                // 如果是对象类型（如基本信息、求职意向等），需要递归合并
                mergedResume[key] = mergeResumeItem(originalResume[key] || {}, optimizedValue);
            } else {
                // 如果是基本类型，直接更新
                mergedResume[key] = optimizedValue;
            }
        }
    });
    
    return mergedResume;
}

/**
 * 合并简历项目数据
 * @param {Object} originalItem - 原始项目数据
 * @param {Object} optimizedItem - 优化后的项目数据
 * @returns {Object} 合并后的项目数据
 */
function mergeResumeItem(originalItem, optimizedItem) {
    if (!optimizedItem) return originalItem;
    
    const mergedItem = { ...originalItem };
    
    // 遍历优化后的项目数据的所有字段
    Object.keys(optimizedItem).forEach(key => {
        const optimizedValue = optimizedItem[key];
        // 如果字段存在且不为null且不为空字符串，则更新
        if (optimizedValue !== null && optimizedValue !== undefined && 
            !(typeof optimizedValue === 'string' && optimizedValue.trim() === '')) {
            mergedItem[key] = optimizedValue;
        }
    });
    
    return mergedItem;
}

/**
 * 应用AI优化
 */
async function applyOptimize(optimizeDescription) {
    try {
        showLoading('正在优化简历...');
        
        // 获取当前简历ID
        const resumeId = getResumeIdFromUrl();
        if (!resumeId) {
            throw new Error('未找到简历ID');
        }
        
        // 调用优化API
        const optimizeResult = await ApiService.resume.optimizeResume(resumeId, optimizeDescription);
        
        // 合并并更新简历数据
        const mergedResumeData = mergeResumeData(window.resumeData, optimizeResult.optimizedResume);
        window.resumeData = validateResumeData(mergedResumeData);
        
        // 重新渲染简历
        await renderResumeData(window.resumeData);
        
        // 显示优化结果
        showOptimizeResult(optimizeResult);
        
        showToast('简历优化成功');
    } catch (error) {
        console.error('优化简历失败:', error);
        showToast('优化简历失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

/**
 * 显示优化结果
 * @param {Object} optimizeResult - 优化结果数据
 */
function showOptimizeResult(optimizeResult) {
    // 获取结果容器
    const resultContainer = document.querySelector('#optimizeComparison');
    if (!resultContainer) return;
    
    // 清空现有内容
    resultContainer.innerHTML = '';
    
    // 创建结果内容
    const content = document.createElement('div');
    content.className = 'optimize-result';
    
    // 添加优化时间
    const timeInfo = document.createElement('div');
    timeInfo.className = 'optimize-time';
    timeInfo.innerHTML = `<strong>优化时间：</strong>${optimizeResult.optimizeTime}`;
    content.appendChild(timeInfo);
    
    // 添加优化说明
    const description = document.createElement('div');
    description.className = 'optimize-description';
    description.innerHTML = `<strong>优化说明：</strong>${optimizeResult.optimizeDescription}`;
    content.appendChild(description);
    
    // 添加优化结果
    const result = document.createElement('div');
    result.className = 'optimize-detail';
    result.innerHTML = `<strong>优化结果：</strong>${optimizeResult.optimizeResult}`;
    content.appendChild(result);
    
    // 添加到容器
    resultContainer.appendChild(content);
    resultContainer.style.display = 'block';
}