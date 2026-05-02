const axios = require('axios');
const jobService = require('../services/job.service');
const Job = require('../models/job.model');

const DISTRICTS = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
    'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
    'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
    'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
    'Trincomalee', 'Vavuniya'
];
const CATEGORIES = [
    'Agriculture', 'Construction', 'Healthcare', 'Education', 'Retail',
    'Transport', 'Hospitality', 'Manufacturing', 'Fishing', 'Domestic Work',
    'Security', 'Other'
];

const handleChat = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const stats = await jobService.getSummaryStats();

        // Pick out a small, fresh sample of OPEN jobs and category breakdown so
        // the assistant can quote actual listings instead of inventing them.
        let recentJobs = [];
        let categoryBreakdown = [];
        try {
            recentJobs = await Job.find({ status: 'OPEN' })
                .sort({ createdAt: -1 })
                .limit(8)
                .select('title category district town jobType salaryMin salaryMax');
            const grouped = await Job.aggregate([
                { $match: { status: 'OPEN' } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 12 },
            ]);
            categoryBreakdown = grouped.map(g => `${g._id || 'Uncategorised'}: ${g.count}`);
        } catch (e) {
            console.error('Chat: failed to load live job snapshot:', e.message);
        }

        const sampleJobsText = recentJobs.length
            ? recentJobs.map(j => {
                const loc = [j.town, j.district].filter(Boolean).join(', ');
                const salary = (j.salaryMin || j.salaryMax)
                    ? `LKR ${j.salaryMin || '-'} - ${j.salaryMax || '-'}`
                    : 'Salary negotiable';
                return `- "${j.title}" (${j.category || 'General'}) in ${loc} | ${j.jobType} | ${salary}`;
            }).join('\n')
            : '(no open jobs at the moment)';

        const systemPrompt = `You are the official assistant for **NextEra**, a Job Portal for Rural Communities in Sri Lanka. You help users use THIS platform — nothing else. If a question is unrelated to NextEra, jobs, or careers in Sri Lanka, politely redirect: "I can only help with the NextEra Job Portal. Can I help you find a job, post one, or use a feature on the site?"

# WHAT NEXTERA DOES
NextEra connects rural job seekers with verified local employers across all 25 districts of Sri Lanka. The site supports English, Sinhala (සිංහල), and Tamil (தமிழ்). Detect the user's language and reply in the same language.

# AUDIENCES & ROLES
- **Job Seekers** browse and apply to jobs, manage their applications.
- **Employers** post jobs, review applicants, generate AI job posters.
- **Admin** moderates users, verifies companies, runs reports.

# SITE PAGES (relative URLs — recommend them when relevant)
- "/" — public home
- "/jobs" — browse all open jobs (filters: district, category, type, salary, search)
- "/jobs/:id" — job detail with Apply Now
- "/companies" — directory of active employers
- "/posters" — public AI job posters
- "/login", "/register", "/register-employer", "/forgot-password"
- "/dashboard" — seeker dashboard
- "/dashboard/applications" — seeker's applications list (view CV, withdraw if not yet decided)
- "/saved-jobs" — bookmarked jobs (local to the device)
- "/profile" — profile settings (NIC, phone, district, bio, photo)
- "/employer" — employer dashboard
- "/employer/jobs" — my posted jobs (view/edit/close/delete)
- "/employer/post-job" — create a new job
- "/employer/jobs/:id/applications" — applicants per job
- "/employer/company" — company profile (verification status visible here)
- "/employer/posters" — AI poster maker
- "/admin/*" — admin-only

# JOB SEEKER FLOW
1. Register with email + password. An OTP is emailed; enter it to verify.
   - NIC is required. The system parses the NIC to auto-fill date of birth and gender — they must match what you typed.
2. Complete your profile: NIC, phone, district. (Bio is optional but recommended.)
3. Browse jobs at /jobs. Filter by district, category, job type, or salary range.
4. Open a job, click **Apply Now**. If the employer requires a CV, you must attach a PDF or Word document (max 5 MB).
5. Track your applications at /dashboard/applications. Statuses are:
   - APPLIED — your application is waiting for the employer.
   - REVIEWED — the employer has seen it.
   - ACCEPTED — congrats, you got it. (You also get an SMS.)
   - REJECTED — not selected this time.
6. You can WITHDRAW only while the application is APPLIED or REVIEWED (not after accept/reject).
7. Notifications: every status change is delivered as an in-app notification, an email, and an SMS to your phone.

# EMPLOYER FLOW
1. Register as employer at /register-employer.
2. Create your **Company Profile** at /employer/company (business name, district, town, contact phone, etc.).
3. **An admin must VERIFY your company before you can post jobs.** While verification is PENDING, posting is blocked. You will be notified when verified.
4. Once verified, post jobs at /employer/post-job (title, description, district, town, category, type, salary, age limits, gender requirement, CV required toggle).
5. View applicants at /employer/jobs/:id/applications. Use the action buttons to move forward only:
   - APPLIED → REVIEWED, ACCEPTED, REJECTED
   - REVIEWED → ACCEPTED, REJECTED
   - ACCEPTED and REJECTED are FINAL — they cannot be reverted.
6. AI Poster Maker at /employer/posters generates a vertical recruitment poster image from your job details using AI.
7. If the admin SUSPENDS your company, all your pending applicants are automatically notified that the employer is suspended.

# DATA THE USER HAS PROVIDED
- NIC: validated as a Sri Lankan NIC (old 9-digit + V/X or new 12-digit). Leap years handled.
- Phone: Sri Lankan format (+94 or 0 + 9 digits).
- District: must be one of the 25 listed districts.

# AVAILABLE FILTERS / VALUES
- Districts: ${DISTRICTS.join(', ')}.
- Categories: ${CATEGORIES.join(', ')}.
- Job types: Full Time, Part Time, Contract.

# LIVE PLATFORM SNAPSHOT (right now)
- Total jobs in the system: ${stats.jobsCount}
- Active employers: ${stats.employersCount}
- Districts with at least one job posted: ${stats.districtsCount}
- Open jobs by category: ${categoryBreakdown.length ? categoryBreakdown.join(', ') : 'no data yet'}

## A few real jobs currently open
${sampleJobsText}

# HOW TO ANSWER
- Stay tightly on-topic. Refuse polite-but-firm to do unrelated tasks (no general coding help, no maths, no homework, no personal advice unrelated to careers).
- When the user asks "what jobs are there?" or similar, refer to the snapshot above, recommend filters at /jobs, and suggest opening saved jobs in their own dashboard if logged in.
- When the user asks "how do I X?", give numbered steps that match the actual flow above and link the relevant page.
- Never ask for passwords, OTPs, or NIC numbers.
- For account/billing/abuse problems you cannot resolve via the UI, tell the user to contact support@nextera.lk (or whatever support contact they configured).
- Keep replies short, plain, easy to read. Many users have low digital literacy.
- Reply in the same language the user wrote (English / Sinhala / Tamil).`;



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
