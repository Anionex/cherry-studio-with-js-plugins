// 简化版快捷键帮助页面 - 调试版本 v2
(function() {
    console.log('🚀 开始加载简化版快捷键帮助脚本 v2...');
    
    // 防止重复加载
    if (window.shortcutsHelpInitialized) {
        console.log('⚠️ 脚本已加载，跳过');
        return;
    }
    window.shortcutsHelpInitialized = true;
    console.log('✅ 脚本初始化完成 v2');

    // 简单的测试函数
    window.simpleDebug = function() {
        console.log('='.repeat(60));
        console.log('🔍 Cherry Studio 快捷键调试信息');
        console.log('='.repeat(60));
        
        console.log('\n📍 基本信息:');
        console.log(`  当前页面: ${window.location.href}`);
        console.log(`  文档标题: ${document.title}`);
        
        console.log('\n🔧 系统检查:');
        const checks = {
            'window.__REDUX_DEVTOOLS_EXTENSION__': window.__REDUX_DEVTOOLS_EXTENSION__,
            'window.reduxStore': window.reduxStore,
            'window.store': window.store,
            'window.__REACT_DEVTOOLS_GLOBAL_HOOK__': window.__REACT_DEVTOOLS_GLOBAL_HOOK__
        };
        
        Object.entries(checks).forEach(([key, value]) => {
            const status = value ? '✅' : '❌';
            console.log(`  ${status} ${key}: ${value ? '已加载' : '未加载'}`);
        });
        
        // 尝试获取快捷键配置
        if (window.store && window.store.getState) {
            console.log('\n🎯 Redux Store 分析:');
            try {
                const state = window.store.getState();
                console.log('✅ 成功获取 Redux state');
                console.log(`📋 State 包含 ${Object.keys(state).length} 个模块:`);
                Object.keys(state).forEach(key => {
                    console.log(`  - ${key}`);
                });
                
                if (state.shortcuts) {
                    console.log('\n✅ 发现 shortcuts 模块');
                    if (state.shortcuts.shortcuts) {
                        const shortcuts = state.shortcuts.shortcuts;
                        console.log(`\n🎯 找到 ${shortcuts.length} 个原生快捷键配置:`);
                        console.log('─'.repeat(60));
                        
                        // 格式化输出快捷键信息
                        shortcuts.forEach((shortcut, index) => {
                            const keyStr = formatShortcut(shortcut);
                            const status = shortcut.enabled ? '✅' : '❌';
                            console.log(`${index + 1}. ${status} ${shortcut.key || '未知功能'}`);
                            console.log(`   快捷键: ${keyStr || '未设置'}`);
                            if (shortcut.shortcut && shortcut.shortcut.length > 0) {
                                console.log(`   原始组合: [${shortcut.shortcut.join(', ')}]`);
                            }
                            console.log('');
                        });
                        console.log('─'.repeat(60));
                        
                        // 统计信息
                        const enabledCount = shortcuts.filter(s => s.enabled).length;
                        console.log(`📊 统计: ${enabledCount}/${shortcuts.length} 个快捷键已启用`);
                    } else {
                        console.log('❌ shortcuts.shortcuts 为空');
                    }
                } else {
                    console.log('❌ state 中没有 shortcuts 模块');
                }
            } catch (error) {
                console.error('❌ 获取 state 失败:', error.message);
            }
        } else {
            console.log('❌ window.store 不可用');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('💡 提示: 使用 ⌘ + / 显示快捷键帮助页面');
        console.log('='.repeat(60));
        
        return '调试完成';
    };

    // 获取 Cherry Studio 快捷键配置
    function getCherryStudioShortcuts() {
        try {
            if (window.store && window.store.getState) {
                const state = window.store.getState();
                if (state && state.shortcuts && state.shortcuts.shortcuts) {
                    return state.shortcuts.shortcuts;
                }
            }
            return [];
        } catch (error) {
            console.error('获取快捷键配置失败:', error);
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

    // 创建帮助页面
    window.showSimpleHelp = function() {
        console.log('📖 创建简化版帮助页面');
        
        // 获取 Cherry Studio 快捷键配置
        const cherryShortcuts = getCherryStudioShortcuts();
        const enabledCount = cherryShortcuts.filter(s => s.enabled && s.shortcut.length > 0).length;
        
        // 移除已存在的帮助
        const existing = document.getElementById('simple-help-container');
        if (existing) {
            existing.remove();
        }

        // 创建容器
        const container = document.createElement('div');
        container.id = 'simple-help-container';
        container.style.cssText = `
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

        // 内容
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 32px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;

        // 生成 Cherry Studio 快捷键 HTML
        let cherryShortcutsHtml = '';
        if (cherryShortcuts.length > 0) {
            const enabledShortcuts = cherryShortcuts.filter(s => s.enabled && s.shortcut.length > 0);
            if (enabledShortcuts.length > 0) {
                cherryShortcutsHtml = `
                    <div style="margin: 24px 0;">
                        <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                            🏠 Cherry Studio 原生快捷键 (${enabledCount} 个已启用)
                        </h3>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px;">
                `;
                enabledShortcuts.forEach(shortcut => {
                    const key = formatShortcut(shortcut);
                    const desc = shortcut.key || '未知功能';
                    cherryShortcutsHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                            <span style="color: #495057; font-size: 14px;">${desc}</span>
                            <span style="background: #007bff; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                                ${key}
                            </span>
                        </div>
                    `;
                });
                cherryShortcutsHtml += '</div></div>';
            }
        }

        // 消息发送快捷键
        const sendShortcutsHtml = `
            <div style="margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                    💬 消息发送快捷键
                </h3>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                        <span style="color: #495057; font-size: 14px;">发送消息（默认，可在设置中修改）</span>
                        <span style="background: #17a2b8; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                            Enter
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                        <span style="color: #495057; font-size: 14px;">换行</span>
                        <span style="background: #17a2b8; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                            Shift + Enter
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                        <span style="color: #495057; font-size: 14px;">其他发送选项（设置中配置）</span>
                        <span style="background: #17a2b8; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                            Ctrl+Enter / ⌘+Enter / Alt+Enter
                        </span>
                    </div>
                </div>
            </div>
        `;

        // 编辑器快捷键
        const editorShortcutsHtml = `
            <div style="margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                    📝 编辑器快捷键
                </h3>
                <div style="background: #f8f9fa; border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                        <span style="color: #495057; font-size: 14px;">搜索内容</span>
                        <span style="background: #6f42c1; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                            ⌘ + F
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                        <span style="color: #495057; font-size: 14px;">退出搜索</span>
                        <span style="background: #6f42c1; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                            ESC
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                        <span style="color: #495057; font-size: 14px;">自动选中变量</span>
                        <span style="background: #6f42c1; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                            Tab
                        </span>
                    </div>
                </div>
            </div>
        `;

        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 28px; font-weight: 600;">
                    🎯 Cherry Studio 快捷键帮助
                </h2>
                <p style="margin: 0; color: #6c757d; font-size: 14px;">
                    插件增强 + 原生功能完整快捷键指南
                </p>
            </div>

            <div style="color: #555; font-size: 14px; line-height: 1.6;">
                <div style="margin: 24px 0;">
                    <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                        🧩 插件增强快捷键
                    </h3>
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                            <span style="color: #495057; font-size: 14px;">切换到对应 Tab 页面</span>
                            <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                                ⌘ + 1-9 / ⌥ + 1-9
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                            <span style="color: #495057; font-size: 14px;">聚焦输入框</span>
                            <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                                ⌘ + I
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                            <span style="color: #495057; font-size: 14px;">打开模型切换面板</span>
                            <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                                ⌘ + ⇧ + M
                            </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                            <span style="color: #495057; font-size: 14px;">删除最后一条消息</span>
                            <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; font-weight: 500;">
                                ⌘ + ⇧ + D
                            </span>
                        </div>
                    </div>
                </div>
                
                ${cherryShortcutsHtml}
                
                ${sendShortcutsHtml}
                
                ${editorShortcutsHtml}
                
                <div style="margin: 24px 0; padding: 16px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                    <h3 style="margin: 0 0 12px 0; color: #856404; font-size: 16px; font-weight: 600;">
                        💡 使用提示
                    </h3>
                    <div style="font-size: 13px; color: #856404; line-height: 1.5;">
                        <div>• 按 <kbd style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px; border: 1px solid #dee2e6;">ESC</kbd> 键或点击背景关闭此页面</div>
                        <div>• 使用 <kbd style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px; border: 1px solid #dee2e6;">⌘ + /</kbd> 随时显示此帮助页面</div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(content);
        document.body.appendChild(container);

        // 点击背景关闭
        container.addEventListener('click', function(e) {
            if (e.target === container) {
                container.remove();
            }
        });

        // ESC 键关闭
        const handleEsc = function(e) {
            if (e.key === 'Escape') {
                container.remove();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        console.log('✅ 帮助页面已创建');
    };

    // 设置键盘监听器
    console.log('⌨️ 设置键盘监听器...');
    document.addEventListener('keydown', function(event) {
        // Command + / 显示帮助
        if ((event.metaKey || event.altKey) && event.key === '/') {
            event.preventDefault();
            event.stopPropagation();
            console.log('🎯 触发快捷键帮助');
            window.showSimpleHelp();
        }
    });

    console.log('✅ 简化版快捷键帮助脚本加载完成');
    console.log('💡 使用 ⌘ + / 显示帮助页面');
    console.log('🔍 使用 window.simpleDebug() 进行调试');
})();