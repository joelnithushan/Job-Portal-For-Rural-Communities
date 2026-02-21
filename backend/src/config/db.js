const mongoose = require('mongoose');
const config = require('./env');

const DEFAULT_RETRY_INTERVAL = 5000; // ms

async function tryConnect() {
    try {
        await mongoose.connect(config.mongoose.url, config.mongoose.options);
        console.log('MongoDB connected successfully');
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return false;
    }
}

/**
 * Attempt an initial connection and, on failure, start background
 * reconnection attempts without exiting the Node process.
 * Returns `true` when connected, otherwise `false`.
 */
const connectDB = async () => {
    const connected = await tryConnect();

    if (!connected) {
        const retryInterval = (config.mongoose && config.mongoose.retryInterval) || DEFAULT_RETRY_INTERVAL;
        console.warn(`MongoDB not available — starting reconnect attempts every ${retryInterval}ms`);

        const timer = setInterval(async () => {
            if (mongoose.connection.readyState === 1) {
                clearInterval(timer);
                return;
            }

            const ok = await tryConnect();
            if (ok) {
                clearInterval(timer);
            }
        }, retryInterval);
    }

    return mongoose.connection.readyState === 1;
};

module.exports = connectDB;
