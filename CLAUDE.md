# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个为 Cherry Studio 应用提供 JavaScript 插件注入系统的项目。它允许在启动 Cherry Studio 时加载自定义 JavaScript 脚本，实现快捷键增强和功能定制。

## 核心架构

### 主要组件
- **electron_inject**: 核心 Electron 应用注入模块，基于 tintinweb/electron-inject 修改
- **start_CherryStudio_with_scripts.py**: 主启动脚本，负责配置读取和进程管理
- **scripts/**: JavaScript 插件目录，包含各种功能增强脚本
- **config.yaml**: 配置文件，指定应用路径和脚本目录

### 工作流程
1. 读取 `config.yaml` 配置文件
2. 启动 Cherry Studio 应用并启用远程调试端口
3. 通过 WebSocket 连接到 Chrome DevTools Protocol
4. 将 scripts 目录中的所有 JS 脚本注入到应用的渲染进程中
5. 保持进程运行直到用户关闭应用

## 常用开发命令

### 安装依赖
```bash
pip install -r requirements.txt
```

### 运行项目
```bash
python start_CherryStudio_with_scripts.py
```

### 生成可执行文件
```bash
pip install pyinstaller
pyinstaller start_CherryStudio_with_scripts.spec --distpath ./
```

### 测试脚本注入
```bash
# 直接使用 electron_inject 模块测试
python -m electron_inject --enable-devtools-hotkeys - "path/to/Cherry Studio.exe" --render-scripts scripts/your-script.js
```

## 配置文件结构

### config.yaml
```yaml
app_path: "C:/Users/username/AppData/Local/Programs/Cherry Studio/Cherry Studio.exe"
scripts_folder: "./scripts"
```

### 脚本命名约定
- 功能脚本使用 `-shortcut.js` 后缀表示快捷键功能
- UI 增强脚本使用 `-buttons.js` 后缀表示界面元素
- 所有脚本应该是自包含的 IIFE (立即调用函数表达式)

## 脚本开发指南

### 脚本结构
```javascript
(function() {
  // 检查是否已初始化，避免重复注入
  if (window.yourScriptInitialized) return;
  window.yourScriptInitialized = true;
  
  // 主要功能代码
  // ...
})();
```

### DOM 等待模式
由于应用是动态加载的，脚本需要等待目标元素出现：
```javascript
function waitForElement(selector, callback, maxAttempts = 50) {
  const interval = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(interval);
      callback(element);
    } else if (--maxAttempts <= 0) {
      clearInterval(interval);
    }
  }, 200);
}
```

### 事件监听清理
在脚本中适当清理事件监听器，避免内存泄漏：
```javascript
// 返回清理函数
return function cleanup() {
  document.removeEventListener('keydown', keyHandler);
};
```

## 调试技巧

### 启用开发者工具
在启动时添加 `--enable-devtools-hotkeys` 参数，可以使用 F12 打开开发者工具。

### 查看注入日志
脚本中的 console.log 会输出到 Chrome DevTools 控制台。

### 端口冲突处理
如果调试端口被占用，系统会自动分配随机端口。

## 故障排除

### 应用启动失败
- 检查 config.yaml 中的路径是否正确
- 确认 Cherry Studio 应用可正常启动
- 查看控制台错误信息

### 脚本注入失败
- 确认脚本文件存在且语法正确
- 检查脚本是否在正确的 DOM 元素上操作
- 使用开发者工具查看脚本执行情况

### 进程管理问题
- 使用任务管理器确保完全关闭所有 Cherry Studio 进程
- 重启应用前等待几秒钟确保端口释放

## 现有脚本功能

### 核心快捷键
- **tab-switch-shortcut.js**: Command+1-9 或 Alt+1-9 切换 Tab 页面
- **focus-textinputarea-shortcut.js**: Command+I 聚焦输入框（仅在聊天页面生效）
- **switch-model-shortcut.js**: Command+Shift+M 打开模型切换面板
- **delete-message-shortcut.js**: Command+Shift+D 删除最后一条消息（自动确认删除）
- **stop-message-shortcut.js**: 当模型正在输出时，按回车键停止生成

### 工具栏快捷键（仅在聊天页面生效）
- **toolbar-shortcuts.js**: 
  - Command+Alt+M - 打开 MCP 终端
  - Command+Alt+K - 打开知识库搜索
  - Command+Alt+A - 添加附件
  - Command+Alt+W - 网络搜索
  - Command+Alt+/ - @提及模型

### 界面增强
- **message-navigation-buttons.js**: 在页面右上角添加四个导航按钮，用于快速浏览消息历史
- **shortcuts-help.js**: Command+? 或 Command+Shift+/ 显示完整的快捷键帮助页面

### 调试和信息
- **Command+T 或 Alt+T**: 显示当前可用 Tab 列表
- **Command+? 或 Command+Shift+/**: 显示快捷键帮助页面