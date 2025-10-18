#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testNewSave() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[LOAD]') || text.includes('ERROR')) {
            console.log('BROWSER:', text);
        }
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.dev.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== STARTING TEST ===');

    // Execute some state-changing commands
    const commands = [
        'tomar maza',
        'abrir puerta principal con abrete sesamo',
        'ir puerta principal',
        'ir cuarto del guerrero',
        'tomar hacha',
        'romper cama con hacha'
    ];

    for (let cmd of commands) {
        console.log('>', cmd);
        await page.type('#input', cmd);
        await page.keyboard.press('Enter');
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    // Check room
    console.log('\n--- Checking room before save ---');
    await page.type('#input', 'mirar');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Save game
    console.log('\n--- Saving game ---');
    await page.type('#input', 'guardar testnew');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check what was saved
    const saveData = await page.evaluate(() => {
        const data = localStorage.getItem('fortaleza_save_testnew');
        return data;
    });
    console.log('\n=== SAVE DATA ===');
    console.log('Length:', saveData.length);
    console.log('Preview:', saveData.substring(0, 200));

    // Reload
    console.log('\n=== RELOADING PAGE ===');
    await page.reload();
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Load game
    console.log('\n=== LOADING SAVE ===');
    await page.type('#input', 'cargar testnew');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check room after load
    console.log('\n--- Checking room after load ---');
    await page.type('#input', 'mirar');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('\n=== RESULT ===');
    const lastLines = output.split('\n').filter(l => l.trim()).slice(-15);
    console.log('Last 15 lines:');
    lastLines.forEach(line => console.log('  ', line));

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

testNewSave().catch(console.error);
