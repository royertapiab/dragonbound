require('dotenv').config();
const app = require('./app');

const PORT = parseInt(process.env.PORT, 10) || 3100;
const HOST = process.env.HOST || '127.0.0.1';

const server = app.listen(PORT, HOST, () => {
    console.log(`=================================================`);
    console.log(`DragonBound Administrative Panel`);
    console.log(`Running on: http://${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`=================================================`);
});

// Graceful shutdown
const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });

    // Force exit if hanging
    setTimeout(() => {
        console.error('Forced shutdown due to timeout.');
        process.exit(1);
    }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
