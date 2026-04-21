// test-launch.js - Fixed version with safe fingerprint handling

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { FingerprintGenerator } = require('fingerprint-generator');
const { FingerprintInjector } = require('fingerprint-injector');

// Activate stealth plugin
puppeteer.use(StealthPlugin());

async function run() {
    console.log('🤖 Generating a new digital identity...');

    // Create fingerprint generator and generate a fingerprint
    const generator = new FingerprintGenerator();
    const fingerprint = generator.getFingerprint({
        devices: ['desktop'],
        operatingSystems: ['windows'],
        locales: ['en-US'],
    });

    // Safely extract screen dimensions (handles different library versions)
    const screen = fingerprint.screen || fingerprint.viewport || {};
    const width = screen.width || 1920;
    const height = screen.height || 1080;
    console.log(`   Mask: Windows PC with ${width}x${height} screen.`);

    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({
        headless: false, // Visible window
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });

    const page = await browser.newPage();

    // Inject the fingerprint into the page
    const injector = new FingerprintInjector();
    await injector.attachFingerprintToPuppeteer(page, { fingerprint });
    console.log('✅ Identity applied.');

    // Go to a fingerprint testing site
    console.log('🔍 Checking disguise at browserleaks.com...');
    await page.goto('https://browserleaks.com/javascript', { waitUntil: 'networkidle2' });

    // Wait 8 seconds to visually inspect the page
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Take a screenshot
    await page.screenshot({ path: 'fingerprint-result.png' });
    console.log('📸 Screenshot saved as "fingerprint-result.png".');

    await browser.close();
    console.log('👋 Browser closed. Done.');
}

// Run and catch errors
run().catch(console.error);