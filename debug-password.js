#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function debugPassword() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    page.on('console', msg => {
        console.log('BROWSER:', msg.text());
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.dev.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== TESTING PASSWORD ===');

    // Add debug logging to the page
    await page.evaluate(() => {
        const originalOpenD = gameState.player.openD;
        gameState.player.openD = function(door, key) {
            console.log('[DEBUG] openD called with door:', door, 'key:', key);
            return originalOpenD.call(this, door, key);
        };

        const originalOpenItem = gameState.player.curr.constructor.prototype.openItem;
        gameState.player.curr.constructor.prototype.openItem = function(nm, psKey) {
            console.log('[DEBUG] openItem called with nm:', nm, 'psKey:', psKey);
            const item = this.get(nm);
            console.log('[DEBUG] Found item:', item ? item.name : 'null');
            if (item) {
                console.log('[DEBUG] Item key:', item.key);
                console.log('[DEBUG] Item type:', item.constructor.name);
            }
            return originalOpenItem.call(this, nm, psKey);
        };
    });

    // Try the command
    await page.type('#input', 'abrir puerta principal con abrete sesamo');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get output
    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('\n=== OUTPUT ===');
    const lastLines = output.split('\n').filter(l => l.trim()).slice(-10);
    lastLines.forEach(line => console.log('  ', line));

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

debugPassword().catch(console.error);
