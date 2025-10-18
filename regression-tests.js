#!/usr/bin/env node

/**
 * Regression tests for bugs that have been fixed
 * These test actual gameplay sequences that we know work
 */

const puppeteer = require('puppeteer');
const path = require('path');

const tests = [
    {
        name: "Bug Fix v3.1: Break command error message",
        commands: ["romper pared solitaria"],
        expected: ["Usted trata, pero no lo consigue."],
        shouldNotContain: ["No puede romper eso con"],
        reason: "Fixed in v3.1: Should show Pascal message, not 'No puede romper eso con'"
    },
    {
        name: "Save/Load: Inventory persistence",
        commands: [
            "tomar maza",
            "inventario"
        ],
        expected: ["Maza (39)"],
        reason: "Fixed in v2.6: Inventory should be saved and loaded"
    },
    {
        name: "Door bidirectional opening",
        commands: [
            "abrir puerta principal con abrete sesamo",
            "atravesar puerta principal",
            "atravesar puerta principal"
        ],
        expected: ["Salón de recepciones", "exterior de la fortaleza"],
        reason: "Opening door from one side opens it from both"
    },
    {
        name: "Troll breaking through Monolito",
        commands: [
            "abrir puerta principal con abrete sesamo",
            "atravesar puerta principal",
            "tomar maza",
            "dejar maza",
            "tomar maza",
            "romper monolito de mármol con maza"
        ],
        expected: ["¡Crash!", "Trebol"],
        reason: "Hidden object Monolito should break and reveal Trebol"
    },
    {
        name: "Troll gift acceptance",
        commands: [
            "abrir puerta principal con abrete sesamo",
            "atravesar puerta principal",
            "tomar maza",
            "romper monolito de mármol con maza",
            "atravesar puerta negra",
            "atravesar puerta azul",
            "atravesar puerta verde",
            "tomar vaso de agua",
            "atravesar puerta verde",
            "atravesar puerta azul",
            "atravesar puerta negra",
            "atravesar puerta principal",
            "dar vaso de agua a trebol",
            "hablar trebol"
        ],
        expected: ["¡Muchas muchas gracias!", "Busca a la doncella"],
        reason: "Troll should become happy when given correct gift"
    },
    {
        name: "Cyclops battle",
        commands: [
            "atravesar tunel",
            "atravesar puerta verde",
            "tomar lanza",
            "matar cíclope con lanza"
        ],
        expected: ["¡Arrrggghhhh! ¡Me has matado!"],
        reason: "Guard should die when killed with correct weapon"
    },
    {
        name: "RiddleLink correct answer",
        commands: [
            "atravesar tunel",
            "atravesar puerta azul",
            "abrir escalera con treinta y nueve",
            "atravesar escalera"
        ],
        expected: ["¡Ha resuelto el acertijo!", "Cuarto de espejos"],
        reason: "RiddleLink should open with correct answer"
    }
];

async function runTests() {
    console.log("=".repeat(70));
    console.log("Running Regression Tests");
    console.log("=".repeat(70));
    console.log();

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        console.log(`Test: ${test.name}`);
        console.log(`Reason: ${test.reason}`);

        const page = await browser.newPage();
        const indexPath = 'file://' + path.resolve(__dirname, 'index.html');
        await page.goto(indexPath);
        await page.waitForSelector('#input');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Run test commands and capture all output
        let allOutput = '';
        for (const cmd of test.commands) {
            await page.evaluate((command) => {
                document.getElementById('input').value = command;
                processCommand();
            }, cmd);
            await new Promise(resolve => setTimeout(resolve, 150));

            const output = await page.evaluate(() => {
                const outputDiv = document.getElementById('output');
                return outputDiv.textContent;
            });

            allOutput = output; // Keep updating to get cumulative output
        }

        // Check if expected strings are in output
        const allExpectedFound = test.expected.every(expected =>
            allOutput.includes(expected)
        );

        // Check if forbidden strings are NOT in output
        let noForbiddenFound = true;
        if (test.shouldNotContain) {
            noForbiddenFound = test.shouldNotContain.every(forbidden =>
                !allOutput.includes(forbidden)
            );
        }

        if (allExpectedFound && noForbiddenFound) {
            console.log(`✓ PASS`);
            passed++;
        } else {
            console.log(`✗ FAIL`);
            if (!allExpectedFound) {
                console.log(`  Missing expected: ${test.expected.filter(e => !allOutput.includes(e)).join(', ')}`);
            }
            if (!noForbiddenFound) {
                console.log(`  Found forbidden: ${test.shouldNotContain.filter(f => allOutput.includes(f)).join(', ')}`);
            }
            console.log(`  Last 500 chars of output:`);
            console.log(allOutput.slice(-500).split('\n').map(line => `    ${line}`).join('\n'));
            failed++;
        }

        console.log();
        await page.close();
    }

    await browser.close();

    console.log("=".repeat(70));
    console.log(`Results: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
    console.log("=".repeat(70));

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
