const axios = require('axios');
const Poster = require('../models/poster.model');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const { cloudinary } = require('../config/cloudinary');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-3-pro-image-preview';

const buildPrompt = ({ title, category, district, town, jobType, salaryMin, salaryMax, tags, stylePreset, companyName, contactPhone, contactEmail }) => {
    const style = {
        CLASSIC: 'classic, red #8B1A1A + gold #E2B325 on cream',
        MINIMAL: 'minimal, lots of whitespace, red #8B1A1A accent',
        VIBRANT: 'bold, red #8B1A1A + gold #E2B325, high contrast',
    }[stylePreset] || 'classic, red #8B1A1A + gold #E2B325 on cream';

    const loc = [town, district].filter(Boolean).join(', ');
    const salary = salaryMin && salaryMax
        ? `LKR ${Number(salaryMin).toLocaleString()}-${Number(salaryMax).toLocaleString()}/mo`
        : salaryMin ? `From LKR ${Number(salaryMin).toLocaleString()}/mo`
        : salaryMax ? `Up to LKR ${Number(salaryMax).toLocaleString()}/mo` : '';

    const lines = [`"WE'RE HIRING" (top)`, `"${title}" (large, below)`];
    if (companyName) lines.push(`"${companyName}"`);
    if (category) lines.push(`badge "${category}"`);
    if (jobType) lines.push(`badge "${jobType.replace('_', ' ')}"`);
    if (loc) lines.push(`pin icon + "${loc}, Sri Lanka"`);
    if (salary) lines.push(`wallet icon + "${salary}"`);
    if (tags && tags.length) lines.push(`bullets: ${tags.map(s => `"${s}"`).join(', ')}`);
    const contactParts = [];
    if (contactPhone) contactParts.push(`phone icon + "${contactPhone}"`);
    if (contactEmail) contactParts.push(`envelope icon + "${contactEmail}"`);
    if (contactParts.length) lines.push(`CONTACT row: ${contactParts.join(', ')}`);
    lines.push(`button "APPLY NOW" (bottom)`);

    return [
        `Portrait 3:4 job recruitment poster, Sri Lanka. Style: ${style}.`,
        `Place EXACTLY this text, spelled correctly, top to bottom: ${lines.join('; ')}.`,
        `Strict rules: 6% safe margin on all sides, nothing clipped or overflowing, no extra text or invented details, no watermark, legible typography.`,
    ].join(' ');
};

const extractImageBase64 = (response) => {
    const choices = response?.data?.choices;
    if (!choices || !choices.length) return null;

    const message = choices[0].message;

    if (Array.isArray(message?.images) && message.images.length) {
        const img = message.images[0];
        const url = img?.image_url?.url || img?.url || img;
        if (typeof url === 'string' && url.startsWith('data:')) {
            return url.split(',')[1];
        }
        if (typeof url === 'string') return url;
    }

    if (Array.isArray(message?.content)) {
        for (const part of message.content) {
            if (part?.type === 'image_url' && part?.image_url?.url) {
                const url = part.image_url.url;
                if (typeof url === 'string' && url.startsWith('data:')) {
                    return url.split(',')[1];
                }
                return url;
            }
            if (part?.type === 'output_image' && part?.image) {
                return part.image;
            }
        }
    }

    if (typeof message?.content === 'string') {
        const match = message.content.match(/data:image\/[a-zA-Z]+;base64,([A-Za-z0-9+/=]+)/);
        if (match) return match[1];
    }

    return null;
};

const uploadBase64ToCloudinary = async (base64OrUrl, employerId) => {
    const dataUri = base64OrUrl.startsWith('data:')
        ? base64OrUrl
        : base64OrUrl.startsWith('http')
            ? base64OrUrl
            : `data:image/png;base64,${base64OrUrl}`;

    const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'ruralwork/posters',
        public_id: `poster_${employerId}_${Date.now()}`,
        resource_type: 'image',
    });

    return { imageUrl: result.secure_url, imagePublicId: result.public_id };
};

