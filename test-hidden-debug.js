#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testHiddenDebug() {
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

    console.log('\n=== STARTING FRESH GAME ===');

    // Inject debug function
    await page.evaluate(() => {
        window.debugRoom = function(roomIndex) {
            const room = gameState.rooms[roomIndex];
            console.log('=== DEBUG ROOM', roomIndex, ':', room.name, '===');
            console.log('Items in room:');
            room.items.forEach((item, idx) => {
                console.log(`  [${idx}] ${item.name} (${item.constructor.name})`);
                if (item.hiddenThing) {
                    console.log(`      -> hides: ${item.hiddenThing.name}`);
                }
            });
        };
    });

    // Take items we need
    await page.type('#input', 'tomar antorcha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.type('#input', 'tomar hacha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Go to warrior room
    await page.type('#input', 'ir puerta principal');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.type('#input', 'ir cuarto del guerrero');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Debug room state BEFORE breaking
    console.log('\n--- Room state BEFORE breaking Cama ---');
    await page.evaluate(() => window.debugRoom(8));
    await new Promise(resolve => setTimeout(resolve, 300));

    // Break Cama
    console.log('\n--- Breaking Cama ---');
    await page.type('#input', 'romper cama con hacha');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Debug room state AFTER breaking
    console.log('\n--- Room state AFTER breaking Cama ---');
    await page.evaluate(() => window.debugRoom(8));
    await new Promise(resolve => setTimeout(resolve, 300));

    // Look at room
    await page.type('#input', 'mirar');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Save game
    console.log('\n--- Saving game ---');
    await page.type('#input', 'guardar testhidden');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 300));

    // Check what was saved
    const saveData = await page.evaluate(() => {
        const data = localStorage.getItem('fortaleza_save_testhidden');
        return data ? JSON.parse(data) : null;
    });
    console.log('\n=== SAVED STATE ===');
    console.log('Room 8 items in save:', JSON.stringify(saveData.roomStates[8].items, null, 2));

    console.log('\n=== RELOADING PAGE ===');
    await page.reload();
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Re-inject debug function
    await page.evaluate(() => {
        window.debugRoom = function(roomIndex) {
            const room = gameState.rooms[roomIndex];
            console.log('=== DEBUG ROOM', roomIndex, ':', room.name, '===');
            console.log('Items in room:');
            room.items.forEach((item, idx) => {
                console.log(`  [${idx}] ${item.name} (${item.constructor.name})`);
                if (item.hiddenThing) {
                    console.log(`      -> hides: ${item.hiddenThing.name}`);
                }
            });
        };
    });

    // Debug fresh room state
    console.log('\n--- Fresh room state (after reload, before load) ---');
    await page.evaluate(() => window.debugRoom(8));
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('\n=== LOADING SAVE ===');
    await page.type('#input', 'cargar testhidden');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Debug room state after loading
    console.log('\n--- Room state AFTER loading save ---');
    await page.evaluate(() => window.debugRoom(8));
    await new Promise(resolve => setTimeout(resolve, 300));

    // Look at room
    await page.type('#input', 'mirar');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    let output = await page.evaluate(() => document.getElementById('output').textContent);
    console.log('\n=== FINAL CHECK ===');
    console.log('Does room description mention Puerta?', output.toLowerCase().includes('puerta'));

    await new Promise(resolve => setTimeout(resolve, 15000));
    await browser.close();
}

testHiddenDebug().catch(console.error);
