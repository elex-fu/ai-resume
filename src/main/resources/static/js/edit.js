// 导入API服务
import ApiService from './api-service.js';
// 导入模板管理器
import { TemplateManager } from './template-manager.js';

// 为了和模板管理器共享功能，将关键函数暴露到全局作用域
window.renderResumePreview = renderResumePreview;

// 从URL获取简历ID
function getResumeIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 先暴露renderResumePreview函数到全局作用域，这样模板管理器可以使用它
        window.renderResumePreview = renderResumePreview;
        
        // 初始化应用
        await initApp();
    } catch (error) {
        console.error('应用初始化失败:', error);
    }
});

// 初始化应用
async function initApp() {
    // 先加载简历数据，确保使用原有样式
    const resumeId = getResumeIdFromUrl();
    try {
        // 如果有简历ID，使用真实API或mock API
        if (resumeId) {
            await loadResumeData(resumeId);
        } else {
            // 如果没有简历ID，直接加载mock数据作为默认数据
            console.log('未指定简历ID，加载默认mock数据');
            
            try {
                // 从mock文件加载默认数据
                const response = await fetch('/mock/resume-mock-data.json');
                if (!response.ok) {
                    throw new Error(`加载默认mock数据失败: ${response.status}`);
                }
                
                const data = await response.json();
                window.resumeData = data;
                
                // 使用默认样式渲染数据
                renderResumePreview(window.resumeData);
            } catch (error) {
                console.error('加载默认mock数据失败:', error);
                showToast('加载默认数据失败');
            }
        }
    } catch (error) {
        console.error('初始化简历数据失败:', error);
        showToast('初始化简历数据失败');
    }
    
    // 初始化组件 - 在数据加载和渲染后
    await initComponents();
}

// 初始化组件
async function initComponents() {
    // 初始化工具栏
    initToolbar();
    
    // 初始化模板选择
    await initTemplateSelection();
    
    // 初始化颜色选择
    initColorSelection();
    
    // 初始化优化按钮
    initOptimizeButton();
    
    // 初始化模态框
    initModal();
    
    // 初始化AI编辑模态框
    initAIEditModal();
    
    // 初始化AI分析
    initAIAnalysis();
    
    // 初始化可编辑内容监听器
    initEditableContentListeners();
    
    // 初始化操作按钮
    initActionButtons();
    
    // 初始化手写输入模块
    initHandwritingModule();
    
    // 初始化头像上传
    initAvatarUpload();
}

// 加载简历数据
async function loadResumeData(resumeId) {
    try {
        // 显示加载状态
        showLoading('加载简历数据...');
        
        // 使用ApiService获取数据，无论是真实API还是mock数据
        let data;
        
        try {
            // 尝试通过API获取数据
            data = await ApiService.resume.getResumeById(resumeId);
            console.log('从API获取简历数据成功');
        } catch (error) {
            console.warn('API获取数据失败，使用mock数据', error);
            // 直接从mock文件获取数据
            const response = await fetch('/mock/resume-mock-data.json');
            if (!response.ok) {
                throw new Error(`加载mock数据失败: ${response.status}`);
            }
            data = await response.json();
        }
        
        // 保存到全局变量
        window.resumeData = data;
        
        // 渲染简历预览
        renderResumePreview(data);
        
        // 隐藏加载状态
        hideLoading();
        
        return data;
    } catch (error) {
        console.error('加载简历数据失败:', error);
        showToast('加载简历数据失败');
        hideLoading();
        
        try {
            // 即使加载失败也使用默认mock数据
            const response = await fetch('/mock/resume-mock-data.json');
            const defaultData = await response.json();
            window.resumeData = defaultData;
            renderResumePreview(defaultData);
            return defaultData;
        } catch (fallbackError) {
            console.error('加载默认数据也失败:', fallbackError);
            return null;
        }
    }
}

// 渲染简历预览
function renderResumePreview(resumeData) {
    if (!resumeData) {
        console.log('没有简历数据，跳过渲染');
        return;
    }
    
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) {
        console.log('找不到预览容器，跳过渲染');
        return;
    }
    
    // 清空预览区域
    previewContainer.innerHTML = '';
    
    try {
        // 根据数据渲染各部分内容
        if (resumeData.basic) renderBasicInfo(resumeData.basic);
        if (resumeData.intention) renderJobIntention(resumeData.intention);
        if (resumeData.education && resumeData.education.length) renderEducation(resumeData.education);
        if (resumeData.work && resumeData.work.length) renderWorkExperience(resumeData.work);
        if (resumeData.project && resumeData.project.length) renderProjectExperience(resumeData.project);
        if (resumeData.campus && resumeData.campus.length) renderCampusExperience(resumeData.campus);
        if (resumeData.awards && resumeData.awards.length) renderAwards(resumeData.awards);
        if (resumeData.skills && resumeData.skills.length) renderSkills(resumeData.skills);
        
        console.log('简历预览渲染完成');
    } catch (error) {
        console.error('渲染简历预览失败:', error);
    }
}

// 渲染基本信息
function renderBasicInfo(basicInfo) {
    if (!basicInfo) return;
    
    // 创建基本信息区域
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) return;
    
    const basicInfoSection = document.createElement('div');
    basicInfoSection.className = 'resume-section basic-info';
    
    // 头像和姓名
    const header = document.createElement('div');
    header.className = 'resume-header';
    
    // 添加头像
    const avatar = document.createElement('div');
    avatar.className = 'resume-avatar';
    avatar.id = 'userAvatar';
    if (basicInfo.avatar) {
        const avatarImg = document.createElement('img');
        avatarImg.src = basicInfo.avatar;
        avatar.appendChild(avatarImg);
    }
    
    // 添加姓名和职位
    const nameTitle = document.createElement('div');
    nameTitle.className = 'name-title';
    
    const name = document.createElement('h1');
    name.className = 'resume-name';
    name.textContent = basicInfo.name || '姓名';
    
    const title = document.createElement('p');
    title.className = 'resume-title';
    title.textContent = basicInfo.position || '求职意向';
    
    nameTitle.appendChild(name);
    nameTitle.appendChild(title);
    
    header.appendChild(avatar);
    header.appendChild(nameTitle);
    
    // 联系信息
    const contact = document.createElement('div');
    contact.className = 'resume-contact';
    
    const contactList = document.createElement('ul');
    
    if (basicInfo.phone) {
        const phoneItem = document.createElement('li');
        phoneItem.innerHTML = `<i class="icon-phone"></i>${basicInfo.phone}`;
        contactList.appendChild(phoneItem);
    }
    
    if (basicInfo.email) {
        const emailItem = document.createElement('li');
        emailItem.innerHTML = `<i class="icon-email"></i>${basicInfo.email}`;
        contactList.appendChild(emailItem);
    }
    
    if (basicInfo.location) {
        const locationItem = document.createElement('li');
        locationItem.innerHTML = `<i class="icon-location"></i>${basicInfo.location}`;
        contactList.appendChild(locationItem);
    }
    
    contact.appendChild(contactList);
    
    // 将所有元素添加到基本信息区域
    basicInfoSection.appendChild(header);
    basicInfoSection.appendChild(contact);
    
    // 添加到预览容器
    previewContainer.appendChild(basicInfoSection);
}

// 渲染求职意向
function renderJobIntention(intention) {
    if (!intention) return;
    
    // 获取预览容器
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) return;
    
    // 创建求职意向区域
    const intentionSection = document.createElement('div');
    intentionSection.className = 'resume-section job-intention';
    
    // 创建标题
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.innerHTML = '<i class="icon-intention"></i>求职意向';
    intentionSection.appendChild(sectionTitle);
    
    // 创建内容区域
    const intentionContent = document.createElement('div');
    intentionContent.className = 'section-content';
    
    // 创建表格展示求职意向
    const table = document.createElement('table');
    table.className = 'intention-table';
    
    // 添加意向内容
    const row1 = document.createElement('tr');
    
    const positionCell = document.createElement('td');
    positionCell.innerHTML = '<strong>期望职位：</strong>';
    const positionValueCell = document.createElement('td');
    positionValueCell.textContent = intention.position || '';
    
    const cityCell = document.createElement('td');
    cityCell.innerHTML = '<strong>期望城市：</strong>';
    const cityValueCell = document.createElement('td');
    cityValueCell.textContent = intention.city || '';
    
    row1.appendChild(positionCell);
    row1.appendChild(positionValueCell);
    row1.appendChild(cityCell);
    row1.appendChild(cityValueCell);
    
    const row2 = document.createElement('tr');
    
    const salaryCell = document.createElement('td');
    salaryCell.innerHTML = '<strong>薪资要求：</strong>';
    const salaryValueCell = document.createElement('td');
    salaryValueCell.textContent = intention.salary || '';
    
    const entryTimeCell = document.createElement('td');
    entryTimeCell.innerHTML = '<strong>到岗时间：</strong>';
    const entryTimeValueCell = document.createElement('td');
    entryTimeValueCell.textContent = intention.entryTime || '';
    
    row2.appendChild(salaryCell);
    row2.appendChild(salaryValueCell);
    row2.appendChild(entryTimeCell);
    row2.appendChild(entryTimeValueCell);
    
    table.appendChild(row1);
    table.appendChild(row2);
    
    intentionContent.appendChild(table);
    intentionSection.appendChild(intentionContent);
    
    // 添加到预览容器
    previewContainer.appendChild(intentionSection);
}

