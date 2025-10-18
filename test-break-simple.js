#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testBreak() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable ALL console logging
    page.on('console', msg => {
        console.log('BROWSER:', msg.text());
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.dev.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== STARTING TEST ===');

    // Inject debug helper
    await page.evaluate(() => {
        window.showInventory = function() {
            console.log('=== INVENTORY ===');
            gameState.player.bag.items.forEach((item, idx) => {
                console.log(`  [${idx}] ${item.name}`);
            });
        };
    });

    // Take Hacha (it's in room 0 - Exterior)
    console.log('\n--- Taking Hacha ---');
    await page.type('#input', 'tomar hacha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.evaluate(() => window.showInventory());

    // Take Antorcha
    console.log('\n--- Taking Antorcha ---');
    await page.type('#input', 'tomar antorcha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Go to warrior room
    console.log('\n--- Going to warrior room ---');
    await page.type('#input', 'ir puerta principal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.type('#input', 'ir cuarto del guerrero');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.evaluate(() => window.showInventory());

    // Try to break Cama
    console.log('\n--- Attempting to break Cama with Hacha ---');
    await page.type('#input', 'romper cama con hacha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check output
    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('\n=== OUTPUT CHECK ===');
    const lines = output.split('\n').slice(-5);
    console.log('Last 5 lines:');
    lines.forEach(line => console.log('  ', line));

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

testBreak().catch(console.error);
