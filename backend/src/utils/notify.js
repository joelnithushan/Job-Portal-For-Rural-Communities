const Notification = require('../models/notification.model');
const sendEmail = require('./sendEmail');
const sendSms = require('./sendSms');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const TYPE_COLOR = {
    INFO: '#1A73E8',
    SUCCESS: '#2e7d32',
    WARNING: '#d97706',
    ERROR: '#d32f2f',
};

const buildDefaultEmail = ({ title, message, type, link, recipientName }) => {
    const accent = TYPE_COLOR[type] || TYPE_COLOR.INFO;
    const ctaUrl = link ? (link.startsWith('http') ? link : `${CLIENT_URL}${link}`) : null;
    const greeting = recipientName ? `Hi <strong>${recipientName}</strong>,` : 'Hello,';
    return `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;padding:32px;border-radius:12px;background:#ffffff;">
            <div style="text-align:center;margin-bottom:24px;">
                <h2 style="color:#1A1A1A;margin:0 0 8px 0;">${title}</h2>
                <div style="height:4px;width:60px;background:${accent};margin:auto;"></div>
            </div>
            <p style="font-size:15px;color:#333;">${greeting}</p>
            <p style="font-size:15px;color:#555;line-height:1.6;white-space:pre-line;">${message}</p>
            ${ctaUrl ? `
                <div style="text-align:center;margin:32px 0;">
                    <a href="${ctaUrl}" style="background:${accent};color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px;display:inline-block;">View Details</a>
                </div>` : ''}
            <hr style="border:0;border-top:1px solid #eeeeee;margin:24px 0;">
            <p style="font-size:12px;color:#999;text-align:center;">This is an automated notification from NextEra Job Portal.</p>
        </div>
    `;
};

const buildDefaultSms = ({ title, message }) => {
    const cleanTitle = String(title || '').trim();
    const cleanMessage = String(message || '').trim();
    const text = `NextEra: ${cleanTitle}\n\n${cleanMessage}`;
    return text.length > 320 ? text.slice(0, 317) + '...' : text;
};

const notifyUser = async (user, opts) => {
    if (!user || !user._id) return;
    const {
        title,
        message,
        type = 'INFO',
        link = null,
        channels = { inApp: true, email: true, sms: true },
        email,
        sms,
    } = opts;

    if (channels.inApp !== false) {
        try {
            await Notification.create({
                userId: user._id,
                title,
                message,
                type: ['INFO', 'SUCCESS', 'WARNING'].includes(type) ? type : 'INFO',
                link,
            });
        } catch (e) {
            console.error('notify: failed to create in-app notification:', e.message);
        }
    }

    if (channels.email !== false && user.email) {
        try {
            const subject = email?.subject || `NextEra: ${title}`;
            const html = email?.html || buildDefaultEmail({
                title,
                message,
                type,
                link,
                recipientName: user.name,
            });
            await sendEmail({ to: user.email, subject, html });
        } catch (e) {
            console.error('notify: failed to send email:', e.message);
        }
    }

    if (channels.sms !== false && user.phone) {
        try {
            const body = sms?.body || buildDefaultSms({ title, message });
            await sendSms({ to: user.phone, body });
        } catch (e) {
            console.error('notify: failed to send SMS:', e.message);
        }
    }
};

const notifyMany = async (users, opts) => {
    await Promise.all((users || []).map((u) => notifyUser(u, opts)));
};

module.exports = { notifyUser, notifyMany };