// 渲染教育经历
function renderEducation(educationList) {
    if (!educationList || !educationList.length) return;
    
    // 获取预览容器
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) return;
    
    // 创建教育经历区域
    const educationSection = document.createElement('div');
    educationSection.className = 'resume-section education';
    
    // 创建标题
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.innerHTML = '<i class="icon-education"></i>教育经历';
    educationSection.appendChild(sectionTitle);
    
    // 创建内容区域
    const educationContent = document.createElement('div');
    educationContent.className = 'section-content';
    
    // 添加每条教育经历
    educationList.forEach(item => {
        const educationItem = document.createElement('div');
        educationItem.className = 'resume-item education-item';
        
        // 时间和学校
        const header = document.createElement('div');
        header.className = 'item-header';
        
        const timeRange = document.createElement('span');
        timeRange.className = 'time-range';
        timeRange.textContent = `${item.startDate || ''} - ${item.endDate || ''}`;
        
        const school = document.createElement('h3');
        school.className = 'school-name';
        school.textContent = item.school || '';
        
        header.appendChild(timeRange);
        header.appendChild(school);
        
        // 专业和学位
        const details = document.createElement('div');
        details.className = 'item-details';
        
        const degreeContainer = document.createElement('div');
        degreeContainer.className = 'degree-container';
        
        const major = document.createElement('span');
        major.className = 'major';
        major.textContent = item.major || '';
        
        const degree = document.createElement('span');
        degree.className = 'degree';
        degree.textContent = item.degree || '';
        
        degreeContainer.appendChild(major);
        degreeContainer.appendChild(document.createTextNode(' '));
        degreeContainer.appendChild(degree);
        
        details.appendChild(degreeContainer);
        
        // 描述
        if (item.description) {
            const description = document.createElement('p');
            description.className = 'item-description';
            description.textContent = item.description;
            details.appendChild(description);
        }
        
        educationItem.appendChild(header);
        educationItem.appendChild(details);
        educationContent.appendChild(educationItem);
    });
    
    educationSection.appendChild(educationContent);
    
    // 添加到预览容器
    previewContainer.appendChild(educationSection);
}

// 渲染工作经历
function renderWorkExperience(workList) {
    if (!workList || !workList.length) return;
    
    // 获取预览容器
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) return;
    
    // 创建工作经历区域
    const workSection = document.createElement('div');
    workSection.className = 'resume-section work-experience';
    
    // 创建标题
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.innerHTML = '<i class="icon-work"></i>工作经历';
    workSection.appendChild(sectionTitle);
    
    // 创建内容区域
    const workContent = document.createElement('div');
    workContent.className = 'section-content';
    
    // 添加每条工作经历
    workList.forEach(item => {
        const workItem = document.createElement('div');
        workItem.className = 'resume-item work-item';
        
        // 时间和公司
        const header = document.createElement('div');
        header.className = 'item-header';
        
        const timeRange = document.createElement('span');
        timeRange.className = 'time-range';
        timeRange.textContent = `${item.startDate || ''} - ${item.endDate || ''}`;
        
        const company = document.createElement('h3');
        company.className = 'company-name';
        company.textContent = item.company || '';
        
        header.appendChild(timeRange);
        header.appendChild(company);
        
        // 部门和职位
        const details = document.createElement('div');
        details.className = 'item-details';
        
        const position = document.createElement('div');
        position.className = 'position-info';
        
        if (item.department) {
            const department = document.createElement('span');
            department.className = 'department';
            department.textContent = item.department;
            position.appendChild(department);
        }
        
        if (item.position) {
            const positionTitle = document.createElement('span');
            positionTitle.className = 'position-title';
            positionTitle.textContent = item.position;
            position.appendChild(positionTitle);
        }
        
        details.appendChild(position);
        
        // 描述
        if (item.description) {
            const description = document.createElement('p');
            description.className = 'item-description';
            description.textContent = item.description;
            details.appendChild(description);
        }
        
        workItem.appendChild(header);
        workItem.appendChild(details);
        workContent.appendChild(workItem);
    });
    
    workSection.appendChild(workContent);
    
    // 添加到预览容器
    previewContainer.appendChild(workSection);
}

// 渲染项目经历
function renderProjectExperience(projectList) {
    if (!projectList || !projectList.length) return;
    
    // 获取预览容器
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) return;
    
    // 创建项目经历区域
    const projectSection = document.createElement('div');
    projectSection.className = 'resume-section project-experience';
    
    // 创建标题
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.innerHTML = '<i class="icon-project"></i>项目经历';
    projectSection.appendChild(sectionTitle);
    
    // 创建内容区域
    const projectContent = document.createElement('div');
    projectContent.className = 'section-content';
    
    // 添加每条项目经历
    projectList.forEach(item => {
        const projectItem = document.createElement('div');
        projectItem.className = 'resume-item project-item';
        
        // 时间和项目
        const header = document.createElement('div');
        header.className = 'item-header';
        
        const timeRange = document.createElement('span');
        timeRange.className = 'time-range';
        timeRange.textContent = `${item.startDate || ''} - ${item.endDate || ''}`;
        
        const project = document.createElement('h3');
        project.className = 'project-name';
        project.textContent = item.name || '';
        
        header.appendChild(timeRange);
        header.appendChild(project);
        
        // 角色和详情
        const details = document.createElement('div');
        details.className = 'item-details';
        
        if (item.role) {
            const role = document.createElement('div');
            role.className = 'project-role';
            role.textContent = `担任角色: ${item.role}`;
            details.appendChild(role);
        }
        
        // 描述
        if (item.description) {
            const description = document.createElement('p');
            description.className = 'item-description';
            description.textContent = item.description;
            details.appendChild(description);
        }
        
        projectItem.appendChild(header);
        projectItem.appendChild(details);
        projectContent.appendChild(projectItem);
    });
    
    projectSection.appendChild(projectContent);
    
    // 添加到预览容器
    previewContainer.appendChild(projectSection);
}

// 渲染校内经历
function renderCampusExperience(campusList) {
    if (!campusList || !campusList.length) return;
    
    // 获取预览容器
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) return;
    
    // 创建校内经历区域
    const campusSection = document.createElement('div');
    campusSection.className = 'resume-section campus-experience';
    
    // 创建标题
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.innerHTML = '<i class="icon-campus"></i>校内经历';
    campusSection.appendChild(sectionTitle);
    
    // 创建内容区域
    const campusContent = document.createElement('div');
    campusContent.className = 'section-content';
    
    // 添加每条校内经历
    campusList.forEach(item => {
        const campusItem = document.createElement('div');
        campusItem.className = 'resume-item campus-item';
        
        // 时间和组织
        const header = document.createElement('div');
        header.className = 'item-header';
        
        const timeRange = document.createElement('span');
        timeRange.className = 'time-range';
        timeRange.textContent = `${item.startDate || ''} - ${item.endDate || ''}`;
        
        const organization = document.createElement('h3');
        organization.className = 'campus-org';
        organization.textContent = item.organization || '';
        
        header.appendChild(timeRange);
        header.appendChild(organization);
        
        // 角色和详情
        const details = document.createElement('div');
        details.className = 'item-details';
        
        if (item.role) {
            const role = document.createElement('div');
            role.className = 'campus-role';
            role.textContent = `担任职务: ${item.role}`;
            details.appendChild(role);
        }
        
        // 描述
        if (item.description) {
            const description = document.createElement('p');
            description.className = 'item-description';
            description.textContent = item.description;
            details.appendChild(description);
        }
        
        campusItem.appendChild(header);
        campusItem.appendChild(details);
        campusContent.appendChild(campusItem);
    });
    
    campusSection.appendChild(campusContent);
    
    // 添加到预览容器
    previewContainer.appendChild(campusSection);
}

// 渲染荣誉奖项
function renderAwards(awardsList) {
    if (!awardsList || awardsList.length === 0) return;
    
    // 获取预览容器
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) return;
    
    // 创建荣誉奖项区域
    const awardsSection = document.createElement('div');
    awardsSection.className = 'resume-section awards';
    
    // 创建标题
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.innerHTML = '<i class="icon-award"></i>荣誉奖项';
    awardsSection.appendChild(sectionTitle);
    
    // 创建内容区域
    const awardsContent = document.createElement('div');
    awardsContent.className = 'section-content';
    
    // 添加每项荣誉奖项
    awardsList.forEach(award => {
        const awardItem = document.createElement('div');
        awardItem.className = 'award-item';
        awardItem.textContent = award.awardName;
        
        const date = document.createElement('span');
        date.className = 'award-date';
        date.textContent = ` (${award.awardDate})`;
        
        awardItem.appendChild(date);
        
        awardsContent.appendChild(awardItem);
    });
    
    awardsSection.appendChild(awardsContent);
    
    // 添加到预览容器
    previewContainer.appendChild(awardsSection);
}

// 渲染个人技能
function renderSkills(skillsList) {
    if (!skillsList || skillsList.length === 0) return;
    
    // 获取预览容器
    const previewContainer = document.getElementById('resumePreview');
    if (!previewContainer) return;
    
    // 创建个人技能区域
    const skillsSection = document.createElement('div');
    skillsSection.className = 'resume-section skills';
    
    // 创建标题
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.innerHTML = '<i class="icon-skill"></i>个人技能';
    skillsSection.appendChild(sectionTitle);
    
    // 创建内容区域
    const skillsContent = document.createElement('div');
    skillsContent.className = 'section-content';
    
    // 添加每项技能
    skillsList.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.textContent = skill.skillName;
        
        const detail = document.createElement('span');
        detail.className = 'skill-detail';
        detail.textContent = `: ${skill.skillDetail}`;
        
        skillItem.appendChild(detail);
        
        skillsContent.appendChild(skillItem);
    });
    
    skillsSection.appendChild(skillsContent);
    
    // 添加到预览容器
    previewContainer.appendChild(skillsSection);
}

