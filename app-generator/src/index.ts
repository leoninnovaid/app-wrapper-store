// app-generator/src/index.ts

// Expo CLI integration for APK and IPA generation

const { exec } = require('child_process');

// Function to execute terminal commands
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${stderr}`);
                return reject(error);
            }
            resolve(stdout);
        });
    });
}

// Build Queue System
class BuildQueue {
    constructor() {
        this.queue = [];
        this.isBuilding = false;
    }

    enqueue(buildCommand) {
        this.queue.push(buildCommand);
        this.processQueue();
    }

    async processQueue() {
        if (this.isBuilding || this.queue.length === 0) return;
        this.isBuilding = true;
        const buildCommand = this.queue.shift();
        try {
            console.log(`Starting build: ${buildCommand}`);
            const result = await executeCommand(buildCommand);
            console.log(`Build completed: ${result}`);
        } catch (error) {
            console.error(`Build failed: ${error.message}`);
        } finally {
            this.isBuilding = false;
            this.processQueue(); // Process next build in the queue
        }
    }
}

// Error Handling
process.on('uncaughtException', (error) => {
    console.error(`Uncaught Exception: ${error.message}`);
});

process.on('unhandledRejection', (reason) => {
    console.error(`Unhandled Rejection: ${reason}`);
});

const buildQueue = new BuildQueue();

// Simulated build commands
buildQueue.enqueue('expo build:android');
buildQueue.enqueue('expo build:ios');
