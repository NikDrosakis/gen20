#!/usr/bin/env node

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    const [method, ...params] = input.split(' ');
    console.log(`Executing method: ${method} with params:`, params);

    switch (method) {
        case 'start':
            console.log('✅ Starting...');
            break;
        case 'stop':
            console.log('⛔ Stopping...');
            break;
        default:
            console.log('❌ Unknown method.');
    }
});
