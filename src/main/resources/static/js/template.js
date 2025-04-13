class TemplateManager {
    constructor(options = {}) {
        this.isTemplateEnabled = options.isTemplateEnabled || false;
        this.preventStyleOverride = options.preventStyleOverride || true;
        this.currentTemplate = null;
        this.templates = {};
    }
    
    init() {
        if (!this.isTemplateEnabled) {
            console.log('模板功能已禁用');
            return;
        }
        
        if (this.preventStyleOverride) {
            console.log('样式覆盖保护已启用');
            this.protectStyles();
        }
        
        // ... existing code ...
    }
    
    protectStyles() {
        const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
        styleElements.forEach(style => {
            style.setAttribute('data-protected', 'true');
        });
    }
    
    // ... existing code ...
} 