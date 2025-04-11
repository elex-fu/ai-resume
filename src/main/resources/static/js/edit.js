// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    initApp();
});

// 初始化应用
function initApp() {
    // 从URL获取简历ID
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id') || 1; // 默认使用ID为1的简历
    
    // 从API获取简历数据
    loadResumeData(resumeId);
    
    // 初始化工具栏功能
    initToolbar();
    
    // 初始化模态框功能
    initModal();
    
    // 初始化AI分析功能
    initAIAnalysis();
    
    // 添加可编辑区域点击事件
    initEditableContentListeners();
    
    // 添加保存和导出按钮事件
    initActionButtons();
    
    // 初始化手写输入模块
    initHandwritingModule();
    
    // 初始化头像上传功能
    initAvatarUpload();
    
    // 调整页面布局
    adjustLayout();
    
    // 监听窗口大小变化
    window.addEventListener('resize', adjustLayout);
}

// 加载简历数据
async function loadResumeData(resumeId) {
    try {
        // 显示加载状态
        showLoading('正在加载简历数据...');
        
        // 调用API服务获取简历数据
        const resumeData = await ApiService.resume.getResumeById(resumeId);
        
        // 渲染简历预览
        renderResumePreview(resumeData);
        
        // 隐藏加载状态
        hideLoading();
    } catch (error) {
        console.error('加载简历数据失败:', error);
        hideLoading();
        showToast('加载简历数据失败，请重试');
    }
}

// 渲染简历预览
function renderResumePreview(resumeData) {
    if (!resumeData) return;
    
    // 渲染基本信息
    renderBasicInfo(resumeData.basic);
    
    // 渲染头像
    if (resumeData.avatar) {
        document.getElementById('userAvatar').src = resumeData.avatar;
    }
    
    // 渲染求职意向
    renderJobIntention(resumeData.intention);
    
    // 渲染教育经历
    renderEducation(resumeData.education);
    
    // 渲染工作经验
    renderWorkExperience(resumeData.work);
    
    // 渲染项目经验
    renderProjectExperience(resumeData.project);
    
    // 渲染校园经历
    renderCampusExperience(resumeData.campus);
    
    // 渲染获奖情况
    renderAwards(resumeData.awards);
    
    // 渲染技能
    renderSkills(resumeData.skills);
    
    // 渲染分析数据
    if (resumeData.analysis) {
        updateAnalysisData(resumeData.analysis);
    }
    
    // 应用模板
    if (resumeData.template) {
        applyTemplate(resumeData.template.current);
        applyColor(resumeData.template.color);
    }
}

// 渲染基本信息
function renderBasicInfo(basicInfo) {
    if (!basicInfo) return;
    
    document.getElementById('previewName').textContent = basicInfo.name || '';
    
    // 格式化基本信息显示
    const basicInfoText = `${basicInfo.gender || ''} | ${basicInfo.age || ''} | ${basicInfo.educationLevel || ''} | ${basicInfo.experience || ''} | ${basicInfo.status || ''}`;
    document.getElementById('previewBasicInfo').textContent = basicInfoText;
    
    // 格式化联系方式
    const contactText = `联系电话：${basicInfo.phone || ''} | 邮箱：${basicInfo.email || ''}`;
    document.getElementById('previewContact').textContent = contactText;
}

// 渲染求职意向
function renderJobIntention(intention) {
    if (!intention) return;
    
    document.getElementById('previewPosition').textContent = intention.position || '';
    document.getElementById('previewCity').textContent = intention.city || '';
    document.getElementById('previewSalary').textContent = intention.salary || '';
    document.getElementById('previewEntryTime').textContent = intention.entryTime || '';
}

// 渲染教育经历
function renderEducation(educationList) {
    if (!educationList || !educationList.length) return;
    
    const container = document.getElementById('previewEducationList');
    container.innerHTML = '';
    
    educationList.forEach(edu => {
        const educationItem = document.createElement('div');
        educationItem.className = 'education-item';
        educationItem.innerHTML = `
            <div class="edu-main">
                <span>${edu.school || ''}·${edu.major || ''}</span>
                <span>${edu.degree || ''}</span>
                <span>${edu.eduTime || ''}</span>
            </div>
            <div class="edu-detail">
                <span>绩点: </span>
                <span>${edu.gpa || ''}</span>
                <span>成绩排名: </span>
                <span>${edu.rank || ''}</span>
            </div>
        `;
        container.appendChild(educationItem);
    });
}

