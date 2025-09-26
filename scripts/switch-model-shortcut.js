// 模型切换快捷键
document.addEventListener('keydown', function(event) {
    // 监听 Ctrl+Shift+M
    if ((event.ctrlKey || event.metaKey) && 
        event.key.toLowerCase() === 'm' && 
        event.shiftKey && 
        !event.altKey) {
        
        event.preventDefault();
        
        // 尝试多种选择器来查找模型切换按钮
        let targetButton = null;
        
        // 方法1: 根据新的HTML结构查找包含模型名称的按钮
        targetButton = document.querySelector('button .ModelName-gsPzDl');
        if (targetButton) {
            // 获取父级button元素
            targetButton = targetButton.closest('button');
        }
        
        // 方法2: 查找包含DeepSeek或其他模型名称的按钮
        if (!targetButton) {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
                const text = button.textContent || button.innerText;
                if (text && (text.includes('DeepSeek') || text.includes('GPT') || text.includes('Claude') || text.includes('模型'))) {
                    targetButton = button;
                    break;
                }
            }
        }
        
        // 方法3: 查找包含ant-btn类的下拉按钮
        if (!targetButton) {
            targetButton = document.querySelector('button.ant-btn[class*="DropdownButton"]');
        }
        
        // 方法4: 兜底方案 - 查找包含chevrons-up-down图标的按钮
        if (!targetButton) {
            const chevronIcons = document.querySelectorAll('svg.lucide-chevrons-up-down');
            if (chevronIcons.length > 0) {
                targetButton = chevronIcons[0].closest('button');
            }
        }
        
        if (targetButton) {
            console.log('找到模型切换按钮，正在点击...');
            targetButton.click();
        } else {
            console.log('未找到模型切换按钮');
        }
    }
});
