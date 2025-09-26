// 工具栏按钮快捷键设置
(function() {
  // 记录当前页面状态
  let currentIsChatPage = false;
  
  // 检查是否在聊天页面（存在MessageFooter元素）
  function isChatPage() {
    return currentIsChatPage;
  }
  
  // 更新页面状态
  function updatePageStatus() {
    const inputbar = document.getElementById('inputbar');
    currentIsChatPage = inputbar !== null;
    console.log('页面状态更新：', currentIsChatPage ? '聊天页面' : '非聊天页面');
  }
  
  // 初始化页面状态
  updatePageStatus();
  
  // 通用函数：根据SVG类名点击按钮
  function clickButtonBySvgClass(svgClass) {
    // 查找包含 inputbar-container 类的元素
    const inputbarContainer = document.querySelector('.inputbar-container');
    
    if (inputbarContainer) {
      // 在其中查找指定图标
      const icon = inputbarContainer.querySelector(svgClass);
      
      if (icon) {
        // 找到图标后，获取其父元素（通常是按钮）并点击
        // 向上最多查找3层父元素，找到可点击的元素
        let clickableElement = icon;
        let maxDepth = 3;
        let depth = 0;
        
        while (depth < maxDepth) {
          if (clickableElement.tagName === 'BUTTON' || 
              clickableElement.getAttribute('role') === 'button' ||
              clickableElement.onclick) {
            break;
          }
          if (clickableElement.parentElement) {
            clickableElement = clickableElement.parentElement;
            depth++;
          } else {
            break;
          }
        }
        
        // 触发点击事件
        clickableElement.click();
        return true;
      } else {
        console.log('未找到指定图标按钮');
        return false;
      }
    } else {
      console.log('未找到输入栏容器');
      return false;
    }
  }

  // 1. MCP按钮快捷键 (Ctrl+Alt+M)
  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'm' && event.altKey && !event.shiftKey) {
      event.preventDefault();
      
      // 检查是否在聊天页面
      if (!isChatPage()) {
        console.log('非聊天页面，终端快捷键未激活');
        return;
      }
      
      if (clickButtonBySvgClass('.lucide.lucide-hammer')) {
        console.log('已触发终端按钮点击 (Ctrl+Alt+M)');
      }
    }
  });

  // 2. 知识库按钮快捷键 (Ctrl+Alt+K)
  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && event.altKey && !event.shiftKey) {
      event.preventDefault();
      
      // 检查是否在聊天页面
      if (!isChatPage()) {
        console.log('非聊天页面，知识库快捷键未激活');
        return;
      }
      
      if (clickButtonBySvgClass('.lucide.lucide-file-search')) {
        console.log('已触发知识库按钮点击 (Ctrl+Alt+K)');
      }
    }
  });

  // 3. 附件按钮快捷键 (Ctrl+Alt+A)
  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a' && event.altKey && !event.shiftKey) {
      event.preventDefault();
      
      // 检查是否在聊天页面
      if (!isChatPage()) {
        console.log('非聊天页面，附件快捷键未激活');
        return;
      }
      
      if (clickButtonBySvgClass('.lucide.lucide-paperclip')) {
        console.log('已触发附件按钮点击 (Ctrl+Alt+A)');
      }
    }
  });

  // 4. 思考按钮快捷键 (Ctrl+Alt+T)
  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't' && event.altKey && !event.shiftKey) {
      event.preventDefault();
      
      // 检查是否在聊天页面
      if (!isChatPage()) {
        console.log('非聊天页面，思考快捷键未激活');
        return;
      }
      
      // 思考按钮使用的是非lucide类的SVG，需要特殊处理
      const inputbarContainer = document.querySelector('.inputbar-container');
      if (inputbarContainer) {
        // 在按钮文本中查找包含"思考"的元素，或者尝试通过SVG路径特征查找
        const allButtons = inputbarContainer.querySelectorAll('button');
        let thinkingButton = null;
        
        // 遍历所有按钮查找思考按钮
        for (const button of allButtons) {
          const svg = button.querySelector('svg[viewBox="0 0 24 24"]');
          if (svg && svg.querySelector('path[d="M12 2C9.76 2 7.78 3.05 6.5 4.68l1.43 1.43C8.84 4.84 10.32 4 12 4a5 5 0 0 1 5 5c0 1.68-.84 3.16-2.11 4.06l1.42 1.44C17.94 13.21 19 11.24 19 9a7 7 0 0 0-7-7M3.28 4L2 5.27L5.04 8.3C5 8.53 5 8.76 5 9c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h5.73l4 4L20 20.72zm3.95 6.5l5.5 5.5H10v-2.42a5 5 0 0 1-2.77-3.08M9 20v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1z"]')) {
            thinkingButton = button;
            break;
          }
        }
        
        if (thinkingButton) {
          thinkingButton.click();
          console.log('已触发思考按钮点击 (Ctrl+Alt+T)');
        } else {
          console.log('未找到思考按钮');
        }
      }
    }
  });

  // 5. 网络搜索按钮快捷键 (Ctrl+Alt+W)
  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w' && event.altKey && !event.shiftKey) {
      event.preventDefault();
      
      // 检查是否在聊天页面
      if (!isChatPage()) {
        console.log('非聊天页面，网络搜索快捷键未激活');
        return;
      }
      
      if (clickButtonBySvgClass('.lucide.lucide-globe')) {
        console.log('已触发网络搜索按钮点击 (Ctrl+Alt+W)');
      }
    }
  });

  // // 6. 新话题按钮快捷键 (Ctrl+Alt+N)
  // document.addEventListener('keydown', function(event) {
  //   if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n' && event.altKey && !event.shiftKey) {
  //     event.preventDefault();
      
  //     // 检查是否在聊天页面
  //     if (!isChatPage()) {
  //       console.log('非聊天页面，新话题快捷键未激活');
  //       return;
  //     }
      
  //     if (clickButtonBySvgClass('.lucide.lucide-message-square-diff')) {
  //       console.log('已触发新话题按钮点击 (Ctrl+Alt+N)');
  //     }
  //   }
  // });

  // 7. @提及模型按钮快捷键 (Ctrl+Alt+/)
  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === '/' && event.altKey && !event.shiftKey) {
      event.preventDefault();
      
      // 检查是否在聊天页面
      if (!isChatPage()) {
        console.log('非聊天页面，@提及模型快捷键未激活');
        return;
      }
      
      if (clickButtonBySvgClass('.lucide.lucide-at-sign')) {
        console.log('已触发@提及模型按钮点击 (Ctrl+Alt+/)');
      }
    }
  });

  // 设置监听器来观察页面变化
  function setupPageObserver() {
    const observer = new MutationObserver(function(mutations) {
      // 检查是否有inputbar的添加或移除
      const shouldUpdate = mutations.some(mutation => {
        // 检查新添加的节点
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // 元素节点
              if (node.id === 'inputbar' ||
                  node.querySelector && node.querySelector('#inputbar')) {
                return true;
              }
            }
          }
        }
        
        // 检查被移除的节点
        if (mutation.removedNodes.length) {
          for (const node of mutation.removedNodes) {
            if (node.nodeType === 1) { // 元素节点
              if (node.id === 'inputbar' ||
                  node.querySelector && node.querySelector('#inputbar')) {
                return true;
              }
            }
          }
        }
        
        return false;
      });
      
      // 只在需要时才更新状态
      if (shouldUpdate) {
        updatePageStatus();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    return observer;
  }
  
  // 初始化监听器
  const pageObserver = setupPageObserver();
})();