// 渲染工作经验
function renderWorkExperience(workList) {
    if (!workList || !workList.length) return;
    
    const container = document.getElementById('previewWorkList');
    container.innerHTML = '';
    
    workList.forEach(work => {
        const workItem = document.createElement('div');
        workItem.className = 'work-item';
        workItem.innerHTML = `
            <div class="work-header">
                <span>${work.company || ''}</span>
                <span>${work.department || ''} ${work.position || ''}</span>
                <span>${work.workTime || ''}</span>
            </div>
            <div class="work-description">
                <p>${work.description || ''}</p>
            </div>
        `;
        container.appendChild(workItem);
    });
}

// 渲染项目经验
function renderProjectExperience(projectList) {
    if (!projectList || !projectList.length) return;
    
    const container = document.getElementById('previewProjectList');
    container.innerHTML = '';
    
    projectList.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <div class="project-header">
                <span>${project.projectName || ''}</span>
                <span>${project.projectRole || ''}</span>
                <span>${project.projectTime || ''}</span>
            </div>
            <div class="project-description">
                <p>${project.description || ''}</p>
            </div>
        `;
        container.appendChild(projectItem);
    });
}

// 渲染校园经历
function renderCampusExperience(campusList) {
    if (!campusList || !campusList.length) return;
    
    const container = document.getElementById('previewCampusList');
    if (!container) return;
    
    container.innerHTML = '';
    
    campusList.forEach(campus => {
        const campusItem = document.createElement('div');
        campusItem.className = 'campus-item';
        campusItem.innerHTML = `
            <div class="campus-header">
                <span>${campus.campusOrg || ''}</span>
                <span>${campus.campusRole || ''}</span>
                <span>${campus.campusTime || ''}</span>
            </div>
            <div class="campus-description">
                <p>${campus.description || ''}</p>
            </div>
        `;
        container.appendChild(campusItem);
    });
}

// 渲染获奖情况
function renderAwards(awardsList) {
    if (!awardsList || !awardsList.length) return;
    
    const container = document.getElementById('previewAwardsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    awardsList.forEach(award => {
        const awardItem = document.createElement('div');
        awardItem.className = 'award-item';
        awardItem.innerHTML = `
            <div class="award-header">
                <span>${award.awardName || ''}</span>
                <span>${award.awardDate || ''}</span>
            </div>
        `;
        container.appendChild(awardItem);
    });
}

// 渲染技能
function renderSkills(skillsList) {
    if (!skillsList || !skillsList.length) return;
    
    const container = document.getElementById('previewSkillsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    skillsList.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `
            <div class="skill-name">${skill.skillName || ''}</div>
            <div class="skill-detail">${skill.skillDetail || ''}</div>
        `;
        container.appendChild(skillItem);
    });
}

// 从预览区获取现有数据以填充模态框
function fillModalWithExistingData(sectionType) {
    let modalContent = '';
    let title = '';
    let saveCallback;
    
    switch (sectionType) {
        case 'basic':
            const name = document.getElementById('previewName').textContent;
            const basicInfoText = document.getElementById('previewBasicInfo').textContent;
            const contactText = document.getElementById('previewContact').textContent;
            
            // 解析基本信息
            const genderMatch = basicInfoText.match(/(.+?)\s*\|/);
            const ageMatch = basicInfoText.match(/\|\s*(.+?岁)/);
            const educationMatch = basicInfoText.match(/\|\s*(.+?)\s*\|.*\|/);
            const experienceMatch = basicInfoText.match(/\|.+?\|.+?\|\s*(.+?)\s*\|/);
            const statusMatch = basicInfoText.match(/\|([^|]+)$/);
            
            // 解析联系方式
            const phoneMatch = contactText.match(/联系电话：\s*(.+?)\s*\|/);
            const emailMatch = contactText.match(/邮箱：\s*(.+)/);
            
            const gender = genderMatch ? genderMatch[1].trim() : '';
            const age = ageMatch ? ageMatch[1].trim() : '';
            const education = educationMatch ? educationMatch[1].trim() : '';
            const experience = experienceMatch ? experienceMatch[1].trim() : '';
            const status = statusMatch ? statusMatch[1].trim() : '';
            const phone = phoneMatch ? phoneMatch[1].trim() : '';
            const email = emailMatch ? emailMatch[1].trim() : '';
            
            modalContent = `
                <div class="modal-form">
                    <div class="form-group">
                        <label for="modal-name">姓名</label>
                        <input type="text" id="modal-name" value="${name}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="modal-gender">性别</label>
                            <input type="text" id="modal-gender" value="${gender}">
                        </div>
                        <div class="form-group">
                            <label for="modal-age">年龄</label>
                            <input type="text" id="modal-age" value="${age}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="modal-education">学历</label>
                            <input type="text" id="modal-education" value="${education}">
                        </div>
                        <div class="form-group">
                            <label for="modal-experience">工作经验</label>
                            <input type="text" id="modal-experience" value="${experience}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="modal-status">在职状态</label>
                            <input type="text" id="modal-status" value="${status}">
                        </div>
                        <div class="form-group">
                            <label for="modal-political">政治面貌</label>
                            <input type="text" id="modal-political" value="群众">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="modal-phone">联系电话</label>
                            <input type="text" id="modal-phone" value="${phone}">
                        </div>
                        <div class="form-group">
                            <label for="modal-email">邮箱</label>
                            <input type="text" id="modal-email" value="${email}">
                        </div>
                    </div>
                </div>
            `;
            
            title = '编辑基本信息';
            saveCallback = saveBasicInfo;
            break;
            
        case 'jobIntention': 
            const position = document.getElementById('previewPosition').textContent;
            const city = document.getElementById('previewCity').textContent;
            const salary = document.getElementById('previewSalary').textContent;
            const entryTime = document.getElementById('previewEntryTime').textContent;
            
            modalContent = `
                <div class="modal-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="modal-position">求职岗位</label>
                            <input type="text" id="modal-position" value="${position}">
                        </div>
                        <div class="form-group">
                            <label for="modal-city">意向城市</label>
                            <input type="text" id="modal-city" value="${city}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="modal-salary">期望薪资</label>
                            <input type="text" id="modal-salary" value="${salary}">
                        </div>
                        <div class="form-group">
                            <label for="modal-entry-time">到岗时间</label>
                            <input type="text" id="modal-entry-time" value="${entryTime}">
                        </div>
                    </div>
                </div>
            `;
            
            title = '编辑求职意向';
            saveCallback = saveJobIntention;
            break;
            
        case 'education':
            // 获取教育经历列表的第一项作为示例
            const educationItem = document.querySelector('.education-item');
            
            if (!educationItem) {
                // 如果没有教育经历项，则创建新的
                modalContent = getNewEducationTemplate();
                title = '添加教育经历';
                saveCallback = addNewEducation;
                break;
            }
            
            const school = educationItem.querySelector('#previewSchool')?.textContent || '';
            const degree = educationItem.querySelector('#previewDegree')?.textContent || '';
            const eduTime = educationItem.querySelector('#previewEduTime')?.textContent || '';
            const gpa = educationItem.querySelector('#previewGPA')?.textContent || '';
            const rank = educationItem.querySelector('#previewRank')?.textContent || '';
            
            modalContent = `
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
            
            title = '编辑教育经历';
            saveCallback = updateEducation;
            break;
            
        case 'work':
            // 获取工作经历列表的第一项作为示例
            const workItem = document.querySelector('.work-item');
            
            if (!workItem) {
                // 如果没有工作经历项，则创建新的
                modalContent = getNewWorkTemplate();
                title = '添加工作经历';
                saveCallback = addNewWork;
                break;
            }
            
            const company = workItem.querySelector('#previewCompany')?.textContent || '';
            const workPosition = workItem.querySelector('#previewRole')?.textContent || '';
            const workTime = workItem.querySelector('#previewWorkTime')?.textContent || '';
            const workDescription = workItem.querySelector('#previewWorkDescription')?.textContent || '';
            
            modalContent = `
                <div class="modal-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="modal-company">公司名称</label>
                            <input type="text" id="modal-company" value="${company}">
                        </div>
                        <div class="form-group">
                            <label for="modal-position">岗位名称</label>
                            <input type="text" id="modal-position" value="${workPosition}">
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
                        <textarea id="modal-description" rows="5">${workDescription}</textarea>
                    </div>
                </div>
            `;
            
            title = '编辑工作经历';
            saveCallback = updateWork;
            break;
            
        case 'project':
            // 获取项目经历列表的第一项作为示例
            const projectItem = document.querySelector('.project-item');
            
            if (!projectItem) {
                // 如果没有项目经历项，则创建新的
                modalContent = getNewProjectTemplate();
                title = '添加项目经历';
                saveCallback = addNewProject;
                break;
            }
            
            const projectName = projectItem.querySelector('#previewProjectName')?.textContent || '';
            const projectRole = projectItem.querySelector('#previewProjectRole')?.textContent || '';
            const projectTime = projectItem.querySelector('#previewProjectTime')?.textContent || '';
            const projectDescription = projectItem.querySelector('.project-description')?.textContent || '';
            
            modalContent = `
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
                        <textarea id="modal-project-description" rows="5">${projectDescription}</textarea>
                    </div>
                </div>
            `;
            
            title = '编辑项目经历';
            saveCallback = updateProject;
            break;
            
        case 'campus':
            // 获取校园经历列表的第一项作为示例
            const campusItem = document.querySelector('.campus-item');
            
            if (!campusItem) {
                // 如果没有校园经历项，则创建新的
                modalContent = getNewCampusTemplate();
                title = '添加校园经历';
                saveCallback = addNewCampus;
                break;
            }
            
            const campusOrg = campusItem.querySelector('#previewCampusOrg')?.textContent || '';
            const campusRole = campusItem.querySelector('#previewCampusRole')?.textContent || '';
            const campusTime = campusItem.querySelector('#previewCampusTime')?.textContent || '';
            const campusDescription = campusItem.querySelector('.campus-description')?.textContent || '';
            
            modalContent = `
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
                        <textarea id="modal-campus-description" rows="5">${campusDescription}</textarea>
                    </div>
                </div>
            `;
            
            title = '编辑校园经历';
            saveCallback = updateCampus;
            break;
            
        case 'awards':
            // 获取奖项列表
            const awardItems = document.querySelectorAll('.award-item');
            let awardsHtml = '';
            
            awardItems.forEach((item, index) => {
                awardsHtml += `
                    <div class="award-entry" data-index="${index}">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="modal-award-name-${index}">奖项名称</label>
                                <input type="text" id="modal-award-name-${index}" value="${item.textContent.trim()}">
                            </div>
                            <div class="form-group">
                                <label for="modal-award-date-${index}">获奖日期</label>
                                <input type="text" id="modal-award-date-${index}" value="2021.10">
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // 如果没有奖项，添加一个空的
            if (awardsHtml === '') {
                awardsHtml = `
                    <div class="award-entry" data-index="0">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="modal-award-name-0">奖项名称</label>
                                <input type="text" id="modal-award-name-0" value="">
                            </div>
                            <div class="form-group">
                                <label for="modal-award-date-0">获奖日期</label>
                                <input type="text" id="modal-award-date-0" value="">
                            </div>
                        </div>
                    </div>
                `;
            }
            
            modalContent = `
                <div class="modal-form">
                    <div id="awards-container">
                        ${awardsHtml}
                    </div>
                    <button type="button" class="btn" id="add-award-btn">添加奖项</button>
                </div>
            `;
            
            title = '编辑荣誉奖项';
            saveCallback = updateAwards;
            break;
            
        case 'skills':
            // 获取技能列表
            const skillItems = document.querySelectorAll('.skill-item');
            let skillsHtml = '';
            
            skillItems.forEach((item, index) => {
                const skillNameMatch = item.textContent.match(/(.+?):/);
                const skillDetailMatch = item.textContent.match(/:\s*(.+)/);
                
                const skillName = skillNameMatch ? skillNameMatch[1].trim() : '';
                const skillDetail = skillDetailMatch ? skillDetailMatch[1].trim() : '';
                
                skillsHtml += `
                    <div class="skill-entry" data-index="${index}">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="modal-skill-name-${index}">技能类别</label>
                                <input type="text" id="modal-skill-name-${index}" value="${skillName}">
                            </div>
                            <div class="form-group">
                                <label for="modal-skill-detail-${index}">技能描述</label>
                                <input type="text" id="modal-skill-detail-${index}" value="${skillDetail}">
                            </div>
                        </div>
                    </div>
                `;
            });
            
            // 如果没有技能，添加一个空的
            if (skillsHtml === '') {
                skillsHtml = `
                    <div class="skill-entry" data-index="0">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="modal-skill-name-0">技能类别</label>
                                <input type="text" id="modal-skill-name-0" value="">
                            </div>
                            <div class="form-group">
                                <label for="modal-skill-detail-0">技能描述</label>
                                <input type="text" id="modal-skill-detail-0" value="">
                            </div>
                        </div>
                    </div>
                `;
            }
            
            modalContent = `
                <div class="modal-form">
                    <div id="skills-container">
                        ${skillsHtml}
                    </div>
                    <button type="button" class="btn" id="add-skill-btn">添加技能</button>
                </div>
            `;
            
            title = '编辑个人技能';
            saveCallback = updateSkills;
            break;
            
        default:
            console.log(`未处理的区域类型: ${sectionType}`);
            return;
    }
    
    // 打开编辑模态框
    openModal(title, modalContent, saveCallback);
}

// 初始化工具栏功能
function initToolbar() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    const toolPanels = document.querySelectorAll('.tool-panel');
    
    // 工具栏按钮点击事件
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const toolType = this.getAttribute('data-tool');
            
            // 移除所有按钮的active类
            toolbarBtns.forEach(btn => btn.classList.remove('active'));
            
            // 移除所有面板的active类
            toolPanels.forEach(panel => panel.classList.remove('active'));
            
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 显示对应的面板
            const panel = document.getElementById(`${toolType}-panel`);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
    
    // 初始化模板选择功能
    initTemplateSelection();
    
    // 初始化颜色选择功能
    initColorSelection();
    
    // 初始化优化按钮功能
    initOptimizeButton();
}

// 初始化模板选择功能
function initTemplateSelection() {
    const templateItems = document.querySelectorAll('.template-item');
    
    templateItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有模板的active类
            templateItems.forEach(item => item.classList.remove('active'));
            
            // 添加当前模板的active类
            this.classList.add('active');
            
            // 获取模板类型
            const templateClass = this.querySelector('.template-preview').classList[1];
            
            // 应用模板样式到简历预览
            applyTemplate(templateClass);
        });
    });
}

// 应用简历模板
function applyTemplate(templateClass) {
    const resumePreview = document.getElementById('resumePreview');
    
    // 移除所有模板类
    resumePreview.classList.remove('standard', 'modern', 'classic', 'creative');
    
    // 添加选中的模板类
    if (templateClass) {
        resumePreview.classList.add(templateClass);
    }
    
    // 在实际应用中，这里可能需要重新渲染简历布局或调整样式
    console.log(`应用${templateClass}模板`);
}

// 初始化颜色选择功能
function initColorSelection() {
    const colorOptions = document.querySelectorAll('.color-option');
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 移除所有颜色选项的active类
            colorOptions.forEach(opt => opt.classList.remove('active'));
            
            // 添加当前颜色选项的active类
            this.classList.add('active');
            
            // 获取选中的颜色
            const color = this.style.backgroundColor;
            
            // 应用颜色到简历预览
            applyColor(color);
        });
    });
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

// 打开编辑模态框
function openEditModal(sectionType, element) {
    let title = '编辑内容';
    let content = '';
    let saveCallback = null;
    
    // 根据区域类型打开不同的编辑模态框
    switch (sectionType) {
        case 'basic':
        case 'basicInfo':
            title = '编辑基本信息';
            openBasicInfoModal(element);
            return;
        case 'intention':
        case 'jobIntention':
            title = '编辑求职意向';
            openJobIntentionModal(element);
            return;
        case 'education':
            title = '编辑教育经历';
            openEducationModal(element);
            return;
        case 'work':
            title = '编辑工作经历';
            openWorkExperienceModal(element);
            return;
        case 'project':
            title = '编辑项目经历';
            openProjectExperienceModal(element);
            return;
        case 'campus':
            title = '编辑校内经历';
            openCampusExperienceModal(element);
            return;
        case 'awards':
            title = '编辑荣誉奖项';
            openAwardsModal(element);
            return;
        case 'skills':
            title = '编辑个人技能';
            openSkillsModal(element);
            return;
        default:
            content = `<div>编辑 ${sectionType} 内容</div>`;
            break;
    }
    
    openModal(title, content, saveCallback);
}

// 打开基本信息编辑模态框
function openBasicInfoModal(element) {
    const name = element.querySelector('.resume-name').textContent;
    const info = element.querySelector('.resume-info').textContent;
    const contact = element.querySelector('.resume-contact').textContent;
    
    const template = `
        <div class="modal-form">
            <div class="form-group">
                <label for="modal-name">姓名</label>
                <input type="text" id="modal-name" value="${name}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-gender">性别</label>
                    <input type="text" id="modal-gender" value="${element.querySelector('#previewGender').textContent}">
                </div>
                <div class="form-group">
                    <label for="modal-age">年龄</label>
                    <input type="text" id="modal-age" value="${element.querySelector('#previewAge').textContent}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-political">政治面貌</label>
                    <input type="text" id="modal-political" value="${element.querySelector('#previewPolitical').textContent}">
                </div>
                <div class="form-group">
                    <label for="modal-location">所在地</label>
                    <input type="text" id="modal-location" value="${element.querySelector('#previewLocation').textContent}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-education">学历</label>
                    <input type="text" id="modal-education" value="${element.querySelector('#previewEducationLevel').textContent}">
                </div>
                <div class="form-group">
                    <label for="modal-experience">工作经验</label>
                    <input type="text" id="modal-experience" value="1年">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-email">邮箱</label>
                    <input type="email" id="modal-email" value="${element.querySelector('#previewEmail').textContent}">
                </div>
                <div class="form-group">
                    <label for="modal-phone">电话</label>
                    <input type="tel" id="modal-phone" value="${element.querySelector('#previewPhone').textContent}">
                </div>
            </div>
        </div>
    `;
    
    openModal('编辑基本信息', template, saveBasicInfo);
}

// 保存基本信息
function saveBasicInfo() {
    const name = document.getElementById('modal-name').value;
    const gender = document.getElementById('modal-gender').value;
    const age = document.getElementById('modal-age').value;
    const political = document.getElementById('modal-political').value;
    const location = document.getElementById('modal-location').value;
    const education = document.getElementById('modal-education').value;
    const email = document.getElementById('modal-email').value;
    const phone = document.getElementById('modal-phone').value;
    
    // 更新简历预览
    document.getElementById('previewName').textContent = name;
    document.getElementById('previewGender').textContent = gender;
    document.getElementById('previewAge').textContent = age;
    document.getElementById('previewPolitical').textContent = political;
    document.getElementById('previewLocation').textContent = location;
    document.getElementById('previewEducationLevel').textContent = education;
    document.getElementById('previewEmail').textContent = email;
    document.getElementById('previewPhone').textContent = phone;
    
    console.log('基本信息已更新');
}

// 打开求职意向编辑模态框
function openJobIntentionModal(element) {
    const position = element.querySelector('#previewPosition').textContent;
    const city = element.querySelector('#previewCity').textContent;
    const salary = element.querySelector('#previewSalary').textContent;
    const entryTime = element.querySelector('#previewEntryTime').textContent;
    
    const template = `
        <div class="modal-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-position">求职岗位</label>
                    <input type="text" id="modal-position" value="${position}">
                </div>
                <div class="form-group">
                    <label for="modal-city">意向城市</label>
                    <input type="text" id="modal-city" value="${city}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="modal-salary">期望薪资</label>
                    <input type="text" id="modal-salary" value="${salary}">
                </div>
                <div class="form-group">
                    <label for="modal-entry-time">到岗时间</label>
                    <input type="text" id="modal-entry-time" value="${entryTime}">
                </div>
            </div>
        </div>
    `;
    
    openModal('编辑求职意向', template, saveJobIntention);
}

// 保存求职意向
function saveJobIntention() {
    const position = document.getElementById('modal-position').value;
    const city = document.getElementById('modal-city').value;
    const salary = document.getElementById('modal-salary').value;
    const entryTime = document.getElementById('modal-entry-time').value;
    
    // 更新简历预览
    document.getElementById('previewPosition').textContent = position;
    document.getElementById('previewCity').textContent = city;
    document.getElementById('previewSalary').textContent = salary;
    document.getElementById('previewEntryTime').textContent = entryTime;
    
    console.log('求职意向已更新');
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
                <input type="text" id="modal-award-date-${index}" value="2023.06">
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
    const saveBtn = document.getElementById('saveBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // 保存按钮点击事件
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveResume();
        });
    }
    
    // 导出按钮点击事件
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            exportResumePDF();
        });
    }
}

// 保存简历
function saveResume() {
    console.log('保存简历');
    
    // 显示加载状态
    showLoading('正在保存...');
    
    // 模拟API调用
    setTimeout(() => {
        hideLoading();
        showToast('简历已保存');
    }, 800);
}

// 导出简历为PDF
function exportResumePDF() {
    console.log('导出PDF');
    
    // 显示加载状态
    showLoading('正在生成PDF...');
    
    // 模拟API调用
    setTimeout(() => {
        hideLoading();
        showToast('PDF已生成，正在下载...');
        
        // 模拟下载
        // 在实际应用中，这里应该是一个真实的下载链接
        console.log('下载PDF文件');
    }, 1500);
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
    const handwritingInput = document.getElementById('handwritingInput');
    const handwritingBtn = document.getElementById('handwritingBtn');
    
    if (!handwritingInput || !handwritingBtn) return;
    
    // 自动调整输入框高度
    handwritingInput.addEventListener('input', function() {
        this.style.height = 'auto';
        const newHeight = Math.min(150, Math.max(60, this.scrollHeight));
        this.style.height = `${newHeight}px`;
    });
    
    // 处理输入内容
    handwritingBtn.addEventListener('click', processHandwritingInput);
    
    // 按下Enter+Ctrl也可以提交
    handwritingInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            processHandwritingInput();
        }
    });
    
    // 处理手写输入的内容
    function processHandwritingInput() {
        const input = handwritingInput.value.trim();
        if (!input) {
            showToast('请输入内容');
            return;
        }
        
        // 显示加载状态
        showLoading('正在处理您的输入...');
        
        // 模拟API调用处理
        setTimeout(() => {
            // 分析输入的内容类型
            let processed = false;
            
            // 检查输入是否包含特定的关键词来判断要修改的区域
            
            // 尝试解析为教育经历
            if (!processed && (input.includes('学校') || input.includes('大学') || input.includes('教育') || input.includes('学历'))) {
                const section = document.querySelector('[data-section="education"]');
                processEducationInput(input, section);
                processed = true;
            }
            
            // 尝试解析为工作经历
            if (!processed && (input.includes('工作') || input.includes('公司') || input.includes('职位'))) {
                const section = document.querySelector('[data-section="work"]');
                processWorkInput(input, section);
                processed = true;
            }
            
            // 尝试解析为项目经历
            if (!processed && (input.includes('项目') || input.includes('产品') || input.includes('开发'))) {
                const section = document.querySelector('[data-section="project"]');
                processProjectInput(input, section);
                processed = true;
            }
            
            // 尝试解析为技能
            if (!processed && (input.includes('技能') || input.includes('能力') || input.includes('掌握'))) {
                const section = document.querySelector('[data-section="skills"]');
                processSkillsInput(input, section);
                processed = true;
            }
            
            // 如果无法确定具体区域，则给出提示
            if (!processed) {
                // 这里可以接入更高级的自然语言处理或AI来理解用户意图
                // 目前先用简单的方法处理
                showToast('已应用您的修改到简历');
                highlightSection(document.querySelector('[data-section="basicInfo"]'));
            }
            
            // 清空输入框
            handwritingInput.value = '';
            handwritingInput.style.height = '60px';
            
            // 隐藏加载状态
            hideLoading();
        }, 1000);
    }
    
    // 处理教育经历输入
    function processEducationInput(input, section) {
        // 这里是模拟处理，实际应用中应该调用后端API
        const schoolPattern = /(北大|清华|复旦|上海交大|浙大|南京大学|中国人民大学|武汉大学|四川大学)/;
        const majorPattern = /(计算机|软件工程|人工智能|数据科学|电子工程|通信工程|自动化)/;
        
        let newContent = section.innerHTML;
        
        // 简单的内容替换逻辑
        if (schoolPattern.test(input)) {
            const match = input.match(schoolPattern)[0];
            const fullName = getFullSchoolName(match);
            newContent = newContent.replace(/(?<=就读于)[^，。]*/, fullName);
        }
        
        if (majorPattern.test(input)) {
            const match = input.match(majorPattern)[0];
            newContent = newContent.replace(/(?<=专业)[^，。]*/, match);
        }
        
        // 应用更改
        section.innerHTML = newContent;
        highlightSection(section);
    }
    
    // 处理工作经历输入
    function processWorkInput(input, section) {
        // 模拟工作经历处理逻辑
        alert('已更新工作经历，请查看简历内容');
        highlightSection(section);
    }
    
    // 处理项目经历输入
    function processProjectInput(input, section) {
        // 模拟项目经历处理逻辑
        alert('已更新项目经历，请查看简历内容');
        highlightSection(section);
    }
    
    // 处理技能输入
    function processSkillsInput(input, section) {
        // 模拟技能处理逻辑
        alert('已更新个人技能，请查看简历内容');
        highlightSection(section);
    }
    
    // 高亮显示更新的板块
    function highlightSection(section) {
        section.style.backgroundColor = '#f0f7ff';
        setTimeout(() => {
            section.style.backgroundColor = '';
            section.style.transition = 'background-color 0.5s';
        }, 1500);
    }
    
    // 获取完整学校名称
    function getFullSchoolName(shortName) {
        const nameMap = {
            '北大': '北京大学',
            '清华': '清华大学',
            '复旦': '复旦大学',
            '上海交大': '上海交通大学',
            '浙大': '浙江大学'
        };
        return nameMap[shortName] || shortName;
    }
}

// 新增：初始化头像上传功能
function initAvatarUpload() {
    // 创建头像上传模态框
    createAvatarModal();
    
    // 获取头像元素
    const avatarSection = document.querySelector('.avatar-container');
    
    // 添加点击事件
    if (avatarSection) {
        avatarSection.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            openAvatarModal();
        });
    }
}

// 创建头像上传模态框
function createAvatarModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'avatar-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>上传头像</h2>
                <button class="close-btn" id="avatar-modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="avatar-upload-container">
                    <div class="avatar-preview">
                        <img id="avatarPreview" src="/images/default-avatar.png" alt="头像预览">
                    </div>
                    <div class="avatar-upload-btn">
                        <input type="file" id="avatarInput" accept="image/*" style="display: none;">
                        <button class="btn" id="selectAvatarBtn">选择图片</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" id="avatar-modal-cancel">取消</button>
                <button class="btn primary" id="avatar-modal-save">保存</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听
    document.getElementById('avatar-modal-close').addEventListener('click', closeAvatarModal);
    document.getElementById('avatar-modal-cancel').addEventListener('click', closeAvatarModal);
    document.getElementById('selectAvatarBtn').addEventListener('click', function() {
        document.getElementById('avatarInput').click();
    });
    
    document.getElementById('avatarInput').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                document.getElementById('avatarPreview').src = e.target.result;
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    document.getElementById('avatar-modal-save').addEventListener('click', function() {
        const previewSrc = document.getElementById('avatarPreview').src;
        document.getElementById('userAvatar').src = previewSrc;
        closeAvatarModal();
    });
}

// 打开头像上传模态框
function openAvatarModal() {
    const modal = document.getElementById('avatar-modal');
    if (modal) {
        document.getElementById('avatarPreview').src = document.getElementById('userAvatar').src;
        modal.classList.add('show');
    }
}

// 关闭头像上传模态框
function closeAvatarModal() {
    const modal = document.getElementById('avatar-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}