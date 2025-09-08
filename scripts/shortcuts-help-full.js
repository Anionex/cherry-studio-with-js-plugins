// 快捷键展示页面
(function() {
    console.log('开始加载快捷键帮助脚本...');
    
    if (window.shortcutsHelpInitialized) {
        console.log('快捷键帮助脚本已经加载过，跳过');
        return;
    }
    window.shortcutsHelpInitialized = true;
    console.log('快捷键帮助脚本初始化完成');

    // 获取 Cherry Studio 原生快捷键配置
    function getCherryStudioShortcuts() {
        console.log('开始获取 Cherry Studio 快捷键配置...');
        
        try {
            // 尝试多种方式获取 Redux store
            let store = null;
            
            // 方式1: 通过 Redux DevTools
            if (window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.getStore) {
                store = window.__REDUX_DEVTOOLS_EXTENSION__.getStore();
                console.log('通过 Redux DevTools 获取 store:', store);
            }
            
            // 方式2: 直接从全局变量获取
            if (!store && window.reduxStore) {
                store = window.reduxStore;
                console.log('通过全局变量获取 store:', store);
            }
            
            // 方式3: 尝试从 React 开发者工具获取
            if (!store && window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers) {
                const renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
                for (const [key, renderer] of renderers) {
                    if (renderer && renderer._dispatcher && renderer._dispatcher._store) {
                        store = renderer._dispatcher._store;
                        console.log('通过 React DevTools 获取 store:', store);
                        break;
                    }
                }
            }
            
            // 方式4: 尝试从 DOM 节点获取
            if (!store) {
                const rootElement = document.querySelector('#root');
                if (rootElement && rootElement._reactRootContainer && rootElement._reactRootContainer._internalRoot) {
                    const fiber = rootElement._reactRootContainer._internalRoot.current;
                    if (fiber && fiber.memoizedProps && fiber.memoizedProps.store) {
                        store = fiber.memoizedProps.store;
                        console.log('通过 DOM 节点获取 store:', store);
                    }
                }
            }
            
            if (store && store.getState) {
                const state = store.getState();
                console.log('获取到 state:', state);
                
                if (state && state.shortcuts && state.shortcuts.shortcuts) {
                    console.log('成功获取快捷键配置:', state.shortcuts.shortcuts);
                    return state.shortcuts.shortcuts;
                } else {
                    console.log('state 中没有找到 shortcuts:', state);
                }
            } else {
                console.log('无法获取 store 或 store 没有 getState 方法');
            }
            
            // 方式5: 尝试通过 window 对象获取其他可能的 store
            const possibleStoreKeys = ['store', 'appStore', 'globalStore', '__STORE__'];
            for (const key of possibleStoreKeys) {
                if (window[key] && window[key].getState) {
                    const state = window[key].getState();
                    console.log(`通过 window.${key} 获取 state:`, state);
                    if (state && state.shortcuts && state.shortcuts.shortcuts) {
                        console.log(`成功通过 window.${key} 获取快捷键配置:`, state.shortcuts.shortcuts);
                        return state.shortcuts.shortcuts;
                    }
                }
            }
            
            console.log('所有方法都失败了，返回空数组');
            return [];
        } catch (error) {
            console.error('获取 Cherry Studio 快捷键配置时出错:', error);
            return [];
        }
    }

    // 格式化快捷键显示
    function formatShortcut(shortcut) {
        if (!shortcut || !shortcut.shortcut || shortcut.shortcut.length === 0) {
            return '';
        }
        
        return shortcut.shortcut.map(key => {
            switch (key.toLowerCase()) {
                case 'control':
                case 'ctrl':
                    return '⌃';
                case 'command':
                    return '⌘';
                case 'alt':
                    return '⌥';
                case 'shift':
                    return '⇧';
                case 'commandorcontrol':
                    return '⌘';
                case 'meta':
                    return '⌘';
                default:
                    return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
            }
        }).join(' + ');
    }

    // 创建快捷键帮助界面
    function createShortcutsHelp() {
        console.log('开始创建快捷键帮助界面...');
        
        // 移除已存在的帮助界面
        const existingHelp = document.getElementById('shortcuts-help-container');
        if (existingHelp) {
            existingHelp.remove();
            return;
        }

        // 创建帮助容器
        const helpContainer = document.createElement('div');
        helpContainer.id = 'shortcuts-help-container';
        helpContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // 创建帮助内容
        const helpContent = document.createElement('div');
        helpContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        // 标题
        const title = document.createElement('h2');
        title.textContent = '⌨️ Cherry Studio 快捷键大全';
        title.style.cssText = `
            margin: 0 0 24px 0;
            color: #1a1a1a;
            font-size: 28px;
            font-weight: 600;
            text-align: center;
        `;

        // 获取 Cherry Studio 原生快捷键配置
        console.log('准备获取 Cherry Studio 原生快捷键配置...');
        const cherryStudioShortcuts = getCherryStudioShortcuts();
        console.log('获取到的快捷键配置:', cherryStudioShortcuts);
        
        // 快捷键描述映射
        const shortcutDescriptions = {
            'zoom_in': '放大界面',
            'zoom_out': '缩小界面',
            'zoom_reset': '重置缩放',
            'show_settings': '打开设置',
            'show_app': '显示/隐藏应用',
            'mini_window': '迷你窗口',
            'selection_assistant_toggle': '开关划词助手',
            'selection_assistant_select_text': '划词助手:取词',
            'new_topic': '新建话题',
            'rename_topic': '重命名话题',
            'toggle_show_assistants': '切换助手显示',
            'toggle_show_topics': '切换话题显示',
            'copy_last_message': '复制上一条消息',
            'edit_last_user_message': '编辑最后一条用户消息',
            'search_message_in_chat': '在当前对话中搜索消息',
            'search_message': '搜索消息',
            'clear_topic': '清空消息',
            'toggle_new_context': '清除上下文',
            'exit_fullscreen': '退出全屏'
        };

        // 基础快捷键数据
        const shortcutsData = [
            {
                category: '🧩 插件增强快捷键',
                shortcuts: [
                    { key: '⌘ + 1-9', desc: '切换到对应 Tab 页面' },
                    { key: '⌥ + 1-9', desc: '切换到对应 Tab 页面' },
                    { key: '⌘ + I', desc: '聚焦输入框' },
                    { key: '⌘ + ⇧ + M', desc: '打开模型切换面板' },
                    { key: '⌘ + ⇧ + D', desc: '删除最后一条消息' },
                    { key: 'Enter', desc: '停止消息生成（输入框聚焦时）' },
                    { key: '⌘ + ⌥ + M', desc: '打开 MCP 终端' },
                    { key: '⌘ + ⌥ + K', desc: '打开知识库搜索' },
                    { key: '⌘ + ⌥ + A', desc: '添加附件' },
                    { key: '⌘ + ⌥ + W', desc: '网络搜索' },
                    { key: '⌘ + ⌥ + /', desc: '@提及模型' },
                    { key: '⌘ + T 或 ⌥ + T', desc: '显示可用 Tab 列表' }
                ]
            },
            {
                category: '💬 聊天功能',
                shortcuts: [
                    { key: '⌘ + Enter', desc: '发送消息' },
                    { key: '⇧ + Enter', desc: '换行' },
                    { key: '⌘ + /', desc: '斜杠命令' },
                    { key: '↑ / ↓', desc: '浏览消息历史' }
                ]
            },
            {
                category: '📝 编辑功能',
                shortcuts: [
                    { key: '⌘ + Z', desc: '撤销' },
                    { key: '⌘ + Y', desc: '重做' },
                    { key: '⌘ + A', desc: '全选' },
                    { key: '⌘ + C', desc: '复制' },
                    { key: '⌘ + X', desc: '剪切' },
                    { key: '⌘ + V', desc: '粘贴' }
                ]
            },
            {
                category: '🔍 搜索功能',
                shortcuts: [
                    { key: '⌘ + F', desc: '查找' },
                    { key: '⌘ + G', desc: '查找下一个' },
                    { key: '⌘ + ⇧ + G', desc: '查找上一个' },
                    { key: '⌘ + ⇧ + F', desc: '替换' }
                ]
            },
            {
                category: '⚙️ 通用功能',
                shortcuts: [
                    { key: '⌘ + N', desc: '新建聊天' },
                    { key: '⌘ + W', desc: '关闭当前标签' },
                    { key: '⌘ + ⇧ + W', desc: '关闭所有标签' },
                    { key: '⌘ + R', desc: '重新生成回复' },
                    { key: '⌘ + S', desc: '保存对话' },
                    { key: '⌘ + O', desc: '打开文件' },
                    { key: '⌘ + P', desc: '打印对话' }
                ]
            }
        ];

        // 动态添加 Cherry Studio 原生快捷键
        console.log('开始动态添加 Cherry Studio 原生快捷键...');
        console.log('原始快捷键数量:', cherryStudioShortcuts.length);
        
        if (cherryStudioShortcuts.length > 0) {
            const enabledShortcuts = cherryStudioShortcuts.filter(shortcut => shortcut.enabled && shortcut.shortcut.length > 0);
            console.log('启用的快捷键:', enabledShortcuts);
            
            const nativeShortcuts = enabledShortcuts.map(shortcut => {
                const formatted = formatShortcut(shortcut);
                const desc = shortcutDescriptions[shortcut.key] || shortcut.key;
                console.log(`处理快捷键: ${shortcut.key} -> ${formatted} (${desc})`);
                return {
                    key: formatted,
                    desc: desc
                };
            });
            
            console.log('格式化后的快捷键:', nativeShortcuts);
            
            if (nativeShortcuts.length > 0) {
                shortcutsData.push({
                    category: '🏠 Cherry Studio 原生功能',
                    shortcuts: nativeShortcuts
                });
                console.log('已添加 Cherry Studio 原生功能分类');
            } else {
                console.log('没有启用的快捷键，不添加分类');
            }
        } else {
            console.log('没有获取到快捷键配置');
        }

        // 添加界面控制
        shortcutsData.push({
            category: '🎯 界面控制',
            shortcuts: [
                { key: 'F11', desc: '全屏模式' }
            ]
        });

        // 生成快捷键HTML
        let shortcutsHTML = '';
        shortcutsData.forEach(section => {
            shortcutsHTML += `
                <div style="margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">
                        ${section.category}
                    </h3>
                    <div style="display: grid; gap: 8px;">
            `;
            
            section.shortcuts.forEach(shortcut => {
                shortcutsHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8f9fa; border-radius: 6px;">
                        <span style="color: #555; font-size: 14px;">${shortcut.desc}</span>
                        <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                            ${shortcut.key}
                        </span>
                    </div>
                `;
            });
            
            shortcutsHTML += '</div></div>';
        });

        // 添加提示信息
        shortcutsHTML += `
            <div style="margin-top: 32px; padding: 16px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; text-align: center;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                    💡 <strong>提示：</strong>按 <kbd>Esc</kbd>、<kbd>⌘ + ?</kbd> 或点击空白处关闭此帮助页面
                </p>
            </div>
        `;

        helpContent.innerHTML = shortcutsHTML;
        helpContent.appendChild(title);
        helpContainer.appendChild(helpContent);

        // 点击背景关闭
        helpContainer.addEventListener('click', function(e) {
            if (e.target === helpContainer) {
                helpContainer.remove();
            }
        });

        // ESC 键关闭
        const handleEsc = function(e) {
            if (e.key === 'Escape') {
                helpContainer.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        document.body.appendChild(helpContainer);
    }

    // 设置键盘监听器
    document.addEventListener('keydown', function(event) {
        // Command + / 显示帮助
        if ((event.metaKey || event.altKey) && event.key === '/') {
            event.preventDefault();
            event.stopPropagation();
            createShortcutsHelp();
        }
    });

    // 设置键盘监听器
    document.addEventListener('keydown', function(event) {
        // Command + Shift + / 显示帮助
        if ((event.metaKey || event.altKey) && event.key === '/' && event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            createShortcutsHelp();
        }
    });

    // 调试函数：在控制台中调用 window.debugShortcuts() 来调试
    window.debugShortcuts = function() {
        console.log('=== 开始调试快捷键获取 ===');
        
        // 检查各种全局对象
        console.log('window.__REDUX_DEVTOOLS_EXTENSION__:', window.__REDUX_DEVTOOLS_EXTENSION__);
        console.log('window.reduxStore:', window.reduxStore);
        console.log('window.__REACT_DEVTOOLS_GLOBAL_HOOK__:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
        console.log('window.store:', window.store);
        console.log('window.appStore:', window.appStore);
        console.log('window.globalStore:', window.globalStore);
        
        // 检查 DOM 节点
        const rootElement = document.querySelector('#root');
        console.log('rootElement:', rootElement);
        if (rootElement) {
            console.log('rootElement._reactRootContainer:', rootElement._reactRootContainer);
        }
        
        // 尝试获取快捷键
        const shortcuts = getCherryStudioShortcuts();
        console.log('最终获取的快捷键:', shortcuts);
        
        console.log('=== 调试结束 ===');
    };

    // 快捷键帮助功能已加载
    console.log('快捷键帮助功能已加载');
    console.log('使用 ⌘ + / 显示所有快捷键');
    console.log('调试：在控制台中输入 window.debugShortcuts() 来调试快捷键获取');
    console.log('window.debugShortcuts 函数是否存在:', typeof window.debugShortcuts);
})();