// test-navigation.js - Simple stealth test (no fingerprint injection)
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    console.log('🚀 Launching browser with stealth...');
    const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    console.log('🌐 Navigating to BrowserLeaks...');
    await page.goto('https://browserleaks.com/javascript', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully!');
    await page.screenshot({ path: 'navigation-test.png' });
    console.log('📸 Screenshot saved.');
    
    await new Promise(r => setTimeout(r, 8000));
    await browser.close();
    console.log('👋 Done.');
})();