const generatePoster = async (employerId, input) => {
    const apiKey = process.env.OPENROUTER_API_KEY2;
    if (!apiKey) {
        const err = new Error('AI poster generation is not configured. Missing OPENROUTER_API_KEY2.');
        err.statusCode = 503;
        throw err;
    }

    const company = await Company.findOne({ employerUserId: employerId });
    const companyName = company?.businessName || '';

    const employer = await User.findById(employerId).select('email phone');
    const contactPhone = input.contactPhone || company?.contactPhone || employer?.phone || '';
    const contactEmail = input.contactEmail || employer?.email || '';

    const prompt = buildPrompt({ ...input, companyName, contactPhone, contactEmail });

    const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

    let response;
    try {
        response = await axios.post(
            OPENROUTER_URL,
            {
                model,
                modalities: ['image', 'text'],
                max_tokens: Number(process.env.OPENROUTER_MAX_TOKENS) || 800,
                messages: [
                    {
                        role: 'user',
                        content: [{ type: 'text', text: prompt }],
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.OPENROUTER_REFERER || 'https://ruralwork.lk',
                    'X-Title': 'NextEra Job Poster Maker',
                },
                timeout: 120000,
            }
        );
    } catch (e) {
        const status = e.response?.status;
        const detail = e.response?.data?.error?.message || e.message;
        const err = new Error(`AI provider error: ${detail}`);
        err.statusCode = status && status >= 400 && status < 600 ? status : 502;
        throw err;
    }

    const imageData = extractImageBase64(response);
    if (!imageData) {
        const err = new Error('AI did not return an image. Try a different prompt or style.');
        err.statusCode = 502;
        throw err;
    }

    const { imageUrl, imagePublicId } = await uploadBase64ToCloudinary(imageData, employerId);

    return { imageUrl, imagePublicId, prompt };
};

const createPoster = async (employerId, data) => {
    const poster = await Poster.create({ ...data, employerId });
    return poster;
};

const getPublicPosters = async ({ category, district, jobType, search, page = 1, limit = 12 }) => {
    const activeEmployers = await User.find({ role: 'EMPLOYER', status: 'ACTIVE' }).select('_id');
    const activeIds = activeEmployers.map(e => e._id);

    const filter = {
        status: 'PUBLISHED',
        employerId: { $in: activeIds },
    };
    if (category) filter.category = category;
    if (district) filter.district = district;
    if (jobType) filter.jobType = jobType;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [posters, total] = await Promise.all([
        Poster.find(filter)
            .populate('employerId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Poster.countDocuments(filter),
    ]);

    return {
        posters,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
    };
};

const getAllPostersAdmin = async ({ search, status, page = 1, limit = 20 }) => {
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [posters, total] = await Promise.all([
        Poster.find(filter)
            .populate('employerId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Poster.countDocuments(filter),
    ]);

    return {
        posters,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
    };
};

const getPostersByEmployer = async (employerId) => {
    return Poster.find({ employerId }).sort({ createdAt: -1 });
};

const getPosterById = async (id) => {
    const poster = await Poster.findById(id).populate('employerId', 'name');
    if (!poster) {
        const err = new Error('Poster not found');
        err.statusCode = 404;
        throw err;
    }
    return poster;
};

const updatePoster = async (id, employerId, updates) => {
    const poster = await Poster.findById(id);
    if (!poster) {
        const err = new Error('Poster not found');
        err.statusCode = 404;
        throw err;
    }
    if (String(poster.employerId) !== String(employerId)) {
        const err = new Error('Forbidden');
        err.statusCode = 403;
        throw err;
    }
    Object.assign(poster, updates);
    await poster.save();
    return poster;
};

const deletePoster = async (id, user) => {
    const poster = await Poster.findById(id);
    if (!poster) {
        const err = new Error('Poster not found');
        err.statusCode = 404;
        throw err;
    }
    if (user.role !== 'ADMIN' && String(poster.employerId) !== String(user._id)) {
        const err = new Error('Forbidden');
        err.statusCode = 403;
        throw err;
    }

    if (poster.imagePublicId) {
        try {
            await cloudinary.uploader.destroy(poster.imagePublicId);
        } catch (e) {
            console.error('Failed to delete poster image from Cloudinary:', e.message);
        }
    }
    await poster.deleteOne();
};

module.exports = {
    generatePoster,
    createPoster,
    getPublicPosters,
    getAllPostersAdmin,
    getPostersByEmployer,
    getPosterById,
    updatePoster,
    deletePoster,
};
