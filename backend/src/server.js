const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const { seedAdmin } = require('./services/auth.service');

let server;

connectDB().then(async () => {
    await seedAdmin();

    server = app.listen(config.port, () => {
        console.log(`Server listening on port ${config.port}`);
    });
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error) => {
    console.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

module.exports = server;