// 初始化颜色选择功能
function initColorSelection() {
    console.log('初始化颜色选择...');
    
    const colorList = document.querySelector('.color-list');
    if (!colorList) {
        console.log('未找到颜色列表元素');
        return;
    }
    
    // 默认颜色选项
    const defaultColors = [
        '#1a73e8', // 蓝色
        '#4caf50', // 绿色
        '#9c27b0', // 紫色
        '#ff9800', // 橙色
        '#f44336', // 红色
        '#795548', // 棕色
        '#607d8b', // 蓝灰色
        '#000000'  // 黑色
    ];
    
    // 如果没有颜色选项，添加默认选项
    if (colorList.children.length === 0) {
        colorList.innerHTML = defaultColors.map(color => 
            `<div class="color-option" style="background-color: ${color}"></div>`
        ).join('');
    }
    
    // 添加点击事件
    colorList.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            // 移除其他颜色选项的激活状态
            colorList.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            
            // 添加当前颜色选项的激活状态
            option.classList.add('active');
            
            // 获取选中的颜色
            const color = option.style.backgroundColor;
            
            // 应用颜色到简历预览
            applyColor(color);
        });
    });
    
    console.log('颜色选择初始化完成');
}

// 应用简历颜色
function applyColor(color) {
    const resumePreview = document.getElementById('resumePreview');
    
    // 更新简历主色调
    resumePreview.style.setProperty('--primary-color', color);
    
    console.log(`应用颜色: ${color}`);
}

// 初始化优化按钮功能
function initOptimizeButton() {
    const optimizeBtn = document.querySelector('.optimize-btn');
    
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', function() {
            // 获取选中的优化选项
            const options = {
                professional: document.getElementById('opt-professional')?.checked,
                keywords: document.getElementById('opt-keywords')?.checked,
                quantify: document.getElementById('opt-quantify')?.checked,
                grammar: document.getElementById('opt-grammar')?.checked
            };
            
            // 执行简历优化
            optimizeResume(options);
        });
    }
}

// 执行简历优化
function optimizeResume(options) {
    console.log('开始优化简历', options);
    
    // 显示加载状态
    showLoading('正在优化简历...');
    
    // 模拟API调用
    setTimeout(() => {
        hideLoading();
        
        // 打开AI编辑模态框，显示优化前后对比
        openAIEditModal(
            '负责产品的规划和设计，参与产品需求分析和功能设计，推动产品快速迭代。',
            '优化简历描述'
        );
    }, 1500);
}

// 初始化模态框功能
function initModal() {
    const modal = document.getElementById('edit-modal');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalSave = document.getElementById('modal-save');
    
    // 关闭模态框
    function closeModal() {
        modal.classList.remove('show');
    }
    
    // 打开模态框
    window.openModal = function(title, content, saveCallback) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        
        // 保存按钮回调
        modalSave.onclick = function() {
            if (typeof saveCallback === 'function') {
                saveCallback();
            }
            closeModal();
        };
        
        // 显示模态框
        modal.classList.add('show');
        
        // 确保模态框内容适应屏幕
        const modalContent = modal.querySelector('.modal-content');
        const modalBody = modal.querySelector('.modal-body');
        modalContent.style.maxHeight = (window.innerHeight * 0.9) + 'px';
        
        // 调整模态框内容宽度，确保不会超出视口
        setTimeout(() => {
            const formGroups = modalBody.querySelectorAll('.form-group');
            const modalBodyWidth = modalBody.clientWidth;
            
            // 确保表单项宽度适当，不会导致水平滚动
            formGroups.forEach(group => {
                const input = group.querySelector('input, textarea, select');
                if (input) {
                    input.style.boxSizing = 'border-box';
                    input.style.width = '100%';
                }
            });
            
            // 检查并调整文本区域的宽度
            const textareas = modalBody.querySelectorAll('textarea');
            textareas.forEach(textarea => {
                textarea.style.boxSizing = 'border-box';
                textarea.style.width = '100%';
                
                // 调整文本区域高度以适应内容
                textarea.addEventListener('input', function() {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight) + 'px';
                });
                
                // 触发一次以适应初始内容
                textarea.dispatchEvent(new Event('input'));
            });
        }, 10);
    };
    
    // 关闭按钮事件
    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    
    // 初始化AI编辑模态框
    initAIEditModal();
}

// 初始化AI编辑模态框
function initAIEditModal() {
    const modal = document.getElementById('ai-edit-modal');
    const closeBtn = document.getElementById('ai-modal-close');
    const cancelBtn = document.getElementById('ai-modal-cancel');
    const applyBtn = document.getElementById('ai-modal-apply');
    const regenerateBtn = document.getElementById('ai-regenerate');
    
    // 关闭模态框
    function closeAIModal() {
        modal.classList.remove('show');
    }
    
    // 关闭按钮事件
    closeBtn.addEventListener('click', closeAIModal);
    cancelBtn.addEventListener('click', closeAIModal);
    
    // 应用按钮事件
    applyBtn.addEventListener('click', function() {
        applyAIChanges();
        closeAIModal();
    });
    
    // 重新生成按钮事件
    regenerateBtn.addEventListener('click', function() {
        const instruction = document.getElementById('ai-edit-instruction').value.trim();
        regenerateAIContent(instruction);
    });
}

// 打开AI编辑模态框
function openAIEditModal(originalText, instruction) {
    const modal = document.getElementById('ai-edit-modal');
    const originalContent = document.getElementById('original-content');
    const optimizedContent = document.getElementById('optimized-content');
    const instructionInput = document.getElementById('ai-edit-instruction');
    
    // 设置原始文本
    originalContent.textContent = originalText;
    instructionInput.value = instruction || '优化文本';
    
    // 生成优化文本
    optimizedContent.innerHTML = '<p>AI正在优化中...</p>';
    
    // 模拟API调用
    setTimeout(() => {
        // 根据指令生成不同的优化文本
        let optimizedText = '';
        
        if (instruction.includes('优化简历')) {
            optimizedText = '独立负责产品从0到1的规划和设计，主导需求分析和功能设计，推动产品在3个月内完成4次迭代，用户满意度提升25%。';
        } else {
            optimizedText = '优化后的文本示例';
        }
        
        optimizedContent.textContent = optimizedText;
        
        // 高亮显示修改部分（简化版，实际应用中需要更复杂的比较算法）
        highlightDifferences(originalText, optimizedText);
    }, 1000);
    
    // 显示模态框
    modal.classList.add('show');
    
    // 确保模态框内容适应屏幕
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.maxWidth = '800px'; // 确保足够宽
    modalContent.style.maxHeight = (window.innerHeight * 0.9) + 'px';
}

// 高亮显示原文和优化文本的差异
function highlightDifferences(original, optimized) {
    // 实际应用中这里应该有复杂的文本比较算法
    // 这里只是一个简化的示例
    console.log('比较文本差异:', original, optimized);
    
    // 可以添加视觉提示，比如给优化后的文本添加不同的背景色
    const optimizedContent = document.getElementById('optimized-content');
    optimizedContent.style.backgroundColor = '#f0f7ff';
}

// 重新生成AI内容
function regenerateAIContent(instruction) {
    const originalContent = document.getElementById('original-content').textContent;
    const optimizedContent = document.getElementById('optimized-content');
    
    // 显示加载状态
    optimizedContent.innerHTML = '<p>AI正在重新优化中...</p>';
    
    // 模拟API调用
    setTimeout(() => {
        // 根据指令生成不同的优化文本
        let optimizedText = '';
        
        if (instruction.includes('专业')) {
            optimizedText = '作为核心产品经理，全面负责产品生命周期管理，通过数据驱动的方法论指导产品迭代，实现用户增长30%，留存率提升15个百分点。';
        } else if (instruction.includes('简洁')) {
            optimizedText = '主导产品规划与迭代，3个月内完成4轮优化，提升用户满意度25%。';
        } else {
            optimizedText = '负责产品规划和设计，参与需求分析和功能设计，推动产品迭代，提升用户体验。';
        }
        
        optimizedContent.textContent = optimizedText;
    }, 800);
}

// 应用AI更改
function applyAIChanges() {
    const optimizedText = document.getElementById('optimized-content').textContent;
    
    // 这里应该根据当前编辑的内容类型，将优化后的文本应用到对应区域
    // 在实际应用中，需要记录当前正在编辑的内容和区域
    
    console.log('应用AI优化内容:', optimizedText);
    
    // 显示成功消息
    showToast('内容已成功优化');
}

// 初始化AI分析功能
function initAIAnalysis() {
    // 这里是AI分析功能的初始化代码
    // 在实际应用中，可能需要从后端获取分析数据
    
    // 模拟获取分析数据
    setTimeout(() => {
        // 更新分析面板内容
        updateAnalysisData({
            score: 85,
            completeness: 90,
            relevance: 75,
            clarity: 80,
            suggestions: [
                '适当补充项目成果',
                '强化核心技能展示',
                '部分描述可更具体量化'
            ]
        });
    }, 1000);
}

// 更新分析数据
function updateAnalysisData(data) {
    // 更新得分
    const scoreElement = document.querySelector('.score');
    if (scoreElement) {
        scoreElement.textContent = data.score;
    }
    
    // 更新进度条
    const progressBars = document.querySelectorAll('.progress');
    if (progressBars.length >= 3) {
        progressBars[0].style.width = `${data.completeness}%`;
        progressBars[1].style.width = `${data.relevance}%`;
        progressBars[2].style.width = `${data.clarity}%`;
    }
}

