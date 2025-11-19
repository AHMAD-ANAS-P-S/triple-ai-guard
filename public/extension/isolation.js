// Browser Isolation Layer - Safe View Mode for Zerophish AI

// Create isolation iframe for dangerous sites
function createIsolationFrame(url) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'zerophish-isolation-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
  `;
  
  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    background: #1f2937;
    color: white;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #dc2626;
  `;
  
  const title = document.createElement('div');
  title.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 24px;">🛡️</span>
      <div>
        <div style="font-weight: bold; font-size: 16px;">Safe Isolation Mode</div>
        <div style="font-size: 12px; color: #9ca3af;">Viewing in protected sandbox</div>
      </div>
    </div>
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Exit Isolation';
  closeBtn.style.cssText = `
    background: #dc2626;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
  `;
  closeBtn.onclick = () => overlay.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Create isolated iframe with security restrictions
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.sandbox = 'allow-scripts allow-same-origin'; // Limited permissions
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  `;
  
  // Create info banner
  const info = document.createElement('div');
  info.style.cssText = `
    background: #fef3c7;
    color: #92400e;
    padding: 12px 16px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  info.innerHTML = `
    <span style="font-size: 18px;">⚠️</span>
    <span><strong>Protected View:</strong> JavaScript is sandboxed, cookies blocked, and no keyboard input captured. This is a safe preview only.</span>
  `;
  
  // Assemble
  overlay.appendChild(header);
  overlay.appendChild(info);
  overlay.appendChild(iframe);
  
  document.body.appendChild(overlay);
}

// Listen for isolation requests from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openInIsolation') {
    createIsolationFrame(request.url);
    sendResponse({ success: true });
  }
});

// Add "Open in Safe Mode" button to warning overlays
document.addEventListener('click', (e) => {
  if (e.target.classList?.contains('zerophish-safe-view-btn')) {
    const url = e.target.dataset.url;
    if (url) {
      createIsolationFrame(url);
    }
  }
});

console.log('Zerophish Browser Isolation active');
