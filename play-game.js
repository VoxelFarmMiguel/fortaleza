#!/usr/bin/env node

/**
 * Interactive game player - executes commands and shows output
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function playGame(commandsFile) {
    const commands = fs.readFileSync(commandsFile, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('#'));

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');
    await page.goto(indexPath);
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 1000));

    let fullLog = '';

    // Get initial output
    let output = await page.evaluate(() => {
        const outputDiv = document.getElementById('output');
        const lines = Array.from(outputDiv.children);
        return lines.map(line => line.textContent).join('\n');
    });
    console.log(output);
    console.log('\n' + '='.repeat(70) + '\n');
    fullLog += output + '\n\n' + '='.repeat(70) + '\n\n';

    // Execute each command
    for (const command of commands) {
        await page.evaluate((cmd) => {
            document.getElementById('input').value = cmd;
            processCommand();
        }, command);

        await new Promise(resolve => setTimeout(resolve, 300));

        // Get output from last prompt onwards
        const newOutput = await page.evaluate(() => {
            const outputDiv = document.getElementById('output');
            const lines = Array.from(outputDiv.children);

            let lastPromptIndex = -1;
            for (let i = lines.length - 1; i >= 0; i--) {
                if (lines[i].classList.contains('prompt')) {
                    lastPromptIndex = i;
                    break;
                }
            }

            if (lastPromptIndex >= 0) {
                return lines.slice(lastPromptIndex).map(line => line.textContent).join('\n');
            }
            return '';
        });

        console.log(newOutput);
        console.log('');
        fullLog += newOutput + '\n\n';
    }

    await browser.close();

    // Write full log to output.txt
    fs.writeFileSync(path.resolve(__dirname, 'output.txt'), fullLog);
    console.log('Session saved to output.txt');
}

const commandsFile = process.argv[2] || 'playthrough.txt';
playGame(commandsFile).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
