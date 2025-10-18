#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testSaveLoad() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging from the page
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[LOAD]')) {
            console.log('PAGE LOG:', text);
        }
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');
    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== PICKING UP MAZA ===');
    await page.evaluate(() => {
        document.getElementById('input').value = 'tomar maza';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== CHECKING INVENTORY ===');
    await page.evaluate(() => {
        document.getElementById('input').value = 'inventario';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    let output = await page.evaluate(() => {
        return document.getElementById('output').textContent;
    });
    console.log('Has Maza before save:', output.includes('Maza'));

    console.log('\n=== SAVING GAME ===');
    await page.evaluate(() => {
        document.getElementById('input').value = 'guardar test2';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== LOADING GAME ===');
    await page.evaluate(() => {
        document.getElementById('input').value = 'cargar test2';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n=== CHECKING INVENTORY AFTER LOAD ===');
    await page.evaluate(() => {
        document.getElementById('input').value = 'inventario';
        processCommand();
    });
    await new Promise(resolve => setTimeout(resolve, 500));

    output = await page.evaluate(() => {
        return document.getElementById('output').textContent;
    });

    const lines = output.split('\n');
    const invIndex = lines.findIndex(l => l.includes('> inventario') && lines.indexOf(l) > lines.findIndex(m => m.includes('> cargar')));

    console.log('\n=== RESULT ===');
    if (invIndex >= 0) {
        console.log(lines.slice(invIndex, invIndex + 5).join('\n'));
    }

    console.log('\nHas Maza after load:', output.includes('Maza (39)'));

    await new Promise(resolve => setTimeout(resolve, 5000));
    await browser.close();
}

testSaveLoad().catch(console.error);
