/**
 * mock-api.js
 * 集中管理所有模拟数据和接口配置
 */

// Mock配置
export const MOCK_CONFIG = {
    // 全局开关：是否启用模拟数据
    enabled: true,
    
    // 模拟数据延迟（毫秒）- 模拟网络延迟
    delay: 300,
    
    // 模拟文件存储路径
    basePath: '/mock/',
    
    // 模拟数据文件列表
    mockFiles: {
        resume: 'resume-mock-data.json',
        auth: 'auth-mock-data.json',
        upload: 'upload-mock-data.json'
    }
};

/**
 * 根据配置创建模拟响应
 * @param {Object} data - 响应数据
 * @param {number} [status=200] - HTTP状态码
 * @param {number} [delay=MOCK_CONFIG.delay] - 延迟时间（毫秒）
 * @returns {Promise<any>} 模拟响应
 */
export const createMockResponse = (data, status = 200, delay = MOCK_CONFIG.delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                status,
                data,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Mock-Data': 'true'
                }
            });
        }, delay);
    });
};

/**
 * 创建模拟错误响应
 * @param {string} message - 错误消息
 * @param {number} [status=500] - HTTP状态码
 * @param {number} [delay=MOCK_CONFIG.delay] - 延迟时间（毫秒）
 * @returns {Promise<any>} 模拟错误响应
 */
export const createMockErrorResponse = (message, status = 500, delay = MOCK_CONFIG.delay) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject({
                status,
                message,
                timestamp: new Date().toISOString()
            });
        }, delay);
    });
};

/**
 * 创建模拟二进制数据响应（如PDF文件）
 * @param {string} [type='application/pdf'] - MIME类型
 * @param {number} [delay=MOCK_CONFIG.delay] - 延迟时间（毫秒）
 * @returns {Promise<Blob>} Blob对象
 */
export const createMockBinaryResponse = (type = 'application/pdf', delay = MOCK_CONFIG.delay) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 创建一个简单的文本内容作为二进制数据
            const content = `This is a mock ${type} file generated at ${new Date().toISOString()}`;
            const blob = new Blob([content], { type });
            resolve(blob);
        }, delay);
    });
};

// 导出接口配置和工具函数
export default {
    config: MOCK_CONFIG,
    createResponse: createMockResponse,
    createErrorResponse: createMockErrorResponse,
    createBinaryResponse: createMockBinaryResponse
}; 