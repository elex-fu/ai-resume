class EditModal {
    constructor() {
        this.modal = null;
        this.currentField = null;
        this.currentElement = null;
        this.init();
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
        const style = document.createElement('style');
        style.textContent = `
            .edit-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .edit-modal-content {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                width: 600px;
                max-width: 90%;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            .edit-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }

            .edit-modal-header h3 {
                margin: 0;
                font-size: 18px;
                color: #333;
            }

            .close-modal {
                cursor: pointer;
                font-size: 24px;
                color: #666;
                background: none;
                border: none;
                padding: 0;
            }

            .form-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin: 0 20px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .form-group label {
                font-weight: bold;
                color: #333;
                font-size: 14px;
            }

            .form-group input,
            .form-group textarea {
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                transition: border-color 0.2s;
            }

            .form-group input:focus,
            .form-group textarea:focus {
                border-color: #1a73e8;
                outline: none;
            }

            .edit-modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }

            .save-btn,
            .cancel-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s;
            }

            .save-btn {
                background-color: #1a73e8;
                color: white;
            }

            .save-btn:hover {
                background-color: #1557b0;
            }

            .cancel-btn {
                background-color: #f1f1f1;
                color: #333;
            }

            .cancel-btn:hover {
                background-color: #e0e0e0;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // 关闭按钮事件
        this.modal.querySelector('.close-modal').addEventListener('click', () => this.hide());
        
        // 取消按钮事件
        this.modal.querySelector('.cancel-btn').addEventListener('click', () => this.hide());
        
        // 保存按钮事件
        this.modal.querySelector('.save-btn').addEventListener('click', () => this.save());
    }

    show(element, field) {
        this.currentElement = element;
        this.currentField = field;
        
        // 获取当前值
        const currentValue = element.textContent.trim();
        
        // 清空表单
        const formGrid = this.modal.querySelector('.form-grid');
        formGrid.innerHTML = '';
        
        // 根据字段类型创建不同的表单
        if (field === 'description') {
            // 对于描述类字段，使用textarea
            formGrid.innerHTML = `
                <div class="form-group" style="grid-column: 1 / -1;">
                    <label>${this.getFieldLabel(field)}</label>
                    <textarea rows="4">${currentValue}</textarea>
                </div>
            `;
        } else if (field.includes('Date')) {
            // 对于日期字段，使用date类型input
            formGrid.innerHTML = `
                <div class="form-group">
                    <label>${this.getFieldLabel(field)}</label>
                    <input type="date" value="${currentValue}">
                </div>
            `;
        } else if (field === 'avatar') {
            // 对于头像字段，使用file类型input
            formGrid.innerHTML = `
                <div class="form-group">
                    <label>${this.getFieldLabel(field)}</label>
                    <input type="file" accept="image/*">
                    <img src="${currentValue}" style="max-width: 100px; margin-top: 10px;">
                </div>
            `;
        } else if (field === 'email') {
            // 对于邮箱字段，使用email类型input
            formGrid.innerHTML = `
                <div class="form-group">
                    <label>${this.getFieldLabel(field)}</label>
                    <input type="email" value="${currentValue}">
                </div>
            `;
        } else if (field === 'phone') {
            // 对于手机号字段，使用tel类型input
            formGrid.innerHTML = `
                <div class="form-group">
                    <label>${this.getFieldLabel(field)}</label>
                    <input type="tel" value="${currentValue}" pattern="[0-9]{11}">
                </div>
            `;
        } else if (field === 'gender') {
            // 对于性别字段，使用select
            formGrid.innerHTML = `
                <div class="form-group">
                    <label>${this.getFieldLabel(field)}</label>
                    <select>
                        <option value="男" ${currentValue === '男' ? 'selected' : ''}>男</option>
                        <option value="女" ${currentValue === '女' ? 'selected' : ''}>女</option>
                    </select>
                </div>
            `;
        } else if (field === 'political') {
            // 对于政治面貌字段，使用select
            formGrid.innerHTML = `
                <div class="form-group">
                    <label>${this.getFieldLabel(field)}</label>
                    <select>
                        <option value="">请选择</option>
                        <option value="中共党员" ${currentValue === '中共党员' ? 'selected' : ''}>中共党员</option>
                        <option value="共青团员" ${currentValue === '共青团员' ? 'selected' : ''}>共青团员</option>
                        <option value="群众" ${currentValue === '群众' ? 'selected' : ''}>群众</option>
                    </select>
                </div>
            `;
        } else {
            // 对于普通字段，使用text类型input
            formGrid.innerHTML = `
                <div class="form-group">
                    <label>${this.getFieldLabel(field)}</label>
                    <input type="text" value="${currentValue}">
                </div>
            `;
        }
        
        this.modal.style.display = 'flex';
    }

    hide() {
        this.modal.style.display = 'none';
        this.currentElement = null;
        this.currentField = null;
    }

    save() {
        if (!this.currentElement || !this.currentField) return;
        
        const formGrid = this.modal.querySelector('.form-grid');
        let newValue;
        
        // 根据字段类型获取值
        if (this.currentField === 'description') {
            newValue = formGrid.querySelector('textarea').value.trim();
        } else if (this.currentField === 'avatar') {
            const fileInput = formGrid.querySelector('input[type="file"]');
            if (fileInput.files.length > 0) {
                // 处理文件上传
                const file = fileInput.files[0];
                // TODO: 实现文件上传逻辑
                return;
            }
            return;
        } else if (this.currentField === 'gender' || this.currentField === 'political') {
            newValue = formGrid.querySelector('select').value;
        } else {
            newValue = formGrid.querySelector('input').value.trim();
        }
        
        // 更新元素内容
        this.currentElement.textContent = newValue;
        
        // 触发自定义事件，通知其他组件数据已更新
        const event = new CustomEvent('resumeDataUpdated', {
            detail: {
                field: this.currentField,
                value: newValue,
                element: this.currentElement
            }
        });
        document.dispatchEvent(event);
        
        this.hide();
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
            'name': '项目名称',
            'role': '担任角色',
            
            // 校园经历
            'organization': '组织名称',
            'position': '职位',
            
            // 获奖经历
            'awardName': '奖项名称',
            'date': '获奖时间',
            
            // 技能特长
            'skillName': '技能名称',
            'level': '掌握程度'
        };
        
        return labels[field] || field;
    }
}

// 导出单例
export const editModal = new EditModal(); 