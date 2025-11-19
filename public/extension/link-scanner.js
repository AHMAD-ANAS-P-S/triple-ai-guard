// Zerophish AI - Inline Link Scanner
// Shows threat indicators when hovering over links

console.log('Zerophish AI: Inline Link Scanner loaded');

const linkCache = new Map(); // Cache analysis results
let activeBadge = null;

// Create threat badge
function createThreatBadge(threat, link) {
  if (activeBadge) activeBadge.remove();
  
  const badge = document.createElement('div');
  badge.className = 'zerophish-link-badge';
  
  const colors = {
    high: { bg: '#DC2626', icon: '🚨', text: 'DANGEROUS' },
    medium: { bg: '#F59E0B', icon: '⚠️', text: 'SUSPICIOUS' },
    low: { bg: '#10B981', icon: '✓', text: 'SAFE' }
  };
  
  const color = colors[threat] || colors.low;
  const rect = link.getBoundingClientRect();
  
  badge.style.cssText = `
    position: fixed;
    top: ${rect.bottom + window.scrollY + 5}px;
    left: ${rect.left + window.scrollX}px;
    background: ${color.bg};
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 999999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    pointer-events: none;
    animation: fadeInScale 0.2s ease-out;
  `;
  
  badge.innerHTML = `${color.icon} ${color.text}`;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInScale {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  if (!document.querySelector('#zerophish-link-styles')) {
    style.id = 'zerophish-link-styles';
    document.head.appendChild(style);
  }
  
  document.body.appendChild(badge);
  activeBadge = badge;
}

// Analyze link on hover
async function analyzeLinkOnHover(link) {
  const url = link.href;
  if (!url || url.startsWith('javascript:') || url.startsWith('#')) return;
  
  // Check cache first
  if (linkCache.has(url)) {
    const cached = linkCache.get(url);
    createThreatBadge(cached.threat, link);
    return;
  }
  
  // Quick heuristic check
  const heuristicThreat = quickHeuristicCheck(url);
  if (heuristicThreat) {
    createThreatBadge(heuristicThreat, link);
    linkCache.set(url, { threat: heuristicThreat });
    return;
  }
  
  // Request full analysis from background
  chrome.runtime.sendMessage({
    action: 'analyzeLinkHover',
    url: url
  }, (response) => {
    if (response && response.result) {
      const threat = response.result.threat || 'low';
      linkCache.set(url, { threat });
      
      // Check if still hovering the same link
      if (document.querySelector(`a[href="${url}"]:hover`)) {
        createThreatBadge(threat, link);
      }
    }
  });
}

// Quick heuristic check for obvious threats
function quickHeuristicCheck(url) {
  try {
    const urlObj = new URL(url);
    
    // Check for suspicious patterns
    const suspiciousKeywords = [
      'verify', 'secure', 'account', 'suspend', 'update', 
      'confirm', 'billing', 'payment', 'login', 'signin',
      'credential', 'password', 'wallet', 'crypto'
    ];
    
    const hostname = urlObj.hostname.toLowerCase();
    const path = urlObj.pathname.toLowerCase();
    const full = url.toLowerCase();
    
    // Check for IP addresses as domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return 'high';
    }
    
    // Check for suspicious TLDs
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.win', '.loan'];
    if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
      return 'medium';
    }
    
    // Check for excessive subdomains (>3)
    const subdomains = hostname.split('.');
    if (subdomains.length > 4) {
      return 'medium';
    }
    
    // Check for suspicious keywords
    const keywordCount = suspiciousKeywords.filter(kw => 
      full.includes(kw)
    ).length;
    
    if (keywordCount >= 3) {
      return 'high';
    } else if (keywordCount >= 2) {
      return 'medium';
    }
    
    // Check for homograph attempts (mixed scripts)
    if (/[а-яА-Я]/.test(hostname) || /[α-ωΑ-Ω]/.test(hostname)) {
      return 'high';
    }
    
    return null;
  } catch {
    return null;
  }
}

// Add hover listeners to all links
function addLinkListeners() {
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    if (link.dataset.zerophishListening) return;
    link.dataset.zerophishListening = 'true';
    
    link.addEventListener('mouseenter', () => {
      analyzeLinkOnHover(link);
    });
    
    link.addEventListener('mouseleave', () => {
      if (activeBadge) {
        setTimeout(() => {
          if (activeBadge) activeBadge.remove();
          activeBadge = null;
        }, 100);
      }
    });
  });
}

// Initial setup
addLinkListeners();

// Watch for dynamically added links
const linkObserver = new MutationObserver(() => {
  addLinkListeners();
});

linkObserver.observe(document.body, {
  childList: true,
  subtree: true
});
