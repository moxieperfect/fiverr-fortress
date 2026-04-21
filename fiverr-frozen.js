// fiverr-frozen.js - Completely locked fingerprint
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// FIXED fingerprint values for this specific persona
const FIXED_FINGERPRINT = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: 'Win32',
    screenWidth: 1280,
    screenHeight: 720,
    language: 'en-US',
    timezone: 'America/Los_Angeles', // Or your local timezone
};

async function applyFixedFingerprint(page) {
    const client = await page.target().createCDPSession();
    
    // Override navigator properties before any page loads
    await page.evaluateOnNewDocument((fp) => {
        // Overwrite userAgent and platform
        Object.defineProperty(navigator, 'userAgent', {
            get: () => fp.userAgent,
        });
        Object.defineProperty(navigator, 'platform', {
            get: () => fp.platform,
        });
        Object.defineProperty(navigator, 'languages', {
            get: () => [fp.language],
        });
        
        // Overwrite screen dimensions
        Object.defineProperty(screen, 'width', {
            get: () => fp.screenWidth,
        });
        Object.defineProperty(screen, 'height', {
            get: () => fp.screenHeight,
        });
        
        // Overwrite timezone offset
        Date.prototype.getTimezoneOffset = () => {
            // America/Los_Angeles is UTC-7 or -8 depending on DST, adjust as needed
            return 420; // Minutes offset for PDT (UTC-7)
        };
        
        // Remove webdriver flag
        delete navigator.__proto__.webdriver;
    }, FIXED_FINGERPRINT);
    
    // Also set viewport to match
    await page.setViewport({
        width: FIXED_FINGERPRINT.screenWidth,
        height: FIXED_FINGERPRINT.screenHeight,
    });
    
    // Set timezone via CDP
    await client.send('Emulation.setTimezoneOverride', {
        timezoneId: FIXED_FINGERPRINT.timezone,
    });
    
    // Set locale
    await client.send('Emulation.setLocaleOverride', {
        locale: FIXED_FINGERPRINT.language,
    });
    
    console.log('🧊 Fingerprint frozen.');
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './profiles/frozen_01', // Dedicated profile for this frozen identity
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1280,720',
            `--user-agent=${FIXED_FINGERPRINT.userAgent}`,
        ],
        ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = await browser.newPage();
    
    // Apply the frozen fingerprint
    await applyFixedFingerprint(page);
    
    console.log('🌍 Navigating to Fiverr...');
    await page.goto('https://www.fiverr.com', { waitUntil: 'networkidle2' });
    
    console.log('✅ Browser open. Solve challenge if needed. Then DO NOT CLOSE this terminal.');
    console.log('⏸️  Press Ctrl+C when done to close cleanly.');
})();