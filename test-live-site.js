#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testLiveSite() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[LOAD]')) {
            console.log('PAGE LOG:', text);
        }
    });

    console.log('\n=== TESTING LIVE SITE: fortressadventure.com ===\n');

    await page.goto('https://fortressadventure.com');
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('=== TAKING MAZA ===');
    await page.type('#input', 'tomar maza');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('=== CHECKING INVENTORY BEFORE SAVE ===');
    await page.type('#input', 'i');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('Has Maza before save:', output.includes('Maza (39)'));

    console.log('\n=== SAVING AS livetest ===');
    await page.type('#input', 'guardar livetest');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== RELOADING PAGE ===');
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== LOADING livetest ===');
    await page.type('#input', 'cargar livetest');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n=== CHECKING INVENTORY AFTER LOAD ===');
    await page.type('#input', 'i');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    output = await page.evaluate(() => document.getElementById('output').textContent);

    const lines = output.split('\n');
    const lastInvIndex = output.lastIndexOf('> i');
    const inventoryText = output.substring(lastInvIndex);

    console.log('\n=== FINAL RESULT ===');
    console.log('Inventory after load:', inventoryText.substring(0, 200));
    console.log('\nHas Maza after load:', output.includes('Maza (39)'));

    if (!output.includes('Maza (39)')) {
        console.log('\n❌ BUG STILL EXISTS ON LIVE SITE!');
    } else {
        console.log('\n✅ BUG FIXED ON LIVE SITE!');
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
}

testLiveSite().catch(console.error);
