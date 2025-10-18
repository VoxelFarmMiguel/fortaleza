#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testSimpleMove() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[') || text.includes('ERROR')) {
            console.log('BROWSER:', text);
        }
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.dev.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== TEST: Simple movement ===');

    // Just take maza and try to move
    await page.type('#input', 'tomar maza');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.type('#input', 'abrir puerta principal con ariete');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.type('#input', 'ir puerta principal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check where we are
    let room1 = await page.evaluate(() => gameState.player.curr.name);
    console.log('After first move, current room:', room1);

    // Save
    console.log('\n--- Saving ---');
    await page.type('#input', 'guardar testmove');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Reload
    console.log('\n--- Reloading ---');
    await page.reload();
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Load
    console.log('\n--- Loading ---');
    await page.type('#input', 'cargar testmove');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check where we are
    let room2 = await page.evaluate(() => gameState.player.curr.name);
    console.log('After load, current room:', room2);

    console.log('\n=== RESULT ===');
    console.log('Match:', room1 === room2);

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

testSimpleMove().catch(console.error);
