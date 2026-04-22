// fiverr-bot.js - Main automation script for one account persona
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// ===== CONFIGURATION FOR THIS SPECIFIC ACCOUNT =====
const ACCOUNT_CONFIG = {
    // Unique folder for this persona's cookies/session
    // Railway volume mounts at /app/profiles, so use that path
    profilePath: '/app/profiles/account_01',
    // VPS Proxy settings (leave empty for now if not ready)
    proxyServer: null, // e.g., 'http://your-vps-ip:3128'
    // Target URL to start
    startUrl: 'https://www.fiverr.com',
};

async function launchSecureBrowser(config) {
    const launchOptions = {
        headless: false, // <-- FIXED: Added quotes around "new"
        userDataDir: config.profilePath, // Persistent profile
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // <-- ADDED: Prevents crashes in Docker/cloud
            '--disable-blink-features=AutomationControlled', // Extra stealth
        ],
    };

    // Add proxy if configured
    if (config.proxyServer) {
        launchOptions.args.push(`--proxy-server=${config.proxyServer}`);
        console.log(`🌐 Using proxy: ${config.proxyServer}`);
    }

    console.log(`📁 Profile stored in: ${config.profilePath}`);
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Set a realistic viewport (overrides default 800x600)
    await page.setViewport({ width: 1280, height: 720 });

    return { browser, page };
}

async function dailyRoutine() {
    const { browser, page } = await launchSecureBrowser(ACCOUNT_CONFIG);

    console.log('🌍 Navigating to Fiverr...');
    await page.goto(ACCOUNT_CONFIG.startUrl, { waitUntil: 'networkidle2' });

    // Simple human-like behavior: scroll a bit
    await page.evaluate(() => window.scrollBy(0, 300));
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 3000));

    // TODO: Add login check, message monitoring, etc.

    console.log('✅ Routine completed. Keeping browser open for manual use.');
    // Do NOT close automatically - you can manually interact or close with Ctrl+C
    // await browser.close();
}

// Run it
// Run it once, then keep alive
async function keepAlive() {
    await dailyRoutine();
    console.log('✅ Initial routine done. Keeping process alive...');
    // Stay alive forever (or until Railway stops us)
    setInterval(() => {
        console.log('💓 Heartbeat - bot is still running');
    }, 60000); // Log a heartbeat every minute
}

keepAlive().catch(console.error);