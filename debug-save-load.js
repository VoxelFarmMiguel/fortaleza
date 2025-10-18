#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function debugSaveLoad() {
    const browser = await puppeteer.launch({
        headless: false,  // Make it visible to see what's happening
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');
    await page.goto(indexPath);
    await page.waitForSelector('#input');

    // Wait a bit for game to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Opening actual game URL to check localStorage...");

    // Pick up maza
    const commands = [
        'abrir puerta principal con abrete sesamo',
        'atravesar puerta principal',
        'atravesar puerta principal',
        'tomar maza',
        'inventario'
    ];

    for (const cmd of commands) {
        await page.evaluate((command) => {
            document.getElementById('input').value = command;
            processCommand();
        }, cmd);
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log("=== BEFORE SAVE ===");
    // Check inventory using the game command instead of accessing gameState directly
    const outputBefore = await page.evaluate(() => {
        const output = document.getElementById('output');
        return output.innerHTML;
    });
    console.log("Output includes 'Maza':", outputBefore.includes('Maza'));

    // Save
    await page.evaluate(() => {
        document.getElementById('input').value = 'guardar test1';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 200));

    // Check what was saved
    const savedData = await page.evaluate(() => {
        const data = localStorage.getItem('fortaleza_save_test1');
        return data;
    });
    console.log("\n=== SAVED DATA ===");
    const parsedData = JSON.parse(savedData);
    console.log("Inventory items:", parsedData.inventoryItems);
    console.log("Room 0 items:", parsedData.roomStates[0].items.map(i => i.name));

    // Load
    await page.evaluate(() => {
        document.getElementById('input').value = 'cargar test1';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log("\n=== AFTER LOAD ===");

    // Use inventory command to check
    await page.evaluate(() => {
        document.getElementById('input').value = 'inventario';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 200));

    const outputAfter = await page.evaluate(() => {
        const output = document.getElementById('output');
        return output.textContent;
    });
    console.log("Inventory command output:");
    const lines = outputAfter.split('\n');
    const invStart = lines.findIndex(l => l.includes('> inventario'));
    if (invStart >= 0) {
        console.log(lines.slice(invStart, invStart + 5).join('\n'));
    }

    await browser.close();
}

debugSaveLoad().catch(console.error);
