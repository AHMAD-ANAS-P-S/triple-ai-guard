// Warning overlay function that gets injected into the page
function showWarningOverlay(reason, url) {
  // Check if overlay already exists
  if (document.getElementById('zerophish-warning-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'zerophish-warning-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  overlay.innerHTML = `
    <div style="max-width: 500px; background: white; border-radius: 12px; padding: 32px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
      <div style="width: 80px; height: 80px; background: #ef4444; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin: 0 0 16px 0;">
        ⚠️ Dangerous Site Detected
      </h1>
      <p style="font-size: 16px; color: #6b7280; margin: 0 0 24px 0; line-height: 1.6;">
        Zerophish AI has detected that this website may be a phishing attempt:
      </p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: left;">
        <p style="font-size: 14px; color: #991b1b; margin: 0; font-weight: 500;">
          ${reason}
        </p>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px 0;">
        We strongly recommend going back to safety. Proceeding may put your personal information at risk.
      </p>
      <div style="display: flex; gap: 12px;">
        <button id="zerophish-go-back" style="flex: 1; padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;">
          Go Back (Recommended)
        </button>
        <button id="zerophish-proceed" style="flex: 1; padding: 12px 24px; background: transparent; color: #6b7280; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          Proceed Anyway
        </button>
      </div>
      <p style="font-size: 12px; color: #9ca3af; margin: 24px 0 0 0;">
        Protected by Zerophish AI • Triple-AI Detection System
      </p>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add event listeners
  document.getElementById('zerophish-go-back').addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('zerophish-proceed').addEventListener('click', () => {
    overlay.remove();
  });

  // Hover effects
  const proceedBtn = document.getElementById('zerophish-proceed');
  proceedBtn.addEventListener('mouseenter', () => {
    proceedBtn.style.borderColor = '#ef4444';
    proceedBtn.style.color = '#ef4444';
  });
  proceedBtn.addEventListener('mouseleave', () => {
    proceedBtn.style.borderColor = '#e5e7eb';
    proceedBtn.style.color = '#6b7280';
  });
}