// 添加可编辑区域点击事件
function initEditableContentListeners() {
    const editableSections = document.querySelectorAll('.editable-section');
    
    editableSections.forEach(section => {
        section.addEventListener('click', function() {
            const sectionType = this.getAttribute('data-section');
            
            // 对于头像，使用特定的处理逻辑
            if (sectionType === 'avatar') {
                document.getElementById('avatar-upload').click();
                return;
            }
            
            // 根据区域类型打开对应的编辑模态框
            fillModalWithExistingData(sectionType);
        });
    });
}

// 填充模态框数据
function fillModalWithExistingData(sectionType) {
    // 获取简历数据
    const resumeData = window.resumeData;
    if (!resumeData) {
        console.error('没有简历数据');
        return;
    }
    
    // 根据区域类型打开不同的编辑模态框
    switch (sectionType) {
        case 'basic':
        case 'basicInfo':
            openBasicInfoModal(resumeData.basic);
            break;
        case 'intention':
        case 'jobIntention':
            openJobIntentionModal(resumeData.intention);
            break;
        case 'education':
            openEducationModal(resumeData.education);
            break;
        case 'work':
            openWorkExperienceModal(resumeData.work);
            break;
        case 'project':
            openProjectExperienceModal(resumeData.project);
            break;
        case 'campus':
            openCampusExperienceModal(resumeData.campus);
            break;
        case 'awards':
            openAwardsModal(resumeData.awards);
            break;
        case 'skills':
            openSkillsModal(resumeData.skills);
            break;
        default:
            console.log(`未知的区域类型: ${sectionType}`);
            break;
    }
}

// 打开编辑模态框
function openEditModal(sectionType, element) {
    fillModalWithExistingData(sectionType);
}

// 打开基本信息编辑模态框
function openBasicInfoModal(basicInfo) {
    if (!basicInfo) {
        basicInfo = {
            name: '',
            gender: '',
            age: '',
            phone: '',
            email: '',
            location: '',
            educationLevel: '',
            experience: '',
            status: ''
        };
    }
    
    const template = `
        <div class="modal-form">
            <div class="form-group">
                <label for="modal-name">姓名</label>
                <input type="text" id="modal-name" value="${basicInfo.name || ''}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-gender">性别</label>
                    <input type="text" id="modal-gender" value="${basicInfo.gender || ''}">
                </div>
                <div class="form-group">
                    <label for="modal-age">年龄</label>
                    <input type="text" id="modal-age" value="${basicInfo.age || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-position">职位</label>
                    <input type="text" id="modal-position" value="${basicInfo.position || ''}">
                </div>
                <div class="form-group">
                    <label for="modal-location">所在地</label>
                    <input type="text" id="modal-location" value="${basicInfo.location || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-education">学历</label>
                    <input type="text" id="modal-education" value="${basicInfo.educationLevel || ''}">
                </div>
                <div class="form-group">
                    <label for="modal-experience">工作经验</label>
                    <input type="text" id="modal-experience" value="${basicInfo.experience || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-email">邮箱</label>
                    <input type="email" id="modal-email" value="${basicInfo.email || ''}">
                </div>
                <div class="form-group">
                    <label for="modal-phone">电话</label>
                    <input type="tel" id="modal-phone" value="${basicInfo.phone || ''}">
                </div>
            </div>
        </div>
    `;
    
    openModal('编辑基本信息', template, saveBasicInfo);
}

// 保存基本信息
function saveBasicInfo() {
    // 获取表单数据
    const name = document.getElementById('modal-name').value;
    const gender = document.getElementById('modal-gender').value;
    const age = document.getElementById('modal-age').value;
    const position = document.getElementById('modal-position').value;
    const location = document.getElementById('modal-location').value;
    const education = document.getElementById('modal-education').value;
    const experience = document.getElementById('modal-experience').value;
    const email = document.getElementById('modal-email').value;
    const phone = document.getElementById('modal-phone').value;
    
    // 更新数据
    if (!window.resumeData) {
        window.resumeData = {};
    }
    
    if (!window.resumeData.basic) {
        window.resumeData.basic = {};
    }
    
    window.resumeData.basic.name = name;
    window.resumeData.basic.gender = gender;
    window.resumeData.basic.age = age;
    window.resumeData.basic.position = position;
    window.resumeData.basic.location = location;
    window.resumeData.basic.educationLevel = education;
    window.resumeData.basic.experience = experience;
    window.resumeData.basic.email = email;
    window.resumeData.basic.phone = phone;
    
    // 重新渲染预览
    renderResumePreview(window.resumeData);
    
    console.log('基本信息已更新');
    closeModal();
}

// 打开求职意向编辑模态框
function openJobIntentionModal(intention) {
    if (!intention) {
        intention = {
            position: '',
            city: '',
            salary: '',
            entryTime: ''
        };
    }
    
    const template = `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-position">求职岗位</label>
                    <input type="text" id="modal-position" value="${intention.position || ''}">
                </div>
                <div class="form-group">
                    <label for="modal-city">意向城市</label>
                    <input type="text" id="modal-city" value="${intention.city || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-salary">薪资要求</label>
                    <input type="text" id="modal-salary" value="${intention.salary || ''}">
                </div>
                <div class="form-group">
                    <label for="modal-entry-time">到岗时间</label>
                    <input type="text" id="modal-entry-time" value="${intention.entryTime || ''}">
                </div>
            </div>
        </div>
    `;
    
    openModal('编辑求职意向', template, saveJobIntention);
}

// 保存求职意向
function saveJobIntention() {
    // 获取表单数据
    const position = document.getElementById('modal-position').value;
    const city = document.getElementById('modal-city').value;
    const salary = document.getElementById('modal-salary').value;
    const entryTime = document.getElementById('modal-entry-time').value;
    
    // 更新数据
    if (!window.resumeData) {
        window.resumeData = {};
    }
    
    if (!window.resumeData.intention) {
        window.resumeData.intention = {};
    }
    
    window.resumeData.intention.position = position;
    window.resumeData.intention.city = city;
    window.resumeData.intention.salary = salary;
    window.resumeData.intention.entryTime = entryTime;
    
    // 重新渲染预览
    renderResumePreview(window.resumeData);
    
    console.log('求职意向已更新');
    closeModal();
}

// 打开教育经历编辑模态框
function openEducationModal(element) {
    const educationItem = element.querySelector('.education-item');
    
    if (!educationItem) {
        // 如果没有教育经历项，则创建新的
        const template = getNewEducationTemplate();
        openModal('添加教育经历', template, addNewEducation);
        return;
    }
    
    const school = educationItem.querySelector('#previewSchool').textContent;
    const degree = educationItem.querySelector('#previewDegree').textContent;
    const eduTime = educationItem.querySelector('#previewEduTime').textContent;
    const gpa = educationItem.querySelector('#previewGPA').textContent;
    const rank = educationItem.querySelector('#previewRank').textContent;
    
    const template = `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-school">学校和专业</label>
                    <input type="text" id="modal-school" value="${school}">
                </div>
                <div class="form-group">
                    <label for="modal-degree">学历</label>
                    <input type="text" id="modal-degree" value="${degree}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-edu-time">就读时间</label>
                    <input type="text" id="modal-edu-time" value="${eduTime}">
                </div>
                <div class="form-group">
                    <label for="modal-gpa">绩点</label>
                    <input type="text" id="modal-gpa" value="${gpa}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-rank">排名</label>
                    <input type="text" id="modal-rank" value="${rank}">
                </div>
                <div class="form-group">
                    <label for="modal-major">主修课程</label>
                    <input type="text" id="modal-major" value="计算机科学">
                </div>
            </div>
        </div>
    `;
    
    openModal('编辑教育经历', template, updateEducation);
}

// 获取新教育经历模板
function getNewEducationTemplate() {
    return `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-school">学校和专业</label>
                    <input type="text" id="modal-school" placeholder="例如：腾讯大学·计算机">
                </div>
                <div class="form-group">
                    <label for="modal-degree">学历</label>
                    <input type="text" id="modal-degree" placeholder="例如：本科">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-edu-time">就读时间</label>
                    <input type="text" id="modal-edu-time" placeholder="例如：2014.9 - 2018.6">
                </div>
                <div class="form-group">
                    <label for="modal-gpa">绩点</label>
                    <input type="text" id="modal-gpa" placeholder="例如：3.8/4.0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-rank">排名</label>
                    <input type="text" id="modal-rank" placeholder="例如：前30%">
                </div>
                <div class="form-group">
                    <label for="modal-major">主修课程</label>
                    <input type="text" id="modal-major" placeholder="例如：数据结构、算法">
                </div>
            </div>
        </div>
    `;
}

// 添加新教育经历
function addNewEducation() {
    const school = document.getElementById('modal-school').value;
    const degree = document.getElementById('modal-degree').value;
    const eduTime = document.getElementById('modal-edu-time').value;
    const gpa = document.getElementById('modal-gpa').value;
    const rank = document.getElementById('modal-rank').value;
    
    const educationList = document.getElementById('previewEducationList');
    
    // 创建新的教育经历项
    const newEducationItem = document.createElement('div');
    newEducationItem.className = 'education-item';
    newEducationItem.innerHTML = `
        <div class="edu-main">
            <span id="previewSchool">${school}</span>
            <span id="previewDegree">${degree}</span>
            <span id="previewEduTime">${eduTime}</span>
        </div>
        <div class="edu-detail">
            <span>绩点: </span>
            <span id="previewGPA">${gpa}</span>
            <span>成绩排名: </span>
            <span id="previewRank">${rank}</span>
        </div>
    `;
    
    // 添加到预览区域
    educationList.appendChild(newEducationItem);
    
    console.log('新教育经历已添加');
}

