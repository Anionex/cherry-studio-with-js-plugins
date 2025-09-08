(function() {
    if (window.cherryStudioTabSwitchInitialized) return;
    window.cherryStudioTabSwitchInitialized = true;

    function getTabTitles() {
        return Array.from(document.querySelectorAll('span.TabTitle-fWxyzo'));
    }

    function switchToTab(index) {
        const tabTitles = getTabTitles();
        
        if (index < 0 || index >= tabTitles.length) return false;
        
        const targetTabTitle = tabTitles[index];
        try {
            targetTabTitle.click();
            return true;
        } catch (error) {
            return false;
        }
    }

    function showAvailableTabs() {
        const tabTitles = getTabTitles();
        
        if (tabTitles.length === 0) return;
        
        console.log(`可用 ${tabTitles.length} 个Tab:`);
        tabTitles.forEach((tabTitle, index) => {
            console.log(`  ${index + 1}. "${tabTitle.textContent.trim()}"`);
        });
    }

    document.addEventListener('keydown', function(event) {
        const isModKey = event.metaKey || event.altKey;
        
        if (isModKey && !event.ctrlKey && !event.shiftKey) {
            const key = event.key;
            
            if (key >= '1' && key <= '9') {
                event.preventDefault();
                event.stopPropagation();
                
                const tabIndex = parseInt(key) - 1;
                switchToTab(tabIndex);
            }
        }
        
        if ((event.metaKey || event.altKey) && event.key === 't') {
            event.preventDefault();
            showAvailableTabs();
        }
        
        if ((event.metaKey || event.altKey) && (event.key === '?' || event.key === '/')) {
            if (event.shiftKey || event.key === '?') {
                event.preventDefault();
                // 触发快捷键帮助
                const helpEvent = new KeyboardEvent('keydown', {
                    key: '?',
                    metaKey: true,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(helpEvent);
            }
        }
    });

    function init() {
        // 初始化时不显示日志
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 1000);
        });
    } else {
        setTimeout(init, 1000);
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            // 页面变化时不显示日志
        }
    }).observe(document, { subtree: true, childList: true });
})();