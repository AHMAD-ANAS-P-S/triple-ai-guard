// Zerophish AI - QR Code Phishing Detection
// Detects QR codes on pages and analyzes their destinations

console.log('Zerophish AI: QR Code Detector loaded');

// Look for QR codes in images
function detectQRCodes() {
  const images = document.querySelectorAll('img, canvas, [style*="background-image"]');
  const potentialQRCodes = [];
  
  images.forEach(async (element) => {
    try {
      let imageUrl = '';
      
      if (element.tagName === 'IMG') {
        imageUrl = element.src;
      } else if (element.tagName === 'CANVAS') {
        imageUrl = element.toDataURL();
      } else {
        const bgImage = window.getComputedStyle(element).backgroundImage;
        const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (urlMatch) imageUrl = urlMatch[1];
      }
      
      if (!imageUrl) return;
      
      // Check if image dimensions suggest QR code (roughly square)
      const width = element.width || element.offsetWidth;
      const height = element.height || element.offsetHeight;
      const aspectRatio = width / height;
      
      if (aspectRatio > 0.8 && aspectRatio < 1.2 && width > 50 && width < 800) {
        potentialQRCodes.push({
          element,
          imageUrl,
          position: element.getBoundingClientRect(),
          dimensions: { width, height }
        });
      }
    } catch (error) {
      console.error('QR detection error:', error);
    }
  });
  
  if (potentialQRCodes.length > 0) {
    console.log('Zerophish: Found potential QR codes:', potentialQRCodes.length);
    
    // Report to background for analysis
    chrome.runtime.sendMessage({
      action: 'qrCodesDetected',
      data: {
        count: potentialQRCodes.length,
        url: window.location.href,
        codes: potentialQRCodes.map(qr => ({
          imageUrl: qr.imageUrl,
          position: qr.position,
          dimensions: qr.dimensions
        }))
      }
    });
    
    // Add visual indicator
    potentialQRCodes.forEach(qr => {
      const indicator = document.createElement('div');
      indicator.className = 'zerophish-qr-indicator';
      indicator.style.cssText = `
        position: absolute;
        top: ${qr.position.top + window.scrollY}px;
        left: ${qr.position.left + window.scrollX}px;
        width: ${qr.position.width}px;
        height: ${qr.position.height}px;
        border: 3px solid #F59E0B;
        border-radius: 8px;
        pointer-events: none;
        z-index: 999998;
        animation: qrPulse 2s infinite;
      `;
      
      const style = document.createElement('style');
      style.textContent = `
        @keyframes qrPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(indicator);
      
      // Add scan button
      const scanBtn = document.createElement('button');
      scanBtn.textContent = '🔍 Scan QR';
      scanBtn.style.cssText = `
        position: absolute;
        top: ${qr.position.top + window.scrollY - 35}px;
        left: ${qr.position.left + window.scrollX}px;
        background: #F59E0B;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      `;
      
      scanBtn.onclick = () => {
        chrome.runtime.sendMessage({
          action: 'scanQRCode',
          data: { imageUrl: qr.imageUrl, pageUrl: window.location.href }
        });
      };
      
      document.body.appendChild(scanBtn);
    });
  }
}

// Run detection after page load
window.addEventListener('load', () => {
  setTimeout(detectQRCodes, 1000);
});

// Re-run on dynamic content changes
const qrObserver = new MutationObserver(() => {
  detectQRCodes();
});

qrObserver.observe(document.body, {
  childList: true,
  subtree: true
});
