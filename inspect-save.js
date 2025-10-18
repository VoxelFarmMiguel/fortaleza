#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function inspectSave() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');

    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the save data
    const saveData = await page.evaluate(() => {
        const data = localStorage.getItem('fortaleza_save_s1');
        return data;
    });

    if (saveData) {
        console.log('Save data for s1:');
        const parsed = JSON.parse(saveData);
        console.log(JSON.stringify(parsed, null, 2));
    } else {
        console.log('No save found with name s1');
    }

    await browser.close();
}

inspectSave().catch(console.error);
