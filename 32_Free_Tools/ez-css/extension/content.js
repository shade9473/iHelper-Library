let isInspecting = false;
let overlay = null;
let stylePanel = null;

function createOverlay() {
  overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 10000;
    border: 2px solid #4CAF50;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 4px;
    transition: all 0.2s ease;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
  `;
  document.body.appendChild(overlay);
}

function createStylePanel() {
  stylePanel = document.createElement('div');
  stylePanel.style.cssText = `
    position: fixed;
    right: 20px;
    top: 20px;
    width: 320px;
    background: white;
    border-radius: 12px;
    padding: 16px;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    z-index: 10001;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(stylePanel);
}

function getElementStyles(element) {
  const computed = window.getComputedStyle(element);
  const important = [
    'width', 'height',
    'margin', 'padding',
    'color', 'background-color',
    'font-family', 'font-size',
    'display', 'position',
    'border', 'border-radius',
    'box-shadow', 'opacity',
    'transform', 'transition'
  ];
  
  let css = '';
  important.forEach(prop => {
    const value = computed.getPropertyValue(prop);
    if (value && value !== 'none' && value !== 'normal') {
      css += `${prop}: ${value};\n`;
    }
  });
  return css;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const notification = document.createElement('div');
    notification.textContent = '✓ Copied to clipboard!';
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 14px;
      z-index: 10002;
      animation: fadeIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    `;
    
    const fadeStyle = document.createElement('style');
    fadeStyle.textContent = `
      @keyframes fadeIn {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(fadeStyle);
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  });
}

function handleMouseMove(e) {
  if (!isInspecting) return;
  
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  overlay.style.left = rect.left + 'px';
  overlay.style.top = rect.top + 'px';
  overlay.style.width = rect.width + 'px';
  overlay.style.height = rect.height + 'px';
  
  const styles = getElementStyles(element);
  stylePanel.innerHTML = `
    <div style="margin-bottom: 16px;">
      <div style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
        ${element.tagName.toLowerCase()}
        ${element.id ? `<span style="color: #4CAF50">#${element.id}</span>` : ''}
        ${Array.from(element.classList).map(c => `<span style="color: #666">.${c}</span>`).join('')}
      </div>
      <div style="font-size: 12px; color: #666;">
        ${Math.round(rect.width)} × ${Math.round(rect.height)} pixels
      </div>
    </div>
    <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
      <pre style="margin: 0; white-space: pre-wrap; font-family: 'Cascadia Code', 'Source Code Pro', monospace; font-size: 12px; color: #333;">${styles}</pre>
    </div>
    <button onclick="copyToClipboard(\`${styles.replace(/`/g, '\\`')}\`)" 
            style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 14px; transition: all 0.2s ease;">
      Copy CSS
    </button>
  `;
}

function startInspecting() {
  isInspecting = true;
  if (!overlay) createOverlay();
  if (!stylePanel) createStylePanel();
  document.addEventListener('mousemove', handleMouseMove);
}

function stopInspecting() {
  isInspecting = false;
  if (overlay) overlay.remove();
  if (stylePanel) stylePanel.remove();
  overlay = null;
  stylePanel = null;
  document.removeEventListener('mousemove', handleMouseMove);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startInspect') {
    startInspecting();
  } else if (request.action === 'stopInspect') {
    stopInspecting();
  }
});
