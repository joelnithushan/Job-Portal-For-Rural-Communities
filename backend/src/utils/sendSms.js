const axios = require('axios');

const NOTIFY_LK_ENDPOINT = 'https://app.notify.lk/api/v1/send';

const sendSms = async ({ to, body }) => {
    try {
        const userId = process.env.NOTIFY_LK_USER_ID;
        const apiKey = process.env.NOTIFY_LK_API_KEY;
        const senderId = process.env.NOTIFY_LK_SENDER_ID || 'NotifyDEMO';

        if (!userId || !apiKey) {
            console.warn('notify.lk credentials not found in .env. Skipping SMS.');
            return;
        }

        // notify.lk expects Sri Lankan numbers in 94XXXXXXXXX format (no '+', no leading 0)
        let formattedNumber = to.trim().replace(/\s+/g, '');
        if (formattedNumber.startsWith('+')) {
            formattedNumber = formattedNumber.substring(1);
        }
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '94' + formattedNumber.substring(1);
        }

        const response = await axios.get(NOTIFY_LK_ENDPOINT, {
            params: {
                user_id: userId,
                api_key: apiKey,
                sender_id: senderId,
                to: formattedNumber,
                message: body,
            },
        });

        if (response.data && response.data.status === 'success') {
            console.log(`SMS successfully sent to ${formattedNumber} via notify.lk.`);
        } else {
            console.error(`notify.lk returned non-success response for ${formattedNumber}:`, response.data);
        }
        return response.data;
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error.response?.data || error.message);
        throw error;
    }
};

module.exports = sendSms;
