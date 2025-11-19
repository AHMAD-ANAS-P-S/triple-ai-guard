// Zerophish AI - Behavioral Detection Engine
// Detects DOM manipulation, credential harvesting, keylogging, clipboard hijacking

console.log('Zerophish AI: Behavioral Detector loaded');

const behavioralData = {
  domModifications: 0,
  suspiciousScripts: [],
  credentialHarvestingAttempts: 0,
  clipboardAccess: 0,
  keyloggers: 0,
  hiddenIframes: 0,
  formInjections: 0,
  eventListeners: []
};

// Monitor DOM mutations
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    behavioralData.domModifications++;
    
    // Detect injected login forms
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          // Check for suspicious form injections
          if (node.tagName === 'FORM' || node.querySelector('form')) {
            const forms = node.tagName === 'FORM' ? [node] : node.querySelectorAll('form');
            forms.forEach(form => {
              const hasPasswordField = form.querySelector('input[type="password"]');
              const hasEmailField = form.querySelector('input[type="email"], input[name*="email"], input[name*="user"]');
              
              if (hasPasswordField || hasEmailField) {
                behavioralData.formInjections++;
                behavioralData.credentialHarvestingAttempts++;
                console.warn('Zerophish: Suspicious form injection detected', form);
              }
            });
          }
          
          // Check for hidden iframes
          if (node.tagName === 'IFRAME') {
            const style = window.getComputedStyle(node);
            if (style.display === 'none' || style.visibility === 'hidden' || 
                parseFloat(style.opacity) < 0.1 || 
                (node.offsetWidth === 0 && node.offsetHeight === 0)) {
              behavioralData.hiddenIframes++;
              console.warn('Zerophish: Hidden iframe detected', node);
            }
          }
        }
      });
    }
  });
});

// Start observing
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});

// Detect clipboard access
const originalClipboard = {
  readText: navigator.clipboard?.readText,
  writeText: navigator.clipboard?.writeText,
  read: navigator.clipboard?.read,
  write: navigator.clipboard?.write
};

if (navigator.clipboard) {
  ['readText', 'writeText', 'read', 'write'].forEach(method => {
    if (navigator.clipboard[method]) {
      const original = navigator.clipboard[method];
      navigator.clipboard[method] = function(...args) {
        behavioralData.clipboardAccess++;
        console.warn('Zerophish: Clipboard access detected:', method);
        return original.apply(this, args);
      };
    }
  });
}

// Detect suspicious event listeners
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  const suspiciousEvents = ['keydown', 'keyup', 'keypress', 'paste', 'copy', 'cut'];
  
  if (suspiciousEvents.includes(type)) {
    behavioralData.eventListeners.push({ type, target: this.constructor.name });
    
    if (type.startsWith('key')) {
      behavioralData.keyloggers++;
      console.warn('Zerophish: Potential keylogger detected:', type, this);
    }
  }
  
  return originalAddEventListener.call(this, type, listener, options);
};

// Analyze inline scripts for suspicious patterns
document.addEventListener('DOMContentLoaded', () => {
  const scripts = document.querySelectorAll('script');
  scripts.forEach(script => {
    const content = script.textContent || script.innerText || '';
    const suspiciousPatterns = [
      /eval\s*\(/i,
      /document\.write\s*\(/i,
      /atob\s*\(/i,
      /fromCharCode/i,
      /\.innerHTML\s*=/i,
      /location\.replace/i,
      /window\.open/i,
      /XMLHttpRequest/i,
      /fetch\s*\(/i
    ];
    
    let matchCount = 0;
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(content)) matchCount++;
    });
    
    if (matchCount >= 3) {
      behavioralData.suspiciousScripts.push({
        src: script.src || 'inline',
        patterns: matchCount
      });
    }
  });
});

// Check for fake overlays on inputs
function detectFakeOverlays() {
  const inputs = document.querySelectorAll('input[type="password"], input[type="email"], input[type="text"]');
  inputs.forEach(input => {
    const rect = input.getBoundingClientRect();
    const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
    
    // If input is covered by other elements
    if (elementsAtPoint[0] !== input && !elementsAtPoint[0].contains(input)) {
      const covering = elementsAtPoint[0];
      const isTransparent = window.getComputedStyle(covering).opacity < 1;
      
      if (isTransparent) {
        behavioralData.credentialHarvestingAttempts++;
        console.warn('Zerophish: Fake input overlay detected', input, covering);
      }
    }
  });
}

// Run overlay detection after page load
setTimeout(detectFakeOverlays, 2000);

// Send behavioral data to background script
function reportBehavioralData() {
  const score = calculateBehaviorScore();
  
  if (score > 30) { // Only report if suspicious
    chrome.runtime.sendMessage({
      action: 'behavioralReport',
      data: {
        ...behavioralData,
        score,
        url: window.location.href,
        timestamp: Date.now()
      }
    });
  }
}

function calculateBehaviorScore() {
  let score = 0;
  
  score += Math.min(behavioralData.formInjections * 30, 50);
  score += Math.min(behavioralData.hiddenIframes * 20, 40);
  score += Math.min(behavioralData.credentialHarvestingAttempts * 25, 50);
  score += Math.min(behavioralData.clipboardAccess * 10, 30);
  score += Math.min(behavioralData.keyloggers * 20, 40);
  score += Math.min(behavioralData.suspiciousScripts.length * 15, 30);
  score += Math.min(behavioralData.domModifications * 0.1, 20);
  
  return Math.min(score, 100);
}

// Report after 5 seconds to gather initial data
setTimeout(reportBehavioralData, 5000);

// Report before unload
window.addEventListener('beforeunload', reportBehavioralData);
