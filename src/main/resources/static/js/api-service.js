/**
 * api-service.js
 * 封装所有前端与后端API的交互
 */

// 导入Mock API配置
import MockAPI from './mock-api.js';

// API基础URL
const API_BASE_URL = '/api';

// API配置
export const API_CONFIG = {
    // 是否开启mock数据模式（设为true则使用模拟数据，false则请求真实后端）
    useMock: MockAPI.config.enabled,
    
    // API映射表，用于配置接口路径和对应的mock数据
    apiMap: {
        // 简历相关接口
        'resume/get': {
            url: '/resume/:id',
            method: 'GET',
            mockFile: '/mock/resume-mock-data.json',
            mockKey: null
        },
        'resume/create': {
            url: '/resume',
            method: 'POST',
            mockFile: '/mock/resume-mock-data.json',
            mockKey: 'resumeData'
        },
        'resume/update': {
            url: '/resume/:id',
            method: 'PUT',
            mockFile: '/mock/resume-mock-data.json',
            mockKey: 'resumeData'
        },
        'resume/delete': {
            url: '/resume/:id',
            method: 'DELETE',
            mockFile: '/mock/resume-mock-data.json',
            mockKey: 'resumeData'
        },
        'resume/download': {
            url: '/resume/:id/download',
            method: 'GET',
            mockFile: '/mock/resume-mock-data.json',
            mockKey: 'resumeData',
            responseType: 'blob'
        },
        'resume/upload': {
            url: '/resume/upload',
            method: 'POST',
            mockFile: '/mock/upload-mock-data.json',
            mockKey: 'uploadData'
        },
        'resume/generate': {
            url: '/resume/generate',
            method: 'POST',
            mockFile: '/mock/upload-mock-data.json',
            mockKey: 'generateData'
        },
        
        // 用户认证相关接口
        'auth/login': {
            url: '/auth/login',
            method: 'POST',
            mockFile: '/mock/auth-mock-data.json',
            mockKey: 'loginData'
        },
        'auth/register': {
            url: '/auth/register',
            method: 'POST',
            mockFile: '/mock/auth-mock-data.json',
            mockKey: 'registerData'
        }
        // 可以在此继续添加更多API
    }
};

// 错误处理函数
const handleApiError = (error) => {
    console.error('API请求错误:', error);
    throw error;
};

/**
 * 通用API请求函数
 * @param {string} apiKey - API映射表中的键名
 * @param {Object} params - 请求参数，包含路径参数、查询参数和请求体
 * @returns {Promise<any>} 请求结果
 */
const apiRequest = async (apiKey, params = {}) => {
    // 获取API配置
    const apiConfig = API_CONFIG.apiMap[apiKey];
    if (!apiConfig) {
        throw new Error(`未找到API配置: ${apiKey}`);
    }
    
    // 如果启用了mock并且有mock配置，则返回mock数据
    if (API_CONFIG.useMock && apiConfig.mockFile) {
        return getMockData(apiConfig.mockFile, apiConfig.mockKey, apiConfig.responseType);
    }
    
    // 处理URL中的路径参数 (如 /resource/:id)
    let url = apiConfig.url;
    if (params.pathParams) {
        Object.keys(params.pathParams).forEach(key => {
            url = url.replace(`:${key}`, params.pathParams[key]);
        });
    }
    
    // 处理查询参数
    if (params.queryParams) {
        const queryString = new URLSearchParams(params.queryParams).toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }
    
    // 构建请求选项
    const requestOptions = {
        method: apiConfig.method,
        headers: {
            'Content-Type': 'application/json',
            ...params.headers
        }
    };
    
    // 添加请求体
    if (params.body && apiConfig.method !== 'GET' && apiConfig.method !== 'HEAD') {
        if (params.body instanceof FormData) {
            // 如果是FormData，则不设置Content-Type，让浏览器自动处理
            delete requestOptions.headers['Content-Type'];
            requestOptions.body = params.body;
        } else {
            requestOptions.body = JSON.stringify(params.body);
        }
    }
    
    // 发送请求
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, requestOptions);
        
        if (!response.ok) {
            throw new Error(`请求失败: ${response.status} ${response.statusText}`);
        }
        
        // 根据响应类型返回不同格式
        if (params.responseType === 'blob') {
            return response.blob();
        } else if (params.responseType === 'text') {
            return response.text();
        } else {
            return response.json();
        }
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * 获取模拟数据
 * @param {string} mockFile - 模拟数据文件名
 * @param {string|null} mockKey - 数据对象中的键名
 * @param {string|null} responseType - 响应类型，如'blob'或'text'
 * @returns {Promise<any>} 模拟数据
 */
