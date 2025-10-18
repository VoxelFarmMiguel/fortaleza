#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testLoad() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create a simple save with Maza in inventory
    await page.evaluate(() => {
        const saveData = {
            currentRoomIndex: 0,
            inventoryItems: [{name: 'Maza', dead: false}],
            roomStates: [{
                items: [
                    {name: 'Roble', dead: false},
                    {name: 'Pastel de cerezas', dead: false},
                    {name: 'Llamador de bronce', dead: false},
                    {name: 'Puerta principal', dead: false, open: false},
                    {name: 'Túnel', dead: false},
                    {name: 'Pared solitaria', dead: false}
                ],
                visited: true
            }],
            playerVisits: 1,
            gameOver: false,
            gameWon: false,
            timestamp: new Date().toISOString()
        };

        // Add room states for other rooms (minimal)
        for (let i = 1; i < 50; i++) {
            saveData.roomStates.push({items: [], visited: false});
        }

        localStorage.setItem('fortaleza_save_testload', JSON.stringify(saveData));
        console.log('Save created');
    });

    // Now load it
    await page.evaluate(() => {
        document.getElementById('input').value = 'cargar testload';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check inventory
    await page.evaluate(() => {
        document.getElementById('input').value = 'inventario';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    const output = await page.evaluate(() => {
        return document.getElementById('output').textContent;
    });

    console.log("\n=== OUTPUT ===");
    const lines = output.split('\n');
    const invIndex = lines.findIndex(l => l.includes('> inventario'));
    if (invIndex >= 0) {
        console.log(lines.slice(invIndex, invIndex + 5).join('\n'));
    }

    await browser.close();
}

testLoad().catch(console.error);
