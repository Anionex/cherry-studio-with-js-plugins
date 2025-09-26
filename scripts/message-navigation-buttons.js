// 消息导航按钮
(function() {
  // 导航按钮配置常量
  const NAVIGATION_CONFIG = {
    // 容器位置
    TOP_POSITION: '100px',
    RIGHT_POSITION: '20px',
    GAP: '5px',
    Z_INDEX: 1000,
    
    // 按钮样式
    BUTTON_SIZE: '28px',
    BUTTON_RADIUS: '6px',
    BUTTON_BG_COLOR: '#f0f0f0',
    BUTTON_HOVER_COLOR: '#e0e0e0',
    BUTTON_BORDER: '1px solid #ddd',
    
    // 图标样式
    ICON_SIZE: '14px',
    ICON_STROKE_WIDTH: '2'
  };

  let isInitialized = false;
  let chatPageObserver = null;
  // 检查是否为聊天页面
  function isChatPage() {
    return document.querySelectorAll('.message-header').length > 0;
  }

  // 显示或隐藏导航按钮
  function toggleNavigationButtons() {
    const container = document.getElementById('message-navigation-container');
    
    if (isChatPage()) {
      // 聊天页面：显示或创建按钮
      if (!container) {
        createNavigationButtons();
      } else {
        container.style.display = 'flex';
      }
    } else {
      // 非聊天页面：隐藏按钮
      if (container) {
        container.style.display = 'none';
      }
    }
  }
  
  // 创建导航按钮
  function createNavigationButtons() {
    // 检查是否已经添加过按钮
    if (document.getElementById('message-navigation-container')) {
      return;
    }

    // 查找content-container元素
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) {
      return;
    }

    // 创建导航按钮容器
    const navigationContainer = document.createElement('div');
    navigationContainer.id = 'message-navigation-container';
    navigationContainer.style.cssText = `
      position: fixed;
      top: ${NAVIGATION_CONFIG.TOP_POSITION};
      right: ${NAVIGATION_CONFIG.RIGHT_POSITION};
      display: flex;
      flex-direction: row;
      gap: ${NAVIGATION_CONFIG.GAP};
      z-index: ${NAVIGATION_CONFIG.Z_INDEX};
    `;

    // 添加按钮
    const buttons = [
      { id: 'first-message', title: '移到第一条消息', icon: 'chevrons-up', action: navigateToFirstMessage },
      { id: 'prev-message', title: '移到上一条消息', icon: 'chevron-up', action: navigateToPrevMessage },
      { id: 'next-message', title: '移到下一条消息', icon: 'chevron-down', action: navigateToNextMessage },
      { id: 'last-message', title: '移到最后一条消息', icon: 'chevrons-down', action: navigateToLastMessage }
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.id = btn.id;
      button.title = btn.title;
      button.style.cssText = `
        width: ${NAVIGATION_CONFIG.BUTTON_SIZE};
        height: ${NAVIGATION_CONFIG.BUTTON_SIZE};
        border-radius: ${NAVIGATION_CONFIG.BUTTON_RADIUS};
        background-color: ${NAVIGATION_CONFIG.BUTTON_BG_COLOR};
        border: ${NAVIGATION_CONFIG.BUTTON_BORDER};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
        padding: 0;
      `;
      
      // 创建SVG图标元素（使用已加载的Lucide库）
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('width', NAVIGATION_CONFIG.ICON_SIZE);
      svg.setAttribute('height', NAVIGATION_CONFIG.ICON_SIZE);
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', NAVIGATION_CONFIG.ICON_STROKE_WIDTH);
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.classList.add('lucide', `lucide-${btn.icon}`);
      
      // 根据图标名称添加合适的路径
      switch(btn.icon) {
        case 'chevrons-up':
          svg.innerHTML = '<polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline>';
          break;
        case 'chevron-up':
          svg.innerHTML = '<polyline points="18 15 12 9 6 15"></polyline>';
          break;
        case 'chevron-down':
          svg.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
          break;
        case 'chevrons-down':
          svg.innerHTML = '<polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline>';
          break;
      }
      
      button.appendChild(svg);
      
      button.addEventListener('mouseover', function() {
        this.style.backgroundColor = NAVIGATION_CONFIG.BUTTON_HOVER_COLOR;
      });
      button.addEventListener('mouseout', function() {
        this.style.backgroundColor = NAVIGATION_CONFIG.BUTTON_BG_COLOR;
      });
      button.addEventListener('click', btn.action);
      navigationContainer.appendChild(button);
    });

    // 添加到页面
    document.body.appendChild(navigationContainer);
  }

  // 获取所有消息（通过MessageFooter来定位）
  function getAllMessages() {
    const messageFooters = document.querySelectorAll('.message-header');
    const messages = [];

    // 为每个MessageFooter获取位置信息
    messageFooters.forEach((footer) => {
      const rect = footer.getBoundingClientRect();
      messages.push({
        element: footer,
        top: rect.top,
        bottom: rect.bottom,
        visible: rect.top >= 0 && rect.bottom <= window.innerHeight
      });
    });

    // 按照视觉顺序（从上到下）排序
    messages.sort((a, b) => a.top - b.top);
    return messages;
  }

  // 获取当前可见的消息或最近的消息
  function getCurrentMessageIndex() {
    const messages = getAllMessages();
    if (messages.length === 0) return -1;

    // 查找最靠近视口顶部的可见消息
    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < messages.length; i++) {
      // 使用消息顶部到视口顶部的距离
      const distance = Math.abs(messages[i].top);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  // 导航到特定消息
  function navigateToMessage(index) {
    const messages = getAllMessages();
    if (messages.length === 0 || index < 0 || index >= messages.length) return;

    messages[index].element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  // 导航函数
  function navigateToFirstMessage() {
    navigateToMessage(0);
  }

  function navigateToLastMessage() {
    const messages = getAllMessages();
    navigateToMessage(messages.length - 1);
  }

  function navigateToPrevMessage() {
    const currentIndex = getCurrentMessageIndex();
    if (currentIndex > 0) {
      navigateToMessage(currentIndex - 1);
    }
  }

  function navigateToNextMessage() {
    const currentIndex = getCurrentMessageIndex();
    const messages = getAllMessages();
    if (currentIndex < messages.length - 1) {
      navigateToMessage(currentIndex + 1);
    }
  }

  // 监听滚动事件，更新当前消息
  window.addEventListener('scroll', function() {
    // 这里可以添加防抖动逻辑，避免频繁计算
  }, { passive: true });

  // 设置主要观察器来监听页面变化
  function setupMainObserver() {
    // 监听DOM变化，检测页面状态变化
    const observer = new MutationObserver(function(mutations) {
      // 检查是否有MessageFooter的添加或移除
      const shouldCheck = mutations.some(mutation => {
        // 检查新添加的节点
        if (mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) { // 元素节点
              if (node.classList && node.classList.contains('message-header') ||
                  node.querySelector && node.querySelector('.message-header')) {
                return true;
              }
            }
          }
        }
        
        // 检查被移除的节点
        if (mutation.removedNodes.length) {
          for (const node of mutation.removedNodes) {
            if (node.nodeType === 1) { // 元素节点
              if (node.classList && node.classList.contains('message-header') ||
                  node.querySelector && node.querySelector('.message-header')) {
                return true;
              }
            }
          }
        }
        
        return false;
      });
      
      // 只在需要时才执行切换逻辑
      if (shouldCheck) {
        toggleNavigationButtons();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
    
    return observer;
  }

  // 初始化
  function init() {
    // 创建按钮并根据页面状态显示/隐藏
    toggleNavigationButtons();
    
    // 设置页面变化观察器
    chatPageObserver = setupMainObserver();
    
    // 标记为已初始化
    isInitialized = true;
  }

  // 当DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();