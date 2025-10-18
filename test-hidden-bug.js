#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testHiddenBug() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
        console.log('BROWSER:', msg.text());
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.dev.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== STARTING FRESH GAME ===');

    // Go to warrior room
    console.log('\n--- Going to warrior room ---');
    await page.type('#input', 'tomar antorcha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.type('#input', 'ir puerta principal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.type('#input', 'ir cuarto del guerrero');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check what's in the room
    console.log('\n--- Checking room before breaking Cama ---');
    await page.type('#input', 'mirar');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Take Hacha
    await page.type('#input', 'tomar hacha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Break Cama to reveal Puerta
    console.log('\n--- Breaking Cama to reveal Puerta ---');
    await page.type('#input', 'romper cama con hacha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check what's in the room after breaking
    console.log('\n--- Checking room after breaking Cama ---');
    await page.type('#input', 'mirar');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Save game
    console.log('\n--- Saving game ---');
    await page.type('#input', 'guardar testhidden');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check localStorage to see what was saved
    const saveData = await page.evaluate(() => {
        const data = localStorage.getItem('fortaleza_save_testhidden');
        return data ? JSON.parse(data) : null;
    });
    console.log('\n=== SAVED STATE ===');
    console.log('Room 8 (Cuarto del guerrero) items:', JSON.stringify(saveData.roomStates[8].items, null, 2));

    console.log('\n=== RELOADING PAGE ===');
    await page.reload();
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== LOADING SAVE ===');
    await page.type('#input', 'cargar testhidden');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check what's in the room after loading
    console.log('\n--- Checking room after loading save ---');
    await page.type('#input', 'mirar');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('\n=== RESULT ===');
    console.log('Does output mention Puerta?', output.includes('Puerta'));
    console.log('\nLast few lines of output:');
    console.log(output.split('\n').slice(-10).join('\n'));

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

testHiddenBug().catch(console.error);
