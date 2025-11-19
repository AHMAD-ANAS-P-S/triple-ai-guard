// Inline Link Scanner - Hover Detection for Zerophish AI
const API_URL = 'https://giucniweqsloezqppsac.supabase.co/functions/v1/analyze-phishing';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpdWNuaXdlcXNsb2V6cXBwc2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Nzc0MDEsImV4cCI6MjA3NTQ1MzQwMX0.k5CpKWu6IKyUNUBJEjVlcCvk-kwXdxk7klJXG7aJ4FY';

// Cache for scanned URLs
const urlCache = new Map();
const scanningUrls = new Set();

// Analyze URL on hover
async function analyzeURL(url) {
  // Check cache first
  if (urlCache.has(url)) {
    return urlCache.get(url);
  }
  
  // Avoid duplicate scans
  if (scanningUrls.has(url)) {
    return null;
  }
  
  scanningUrls.add(url);
  
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
    
    if (response.ok) {
      const result = await response.json();
      urlCache.set(url, result);
      return result;
    }
  } catch (error) {
    console.error('Link scan error:', error);
  } finally {
    scanningUrls.delete(url);
  }
  
  return null;
}

// Create threat badge
function createThreatBadge(threat) {
  const badge = document.createElement('span');
  badge.className = 'zerophish-badge';
  
  let color, emoji, text;
  if (threat === 'high') {
    color = '#dc2626';
    emoji = '🚨';
    text = 'DANGER';
  } else if (threat === 'medium') {
    color = '#f59e0b';
    emoji = '⚠️';
    text = 'WARNING';
  } else {
    color = '#10b981';
    emoji = '✓';
    text = 'SAFE';
  }
  
  badge.style.cssText = `
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    background: ${color};
    color: white;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
    font-family: system-ui, -apple-system, sans-serif;
    vertical-align: middle;
    animation: fadeIn 0.3s;
  `;
  badge.textContent = `${emoji} ${text}`;
  
  return badge;
}

// Add hover listener to all links
function initLinkScanner() {
  document.addEventListener('mouseover', async (e) => {
    const link = e.target.closest('a');
    if (!link || !link.href || link.dataset.zerophishScanned) return;
    
    // Skip internal links
    if (link.href.startsWith(window.location.origin)) return;
    
    link.dataset.zerophishScanned = 'true';
    
    // Show loading indicator
    const loadingBadge = document.createElement('span');
    loadingBadge.className = 'zerophish-loading';
    loadingBadge.textContent = '⏳ Scanning...';
    loadingBadge.style.cssText = `
      display: inline-block;
      margin-left: 8px;
      padding: 2px 8px;
      background: #6b7280;
      color: white;
      border-radius: 4px;
      font-size: 11px;
      font-family: system-ui, -apple-system, sans-serif;
    `;
    link.appendChild(loadingBadge);
    
    // Analyze the link
    const result = await analyzeURL(link.href);
    
    // Remove loading badge
    loadingBadge.remove();
    
    if (result) {
      // Add threat badge
      const badge = createThreatBadge(result.threat);
      link.appendChild(badge);
      
      // Add tooltip
      link.title = `Zerophish AI: ${result.verdict} - ${result.reason}`;
    }
  });
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-2px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// Initialize
initLinkScanner();

console.log('Zerophish Link Scanner active');
