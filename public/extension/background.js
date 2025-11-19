// Zerophish AI Background Service Worker
const API_URL = 'https://giucniweqsloezqppsac.supabase.co/functions/v1/analyze-phishing';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdWNuaXdlcXNsb2V6cXBwc2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Nzc0MDEsImV4cCI6MjA3NTQ1MzQwMX0.k5CpKWu6IKyUNUBJEjVlcCvk-kwXdxk7klJXG7aJ4FY';

// Analyze URL with Zerophish AI
async function analyzeURL(url) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'apikey': API_KEY
      },
      body: JSON.stringify({ url, emailContent: '' })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Analysis error:', error);
    return null;
  }
}

// Show notification
function showNotification(title, message, threat) {
  const iconMap = {
    'high': 'icon-danger.png',
    'medium': 'icon-warning.png',
    'low': 'icon-safe.png'
  };

  chrome.notifications.create({
    type: 'basic',
    iconUrl: iconMap[threat] || 'icon48.png',
    title: title,
    message: message,
    priority: threat === 'high' ? 2 : 1
  });
}

// Listen for tab updates (page navigation)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Skip chrome:// and extension pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    // Check if auto-scan is enabled (opt-in by default)
    const { autoScan = false } = await chrome.storage.local.get('autoScan');
    
    if (!autoScan) {
      return;
    }

    // Analyze the URL with error handling
    const result = await analyzeURL(tab.url);
    
    if (!result) {
      // Don't block on API failure - just log for debugging
      console.warn('Analysis failed for:', tab.url);
      return;
    }
    
    // Store result for popup
    await chrome.storage.local.set({
      [`analysis_${tabId}`]: {
        url: tab.url,
        result: result,
        timestamp: Date.now()
      }
    });

    // Show notification and warning overlay (not automatic block)
    if (result.threat === 'high') {
      showNotification(
        '🚨 WARNING - High Risk Detected!',
        `Zerophish detected a dangerous site: ${result.reason}`,
        'high'
      );
      
      // Inject warning overlay instead of blocking
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: showWarningOverlay,
        args: [result.reason, tab.url]
      });
    } else if (result.threat === 'medium') {
      showNotification(
        '⚠️ WARNING - Suspicious Activity',
        `Be careful: ${result.reason}`,
        'medium'
      );
    }
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeEmail') {
    analyzeURL('', request.emailContent).then(result => {
      sendResponse({ success: true, result });
    });
    return true;
  }
  
  if (request.action === 'analyzeCurrentPage') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        const result = await analyzeURL(tabs[0].url);
        sendResponse({ success: true, result });
      }
    });
    return true;
  }
  
  if (request.action === 'behavioralReport') {
    console.log('Behavioral data received:', request.data);
    // Store for dashboard reporting
    chrome.storage.local.set({ [`behavioral_${Date.now()}`]: request.data });
  }
  
  if (request.action === 'qrCodesDetected') {
    console.log('QR codes detected:', request.data);
    showNotification('QR Code Detected', `Found ${request.data.count} QR code(s) on this page`, 'medium');
  }
  
  if (request.action === 'analyzeLinkHover') {
    analyzeURL(request.url).then(result => {
      sendResponse({ success: true, result });
    });
    return true;
  }
  
  if (request.action === 'scanQRCode') {
    // In production, decode QR and analyze destination
    console.log('QR scan requested:', request.data);
  }
});

console.log('Zerophish AI Background Service Worker initialized');
