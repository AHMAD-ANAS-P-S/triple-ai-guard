// Zerophish AI Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings - default to opt-in (false)
  const { autoScan = false, stats = { blocked: 0, scanned: 0 } } = await chrome.storage.local.get(['autoScan', 'stats']);
  
  document.getElementById('autoScan').checked = autoScan;
  document.getElementById('threatsBlocked').textContent = stats.blocked || 0;
  document.getElementById('sitesScanned').textContent = stats.scanned || 0;
  document.getElementById('protectionStatus').textContent = autoScan ? '🟢 Active' : '🔴 Disabled';

  // Auto-scan toggle
  document.getElementById('autoScan').addEventListener('change', async (e) => {
    await chrome.storage.local.set({ autoScan: e.target.checked });
    document.getElementById('protectionStatus').textContent = e.target.checked ? '🟢 Active' : '🔴 Disabled';
  });

  // Scan current page
  document.getElementById('scanCurrent').addEventListener('click', async () => {
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    
    loading.classList.add('show');
    result.classList.remove('show');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url || tab.url.startsWith('chrome://')) {
        showResult({
          threat: 'low',
          verdict: 'SKIPPED',
          reason: 'Cannot scan Chrome internal pages',
          confidence: 0,
          nlp: { score: 0 },
          visual: { score: 0 },
          network: { score: 0 }
        });
        loading.classList.remove('show');
        return;
      }

      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'analyzeCurrentPage'
      }, (response) => {
        loading.classList.remove('show');
        
        if (response && response.success && response.result) {
          showResult(response.result);
          
          // Update stats
          const newStats = {
            blocked: stats.blocked + (response.result.threat === 'high' ? 1 : 0),
            scanned: (stats.scanned || 0) + 1
          };
          chrome.storage.local.set({ stats: newStats });
          document.getElementById('threatsBlocked').textContent = newStats.blocked;
          document.getElementById('sitesScanned').textContent = newStats.scanned;
        } else {
          showResult({
            threat: 'low',
            verdict: 'ERROR',
            reason: 'Analysis failed. Please try again.',
            confidence: 0,
            nlp: { score: 0 },
            visual: { score: 0 },
            network: { score: 0 }
          });
        }
      });
    } catch (error) {
      console.error('Scan error:', error);
      loading.classList.remove('show');
      showResult({
        threat: 'low',
        verdict: 'ERROR',
        reason: error.message,
        confidence: 0,
        nlp: { score: 0 },
        visual: { score: 0 },
        network: { score: 0 }
      });
    }
  });

  // Open dashboard
  document.getElementById('openDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://51677893-a813-4b94-8565-797993464922.lovableproject.com/dashboard' });
  });

  // Show current page analysis if available
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    const analysis = await chrome.storage.local.get(`analysis_${tab.id}`);
    const key = Object.keys(analysis)[0];
    if (key && analysis[key]) {
      showResult(analysis[key].result);
    }
  }
});

function showResult(result) {
  const resultDiv = document.getElementById('result');
  const icons = {
    high: '🚨',
    medium: '⚠️',
    low: '✓'
  };

  document.getElementById('resultIcon').textContent = icons[result.threat];
  document.getElementById('resultTitle').textContent = result.verdict;
  document.getElementById('resultConfidence').textContent = `Confidence: ${result.confidence}%`;
  document.getElementById('resultReason').textContent = result.reason;
  document.getElementById('resultScores').innerHTML = `
    <span>NLP: ${result.nlp.score}%</span>
    <span>Visual: ${result.visual.score}%</span>
    <span>Network: ${result.network.score}%</span>
  `;

  resultDiv.classList.add('show');
}
