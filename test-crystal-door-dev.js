#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testCrystalDoor() {
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

    console.log('\n=== NAVIGATING TO PÁRAMO ===');
    
    // Quick navigation to páramo (Room 23)
    const commands = [
        'abrir puerta principal con abrete sesamo',
        'ir puerta principal',
        'ir puerta negra',
        'ir puerta azul',
        'ir puerta verde',
        'ir libro',
        'ir puerta verde',
        'ir puerta de madera',
        'ir puerta verde'
    ];

    for (const cmd of commands) {
        await page.type('#input', cmd);
        await page.keyboard.press('Enter');
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=== CHECKING IF WE ARE IN PÁRAMO ===');
    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('Current location contains "páramo"?', output.toLowerCase().includes('páramo'));

    console.log('\n=== TRYING TO CROSS CRYSTAL DOOR (should fail - door is closed) ===');
    await page.type('#input', 'ir puerta de cristal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== OPENING CRYSTAL DOOR WITH AGUA ===');
    await page.type('#input', 'abrir puerta de cristal con agua');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== TRYING TO CROSS CRYSTAL DOOR AGAIN (should work now) ===');
    await page.type('#input', 'ir puerta de cristal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));

    output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('\n=== CHECKING IF WE MADE IT TO SALÓN DE CRISTAL ===');
    console.log('Contains "Salón de cristal"?', output.includes('Salón de cristal'));

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

testCrystalDoor().catch(console.error);
