// 设置TextEncoder和TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 设置全局 fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
            templates: [
                {
                    id: 'default',
                    name: '默认模板',
                    description: '简洁的默认简历模板',
                    primaryColor: '#1a73e8'
                }
            ]
        }),
        text: () => Promise.resolve(`
            .resume-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
        `)
    })
);

// 设置DOM模拟
const { JSDOM } = require('jsdom');
const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
        <body>
            <div id="resumePreview">
                <div class="resume-container">
                    <div class="basic-info">
                        <div class="avatar-container">
                            <img data-bind="basic.avatar" alt="头像">
                        </div>
                        <div class="info-content">
                            <h1 data-bind="basic.name"></h1>
                            <p data-bind="basic.gender"></p>
                            <p data-bind="basic.phone"></p>
                            <p data-bind="basic.email"></p>
                        </div>
                    </div>
                    <div class="education">
                        <h2>教育经历</h2>
                        <div data-bind="education.map(item => \`
                            <div class='education-item'>
                                <h3>\${item.school}</h3>
                                <p>\${item.major}</p>
                                <p>\${item.degree}</p>
                                <p>\${item.time}</p>
                            </div>
                        \`)"></div>
                    </div>
                    <div class="skills">
                        <h2>技能特长</h2>
                        <div data-bind="skills.map(item => \`
                            <div class='skill-item'>
                                <span>\${item.name}</span>
                                <div class='skill-progress' style='width: \${item.level}%'></div>
                            </div>
                        \`)"></div>
                    </div>
                </div>
            </div>
        </body>
    </html>
`);

global.document = dom.window.document;
global.window = dom.window;
global.navigator = dom.window.navigator;

// 添加DOM操作方法
const originalQuerySelector = document.querySelector;
const originalQuerySelectorAll = document.querySelectorAll;

document.querySelector = function(selector) {
    const element = originalQuerySelector.call(this, selector);
    if (element) return element;
    
    // 如果是预览容器选择器
    if (selector === '#resumePreview') {
        return document.getElementById('resumePreview');
    }
    return null;
};

document.querySelectorAll = function(selector) {
    return originalQuerySelectorAll.call(this, selector);
}; 