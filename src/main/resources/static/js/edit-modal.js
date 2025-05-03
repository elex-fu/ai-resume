class EditModal {
    constructor() {
        this.modal = null;
        this.currentSection = null;  // 当前编辑的区域类型
        this.currentIndex = -1;      // 当前编辑的项目索引（用于数组类型数据）
        this.cropperLoaded = false;
        this.init();
        this.initEditableSections();
    }

    init() {
        // 创建弹窗HTML结构
        const modalHTML = `
            <div class="edit-modal" style="display: none;">
                <div class="edit-modal-content">
                    <div class="edit-modal-header">
                        <h3>编辑信息</h3>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="edit-modal-body">
                        <form id="editForm">
                            <div class="form-grid">
                                <!-- 表单内容将通过JavaScript动态添加 -->
                            </div>
                        </form>
                    </div>
                    <div class="edit-modal-footer">
                        <button class="save-btn">保存</button>
                        <button class="cancel-btn">取消</button>
                    </div>
                </div>
            </div>
        `;

        // 添加弹窗到body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.querySelector('.edit-modal');

        // 添加样式
        this.addStyles();

        // 绑定事件
        this.bindEvents();
    }

    addStyles() {
        // 加载编辑弹窗样式
        const modalStyle = document.createElement('link');
        modalStyle.rel = 'stylesheet';
        modalStyle.href = '/css/edit-modal.css';
        document.head.appendChild(modalStyle);

        // 加载头像上传样式
        const avatarStyle = document.createElement('link');
        avatarStyle.rel = 'stylesheet';
        avatarStyle.href = '/css/avatar-upload.css';
        document.head.appendChild(avatarStyle);
    }

    bindEvents() {
        // 关闭按钮事件
        this.modal.querySelector('.close-modal').addEventListener('click', () => this.hide());
        
        // 取消按钮事件
        this.modal.querySelector('.cancel-btn').addEventListener('click', () => this.hide());
        
        // 保存按钮事件
        this.modal.querySelector('.save-btn').addEventListener('click', () => this.save());
    }

    initEditableSections() {
        // 为所有可编辑区域添加点击事件
        document.addEventListener('click', (e) => {
            const editableSection = e.target.closest('.editable-section');
            if (editableSection) {
                const sectionType = editableSection.dataset.section;
                if (sectionType) {
                    // 获取当前编辑项的索引（如果是列表项）
                    const items = document.querySelectorAll(`[data-section="${sectionType}"]`);
                    this.currentIndex = Array.from(items).indexOf(editableSection);
                    this.currentSection = sectionType;
                    this.showEditForm(sectionType);
                }
            }
        });
    }

    showEditForm(sectionType) {
        // 清空表单
        const formGrid = this.modal.querySelector('.form-grid');
        formGrid.innerHTML = '';
        
        // 更新模态框标题
        const modalTitle = this.modal.querySelector('.edit-modal-header h3');
        modalTitle.textContent = this.getModalTitle(sectionType);
        
        // 根据不同的区域类型创建不同的表单
        switch (sectionType) {
            case 'avatar':
                formGrid.innerHTML = this.createAvatarUploadForm();
                this.initAvatarUpload();
                break;
            case 'basic':
                formGrid.innerHTML = this.createBasicInfoForm();
                break;
            case 'jobIntention':
                formGrid.innerHTML = this.createJobIntentionForm();
                break;
            case 'education':
                formGrid.innerHTML = this.createEducationForm();
                break;
            case 'work':
                formGrid.innerHTML = this.createWorkForm();
                break;
            case 'project':
                formGrid.innerHTML = this.createProjectForm();
                break;
            case 'skills':
                formGrid.innerHTML = this.createSkillsForm();
                break;
        }
        
        this.modal.style.display = 'flex';
    }

    getModalTitle(sectionType) {
        const titles = {
            'avatar': '上传头像',
            'basic': '编辑基本信息',
            'jobIntention': '编辑求职意向',
            'education': '编辑教育经历',
            'work': '编辑工作经历',
            'project': '编辑项目经历',
            'skills': '编辑技能特长'
        };
        return titles[sectionType] || '编辑信息';
    }

    createAvatarUploadForm() {
        const currentAvatar = window.resumeData?.basicInfo?.avatar || '/images/default-avatar.png';
        return `
            <div class="avatar-upload-container">
                <div class="avatar-preview">
                    <img src="${currentAvatar}" alt="头像预览" id="avatarPreview">
                </div>
                <input type="file" id="avatarInput" accept="image/*" style="display: none;">
                <button type="button" class="avatar-upload-button">选择图片</button>
                <p class="upload-tip">支持 jpg、png 格式，大小不超过 2M</p>
            </div>
            <div class="cropper-container" style="display: none;">
                <div class="cropper-preview"></div>
                <div class="cropper-buttons">
                    <button type="button" class="cropper-button" id="confirmCrop">确认</button>
                    <button type="button" class="cropper-button cancel" id="cancelCrop">取消</button>
                </div>
            </div>
        `;
    }

    async loadCropper() {
        if (this.cropperLoaded) return;

        return new Promise((resolve, reject) => {
            // 加载 CSS
            const cropperCSS = document.createElement('link');
            cropperCSS.rel = 'stylesheet';
            cropperCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css';
            document.head.appendChild(cropperCSS);

            // 加载 JavaScript
            const cropperScript = document.createElement('script');
            cropperScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js';
            cropperScript.onload = () => {
                this.cropperLoaded = true;
                resolve();
            };
            cropperScript.onerror = reject;
            document.head.appendChild(cropperScript);
        });
    }

    async initAvatarUpload() {
        // 确保 Cropper.js 已加载
        try {
            await this.loadCropper();
        } catch (error) {
            console.error('加载 Cropper.js 失败:', error);
            alert('加载图片裁剪工具失败，请刷新页面重试');
            return;
        }

        const container = this.modal.querySelector('.avatar-upload-container');
        const input = this.modal.querySelector('#avatarInput');
        const preview = this.modal.querySelector('#avatarPreview');
        const cropperContainer = this.modal.querySelector('.cropper-container');
        let cropper = null;

        // 点击容器触发文件选择
        container.addEventListener('click', () => input.click());

        // 文件选择变化时预览
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert('图片大小不能超过2M');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    // 隐藏上传容器，显示裁剪容器
                    container.style.display = 'none';
                    cropperContainer.style.display = 'block';
                    
                    // 创建图片元素用于裁剪
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    cropperContainer.querySelector('.cropper-preview').innerHTML = '';
                    cropperContainer.querySelector('.cropper-preview').appendChild(img);
                    
                    // 初始化裁剪器
                    if (cropper) {
                        cropper.destroy();
                    }
                    cropper = new Cropper(img, {
                        aspectRatio: 1,
                        viewMode: 1,
                        dragMode: 'move',
                        autoCropArea: 1,
                        cropBoxMovable: false,
                        cropBoxResizable: false,
                        guides: false,
                        center: false,
                        highlight: false,
                        background: false
                    });
                };
                reader.readAsDataURL(file);
            }
        });

        // 确认裁剪
        this.modal.querySelector('#confirmCrop').addEventListener('click', () => {
            if (!cropper) return;
            
            // 获取裁剪后的图片数据
            const canvas = cropper.getCroppedCanvas({
                width: 200,
                height: 200
            });
            
            // 转换为base64
            const croppedImageData = canvas.toDataURL('image/jpeg');
            
            // 更新预览图
            preview.src = croppedImageData;
            
            // 更新简历数据
            this.updateResumeAvatar(croppedImageData);
            
            // 销毁裁剪器并重置显示
            cropper.destroy();
            cropper = null;
            container.style.display = 'flex';
            cropperContainer.style.display = 'none';
        });

        // 取消裁剪
        this.modal.querySelector('#cancelCrop').addEventListener('click', () => {
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            container.style.display = 'flex';
            cropperContainer.style.display = 'none';
        });
    }

    updateResumeAvatar(imageData) {
        if (!window.resumeData) {
            window.resumeData = { basicInfo: {} };
        } else if (!window.resumeData.basicInfo) {
            window.resumeData.basicInfo = {};
        }

        // 更新简历数据中的头像
        window.resumeData.basicInfo.avatar = imageData;

        // 触发数据更新事件
        const event = new CustomEvent('resumeDataUpdated', {
            detail: {
                section: 'basic',
                field: 'avatar',
                value: imageData
            }
        });
        document.dispatchEvent(event);

        // 重新渲染简历
        if (window.templateManager) {
            window.templateManager.renderResumeData(window.resumeData);
        }
    }

    createBasicInfoForm() {
        return `
            <div class="form-group">
                <span>姓名</span>
                <input type="text" name="name" value="${this.getFieldValue('name')}">
            </div>
            <div class="form-group">
                <span>性别</span>
                <select name="gender">
                    <option value="男" ${this.getFieldValue('gender') === '男' ? 'selected' : ''}>男</option>
                    <option value="女" ${this.getFieldValue('gender') === '女' ? 'selected' : ''}>女</option>
                </select>
            </div>
            <div class="form-group">
                <span>年龄</span>
                <input type="number" name="age" value="${this.getFieldValue('age')}">
            </div>
            <div class="form-group">
                <span>学历</span>
                <input type="text" name="educationLevel" value="${this.getFieldValue('educationLevel')}">
            </div>
            <div class="form-group">
                <span>经验</span>
                <input type="text" name="experience" value="${this.getFieldValue('experience')}">
            </div>
            <div class="form-group">
                <span>状态</span>
                <input type="text" name="status" value="${this.getFieldValue('status')}">
            </div>
            <div class="form-group">
                <span>电话</span>
                <input type="tel" name="phone" value="${this.getFieldValue('phone')}">
            </div>
            <div class="form-group">
                <span>邮箱</span>
                <input type="email" name="email" value="${this.getFieldValue('email')}">
            </div>
        `;
    }

    createJobIntentionForm() {
        return `
            <div class="form-group">
                <span>职位</span>
                <input type="text" name="position" value="${this.getFieldValue('position')}">
            </div>
            <div class="form-group">
                <span>城市</span>
                <input type="text" name="city" value="${this.getFieldValue('city')}">
            </div>
            <div class="form-group">
                <span>薪资</span>
                <input type="text" name="salary" value="${this.getFieldValue('salary')}">
            </div>
            <div class="form-group">
                <span>到岗</span>
                <input type="text" name="entryTime" value="${this.getFieldValue('entryTime')}">
            </div>
        `;
    }

    createEducationForm() {
        return `
            <div class="form-group">
                <span>学校</span>
                <input type="text" name="school" value="${this.getFieldValue('school')}">
            </div>
            <div class="form-group">
                <span>专业</span>
                <input type="text" name="major" value="${this.getFieldValue('major')}">
            </div>
            <div class="form-group">
                <span>学位</span>
                <input type="text" name="degree" value="${this.getFieldValue('degree')}">
            </div>
            <div class="form-group">
                <span>绩点</span>
                <input type="text" name="gpa" value="${this.getFieldValue('gpa')}">
            </div>
            <div class="form-group">
                <span>开始</span>
                <input type="month" name="startDate" value="${this.formatDateForInput(this.getFieldValue('startDate'))}" placeholder="YYYY.MM">
            </div>
            <div class="form-group">
                <span>结束</span>
                <input type="month" name="endDate" value="${this.formatDateForInput(this.getFieldValue('endDate'))}" placeholder="YYYY.MM">
            </div>
            <div class="form-group">
                <span>排名</span>
                <input type="text" name="rank" value="${this.getFieldValue('rank')}">
            </div>
            <div class="form-group full-width">
                <label>在校经历描述</label>
                <textarea name="description" rows="4" placeholder="请详细描述您的在校经历、成绩、获奖情况等">${this.getFieldValue('description')}</textarea>
            </div>
        `;
    }

    createWorkForm() {
        return `
            <div class="form-group">
                <span>公司</span>
                <input type="text" name="company" value="${this.getFieldValue('company')}">
            </div>
            <div class="form-group">
                <span>部门</span>
                <input type="text" name="department" value="${this.getFieldValue('department')}">
            </div>
            <div class="form-group">
                <span>职位</span>
                <input type="text" name="position" value="${this.getFieldValue('position')}">
            </div>
            <div class="form-group">
                <span>开始</span>
                <input type="month" name="startDate" value="${this.formatDateForInput(this.getFieldValue('startDate'))}" placeholder="YYYY.MM">
            </div>
            <div class="form-group">
                <span>结束</span>
                <input type="month" name="endDate" value="${this.formatDateForInput(this.getFieldValue('endDate'))}" placeholder="YYYY.MM">
            </div>
            <div class="form-group full-width">
                <label>工作内容描述</label>
                <textarea name="description" rows="4" placeholder="请详细描述您的工作职责、成果、业绩等">${this.getFieldValue('description')}</textarea>
            </div>
        `;
    }

    createProjectForm() {
        return `
            <div class="form-group">
                <span>项目</span>
                <input type="text" name="name" value="${this.getFieldValue('name')}">
            </div>
            <div class="form-group">
                <span>角色</span>
                <input type="text" name="role" value="${this.getFieldValue('role')}">
            </div>
            <div class="form-group">
                <span>开始</span>
                <input type="month" name="startDate" value="${this.formatDateForInput(this.getFieldValue('startDate'))}" placeholder="YYYY.MM">
            </div>
            <div class="form-group">
                <span>结束</span>
                <input type="month" name="endDate" value="${this.formatDateForInput(this.getFieldValue('endDate'))}" placeholder="YYYY.MM">
            </div>
            <div class="form-group full-width">
                <label>项目描述</label>
                <textarea name="description" rows="4" placeholder="请详细描述项目背景、您的职责、技术方案、取得的成果等">${this.getFieldValue('description')}</textarea>
            </div>
        `;
    }

    createSkillsForm() {
        return `
            <div class="form-group">
                <span>技能</span>
                <input type="text" name="name" value="${this.getFieldValue('name')}">
            </div>
            <div class="form-group">
                <span>等级</span>
                <select name="level" value="${this.getFieldValue('level')}">
                    <option value="精通">精通</option>
                    <option value="熟练">熟练</option>
                    <option value="良好">良好</option>
                    <option value="一般">一般</option>
                </select>
            </div>
            <div class="form-group full-width">
                <label>技能描述</label>
                <textarea name="description" rows="4" placeholder="请详细描述该技能的应用场景、项目经验等">${this.getFieldValue('description')}</textarea>
            </div>
        `;
    }

    getFieldValue(fieldName) {
        if (!window.resumeData) return '';

        const sectionMap = {
            'basic': 'basicInfo',
            'jobIntention': 'jobIntention',
            'education': 'educationList',
            'work': 'workList',
            'project': 'projectList',
            'skills': 'skillList'
        };

        const section = sectionMap[this.currentSection];
        if (!section) return '';

        if (Array.isArray(window.resumeData[section])) {
            // 如果是数组类型的数据（如教育经历、工作经历等）
            if (this.currentIndex >= 0 && this.currentIndex < window.resumeData[section].length) {
                return window.resumeData[section][this.currentIndex][fieldName] || '';
            }
            return '';
        } else {
            // 如果是对象类型的数据（如基本信息、求职意向）
            return window.resumeData[section][fieldName] || '';
        }
    }

    hide() {
        this.modal.style.display = 'none';
        this.currentSection = null;
        this.currentIndex = -1;
    }

    save() {
        const formData = this.getFormData();
        if (!formData) return;

        const sectionMap = {
            'basic': 'basicInfo',
            'jobIntention': 'jobIntention',
            'education': 'educationList',
            'work': 'workList',
            'project': 'projectList',
            'skills': 'skillList'
        };

        const section = sectionMap[this.currentSection];
        if (!section) return;

        if (Array.isArray(window.resumeData[section])) {
            // 更新数组类型的数据
            if (this.currentIndex >= 0) {
                window.resumeData[section][this.currentIndex] = {
                    ...window.resumeData[section][this.currentIndex],
                    ...formData
                };
            } else {
                // 新增项目
                window.resumeData[section].push(formData);
            }
        } else {
            // 更新对象类型的数据
            window.resumeData[section] = {
                ...window.resumeData[section],
                ...formData
            };
        }

        // 触发数据更新事件
        const event = new CustomEvent('resumeDataUpdated', {
            detail: {
                section: this.currentSection,
                data: window.resumeData[section]
            }
        });
        document.dispatchEvent(event);

        // 重新渲染简历
        if (window.templateManager) {
            window.templateManager.renderResumeData(window.resumeData);
        }
        
        this.hide();
    }

    getFormData() {
        const form = this.modal.querySelector('form');
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.type === 'file') return; // 跳过文件输入
            formData[input.name] = input.value.trim();
        });

        return formData;
    }

    getFieldLabel(field) {
        const labels = {
            // 基本信息
            'name': '姓名',
            'avatar': '头像',
            'position': '职位',
            'gender': '性别',
            'age': '年龄',
            'political': '政治面貌',
            'educationLevel': '学历',
            'experience': '工作经验',
            'status': '求职状态',
            'phone': '手机号码',
            'email': '邮箱',
            'location': '所在地',
            
            // 求职意向
            'jobPosition': '期望职位',
            'city': '期望城市',
            'salary': '期望薪资',
            'entryTime': '到岗时间',
            
            // 教育经历
            'school': '学校',
            'major': '专业',
            'degree': '学历',
            'startDate': '开始时间',
            'endDate': '结束时间',
            'gpa': 'GPA',
            'rank': '排名',
            'description': '描述',
            
            // 工作经历
            'company': '公司',
            'department': '部门',
            'workPosition': '职位',
            
            // 项目经历
            // 'name': '项目名称',
            'role': '担任角色',
            
            // 校园经历
            'organization': '组织名称',
            // 'position': '职位',
            
            // 获奖经历
            'awardName': '奖项名称',
            'date': '获奖时间',
            
            // 技能特长
            'skillName': '技能名称',
            'level': '掌握程度'
        };
        
        return labels[field] || field;
    }

    formatDateForInput(dateStr) {
        if (!dateStr) return '';
        // 将 "2014.9" 转换为 "2014-09" 格式
        const [year, month] = dateStr.split('.');
        return `${year}-${month.padStart(2, '0')}`;
    }

    formatDateForData(inputDate) {
        if (!inputDate) return '';
        // 将 "2014-09" 转换为 "2014.9" 格式
        const [year, month] = inputDate.split('-');
        return `${year}.${parseInt(month)}`;
    }

    render() {
        // ... existing code ...
        const dateInputs = this.modalElement.querySelectorAll('input[type="month"]');
        dateInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const formattedDate = this.formatDateForData(e.target.value);
                this.formData[e.target.name] = formattedDate;
            });
        });
        // ... existing code ...
    }

    getTemplate() {
        return `
            // ... existing code ...
            <div class="form-group">
                <span>开始</span>
                <input type="month" name="startDate" value="${this.formatDateForInput(this.getFieldValue('startDate'))}" placeholder="YYYY.MM">
            </div>
            <div class="form-group">
                <span>结束</span>
                <input type="month" name="endDate" value="${this.formatDateForInput(this.getFieldValue('endDate'))}" placeholder="YYYY.MM">
            </div>
            // ... existing code ...
        `;
    }
}

// 导出单例
export const editModal = new EditModal(); 