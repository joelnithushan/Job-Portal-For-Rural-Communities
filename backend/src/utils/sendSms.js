const twilio = require('twilio');

const sendSms = async ({ to, body }) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !from) {
            console.warn('Twilio credentials not found in .env. Skipping SMS.');
            return;
        }

        const client = twilio(accountSid, authToken);

        // Format number to E.164 (Assuming Sri Lankan +94 for numbers starting with 0)
        let formattedNumber = to.trim();
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '+94' + formattedNumber.substring(1);
        } else if (!formattedNumber.startsWith('+')) {
            formattedNumber = '+' + formattedNumber;
        }

        const message = await client.messages.create({
            body,
            from,
            to: formattedNumber,
        });

        console.log(`SMS successfully sent to ${formattedNumber}. SID: ${message.sid}`);
        return message;
    } catch (error) {
        console.error(`Failed to send SMS to ${to}:`, error.message);
        throw error;
    }
};

module.exports = sendSms;
