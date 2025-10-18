#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testSaveLoad() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging - filter for WALK messages only
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[WALK]')) {
            console.log('BROWSER:', text);
        }
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== STARTING FRESH GAME (MINIFIED VERSION) ===');
    
    // Simple: Just take Maza and save
    await page.type('#input', 'tomar maza');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await page.type('#input', 'guardar testcrystal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('\n=== RELOADING PAGE ===');
    await page.reload();
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== LOADING SAVE ===');
    await page.type('#input', 'cargar testcrystal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n=== TRYING TO CROSS PUERTA PRINCIPAL (after load) ===');
    await page.type('#input', 'abrir puerta principal con abrete sesamo');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await page.type('#input', 'ir puerta principal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));

    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('\n=== RESULT ===');
    console.log('Made it to Salón de recepciones?', output.includes('Salón de recepciones'));

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

testSaveLoad().catch(console.error);
