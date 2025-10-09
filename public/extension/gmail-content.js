// Zerophish AI Gmail Content Script - Email Protection
console.log('Zerophish AI: Gmail protection active');

let processedEmails = new Set();

// Extract email content from Gmail
function extractEmailContent(emailElement) {
  const subject = emailElement.querySelector('[data-subject]')?.textContent || '';
  const body = emailElement.querySelector('.a3s')?.textContent || '';
  const sender = emailElement.querySelector('.go')?.textContent || '';
  const links = Array.from(emailElement.querySelectorAll('a')).map(a => a.href);
  
  return {
    subject,
    body,
    sender,
    links: links.join('\n'),
    fullContent: `From: ${sender}\nSubject: ${subject}\n\n${body}\n\nLinks:\n${links.join('\n')}`
  };
}

// Add Zerophish badge to email
function addZerophishBadge(emailElement, result) {
  // Check if already processed
  if (emailElement.dataset.zerophishProcessed) {
    return;
  }
  emailElement.dataset.zerophishProcessed = 'true';

  const colors = {
    high: { bg: '#FEE2E2', border: '#DC2626', text: '#991B1B', icon: '🚨' },
    medium: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', icon: '⚠️' },
    low: { bg: '#D1FAE5', border: '#10B981', text: '#065F46', icon: '✓' }
  };

  const color = colors[result.threat];

  const badge = document.createElement('div');
  badge.style.cssText = `
    background: ${color.bg};
    border-left: 4px solid ${color.border};
    padding: 12px;
    margin: 8px 0;
    border-radius: 4px;
    font-family: 'Google Sans', Arial, sans-serif;
    font-size: 13px;
  `;

  badge.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; color: ${color.text}; font-weight: 500;">
      <span style="font-size: 18px;">${color.icon}</span>
      <span>Zerophish AI: ${result.verdict}</span>
    </div>
    <div style="color: ${color.text}; margin-top: 6px; font-size: 12px;">
      ${result.reason}
    </div>
    <div style="margin-top: 8px; font-size: 11px; color: #666; display: flex; gap: 12px;">
      <span>NLP: ${result.nlp.score}%</span>
      <span>Visual: ${result.visual.score}%</span>
      <span>Network: ${result.network.score}%</span>
      <span>Confidence: ${result.confidence}%</span>
    </div>
  `;

  // Insert badge at the top of email
  const emailBody = emailElement.querySelector('.a3s');
  if (emailBody) {
    emailBody.insertBefore(badge, emailBody.firstChild);
  }

  // If high threat, add warning overlay
  if (result.threat === 'high') {
    emailElement.style.opacity = '0.6';
    emailElement.style.pointerEvents = 'none';
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(220, 38, 38, 0.1);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: not-allowed;
    `;
    overlay.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 400px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 12px;">🚨</div>
        <div style="font-weight: 600; color: #DC2626; margin-bottom: 8px;">BLOCKED - Dangerous Email</div>
        <div style="color: #666; font-size: 14px;">${result.reason}</div>
      </div>
    `;
    emailElement.style.position = 'relative';
    emailElement.appendChild(overlay);
  }
}

// Analyze opened emails
async function analyzeEmail(emailElement) {
  const emailId = emailElement.dataset.messageId;
  
  if (!emailId || processedEmails.has(emailId)) {
    return;
  }

  processedEmails.add(emailId);

  const emailData = extractEmailContent(emailElement);
  
  // Send to background script for analysis
  chrome.runtime.sendMessage({
    action: 'analyzeEmail',
    emailContent: emailData.fullContent
  }, (response) => {
    if (response && response.success && response.result) {
      addZerophishBadge(emailElement, response.result);
    }
  });
}

// Observe Gmail for new emails
const observer = new MutationObserver((mutations) => {
  // Look for opened emails
  const emails = document.querySelectorAll('[data-message-id]');
  emails.forEach(email => {
    if (email.querySelector('.a3s') && !email.dataset.zerophishProcessed) {
      analyzeEmail(email);
    }
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Analyze any already-open emails
setTimeout(() => {
  const emails = document.querySelectorAll('[data-message-id]');
  emails.forEach(email => {
    if (email.querySelector('.a3s')) {
      analyzeEmail(email);
    }
  });
}, 2000);
