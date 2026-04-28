jest.mock('axios');
jest.unmock('../src/utils/sendSms');

const axios = require('axios');
const sendSms = jest.requireActual('../src/utils/sendSms');

describe('sendSms (notify.lk)', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        process.env = {
            ...ORIGINAL_ENV,
            NOTIFY_LK_USER_ID: 'user_123',
            NOTIFY_LK_API_KEY: 'key_abc',
            NOTIFY_LK_SENDER_ID: 'NotifyDEMO',
        };
        axios.get.mockResolvedValue({ data: { status: 'success' } });
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    it('skips sending and warns if credentials are missing', async () => {
        delete process.env.NOTIFY_LK_USER_ID;
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await sendSms({ to: '0712345678', body: 'hi' });

        expect(result).toBeUndefined();
        expect(axios.get).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledWith(expect.stringMatching(/notify\.lk credentials not found/i));
        warn.mockRestore();
    });

    it('normalises a leading 0 Sri Lankan number to 94XXXXXXXXX', async () => {
        await sendSms({ to: '0712345678', body: 'hello' });

        expect(axios.get).toHaveBeenCalledTimes(1);
        const [url, opts] = axios.get.mock.calls[0];
        expect(url).toBe('https://app.notify.lk/api/v1/send');
        expect(opts.params.to).toBe('94712345678');
        expect(opts.params.message).toBe('hello');
        expect(opts.params.user_id).toBe('user_123');
        expect(opts.params.api_key).toBe('key_abc');
        expect(opts.params.sender_id).toBe('NotifyDEMO');
    });

    it('strips a leading + and keeps the rest of the number', async () => {
        await sendSms({ to: '+94712345678', body: 'msg' });

        expect(axios.get.mock.calls[0][1].params.to).toBe('94712345678');
    });

    it('falls back to the default sender id when not configured', async () => {
        delete process.env.NOTIFY_LK_SENDER_ID;
        await sendSms({ to: '0712345678', body: 'msg' });

        expect(axios.get.mock.calls[0][1].params.sender_id).toBe('NotifyDEMO');
    });

    it('logs an error and rethrows when notify.lk request fails', async () => {
        const err = Object.assign(new Error('Network down'), {
            response: { data: { status: 'error', message: 'bad request' } },
        });
        axios.get.mockRejectedValueOnce(err);
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(sendSms({ to: '0712345678', body: 'msg' })).rejects.toThrow('Network down');
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    it('logs a non-success response from notify.lk without throwing', async () => {
        axios.get.mockResolvedValueOnce({ data: { status: 'error', message: 'invalid number' } });
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const result = await sendSms({ to: '0712345678', body: 'msg' });

        expect(result).toEqual({ status: 'error', message: 'invalid number' });
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringMatching(/notify\.lk returned non-success/i),
            expect.objectContaining({ status: 'error' })
        );
        errorSpy.mockRestore();
    });
});
