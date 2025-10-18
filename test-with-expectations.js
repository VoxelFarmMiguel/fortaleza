#!/usr/bin/env node

/**
 * Automated test comparing JS version output against expected Pascal behavior
 * Based on analysis of Pascal source code
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const tests = [
    {
        name: "Break without tool",
        commands: ["romper pared solitaria"],
        expected: ["Usted trata, pero no lo consigue."],
        reason: "VOCABL.PAS:84 _Can_not_break"
    },
    {
        name: "Break with wrong tool",
        setup: ["tomar maza"],
        commands: ["romper pared solitaria con maza"],
        expected: ["Usted trata, pero no lo consigue."],
        reason: "Hidden.Break returns false when breaker doesn't match"
    },
    {
        name: "Break with correct tool - Pared solitaria",
        setup: ["tomar ariete"],
        commands: ["romper pared solitaria con ariete"],
        expected: ["¡Crash!", "Puerta secreta"],
        reason: "FORT1.PAS:187 - Pared solitaria breaks with Ariete, reveals Puerta secreta"
    },
    {
        name: "Break with correct tool - Monolito de mármol",
        setup: ["atravesar puerta principal con abrete sesamo", "atravesar puerta principal", "tomar maza"],
        commands: ["romper monolito de mármol con maza"],
        expected: ["¡Crash!", "Trebol"],
        reason: "FORT1.PAS:200 - Monolito breaks with Maza, reveals Troll Trebol"
    },
    {
        name: "Troll gift mechanic - wrong gift",
        setup: [
            "atravesar puerta principal con abrete sesamo",
            "atravesar puerta principal",
            "tomar maza",
            "romper monolito de mármol con maza"
        ],
        commands: ["dar maza a trebol", "hablar trebol"],
        expected: ["Gracias", "Dame agua, por favor"],
        reason: "Troll accepts but not happy, still asks for water"
    },
    {
        name: "Troll gift mechanic - correct gift",
        setup: [
            "atravesar puerta principal con abrete sesamo",
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
            "atravesar puerta principal"
        ],
        commands: ["dar vaso de agua a trebol", "hablar trebol"],
        expected: ["¡Muchas muchas gracias!", "Busca a la doncella"],
        reason: "FORT1.PAS:203 - Troll happy when given Vaso de agua"
    },
    {
        name: "Door open bidirectionally",
        setup: ["abrir puerta principal con abrete sesamo"],
        commands: ["atravesar puerta principal", "atravesar puerta principal"],
        expected: ["Salón de recepciones", "exterior de la fortaleza"],
        reason: "Opening door from one side should open it from both sides"
    },
    {
        name: "Guard with wrong weapon",
        setup: [
            "atravesar puerta principal con abrete sesamo",
            "atravesar puerta principal",
            "atravesar puerta negra",
            "atravesar puerta azul",
            "atravesar puerta verde"
        ],
        commands: ["matar cíclope con maza"],
        expected: ["¡Ja ja ja! ¡Eso no me hará daño!"],
        reason: "Guard.die returns false when weapon doesn't match lethalWeapon"
    },
    {
        name: "Guard with correct weapon",
        setup: [
            "atravesar tunel",
            "atravesar puerta verde",
            "tomar lanza",
            "atravesar puerta verde"
        ],
        commands: ["matar cíclope con lanza"],
        expected: ["¡Arrrggghhhh! ¡Me has matado!", "Maza"],
        reason: "FORT1.PAS:362 - Cyclops confesses and dies with Lanza"
    },
    {
        name: "RiddleLink - wrong answer",
        setup: ["atravesar tunel", "atravesar puerta azul"],
        commands: ["abrir escalera con treinta"],
        expected: ["Respuesta incorrecta", "¿Cuántos peldaños"],
        reason: "RiddleLink shows riddle again when answer is wrong"
    },
    {
        name: "RiddleLink - correct answer",
        setup: ["atravesar tunel", "atravesar puerta azul"],
        commands: ["abrir escalera con treinta y nueve"],
        expected: ["¡Ha resuelto el acertijo!", "Ok."],
        reason: "FORT1.PAS:329 - Escalera opens with 'Treinta y nueve'"
    }
];

async function runTests() {
    console.log("=".repeat(70));
    console.log("Running Automated Tests");
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

        // Run setup commands
        if (test.setup) {
            for (const cmd of test.setup) {
                await page.evaluate((command) => {
                    document.getElementById('input').value = command;
                    processCommand();
                }, cmd);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Run test commands and capture output
        let testOutput = '';
        for (const cmd of test.commands) {
            await page.evaluate((command) => {
                document.getElementById('input').value = command;
                processCommand();
            }, cmd);
            await new Promise(resolve => setTimeout(resolve, 200));

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

            testOutput += newOutput + '\n';
        }

        // Check if expected strings are in output
        const allExpectedFound = test.expected.every(expected =>
            testOutput.includes(expected)
        );

        if (allExpectedFound) {
            console.log(`✓ PASS`);
            passed++;
        } else {
            console.log(`✗ FAIL`);
            console.log(`  Expected to find: ${test.expected.join(', ')}`);
            console.log(`  Actual output:`);
            console.log(testOutput.split('\n').map(line => `    ${line}`).join('\n'));
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
