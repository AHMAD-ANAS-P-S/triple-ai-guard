// Zerophish AI Content Script - Website Protection
console.log('Zerophish AI: Content script loaded');

// Create floating badge
function createZerophishBadge(result) {
  // Remove existing badge if any
  const existingBadge = document.getElementById('zerophish-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  const badge = document.createElement('div');
  badge.id = 'zerophish-badge';
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    background: white;
    border-radius: 12px;
    padding: 16px 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    font-family: system-ui, -apple-system, sans-serif;
    max-width: 320px;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
  `;

  const colors = {
    high: { bg: '#FEE2E2', border: '#DC2626', icon: '🚨' },
    medium: { bg: '#FEF3C7', border: '#F59E0B', icon: '⚠️' },
    low: { bg: '#D1FAE5', border: '#10B981', icon: '✓' }
  };

  const color = colors[result.threat];

  badge.innerHTML = `
    <style>
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
    <div style="display: flex; align-items: start; gap: 12px;">
      <div style="font-size: 24px;">${color.icon}</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #111; margin-bottom: 4px;">
          Zerophish AI - ${result.verdict}
        </div>
        <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
          ${result.reason}
        </div>
        <div style="display: flex; gap: 8px; font-size: 11px; color: #888;">
          <span>NLP: ${result.nlp.score}%</span>
          <span>Visual: ${result.visual.score}%</span>
          <span>Network: ${result.network.score}%</span>
        </div>
        <div style="font-size: 12px; color: ${color.border}; margin-top: 8px; font-weight: 500;">
          Confidence: ${result.confidence}%
        </div>
      </div>
      <button id="zerophish-close" style="
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #999;
        padding: 0;
        line-height: 1;
      ">×</button>
    </div>
  `;

  badge.style.borderLeft = `4px solid ${color.border}`;

  document.body.appendChild(badge);

  // Close button
  document.getElementById('zerophish-close').addEventListener('click', (e) => {
    e.stopPropagation();
    badge.remove();
  });

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (badge.parentElement) {
      badge.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => badge.remove(), 300);
    }
  }, 10000);

  // Click to see details
  badge.addEventListener('click', () => {
    alert(`Zerophish AI Analysis:\n\n${result.verdict}\n\n${result.reason}\n\nNLP Issues: ${result.nlp.issues.join(', ') || 'None'}\nVisual Issues: ${result.visual.issues.join(', ') || 'None'}\nNetwork Issues: ${result.network.issues.join(', ') || 'None'}`);
  });
}

// Listen for analysis results from background script
chrome.storage.local.get(`analysis_${chrome.runtime.id}`, (data) => {
  const key = Object.keys(data)[0];
  if (key && data[key]) {
    const analysis = data[key];
    if (analysis.url === window.location.href) {
      createZerophishBadge(analysis.result);
    }
  }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let key in changes) {
    if (key.startsWith('analysis_')) {
      const analysis = changes[key].newValue;
      if (analysis && analysis.url === window.location.href) {
        createZerophishBadge(analysis.result);
      }
    }
  }
});