// 更新教育经历
function updateEducation() {
    const school = document.getElementById('modal-school').value;
    const degree = document.getElementById('modal-degree').value;
    const eduTime = document.getElementById('modal-edu-time').value;
    const gpa = document.getElementById('modal-gpa').value;
    const rank = document.getElementById('modal-rank').value;
    
    // 更新简历预览
    document.getElementById('previewSchool').textContent = school;
    document.getElementById('previewDegree').textContent = degree;
    document.getElementById('previewEduTime').textContent = eduTime;
    document.getElementById('previewGPA').textContent = gpa;
    document.getElementById('previewRank').textContent = rank;
    
    console.log('教育经历已更新');
}

// 打开工作经历编辑模态框
function openWorkExperienceModal(element) {
    const workItem = element.querySelector('.work-item');
    
    if (!workItem) {
        // 如果没有工作经历项，则创建新的
        const template = getNewWorkTemplate();
        openModal('添加工作经历', template, addNewWork);
        return;
    }
    
    const company = workItem.querySelector('#previewCompany').textContent;
    const position = workItem.querySelector('#previewPosition').textContent;
    const workTime = workItem.querySelector('#previewWorkTime').textContent;
    const description = workItem.querySelector('.work-description').innerHTML;
    
    const template = `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-company">公司名称</label>
                    <input type="text" id="modal-company" value="${company}">
                </div>
                <div class="form-group">
                    <label for="modal-position">岗位名称</label>
                    <input type="text" id="modal-position" value="${position}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-work-time">工作时间</label>
                    <input type="text" id="modal-work-time" value="${workTime}">
                </div>
                <div class="form-group">
                    <label for="modal-department">所在部门</label>
                    <input type="text" id="modal-department" value="技术部">
                </div>
            </div>
            <div class="form-group">
                <label for="modal-description">工作描述</label>
                <textarea id="modal-description" rows="5">${description.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/g, '\n')}</textarea>
            </div>
        </div>
    `;
    
    openModal('编辑工作经历', template, updateWork);
}

// 获取新工作经历模板
function getNewWorkTemplate() {
    return `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-company">公司名称</label>
                    <input type="text" id="modal-company" placeholder="例如：腾讯科技广州有限公司">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-role">职位</label>
                    <input type="text" id="modal-role" placeholder="例如：QQ邮箱产品部 产品实习生">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-work-time">工作时间</label>
                    <input type="text" id="modal-work-time" placeholder="例如：2018.9 - 2020.3">
                </div>
            </div>
            <div class="form-group">
                <label for="modal-work-description">工作描述</label>
                <textarea id="modal-work-description" rows="4" placeholder="描述您的工作职责和成就..."></textarea>
            </div>
        </div>
    `;
}

// 添加新工作经历
function addNewWork() {
    const company = document.getElementById('modal-company').value;
    const role = document.getElementById('modal-role').value;
    const workTime = document.getElementById('modal-work-time').value;
    const description = document.getElementById('modal-work-description').value;
    
    const workList = document.getElementById('previewWorkList');
    
    // 创建新的工作经历项
    const newWorkItem = document.createElement('div');
    newWorkItem.className = 'work-item';
    newWorkItem.innerHTML = `
        <div class="work-header">
            <span id="previewCompany">${company}</span>
            <span id="previewRole">${role}</span>
            <span id="previewWorkTime">${workTime}</span>
        </div>
        <div class="work-description">
            <p id="previewWorkDescription">${description}</p>
        </div>
    `;
    
    // 添加到预览区域
    workList.appendChild(newWorkItem);
    
    console.log('新工作经历已添加');
}

// 更新工作经历
function updateWork() {
    const company = document.getElementById('modal-company').value;
    const role = document.getElementById('modal-role').value;
    const workTime = document.getElementById('modal-work-time').value;
    const description = document.getElementById('modal-work-description').value;
    
    // 更新简历预览
    document.getElementById('previewCompany').textContent = company;
    document.getElementById('previewRole').textContent = role;
    document.getElementById('previewWorkTime').textContent = workTime;
    document.getElementById('previewWorkDescription').textContent = description;
    
    console.log('工作经历已更新');
}

// 打开项目经历编辑模态框
function openProjectExperienceModal(element) {
    const projectItem = element.querySelector('.project-item');
    
    if (!projectItem) {
        // 如果没有项目经历项，则创建新的
        const template = getNewProjectTemplate();
        openModal('添加项目经历', template, addNewProject);
        return;
    }
    
    const projectName = projectItem.querySelector('#previewProjectName').textContent;
    const projectRole = projectItem.querySelector('#previewProjectRole').textContent;
    const projectTime = projectItem.querySelector('#previewProjectTime').textContent;
    const description = projectItem.querySelector('.project-description').innerHTML;
    
    const template = `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-project-name">项目名称</label>
                    <input type="text" id="modal-project-name" value="${projectName}">
                </div>
                <div class="form-group">
                    <label for="modal-project-role">项目角色</label>
                    <input type="text" id="modal-project-role" value="${projectRole}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-project-time">项目时间</label>
                    <input type="text" id="modal-project-time" value="${projectTime}">
                </div>
                <div class="form-group">
                    <label for="modal-project-link">项目链接</label>
                    <input type="text" id="modal-project-link" value="https://example.com">
                </div>
            </div>
            <div class="form-group">
                <label for="modal-project-description">项目描述</label>
                <textarea id="modal-project-description" rows="5">${description.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/g, '\n')}</textarea>
            </div>
        </div>
    `;
    
    openModal('编辑项目经历', template, updateProject);
}

// 获取新项目经历模板
function getNewProjectTemplate() {
    return `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-project-name">项目名称</label>
                    <input type="text" id="modal-project-name" placeholder="例如：AI简历生成器">
                </div>
                <div class="form-group">
                    <label for="modal-project-role">项目角色</label>
                    <input type="text" id="modal-project-role" placeholder="例如：项目负责人">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-project-time">项目时间</label>
                    <input type="text" id="modal-project-time" placeholder="例如：2022.3 - 2022.6">
                </div>
                <div class="form-group">
                    <label for="modal-project-link">项目链接</label>
                    <input type="text" id="modal-project-link" placeholder="例如：https://github.com/yourname/project">
                </div>
            </div>
            <div class="form-group">
                <label for="modal-project-description">项目描述</label>
                <textarea id="modal-project-description" rows="5" placeholder="请描述项目的背景、你的职责和贡献、项目成果等..."></textarea>
            </div>
        </div>
    `;
}

// 添加新项目经历
function addNewProject() {
    const projectName = document.getElementById('modal-project-name').value;
    const projectRole = document.getElementById('modal-project-role').value;
    const projectTime = document.getElementById('modal-project-time').value;
    const description = document.getElementById('modal-project-description').value;
    
    // 将文本区域的内容转换为HTML段落
    const descriptionHtml = description.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p>${line}</p>`)
        .join('');
    
    const projectList = document.getElementById('previewProjectList');
    
    // 创建新的项目经历项
    const newProjectItem = document.createElement('div');
    newProjectItem.className = 'project-item';
    newProjectItem.innerHTML = `
        <div class="project-header">
            <span id="previewProjectName">${projectName}</span>
            <span id="previewProjectRole">${projectRole}</span>
            <span id="previewProjectTime">${projectTime}</span>
        </div>
        <div class="project-description">
            ${descriptionHtml}
        </div>
    `;
    
    // 添加到预览区域
    projectList.appendChild(newProjectItem);
    
    console.log('新项目经历已添加');
}

// 更新项目经历
function updateProject() {
    const projectName = document.getElementById('modal-project-name').value;
    const projectRole = document.getElementById('modal-project-role').value;
    const projectTime = document.getElementById('modal-project-time').value;
    const description = document.getElementById('modal-project-description').value;
    
    // 将文本区域的内容转换为HTML段落
    const descriptionHtml = description.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p>${line}</p>`)
        .join('');
    
    // 更新简历预览
    document.getElementById('previewProjectName').textContent = projectName;
    document.getElementById('previewProjectRole').textContent = projectRole;
    document.getElementById('previewProjectTime').textContent = projectTime;
    
    // 更新项目描述（HTML内容）
    const projectDescription = document.querySelector('.project-item .project-description');
    if (projectDescription) {
        projectDescription.innerHTML = descriptionHtml;
    }
    
    console.log('项目经历已更新');
}

// 打开校内经历编辑模态框
function openCampusExperienceModal(element) {
    const campusItem = element.querySelector('.campus-item');
    
    if (!campusItem) {
        // 如果没有校内经历项，则创建新的
        const template = getNewCampusTemplate();
        openModal('添加校内经历', template, addNewCampus);
        return;
    }
    
    const campusOrg = campusItem.querySelector('#previewCampusOrg').textContent;
    const campusRole = campusItem.querySelector('#previewCampusRole').textContent;
    const campusTime = campusItem.querySelector('#previewCampusTime').textContent;
    const description = campusItem.querySelector('.campus-description').innerHTML;
    
    const template = `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-campus-org">组织名称</label>
                    <input type="text" id="modal-campus-org" value="${campusOrg}">
                </div>
                <div class="form-group">
                    <label for="modal-campus-role">担任职务</label>
                    <input type="text" id="modal-campus-role" value="${campusRole}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-campus-time">活动时间</label>
                    <input type="text" id="modal-campus-time" value="${campusTime}">
                </div>
                <div class="form-group">
                    <label for="modal-campus-type">组织类型</label>
                    <select id="modal-campus-type">
                        <option value="学生会">学生会</option>
                        <option value="社团">社团</option>
                        <option value="志愿者">志愿者</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="modal-campus-description">活动描述</label>
                <textarea id="modal-campus-description" rows="5">${description.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/g, '\n')}</textarea>
            </div>
        </div>
    `;
    
    openModal('编辑校内经历', template, updateCampus);
}