const getMockData = async (mockFile, mockKey = null, responseType = null) => {
    console.log('获取模拟数据:', mockFile, mockKey, responseType);
    try {
        // 如果需要blob数据（如PDF下载）
        if (responseType === 'blob') {
            return await MockAPI.createBinaryResponse('application/pdf');
        }
        
        // 否则返回JSON数据
        const response = await fetch(`${mockFile}`);
        if (!response.ok) {
            throw new Error(`获取模拟数据失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`getMockData mockFile= ${mockFile}, 获取到的数据:`, data);
        
        // 如果mockKey为null，直接返回整个数据
        if (mockKey === null) {
            return data;
        }
        
        // 否则尝试从数据中获取mockKey对应的值
        const result = data[mockKey];
        if (result === undefined) {
            console.warn(`未找到mockKey "${mockKey}" 对应的数据，返回整个数据对象`);
            return data;
        }
        
        // 添加延迟以模拟网络请求
        const mockResponse = await MockAPI.createResponse(result);
        return mockResponse.data;
    } catch (error) {
        console.error('获取模拟数据失败:', error);
        throw error;
    }
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
            return apiRequest('resume/get', {
                pathParams: { id }
            });
        },

        /**
         * 创建简历
         * @param {Object} resumeData - 简历数据
         * @returns {Promise<Object>} 创建的简历
         */
        createResume: async (resumeData) => {
            return apiRequest('resume/create', {
                body: resumeData
            });
        },

        /**
         * 更新简历
         * @param {number} id - 简历ID
         * @param {Object} resumeData - 简历数据
         * @returns {Promise<Object>} 更新后的简历
         */
        updateResume: async (id, resumeData) => {
            return apiRequest('resume/update', {
                pathParams: { id },
                body: resumeData
            });
        },

        /**
         * 删除简历
         * @param {number} id - 简历ID
         * @returns {Promise<void>}
         */
        deleteResume: async (id) => {
            return apiRequest('resume/delete', {
                pathParams: { id }
            });
        },

        /**
         * 生成简历PDF
         * @param {number} id - 简历ID
         * @returns {Promise<Blob>} PDF文件Blob对象
         */
        generatePDF: async (id) => {
            return apiRequest('resume/download', {
                pathParams: { id },
                responseType: 'blob'
            });
        },

        /**
         * 上传简历文件
         * @param {File} file - 文件对象
         * @returns {Promise<Object>} 上传结果
         */
        uploadResume: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            
            return apiRequest('resume/upload', {
                body: formData
            });
        },

        /**
         * AI生成简历
         * @param {string} content - 简历内容
         * @param {File} [file] - 可选文件
         * @returns {Promise<Object>} 生成的简历
         */
        generateResume: async (content, file = null) => {
            const formData = new FormData();
            if (content) {
                formData.append('content', content);
            }
            if (file) {
                formData.append('file', file);
            }
            
            return apiRequest('resume/generate', {
                body: formData
            });
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
            return apiRequest('auth/login', {
                body: { username, password }
            });
        },

        /**
         * 用户注册
         * @param {Object} userData - 用户数据
         * @returns {Promise<Object>} 注册结果
         */
        register: async (userData) => {
            return apiRequest('auth/register', {
                body: userData
            });
        }
    }
};

// 导出API服务
export default ApiService; 