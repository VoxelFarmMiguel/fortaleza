#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testFreshSave() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        devtools: true  // Open devtools to see console
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
        console.log('BROWSER:', msg.text());
    });

    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== TAKING MAZA ===');
    await page.type('#input', 'tomar maza');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== CHECKING INVENTORY BEFORE SAVE ===');
    await page.type('#input', 'i');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== SAVING AS s3 ===');
    await page.type('#input', 'guardar s3');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n=== RELOADING PAGE ===');
    await page.reload();
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n=== LOADING s3 ===');
    await page.type('#input', 'cargar s3');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n=== CHECKING INVENTORY AFTER LOAD ===');
    await page.type('#input', 'i');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 500));

    const output = await page.evaluate(() => {
        return document.getElementById('output').textContent;
    });

    console.log('\n=== CHECKING RESULT ===');
    const hasMaza = output.includes('Maza (39)');
    console.log('Has Maza in inventory:', hasMaza);

    if (!hasMaza) {
        console.log('\n=== BUG REPRODUCED! ===');
        const lines = output.split('\n');
        const lastInv = lines.lastIndexOf(lines.find(l => l.includes('> i')));
        console.log('Last inventory command output:');
        console.log(lines.slice(lines.lastIndexOf('> i'), lines.lastIndexOf('> i') + 5).join('\n'));
    }

    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
}

testFreshSave().catch(console.error);
