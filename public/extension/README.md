# Zerophish AI - Chrome Extension

## 🛡️ Triple-AI Phishing Protection

Zerophish AI is a powerful Chrome extension that uses three specialized AI detectives to protect you from phishing attacks in real-time.

## Features

✅ **Automatic Website Protection**
- Analyzes every website you visit in real-time
- Shows floating badge with threat assessment
- Blocks dangerous sites automatically

✅ **Gmail Integration**
- Scans emails for phishing attempts
- Adds warning badges to suspicious emails
- Blocks dangerous email content

✅ **Triple-AI Detection**
- NLP Detective: Analyzes text patterns and language
- Visual Detective: Examines design and branding
- Network Detective: Checks domain and infrastructure

✅ **Smart Notifications**
- Real-time alerts for threats
- Confidence scores and detailed analysis
- Non-intrusive popup badges

## Installation

### Option 1: Load Unpacked Extension (Development)

1. **Download Extension Files**
   - All extension files are in the `public/extension/` folder
   - Download or copy this entire folder to your computer

2. **Open Chrome Extensions**
   - Open Chrome browser
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the Extension**
   - Click "Load unpacked"
   - **IMPORTANT:** Navigate to and select the `public/extension/` folder (NOT just `public`)
   - The extension will be installed with Zerophish AI icons

5. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Zerophish AI"
   - Click the pin icon to keep it visible

### Option 2: Chrome Web Store (Future)

Once published, you'll be able to install directly from the Chrome Web Store.

## Usage

### Automatic Protection

Once installed, Zerophish AI automatically:
- Scans every website you visit
- Analyzes Gmail emails when opened
- Shows threat assessments via badges
- Blocks high-risk websites

### Manual Scanning

1. Click the Zerophish AI icon in your toolbar
2. Click "Scan Current Page" button
3. View detailed analysis results
4. Check statistics (threats blocked, sites scanned)

### Gmail Protection

1. Open Gmail
2. Open any email
3. Zerophish AI will automatically analyze it
4. Warning badges appear for suspicious emails
5. Dangerous emails are blocked with overlay

### Settings

Click the extension icon to:
- Toggle auto-scan on/off
- View protection status
- Check threat statistics
- Access the dashboard

## How It Works

### Triple-AI Analysis

1. **NLP Detective**
   - Analyzes text patterns
   - Detects urgency tactics
   - Identifies grammatical errors
   - Spots AI-generated content

2. **Visual Detective**
   - Examines logos and branding
   - Checks color schemes
   - Analyzes layout patterns
   - Detects brand spoofing

3. **Network Detective**
   - Checks domain age
   - Verifies SSL certificates
   - Analyzes hosting location
   - Examines DNS patterns

### Threat Levels

- **🚨 HIGH (Blocked)**: All detectives agree it's dangerous → Site is blocked
- **⚠️ MEDIUM (Warning)**: 2/3 detectives suspicious → Warning shown
- **✓ LOW (Safe)**: No significant threats detected → Safe to proceed

## Configuration

### API Endpoint

The extension connects to Zerophish AI backend at:
```
https://giucniweqsloezqppsac.supabase.co/functions/v1/analyze-phishing
```

### Permissions

The extension requires these permissions:
- `activeTab`: To analyze the current page
- `tabs`: To monitor page navigation
- `notifications`: To show threat alerts
- `storage`: To save settings and statistics
- `https://mail.google.com/*`: For Gmail integration
- `https://*/*` and `http://*/*`: To protect all websites

## Troubleshooting

### Extension Not Working

1. Check that Developer Mode is enabled
2. Reload the extension at `chrome://extensions/`
3. Check browser console for errors (F12)

### Gmail Not Scanning

1. Make sure you're on `https://mail.google.com`
2. Refresh Gmail page
3. Open an email to trigger analysis
4. Check extension permissions

### Sites Not Being Scanned

1. Check auto-scan is enabled (click extension icon)
2. Some sites (chrome://) cannot be scanned
3. Check that you have internet connection
4. View extension logs in Chrome DevTools

### Analysis Taking Too Long

1. The AI analysis can take 2-5 seconds
2. Check your internet connection
3. Try manual scan from extension popup

## Privacy & Security

- ✅ All analysis happens via secure API
- ✅ No data is stored locally without your consent
- ✅ URLs and email content analyzed for threats only
- ✅ Open source - you can review all code
- ✅ No tracking or third-party analytics

## Support

For issues, questions, or feature requests:
- Visit: https://51677893-a813-4b94-8565-797993464922.lovableproject.com
- View Dashboard: https://51677893-a813-4b94-8565-797993464922.lovableproject.com/dashboard

## Roadmap

Coming soon:
- [ ] Chrome Web Store publication
- [ ] Custom block/allow lists
- [ ] Export threat reports
- [ ] Team/organization features
- [ ] Additional browser support (Firefox, Edge)

## License

Zerophish AI - Triple-AI Phishing Protection