// 获取新校内经历模板
function getNewCampusTemplate() {
    return `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-campus-org">组织名称</label>
                    <input type="text" id="modal-campus-org" placeholder="例如：腾讯大学产品协会">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-campus-role">担任职务</label>
                    <input type="text" id="modal-campus-role" placeholder="例如：产品研发部 副主席">
                </div>
                <div class="form-group">
                    <label for="modal-campus-time">活动时间</label>
                    <input type="text" id="modal-campus-time" placeholder="例如：2015.3 - 2015.6">
                </div>
            </div>
            <div class="form-group">
                <label for="modal-campus-description">活动描述</label>
                <textarea id="modal-campus-description" rows="5" placeholder="描述您的校内活动内容、职责和成就..."></textarea>
            </div>
        </div>
    `;
}

// 添加新校内经历
function addNewCampus() {
    const campusOrg = document.getElementById('modal-campus-org').value;
    const campusRole = document.getElementById('modal-campus-role').value;
    const campusTime = document.getElementById('modal-campus-time').value;
    const description = document.getElementById('modal-campus-description').value;
    
    // 将文本区域的内容转换为HTML段落
    const descriptionHtml = description.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p>${line}</p>`)
        .join('');
    
    const campusList = document.getElementById('previewCampusList');
    
    // 创建新的校内经历项
    const newCampusItem = document.createElement('div');
    newCampusItem.className = 'campus-item';
    newCampusItem.innerHTML = `
        <div class="campus-header">
            <span id="previewCampusOrg">${campusOrg}</span>
            <span id="previewCampusRole">${campusRole}</span>
            <span id="previewCampusTime">${campusTime}</span>
        </div>
        <div class="campus-description">
            ${descriptionHtml}
        </div>
    `;
    
    // 添加到预览区域
    campusList.appendChild(newCampusItem);
    
    console.log('新校内经历已添加');
}

// 更新校内经历
function updateCampus() {
    const campusOrg = document.getElementById('modal-campus-org').value;
    const campusRole = document.getElementById('modal-campus-role').value;
    const campusTime = document.getElementById('modal-campus-time').value;
    const description = document.getElementById('modal-campus-description').value;
    
    // 将文本区域的内容转换为HTML段落
    const descriptionHtml = description.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p>${line}</p>`)
        .join('');
    
    // 更新简历预览
    document.getElementById('previewCampusOrg').textContent = campusOrg;
    document.getElementById('previewCampusRole').textContent = campusRole;
    document.getElementById('previewCampusTime').textContent = campusTime;
    
    // 更新校内经历描述（HTML内容）
    const campusDescription = document.querySelector('.campus-item .campus-description');
    if (campusDescription) {
        campusDescription.innerHTML = descriptionHtml;
    }
    
    console.log('校内经历已更新');
}

// 打开荣誉奖项编辑模态框
function openAwardsModal(element) {
    const awardsList = element.querySelector('#previewAwardsList');
    
    if (!awardsList || awardsList.children.length === 0) {
        // 如果没有奖项，则创建新的
        const template = getNewAwardTemplate();
        openModal('添加荣誉奖项', template, addNewAward);
        return;
    }
    
    // 获取所有奖项
    const awards = Array.from(awardsList.children).map(item => item.textContent.trim());
    
    const awardInputs = awards.map((award, index) => `
        <div class="form-row" id="award-row-${index}">
            <div class="form-group">
                <label for="modal-award-${index}">奖项 ${index + 1}</label>
                <input type="text" id="modal-award-${index}" value="${award}">
            </div>
            <div class="form-group">
                <label for="modal-award-date-${index}">获奖日期</label>
                <input type="text" id="modal-award-date-${index}" value="2021.10">
            </div>
        </div>
    `).join('');
    
    const template = `
        <div class="modal-form">
            ${awardInputs}
            <div class="form-group" style="margin-top: 15px;">
                <button type="button" class="btn" id="add-award-btn">+ 添加奖项</button>
            </div>
        </div>
    `;
    
    openModal('编辑荣誉奖项', template, updateAwards);
    
    // 添加奖项按钮事件
    setTimeout(() => {
        document.getElementById('add-award-btn').addEventListener('click', function() {
            const index = document.querySelectorAll('[id^="award-row-"]').length;
            const newRow = document.createElement('div');
            newRow.className = 'form-row';
            newRow.id = `award-row-${index}`;
            newRow.innerHTML = `
                <div class="form-group">
                    <label for="modal-award-${index}">奖项 ${index + 1}</label>
                    <input type="text" id="modal-award-${index}" placeholder="例如：校级优秀学生">
                </div>
                <div class="form-group">
                    <label for="modal-award-date-${index}">获奖日期</label>
                    <input type="text" id="modal-award-date-${index}" placeholder="例如：2023.06">
                </div>
            `;
            document.getElementById('add-award-btn').parentNode.before(newRow);
        });
    }, 100);
}

// 更新荣誉奖项
function updateAwards() {
    const awardsText = document.getElementById('modal-awards').value;
    const awards = awardsText.split('\n').filter(award => award.trim() !== '');
    
    const awardsList = document.getElementById('previewAwardsList');
    
    // 清空现有奖项
    awardsList.innerHTML = '';
    
    // 添加新奖项
    awards.forEach(award => {
        const awardItem = document.createElement('div');
        awardItem.className = 'award-item';
        awardItem.textContent = award;
        awardsList.appendChild(awardItem);
    });
    
    console.log('荣誉奖项已更新');
}

// 打开个人技能编辑模态框
function openSkillsModal(element) {
    const skillsList = element.querySelector('#previewSkillsList');
    const skills = [];
    
    // 获取所有技能
    const skillItems = skillsList.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        skills.push(item.textContent.trim());
    });
    
    const skillsText = skills.join('\n');
    
    const template = `
        <div class="modal-form">
            <div class="form-group">
                <label for="modal-skills">个人技能（每行一个）</label>
                <textarea id="modal-skills" rows="6">${skillsText}</textarea>
            </div>
        </div>
    `;
    
    openModal('编辑个人技能', template, updateSkills);
}

// 更新个人技能
function updateSkills() {
    const skillsText = document.getElementById('modal-skills').value;
    const skills = skillsText.split('\n').filter(skill => skill.trim() !== '');
    
    const skillsList = document.getElementById('previewSkillsList');
    
    // 清空现有技能
    skillsList.innerHTML = '';
    
    // 添加新技能
    skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.textContent = skill;
        skillsList.appendChild(skillItem);
    });
    
    console.log('个人技能已更新');
}

// 初始化保存和导出按钮
function initActionButtons() {
    console.log('初始化操作按钮...');
    
    // 绑定保存按钮
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveResume);
    }
    
    // 绑定导出按钮
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResumePDF);
    }
    
    console.log('操作按钮初始化完成');
}

// 保存简历
async function saveResume() {
    console.log('保存简历');
    
    try {
        // 显示加载状态
        showLoading('正在保存...');
        
        // 收集当前简历数据
        const resumeData = collectResumeData();
        
        // 从URL获取简历ID
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('id') || 1;
        
        // 调用API保存简历
        await ApiService.resume.updateResume(resumeId, resumeData);
        
        // 隐藏加载状态
        hideLoading();
        showToast('简历已保存');
    } catch (error) {
        console.error('保存简历失败:', error);
        hideLoading();
        showToast('保存失败，请重试');
    }
}

