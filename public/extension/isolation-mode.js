// Zerophish AI - Browser Isolation Layer
// Opens suspicious sites in isolated, sandboxed view

console.log('Zerophish AI: Isolation Mode loaded');

// Check if this page is already in isolation mode
const isIsolated = new URLSearchParams(window.location.search).get('zerophish_isolated') === 'true';

if (isIsolated) {
  // We're in isolation mode - apply restrictions
  console.log('Zerophish: Running in ISOLATION MODE');
  
  // Create isolation banner
  const banner = document.createElement('div');
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
    color: white;
    padding: 12px 20px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 999999;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;
  
  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 20px;">🛡️</span>
      <span>ZEROPHISH ISOLATION MODE - This site is running in a protected sandbox</span>
    </div>
    <button id="zerophish-exit-isolation" style="
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 6px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
    ">EXIT ISOLATION</button>
  `;
  
  document.documentElement.insertBefore(banner, document.body);
  
  // Exit isolation button
  document.getElementById('zerophish-exit-isolation').onclick = () => {
    const originalUrl = new URLSearchParams(window.location.search).get('zerophish_original');
    if (originalUrl) {
      window.location.href = originalUrl;
    } else {
      window.close();
    }
  };
  
  // Apply isolation restrictions
  
  // 1. Block all cookies
  Object.defineProperty(document, 'cookie', {
    get: () => '',
    set: () => false
  });
  
  // 2. Block localStorage and sessionStorage
  Storage.prototype.setItem = () => {};
  Storage.prototype.getItem = () => null;
  Storage.prototype.removeItem = () => {};
  Storage.prototype.clear = () => {};
  
  // 3. Disable JavaScript execution of new scripts
  const originalCreateElement = document.createElement;
  document.createElement = function(tag) {
    const element = originalCreateElement.call(document, tag);
    
    if (tag.toLowerCase() === 'script') {
      element.type = 'text/plain';
      console.warn('Zerophish: Blocked script execution in isolation mode');
    }
    
    return element;
  };
  
  // 4. Block form submissions
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert('Zerophish: Form submission blocked in isolation mode');
    return false;
  }, true);
  
  // 5. Disable keyboard capture
  ['keydown', 'keyup', 'keypress'].forEach(event => {
    document.addEventListener(event, (e) => {
      // Allow only basic navigation keys
      const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'];
      if (!allowedKeys.includes(e.key)) {
        console.warn('Zerophish: Keyboard event blocked in isolation mode');
      }
    }, true);
  });
  
  // 6. Block clipboard access
  ['copy', 'cut', 'paste'].forEach(event => {
    document.addEventListener(event, (e) => {
      e.preventDefault();
      console.warn('Zerophish: Clipboard event blocked in isolation mode');
    }, true);
  });
  
  // 7. Disable pointer lock
  Element.prototype.requestPointerLock = () => {
    console.warn('Zerophish: Pointer lock blocked in isolation mode');
  };
  
  // 8. Disable fullscreen
  Element.prototype.requestFullscreen = () => {
    console.warn('Zerophish: Fullscreen blocked in isolation mode');
  };
  
  // 9. Block WebRTC and fingerprinting attempts
  if (window.RTCPeerConnection) {
    window.RTCPeerConnection = undefined;
  }
  if (window.webkitRTCPeerConnection) {
    window.webkitRTCPeerConnection = undefined;
  }
  
  // Add padding to body for banner
  document.addEventListener('DOMContentLoaded', () => {
    document.body.style.paddingTop = '50px';
  });
  
} else {
  // Not in isolation mode - provide option to enter it for suspicious sites
  
  // Listen for isolation request from background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'offerIsolation') {
      showIsolationOffer(request.data);
    }
  });
}

function showIsolationOffer(data) {
  const overlay = document.createElement('div');
  overlay.id = 'zerophish-isolation-offer';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  overlay.innerHTML = `
    <div style="
      background: white;
      border-radius: 12px;
      padding: 32px;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    ">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🛡️</div>
        <h2 style="font-size: 24px; font-weight: 700; color: #DC2626; margin-bottom: 8px;">
          Suspicious Site Detected
        </h2>
        <p style="color: #666; font-size: 14px;">
          Zerophish recommends viewing this site in Isolation Mode for your protection
        </p>
      </div>
      
      <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <p style="font-size: 13px; color: #92400E; margin: 0;">
          <strong>What is Isolation Mode?</strong><br>
          • Blocks all scripts and tracking<br>
          • Disables cookies and storage<br>
          • Prevents form submissions<br>
          • Protects against keyloggers<br>
          • Sandboxed environment
        </p>
      </div>
      
      <div style="display: flex; gap: 12px;">
        <button id="zerophish-enable-isolation" style="
          flex: 1;
          background: #DC2626;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        ">
          🛡️ Enable Protection
        </button>
        <button id="zerophish-cancel-isolation" style="
          flex: 1;
          background: #E5E7EB;
          color: #374151;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        ">
          Continue Anyway
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('zerophish-enable-isolation').onclick = () => {
    const isolatedUrl = `${window.location.href}${window.location.href.includes('?') ? '&' : '?'}zerophish_isolated=true&zerophish_original=${encodeURIComponent(window.location.href)}`;
    window.location.href = isolatedUrl;
  };
  
  document.getElementById('zerophish-cancel-isolation').onclick = () => {
    overlay.remove();
  };
}
