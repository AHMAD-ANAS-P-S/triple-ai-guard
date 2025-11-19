// QR Code Scanner for Zerophish AI
const API_URL = 'https://giucniweqsloezqppsac.supabase.co/functions/v1/scan-qr-code';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdWNuaXdlcXNsb2V6cXBwc2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Nzc0MDEsImV4cCI6MjA3NTQ1MzQwMX0.k5CpKWu6IKyUNUBJEjVlcCvk-kwXdxk7klJXG7aJ4FY';

// Detect QR codes on the page
function detectQRCodes() {
  const images = document.querySelectorAll('img, canvas');
  
  images.forEach(async (element) => {
    // Skip if already scanned
    if (element.dataset.qrScanned) return;
    element.dataset.qrScanned = 'true';
    
    try {
      let imageData;
      
      if (element.tagName === 'IMG') {
        // Convert image to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
        ctx.drawImage(element, 0, 0);
        imageData = canvas.toDataURL('image/png');
      } else if (element.tagName === 'CANVAS') {
        imageData = element.toDataURL('image/png');
      }
      
      if (!imageData) return;
      
      // Send to QR scanning API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'apikey': API_KEY
        },
        body: JSON.stringify({ imageData })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.detected && result.url) {
          // Show warning overlay on QR code
          showQRWarning(element, result);
          
          // Notify user
          chrome.runtime.sendMessage({
            action: 'qrDetected',
            url: result.url,
            threat: result.analysis?.threat || 'unknown'
          });
        }
      }
    } catch (error) {
      console.error('QR scan error:', error);
    }
  });
}

// Show warning overlay on dangerous QR codes
function showQRWarning(element, result) {
  const threat = result.analysis?.threat || 'medium';
  
  if (threat === 'high' || threat === 'medium') {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      top: ${element.offsetTop}px;
      left: ${element.offsetLeft}px;
      width: ${element.offsetWidth}px;
      height: ${element.offsetHeight}px;
      background: rgba(255, 0, 0, 0.3);
      border: 3px solid red;
      z-index: 999999;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `;
    overlay.textContent = '⚠️ QR CODE RISK';
    
    element.parentElement?.appendChild(overlay);
  }
}

// Run QR detection on page load and when new images appear
detectQRCodes();

// Watch for new images being added
const observer = new MutationObserver(() => {
  detectQRCodes();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('Zerophish QR Scanner active');