// 收集当前简历数据
function collectResumeData() {
    // 基本信息
    const name = document.getElementById('previewName').textContent;
    const basicInfo = document.getElementById('previewBasicInfo').textContent;
    const contactInfo = document.getElementById('previewContact').textContent;
    
    // 解析基本信息
    const basicInfoParts = basicInfo.split('|').map(item => item.trim());
    const gender = basicInfoParts[0];
    const age = basicInfoParts[1];
    const educationLevel = basicInfoParts[2];
    const experience = basicInfoParts[3];
    const status = basicInfoParts[4];
    
    // 解析联系信息
    const phone = contactInfo.includes('联系电话') ? 
        contactInfo.split('|')[0].replace('联系电话：', '').trim() : '';
    const email = contactInfo.includes('邮箱') ? 
        contactInfo.split('|')[1].replace('邮箱：', '').trim() : '';
    
    // 获取头像
    const avatar = document.getElementById('userAvatar').src;
    
    // 求职意向
    const position = document.getElementById('previewPosition').textContent;
    const city = document.getElementById('previewCity').textContent;
    const salary = document.getElementById('previewSalary').textContent;
    const entryTime = document.getElementById('previewEntryTime').textContent;
    
    // 收集教育经历
    const educationItems = document.querySelectorAll('#previewEducationList .education-item');
    const education = Array.from(educationItems).map(item => {
        const schoolMajor = item.querySelector('.edu-main span:nth-child(1)').textContent;
        const parts = schoolMajor.split('·');
        return {
            school: parts[0],
            major: parts.length > 1 ? parts[1] : '',
            degree: item.querySelector('.edu-main span:nth-child(2)').textContent,
            eduTime: item.querySelector('.edu-main span:nth-child(3)').textContent,
            gpa: item.querySelector('.edu-detail span:nth-child(2)').textContent,
            rank: item.querySelector('.edu-detail span:nth-child(4)').textContent
        };
    });
    
    // 收集工作经历
    const workItems = document.querySelectorAll('#previewWorkList .work-item');
    const work = Array.from(workItems).map(item => {
        const roleText = item.querySelector('.work-header span:nth-child(2)').textContent;
        const roleParts = roleText.split(' ');
        return {
            company: item.querySelector('.work-header span:nth-child(1)').textContent,
            department: roleParts.length > 1 ? roleParts[0] : '',
            position: roleParts.length > 1 ? roleParts[1] : roleText,
            workTime: item.querySelector('.work-header span:nth-child(3)').textContent,
            description: item.querySelector('.work-description p').textContent
        };
    });
    
    // 收集项目经历
    const projectItems = document.querySelectorAll('#previewProjectList .project-item');
    const project = Array.from(projectItems).map(item => {
        const descriptionParagraphs = item.querySelectorAll('.project-description p');
        let description = '';
        if (descriptionParagraphs.length > 0) {
            description = Array.from(descriptionParagraphs)
                .map(p => p.textContent)
                .join('\n');
        }
        
        return {
            projectName: item.querySelector('.project-header span:nth-child(1)').textContent,
            projectRole: item.querySelector('.project-header span:nth-child(2)').textContent,
            projectTime: item.querySelector('.project-header span:nth-child(3)').textContent,
            description: description
        };
    });
    
    // 收集校内经历
    const campusItems = document.querySelectorAll('#previewCampusList .campus-item');
    const campus = Array.from(campusItems).map(item => {
        const descriptionParagraphs = item.querySelectorAll('.campus-description p');
        let description = '';
        if (descriptionParagraphs.length > 0) {
            description = Array.from(descriptionParagraphs)
                .map(p => p.textContent)
                .join('\n');
        }
        
        return {
            campusOrg: item.querySelector('.campus-header span:nth-child(1)').textContent,
            campusRole: item.querySelector('.campus-header span:nth-child(2)').textContent,
            campusTime: item.querySelector('.campus-header span:nth-child(3)').textContent,
            description: description
        };
    });
    
    // 收集荣誉奖项
    const awardItems = document.querySelectorAll('#previewAwardsList .award-item');
    const awards = Array.from(awardItems).map(item => {
        const awardText = item.querySelector('span').textContent;
        const dateMatch = awardText.match(/^(\d{4}\.\d+)\s+(.+)$/);
        
        if (dateMatch) {
            return {
                awardDate: dateMatch[1],
                awardName: dateMatch[2]
            };
        } else {
            return {
                awardName: awardText,
                awardDate: ''
            };
        }
    });
    
    // 收集个人技能
    const skillItems = document.querySelectorAll('#previewSkillsList .skill-item');
    const skills = Array.from(skillItems).map(item => {
        const skillText = item.querySelector('span').textContent;
        const parts = skillText.split(':');
        
        return {
            skillName: parts[0].trim(),
            skillDetail: parts.length > 1 ? parts[1].trim() : ''
        };
    });
    
    // 构建最终简历数据对象
    return {
        basic: {
            name,
            gender,
            age,
            educationLevel,
            experience,
            status,
            phone,
            email
        },
        avatar,
        intention: {
            position,
            city,
            salary,
            entryTime
        },
        education,
        work,
        project,
        campus,
        awards,
        skills,
        template: {
            current: 'standard', // 当前使用的模板
            color: '#1a73e8'  // 主题颜色
        }
    };
}

// 导出简历为PDF
async function exportResumePDF() {
    console.log('导出PDF');
    
    try {
        // 显示加载状态
        showLoading('正在生成PDF...');
        
        // 从URL获取简历ID
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('id') || 1;
        
        // 调用API生成PDF
        const pdfBlob = await ApiService.resume.generatePDF(resumeId);
        
        // 创建下载链接
        const downloadLink = document.createElement('a');
        const url = URL.createObjectURL(pdfBlob);
        downloadLink.href = url;
        downloadLink.download = `简历_${new Date().getTime()}.pdf`;
        
        // 点击下载
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }, 100);
        
        // 隐藏加载状态
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
    // 创建或获取加载提示元素
    let loading = document.getElementById('loading-indicator');
    
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading-indicator';
        loading.className = 'loading-indicator';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        
        const text = document.createElement('p');
        text.className = 'loading-text';
        
        loading.appendChild(spinner);
        loading.appendChild(text);
        document.body.appendChild(loading);
    }
    
    loading.querySelector('.loading-text').textContent = message || '加载中...';
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
    // 创建或获取提示元素
    let toast = document.getElementById('toast-message');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.className = 'toast-message';
        document.body.appendChild(toast);
    }
    
    // 设置消息
    toast.textContent = message;
    toast.classList.add('show');
    
    // 设置定时器自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 调整页面布局
function adjustLayout() {
    // 获取窗口尺寸
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // 获取编辑器头部高度
    const headerHeight = document.querySelector('.editor-header').offsetHeight;
    
    // 调整编辑器容器高度
    const editorContainer = document.querySelector('.editor-container');
    editorContainer.style.height = `${windowHeight - headerHeight - 20}px`;
    
    // 获取页面主要元素
    const previewPanel = document.querySelector('.preview-panel');
    const resumePreview = document.getElementById('resumePreview');
    const rightSidebar = document.querySelector('.right-sidebar');
    
    // 确保预览面板可以滚动显示完整内容
    resumePreview.style.height = '100%';
    
    // 根据窗口大小调整布局
    if (windowWidth <= 992) {
        // 小屏幕布局 - 响应式堆叠
        previewPanel.style.width = '100%';
        previewPanel.style.maxWidth = '800px'; 
        previewPanel.style.margin = '0 auto';
        previewPanel.style.height = '60vh';
        
        rightSidebar.style.position = 'static';
        rightSidebar.style.width = '100%';
        rightSidebar.style.flexDirection = windowWidth > 768 ? 'row' : 'column';
        rightSidebar.style.marginTop = '20px';
        rightSidebar.style.height = 'auto';
        
        // 调整工具容器和输入区域
        const toolsContainer = document.querySelector('.tools-container');
        const handwritingContainer = document.querySelector('.handwriting-container');
        
        if (toolsContainer && handwritingContainer) {
            toolsContainer.style.flex = '1';
            handwritingContainer.style.flex = '1';
            handwritingContainer.style.marginTop = windowWidth > 768 ? '0' : '20px';
            handwritingContainer.style.marginLeft = windowWidth > 768 ? '20px' : '0';
        }
    } else {
        // 大屏幕布局 - 预览居中，工具浮动
        previewPanel.style.width = windowWidth > 1200 ? '800px' : '700px'; 
        previewPanel.style.margin = '0 auto';
        previewPanel.style.height = '100%';
        
        rightSidebar.style.position = 'fixed';
        rightSidebar.style.right = windowWidth > 1200 ? '20px' : '10px';
        rightSidebar.style.top = '60px';
        rightSidebar.style.width = windowWidth > 1200 ? '260px' : '240px';
        rightSidebar.style.flexDirection = 'column';
        rightSidebar.style.height = 'calc(100vh - 80px)';
    }
    
    console.log('布局已调整', {
        windowWidth,
        windowHeight,
        headerHeight,
        containerHeight: editorContainer.style.height
    });
}

