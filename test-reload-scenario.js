#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testWithReload() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[LOAD]')) {
            console.log('PAGE:', text);
        }
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');

    console.log('\n=== SESSION 1: SAVE ===');
    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take Maza
    await page.evaluate(() => {
        document.getElementById('input').value = 'tomar maza';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check inventory
    await page.evaluate(() => {
        document.getElementById('input').value = 'inventario';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('Has Maza before save:', output.includes('Maza'));

    // Save
    await page.evaluate(() => {
        document.getElementById('input').value = 'guardar testreload';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== SESSION 2: RELOAD PAGE AND LOAD ===');
    // Reload the page (simulating closing and reopening browser)
    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Load the save
    await page.evaluate(() => {
        document.getElementById('input').value = 'cargar testreload';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check inventory
    await page.evaluate(() => {
        document.getElementById('input').value = 'inventario';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    output = await page.evaluate(() => document.getElementById('output').textContent);

    const lines = output.split('\n');
    const invIndex = lines.findIndex(l => l.includes('> inventario'));

    console.log('\n=== RESULT AFTER RELOAD ===');
    if (invIndex >= 0) {
        console.log(lines.slice(invIndex, invIndex + 5).join('\n'));
    }

    console.log('\nHas Maza after reload+load:', output.includes('Maza'));

    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
}

testWithReload().catch(console.error);
