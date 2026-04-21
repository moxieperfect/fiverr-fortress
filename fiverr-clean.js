// fiverr-clean.js - Minimal automation, maximum human mimicry
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './profiles/clean_01', // Fresh profile
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-web-security',
            '--window-size=1280,720',
            // CRITICAL: Use a real Chrome executable path if possible (optional)
        ],
        // Use system Chrome instead of bundled Chromium (more realistic)
        executablePath: puppeteer.executablePath(), // Or specify path to your Chrome
        ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Additional evasion: Remove "webdriver" before any page load
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        // Fake plugins
        Object.defineProperty(navigator, 'plugins', { get: () => [1,2,3,4,5] });
    });

    console.log('🌍 Going to Fiverr...');
    await page.goto('https://www.fiverr.com', { waitUntil: 'networkidle2', timeout: 60000 });

    console.log('✅ Browser open. Manually solve the challenge now.');
    // Keep browser open indefinitely
})();