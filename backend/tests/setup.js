const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('dotenv').config();

// Global mocks for external services so tests never hit Gmail SMTP or notify.lk.
jest.mock('../src/utils/sendEmail', () => jest.fn());
jest.mock('../src/utils/sendSms', () => jest.fn());

const sendEmail = require('../src/utils/sendEmail');
const sendSms = require('../src/utils/sendSms');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    process.env.NODE_ENV = 'test';

    await mongoose.disconnect();
    await mongoose.connect(uri);
});

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(() => {
    // jest config has resetMocks: true, which wipes implementations between tests.
    // Re-apply the no-op resolved promise so any code path that awaits the mock works.
    sendEmail.mockResolvedValue(undefined);
    sendSms.mockResolvedValue(undefined);
});

afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
});
