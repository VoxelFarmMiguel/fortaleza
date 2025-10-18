#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testJSVersion() {
    // Read commands from file
    const commandsFile = process.argv[2] || 'test-commands.txt';
    const commands = fs.readFileSync(commandsFile, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    console.error(`Running ${commands.length} commands...`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Load the game
    const indexPath = 'file://' + path.resolve(__dirname, 'index.html');
    await page.goto(indexPath);

    // Wait for game to initialize
    await page.waitForSelector('#input');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get initial output
    let output = await page.evaluate(() => {
        const outputDiv = document.getElementById('output');
        const lines = Array.from(outputDiv.children);
        return lines.map(line => line.textContent).join('\n');
    });
    console.log(output);
    console.log('');

    // Execute each command
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];

        // Set command directly in input field and trigger command processing
        await page.evaluate((cmd) => {
            document.getElementById('input').value = cmd;
            processCommand();
        }, command);

        // Wait a bit for output to render
        await new Promise(resolve => setTimeout(resolve, 300));

        // Get ALL output after the last prompt (since walkT clears output)
        const newOutput = await page.evaluate(() => {
            const outputDiv = document.getElementById('output');
            const lines = Array.from(outputDiv.children);

            // Find the last prompt
            let lastPromptIndex = -1;
            for (let i = lines.length - 1; i >= 0; i--) {
                if (lines[i].classList.contains('prompt')) {
                    lastPromptIndex = i;
                    break;
                }
            }

            // Return everything from the prompt onwards
            if (lastPromptIndex >= 0) {
                return lines.slice(lastPromptIndex).map(line => line.textContent).join('\n');
            }
            return '';
        });

        console.log(newOutput);
        console.log('');
    }

    await browser.close();
}

testJSVersion().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