// 初始化手写输入模块
function initHandwritingModule() {
    console.log('初始化手写输入模块...');
    
    // 这里可以根据需要添加手写输入的初始化代码
    // 由于这可能涉及到复杂的手写识别库，这里只提供一个简化的实现
    
    // 检查是否有手写输入按钮
    const handwritingBtn = document.querySelector('.handwriting-btn');
    if (!handwritingBtn) {
        console.log('未找到手写输入按钮，跳过初始化');
        return;
    }
    
    handwritingBtn.addEventListener('click', () => {
        // 创建一个简单的画布供用户输入
        const modal = document.createElement('div');
        modal.className = 'handwriting-modal';
        modal.innerHTML = `
            <div class="handwriting-container">
                <h3>手写输入</h3>
                <canvas id="handwritingCanvas" width="600" height="300"></canvas>
                <div class="button-group">
                    <button id="clearCanvas">清除</button>
                    <button id="recognizeCanvas">识别</button>
                    <button id="closeCanvas">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 初始化画布
        const canvas = document.getElementById('handwritingCanvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        
        // 绑定画布事件
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        function startDrawing(e) {
            isDrawing = true;
            draw(e);
        }
        
        function draw(e) {
            if (!isDrawing) return;
            
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
            
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        }
        
        function stopDrawing() {
            isDrawing = false;
            ctx.beginPath();
        }
        
        // 绑定按钮事件
        document.getElementById('clearCanvas').addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        
        document.getElementById('recognizeCanvas').addEventListener('click', () => {
            // 这里应该调用手写识别API
            // 由于这是模拟，我们直接返回一个固定的结果
            const recognizedText = "手写识别结果";
            
            // 将识别结果插入到当前焦点元素
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                activeElement.value += recognizedText;
            }
            
            // 关闭模态框
            document.body.removeChild(modal);
        });
        
        document.getElementById('closeCanvas').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
    
    console.log('手写输入模块初始化完成');
}

// 初始化头像上传
function initAvatarUpload() {
    console.log('初始化头像上传...');
    
    // 查找头像容器和上传按钮
    const avatarContainer = document.querySelector('.resume-avatar') || document.querySelector('[data-section="avatar"]');
    if (!avatarContainer) {
        console.log('未找到头像容器，跳过初始化');
        return;
    }
    
    // 创建头像上传输入框
    let fileInput = document.getElementById('avatar-upload');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'avatar-upload';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }
    
    // 添加头像点击事件
    avatarContainer.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 添加文件选择事件
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // 检查文件类型
            if (!file.type.match('image.*')) {
                showToast('请选择图片文件');
                return;
            }
            
            // 检查文件大小（限制为2MB）
            if (file.size > 2 * 1024 * 1024) {
                showToast('图片大小不能超过2MB');
                return;
            }
            
            // 读取文件并预览
            const reader = new FileReader();
            reader.onload = (event) => {
                // 更新头像预览
                const avatarImg = avatarContainer.querySelector('img');
                if (avatarImg) {
                    avatarImg.src = event.target.result;
                } else {
                    const newImg = document.createElement('img');
                    newImg.src = event.target.result;
                    newImg.className = 'avatar-img';
                    avatarContainer.innerHTML = '';
                    avatarContainer.appendChild(newImg);
                }
                
                // 更新简历数据
                if (!window.resumeData) {
                    window.resumeData = {};
                }
                window.resumeData.avatar = event.target.result;
                
                showToast('头像已更新');
            };
            reader.readAsDataURL(file);
        }
    });
    
    console.log('头像上传初始化完成');
}

// 测试模板切换功能
async function testTemplateSwitching() {
    try {
        console.log('开始测试模板切换功能...');
        
        // 获取所有模板
        const templates = await window.templateManager.loadTemplatesData();
        console.log('可用模板:', templates);
        
        // 测试每个模板
        for (const template of templates) {
            console.log(`正在测试模板: ${template.name}`);
            
            // 切换到当前模板
            await window.templateManager.setTemplate(template.id);
            
            // 验证数据是否正确加载
            const resumeData = window.templateManager.resumeData;
            if (!resumeData) {
                throw new Error(`模板 ${template.name} 数据加载失败`);
            }
            
            // 验证基本数据
            if (!resumeData.basic || !resumeData.basic.name) {
                throw new Error(`模板 ${template.name} 基本信息加载失败`);
            }
            
            // 验证教育经历
            if (!resumeData.education || !Array.isArray(resumeData.education)) {
                throw new Error(`模板 ${template.name} 教育经历加载失败`);
            }
            
            // 验证工作经历
            if (!resumeData.work || !Array.isArray(resumeData.work)) {
                throw new Error(`模板 ${template.name} 工作经历加载失败`);
            }
            
            console.log(`模板 ${template.name} 测试通过`);
        }
        
        console.log('所有模板测试完成');
        showToast('模板切换测试完成', 3000, 'success');
    } catch (error) {
        console.error('模板切换测试失败:', error);
        showToast(`测试失败: ${error.message}`, 3000, 'error');
    }
}

// 初始化工具栏
function initToolbar() {
    console.log('初始化工具栏...');
    
    // 创建工具栏
    const toolbar = document.querySelector('.toolbar');
    if (!toolbar) {
        console.log('未找到工具栏元素');
        return;
    }
    
    // 确保工具栏包含必要的按钮
    const toolbarButtons = [
        { class: 'save-btn', icon: 'save', text: '保存', click: saveResume },
        { class: 'export-btn', icon: 'export', text: '导出', click: exportResumePDF },
        { class: 'optimize-btn', icon: 'optimize', text: 'AI优化', click: () => openAIEditModal() }
    ];
    
    // 检查工具栏是否已经包含这些按钮
    if (toolbar.querySelector('.save-btn') === null) {
        // 添加工具栏按钮
        toolbarButtons.forEach(btn => {
            const button = document.createElement('button');
            button.className = btn.class;
            button.innerHTML = `<i class="icon-${btn.icon}"></i>${btn.text}`;
            button.addEventListener('click', btn.click);
            toolbar.appendChild(button);
        });
    }
    
    console.log('工具栏初始化完成');
}

// 初始化模板选择功能
async function initTemplateSelection() {
    console.log('初始化模板选择...');
    
    const templateList = document.querySelector('.template-list');
    if (!templateList) {
        console.log('未找到模板列表元素');
        return;
    }

    try {
        // 确保预览容器存在
        const previewContainer = document.getElementById('resumePreview');
        if (!previewContainer) {
            console.log('创建预览容器');
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                const newPreviewContainer = document.createElement('div');
                newPreviewContainer.id = 'resumePreview';
                newPreviewContainer.className = 'resume-preview';
                mainContent.appendChild(newPreviewContainer);
            }
        }
        
        // 初始化模板管理器 - 默认不启用模板，使用页面原有样式
        window.templateManager = new TemplateManager({
            previewContainer: '#resumePreview',
            useMockData: true, // 使用mock数据
            templatesDataUrl: '/templates/templates.json', // 模板数据文件路径
            isTemplateEnabled: false // 确保模板功能默认关闭
        });
        
        // 关键：不调用resetToDefaultStyle，避免修改已有页面样式
        // 只设置内部状态，不修改DOM
        window.templateManager.isUsingTemplate = false;
        window.templateManager.options.isTemplateEnabled = false;
        console.log('模板系统已初始化，但未启用（使用原有样式）');

        // 加载模板列表
        const templates = await templateManager.getTemplates();
        
        // 添加恢复默认样式按钮
        const templateHeader = document.querySelector('.template-header') || document.querySelector('.tool-panel[data-tool="template"] h3');
        if (templateHeader && !document.getElementById('reset-template')) {
            const resetButton = document.createElement('button');
            resetButton.id = 'reset-template';
            resetButton.className = 'reset-template-btn';
            resetButton.innerHTML = '恢复默认样式';
            resetButton.addEventListener('click', () => {
                // 恢复默认样式
                if (window.templateManager) {
                    // 先保存当前数据
                    const currentData = window.resumeData;
                    
                    // 重置样式
                    window.templateManager.resetToDefaultStyle();
                    
                    // 重新渲染简历数据
                    if (currentData) {
                        renderResumePreview(currentData);
                    }
                    
                    // 移除所有模板的激活状态
                    document.querySelectorAll('.template-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    showToast('已恢复默认样式');
                }
            });
            
            // 插入到模板标题后面
            templateHeader.parentNode.insertBefore(resetButton, templateHeader.nextSibling);
            
            // 添加CSS样式
            if (!document.getElementById('reset-template-style')) {
                const style = document.createElement('style');
                style.id = 'reset-template-style';
                style.textContent = `
                    .reset-template-btn {
                        margin-left: 10px;
                        padding: 4px 8px;
                        font-size: 12px;
                        background-color: #f5f5f5;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        cursor: pointer;
                        color: #333;
                    }
                    .reset-template-btn:hover {
                        background-color: #e0e0e0;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // 如果没有模板，就创建一些默认模板
        if (!templates || templates.length === 0) {
            console.log('未找到模板，使用默认模板');
            const defaultTemplates = [
                {
                    id: 'standard',
                    name: '标准模板',
                    primaryColor: '#2196F3'
                },
                {
                    id: 'modern',
                    name: '现代模板',
                    primaryColor: '#4CAF50'
                },
                {
                    id: 'classic',
                    name: '经典模板',
                    primaryColor: '#9C27B0'
                },
                {
                    id: 'creative',
                    name: '创意模板',
                    primaryColor: '#FF9800'
                }
            ];
            
            templateList.innerHTML = defaultTemplates.map(template => `
                <div class="template-item" data-template-id="${template.id}">
                    <div class="template-preview" style="background-color: ${template.primaryColor}"></div>
                    <span>${template.name}</span>
                </div>
            `).join('');
        } else {
            templateList.innerHTML = templates.map(template => `
                <div class="template-item" data-template-id="${template.id}">
                    <div class="template-preview" style="background-color: ${template.primaryColor}"></div>
                    <span>${template.name}</span>
                </div>
            `).join('');
        }

        // 添加点击事件 - 仅在点击模板时才启用模板功能
        templateList.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', async () => {
                const templateId = item.dataset.templateId;
                console.log(`点击模板: ${templateId}`);
                
                // 移除其他模板的激活状态
                templateList.querySelectorAll('.template-item').forEach(i => i.classList.remove('active'));
                // 添加当前模板的激活状态
                item.classList.add('active');
                
                // 保存当前的简历数据，以便在切换模板后使用
                const currentResumeData = window.resumeData ? { ...window.resumeData } : null;
                
                if (window.templateManager) {
                    // 显示加载状态
                    showLoading('正在应用模板...');
                    
                    try {
                        // 启用模板功能 - 明确告知用户从这里开始使用模板
                        window.templateManager.options.isTemplateEnabled = true;
                        console.log('模板功能已启用');
                        
                        // 保存当前页面内容（如果需要的话）
                        const previewContainer = document.getElementById('resumePreview');
                        const originalContent = previewContainer ? previewContainer.innerHTML : null;
                        
                        // 应用模板 - 这会改变页面样式和结构
                        await window.templateManager.setTemplate(templateId);
                        console.log(`模板已应用: ${templateId}`);
                        
                        // 使用当前简历数据重新渲染 - 如果应用模板后内容丢失了
                        if (currentResumeData) {
                            // 确保使用的是最新的数据
                            window.resumeData = currentResumeData;
                            if (typeof window.renderResumePreview === 'function') {
                                window.renderResumePreview(currentResumeData);
                            }
                        } else {
                            // 如果没有当前数据，尝试加载mock数据
                            try {
                                const response = await fetch('/mock/resume-mock-data.json');
                                if (response.ok) {
                                    const mockData = await response.json();
                                    window.resumeData = mockData;
                                    window.renderResumePreview(mockData);
                                }
                            } catch (mockError) {
                                console.error('加载mock数据失败:', mockError);
                            }
                        }
                        
                        // 隐藏加载状态
                        hideLoading();
                        
                        // 显示成功消息
                        showToast('模板已应用');
                    } catch (error) {
                        console.error('应用模板失败:', error);
                        showToast('应用模板失败，请重试');
                        hideLoading();
                        
                        // 恢复原样
                        item.classList.remove('active');
                    }
                } else {
                    console.error('模板管理器未初始化');
                    showToast('模板系统未准备好，请刷新页面');
                }
            });
        });
        
        console.log('模板选择初始化完成');
    } catch (error) {
        console.error('初始化模板选择器失败:', error);
        showToast('加载模板列表失败');
    }
}