/**
 * api-service.js
 * 封装所有前端与后端API的交互
 */

// API基础URL
const API_BASE_URL = '/api';

// 错误处理函数
const handleApiError = (error) => {
    console.error('API请求错误:', error);
    throw error;
};

// API服务对象
const ApiService = {
    /**
     * 简历相关接口
     */
    resume: {
        /**
         * 获取简历数据
         * @param {number} id - 简历ID
         * @returns {Promise<Object>} 简历数据
         */
        getResumeById: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/resume/${id}`);
                if (!response.ok) {
                    throw new Error('获取简历数据失败');
                }
                return await response.json();
            } catch (error) {
                console.warn('从API获取简历失败，将使用本地模拟数据:', error.message);
                // 从本地模拟数据获取
                return ApiService.resume.getMockResumeData();
            }
        },

        /**
         * 获取本地模拟简历数据
         * @returns {Promise<Object>} 本地模拟简历数据
         */
        getMockResumeData: async () => {
            try {
                const response = await fetch('/js/resume-mock-data.json');
                if (!response.ok) {
                    throw new Error('获取模拟数据失败');
                }
                const data = await response.json();
                return data.resumeData;
            } catch (error) {
                console.error('获取模拟数据失败:', error);
                throw error;
            }
        },

        /**
         * 创建简历
         * @param {Object} resumeData - 简历数据
         * @returns {Promise<Object>} 创建的简历
         */
        createResume: async (resumeData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/resume`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(resumeData)
                });
                
                if (!response.ok) {
                    throw new Error('创建简历失败');
                }
                
                return await response.json();
            } catch (error) {
                return handleApiError(error);
            }
        },

        /**
         * 更新简历
         * @param {number} id - 简历ID
         * @param {Object} resumeData - 简历数据
         * @returns {Promise<Object>} 更新后的简历
         */
        updateResume: async (id, resumeData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/resume/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(resumeData)
                });
                
                if (!response.ok) {
                    throw new Error('更新简历失败');
                }
                
                return await response.json();
            } catch (error) {
                return handleApiError(error);
            }
        },

        /**
         * 删除简历
         * @param {number} id - 简历ID
         * @returns {Promise<void>}
         */
        deleteResume: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/resume/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error('删除简历失败');
                }
            } catch (error) {
                return handleApiError(error);
            }
        },

        /**
         * 生成简历PDF
         * @param {number} id - 简历ID
         * @returns {Promise<Blob>} PDF文件Blob对象
         */
        generatePDF: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/resume/${id}/download`);
                
                if (!response.ok) {
                    throw new Error('生成PDF失败');
                }
                
                return await response.blob();
            } catch (error) {
                return handleApiError(error);
            }
        },

        /**
         * 上传简历文件
         * @param {File} file - 文件对象
         * @returns {Promise<Object>} 上传结果
         */
        uploadResume: async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await fetch(`${API_BASE_URL}/resume/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('上传简历失败');
                }
                
                return await response.json();
            } catch (error) {
                return handleApiError(error);
            }
        },

        /**
         * AI生成简历
         * @param {string} content - 简历内容
         * @param {File} [file] - 可选文件
         * @returns {Promise<Object>} 生成的简历
         */
        generateResume: async (content, file = null) => {
            try {
                const formData = new FormData();
                if (content) {
                    formData.append('content', content);
                }
                if (file) {
                    formData.append('file', file);
                }
                
                const response = await fetch(`${API_BASE_URL}/resume/generate`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('生成简历失败');
                }
                
                return await response.json();
            } catch (error) {
                return handleApiError(error);
            }
        }
    },

    /**
     * 用户认证相关接口
     */
    auth: {
        /**
         * 用户登录
         * @param {string} username - 用户名
         * @param {string} password - 密码
         * @returns {Promise<Object>} 登录结果
         */
        login: async (username, password) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                if (!response.ok) {
                    throw new Error('登录失败');
                }
                
                return await response.json();
            } catch (error) {
                return handleApiError(error);
            }
        },

        /**
         * 用户注册
         * @param {Object} userData - 用户数据
         * @returns {Promise<Object>} 注册结果
         */
        register: async (userData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    throw new Error('注册失败');
                }
                
                return await response.json();
            } catch (error) {
                return handleApiError(error);
            }
        }
    }
}; 