const http = require('http');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { seedAdmin } = require('./services/auth.service');

let server;


const startServer = (port, attempts = 5) => {
    return new Promise((resolve, reject) => {
        const srv = http.createServer(app);

        srv.on('error', (err) => {
            if (err && err.code === 'EADDRINUSE') {
                console.error(`Port ${port} is already in use`);
                if (attempts > 0) {
                    const nextPort = port + 1;
                    console.log(`Trying port ${nextPort}...`);
                    setTimeout(() => {
                        startServer(nextPort, attempts - 1).then(resolve).catch(reject);
                    }, 300);
                    return;
                }
                console.error('No available ports found to bind server');

                return reject(err);
            }
            reject(err);
        });

        srv.listen(port, () => {
            server = srv;
            console.log(`Server listening on port ${port}`);
            resolve(srv);
        });
    });
};

const exitHandler = async (code = 0) => {
    try {
        if (server) {
            await new Promise((res) => server.close(res));
            console.log('Server closed');
        }
    } catch (err) {
        console.error('Error while closing server', err);
    } finally {
        process.exit(code);
    }
};

const unexpectedErrorHandler = (error) => {
    console.error('Unexpected error', error);

    exitHandler(1);
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGINT', () => exitHandler(0));
process.on('SIGTERM', () => exitHandler(0));


connectDB()
    .then(async (connected) => {
        if (connected) {
            try {
                await seedAdmin();
            } catch (err) {
                console.error('seedAdmin error:', err);
            }
        } else {
            console.warn('Database not connected at startup — continuing without DB');
        }

        try {
            await startServer(config.port, 5);
        } catch (err) {
            console.error('Failed to start server (see error above).');
        }
    })
    .catch((err) => {
        console.error('Error during startup flow:', err);
    });

module.exports = () => server;
