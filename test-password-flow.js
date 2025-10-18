#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testPasswordFlow() {
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

    console.log('\n=== TEST: Password and movement flow ===');

    // Open main door with password
    console.log('> abrir puerta principal con abrete sesamo');
    await page.type('#input', 'abrir puerta principal con abrete sesamo');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Move through the door
    console.log('> ir puerta principal');
    await page.type('#input', 'ir puerta principal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check where we are
    let room = await page.evaluate(() => gameState.player.curr.name);
    console.log('\nCurrent room:', room);
    console.log('Expected: el Salón de recepciones');
    console.log('Match:', room === 'el Salón de recepciones');

    // Save the game
    console.log('\n> guardar testpass');
    await page.type('#input', 'guardar testpass');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Reload page
    console.log('\n=== RELOADING PAGE ===');
    await page.reload();
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Load the game
    console.log('> cargar testpass');
    await page.type('#input', 'cargar testpass');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check where we are after load
    let room2 = await page.evaluate(() => gameState.player.curr.name);
    console.log('\nAfter load room:', room2);
    console.log('Expected: el Salón de recepciones');
    console.log('Match:', room2 === 'el Salón de recepciones');

    console.log('\n=== FINAL RESULT ===');
    console.log('Password works:', room === 'el Salón de recepciones');
    console.log('Save/Load works:', room2 === 'el Salón de recepciones');

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

testPasswordFlow().catch(console.error);
