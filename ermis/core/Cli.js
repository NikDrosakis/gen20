// core/Cli.js

const { exec } = require('child_process');

function runCli(method) {
    console.log(`Running CLI method: ${method}`);

    // You could invoke a specific process here, for example:
    exec(`node ${method}`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error executing CLI method: ${err}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        console.log(`stdout: ${stdout}`);
    });
}

module.exports = {
    runCli
};
