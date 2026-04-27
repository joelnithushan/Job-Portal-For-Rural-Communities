const axios = require('axios');
const jobService = require('../services/job.service');

const handleChat = async (req, res) => {
    try {
        console.log('OpenRouter API Key defined:', !!process.env.OPENROUTER_API_KEY);
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const stats = await jobService.getSummaryStats();

        const systemPrompt = `You are an AI assistant for the "Job Portal for Rural Communities" in Sri Lanka.
Your role is to help job seekers and employers.
Help job seekers: register, login, search jobs on map, upload CV, apply for jobs, track applications, understand SMS/email notifications.
Help employers: post jobs, manage applications, upload logos.
Respond in the user's language (Sinhala, Tamil, or English). Detect the language and respond in the same.
Keep answers simple and clear for users with low digital literacy in rural Sri Lanka.
Never ask for passwords or sensitive personal data.
If an issue is unresolvable, advise the user to contact the support team.
Keep your responses concise.

Here is the current live data from the platform:
- Total Jobs Available: ${stats.jobsCount}
- Active Employers: ${stats.employersCount}
- Districts Covered: ${stats.districtsCount}
- Job Placement Rate: ${stats.placementRate}%`;



        const messages = [
            ...conversationHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'anthropic/claude-sonnet-4',
                max_tokens: 1000,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
                    'X-Title': 'Rural Job Portal',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const reply = response.data.choices[0].message.content;
            return res.status(200).json({
                success: true,
                reply
            });
        } else {
            throw new Error('Invalid response from OpenRouter API');
        }
    } catch (error) {
        console.error('Chat API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat request. Please try again later.'
        });
    }
};

module.exports = {
    handleChat
};
