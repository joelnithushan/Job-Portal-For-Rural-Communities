const User = require('../models/user.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const Company = require('../models/company.model');
const Notification = require('../models/notification.model');
const { notifyUser, notifyMany } = require('../utils/notify');

const notifyApplicantsOfEmployerSuspension = async (employerUserId, reason) => {
    const company = await Company.findOne({ employerUserId }).select('businessName');
    const businessName = company?.businessName || 'this employer';

    const applications = await Application.find({
        employerId: employerUserId,
        status: { $in: ['APPLIED', 'REVIEWED'] },
    }).populate('seekerId', 'name email phone').populate('jobId', 'title');

    const seekerMap = new Map();
    for (const app of applications) {
        const seeker = app.seekerId;
        if (!seeker || !seeker._id) continue;
        const key = String(seeker._id);
        if (!seekerMap.has(key)) {
            seekerMap.set(key, { seeker, jobTitles: new Set() });
        }
        if (app.jobId?.title) seekerMap.get(key).jobTitles.add(app.jobId.title);
    }

    const tasks = [];
    for (const { seeker, jobTitles } of seekerMap.values()) {
        const jobsList = Array.from(jobTitles);
        const jobsLine = jobsList.length
            ? jobsList.map((tt) => `"${tt}"`).join(', ')
            : 'a job at this company';
        const reasonLine = reason ? ` Reason: ${reason}.` : '';
        const message = `The employer "${businessName}" has been suspended by the administrator.${reasonLine} Your pending application(s) for ${jobsLine} will not move forward while the suspension is in effect. We will notify you if the employer is reinstated.`;

        tasks.push(notifyUser(seeker, {
            title: 'Employer Suspended',
            message,
            type: 'WARNING',
            link: '/dashboard/applications',
        }));
    }
    await Promise.all(tasks);
};

const getAllUsers = async () => {
    const users = await User.find().select('-password -__v');
    return users;
};

const updateUserStatus = async (userId, status, reason = null) => {
    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }
    user.status = status;
    user.suspensionReason = status === 'SUSPENDED' ? reason : null;
    await user.save();

    if (user.role === 'EMPLOYER') {
        const company = await Company.findOne({ employerUserId: userId });
        if (company) {
            company.isSuspended = status === 'SUSPENDED';
            company.suspensionReason = status === 'SUSPENDED' ? reason : null;
            await company.save();
        }
    }

    await notifyUser(user, {
        title: status === 'SUSPENDED' ? 'Account Suspended' : 'Account Activated',
        message: status === 'SUSPENDED'
            ? `Your account has been suspended by the administrator.${reason ? ` Reason: ${reason}` : ''}`
            : 'Your account has been activated by the administrator.',
        type: status === 'SUSPENDED' ? 'WARNING' : 'SUCCESS',
        link: '/profile',
    });

    if (user.role === 'EMPLOYER' && status === 'SUSPENDED') {
        try {
            await notifyApplicantsOfEmployerSuspension(user._id, reason);
        } catch (e) {
            console.error('Failed to notify applicants of employer suspension:', e.message);
        }
    }

    return user;
};

const getAllJobs = async () => {
    const jobs = await Job.find().populate('employerId', 'name email');
    return jobs;
};

const deleteJob = async (jobId) => {
    const job = await Job.findById(jobId);
    if (!job) {
        throw { statusCode: 404, message: 'Job not found' };
    }
    const employerId = job.employerId;
    const jobTitle = job.title;
    await job.deleteOne();

    const employer = await User.findById(employerId).select('name email phone');
    if (employer) {
        await notifyUser(employer, {
            title: 'Job Removed by Admin',
            message: `Your job listing "${jobTitle}" was removed by the administrator.`,
            type: 'WARNING',
            link: '/employer/jobs',
        });
    }

    return job;
};

const getAllApplications = async () => {
    const applications = await Application.find()
        .populate('jobId', 'title')
        .populate('seekerId', 'name email')
        .populate('employerId', 'name email');
    return applications;
};

const deleteApplication = async (applicationId) => {
    const application = await Application.findById(applicationId);
    if (!application) {
        throw { statusCode: 404, message: 'Application not found' };
    }
    await application.deleteOne();
    return application;
};

const verifyCompany = async (companyId) => {
    const company = await Company.findById(companyId);
    if (!company) {
        throw { statusCode: 404, message: 'Company not found' };
    }
    company.verificationStatus = 'VERIFIED';
    await company.save();

    const employer = await User.findById(company.employerUserId).select('name email phone');
    if (employer) {
        await notifyUser(employer, {
            title: 'Company Verified',
            message: `Your company "${company.businessName}" has been verified by the administrator. You can now post jobs.`,
            type: 'SUCCESS',
            link: '/employer/company',
        });
    }

    return company;
};

const suspendCompany = async (companyId, reason = null) => {
    const company = await Company.findById(companyId);
    if (!company) {
        throw { statusCode: 404, message: 'Company not found' };
    }

    company.isSuspended = !company.isSuspended;
    company.suspensionReason = company.isSuspended ? reason : null;
    await company.save();

    const employer = await User.findById(company.employerUserId);
    if (employer) {
        employer.status = company.isSuspended ? 'SUSPENDED' : 'ACTIVE';
        employer.suspensionReason = company.isSuspended ? reason : null;
        await employer.save();

        await notifyUser(employer, {
            title: company.isSuspended ? 'Company Suspended' : 'Company Unsuspended',
            message: company.isSuspended
                ? `Your company "${company.businessName}" has been suspended.${reason ? ` Reason: ${reason}` : ''}`
                : `Your company "${company.businessName}" has been unsuspended. You can resume posting jobs.`,
            type: company.isSuspended ? 'WARNING' : 'SUCCESS',
            link: '/employer/company',
        });

        if (company.isSuspended) {
            try {
                await notifyApplicantsOfEmployerSuspension(employer._id, reason);
            } catch (e) {
                console.error('Failed to notify applicants of company suspension:', e.message);
            }
        }
    }

    return company;
};

const getAdminNotifications = async (adminUserId) => {
    const notifications = await Notification.find({ userId: adminUserId })
        .sort({ createdAt: -1 })
        .limit(50);
    return notifications;
};

const getAllCompanies = async () => {
    const companies = await Company.find().populate('employerUserId', 'name email');
    return companies;
};

const getSystemReport = async (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const query = {
        createdAt: { $gte: start, $lte: end }
    };

    const [users, jobs, applications, companies] = await Promise.all([
        User.find(query).select('name email role createdAt status'),
        Job.find(query).select('title category district status createdAt'),
        Application.find(query).select('status createdAt'),
        Company.find(query).select('businessName verificationStatus isSuspended createdAt'),
    ]);

    const userStats = {
        total: users.length,
        seekers: users.filter(u => u.role === 'JOB_SEEKER').length,
        employers: users.filter(u => u.role === 'EMPLOYER').length,
        admins: users.filter(u => u.role === 'ADMIN').length,
    };

    const jobStats = {
        total: jobs.length,
        open: jobs.filter(j => j.status === 'OPEN').length,
        closed: jobs.filter(j => j.status === 'CLOSED').length,
    };

    const applicationStats = {
        total: applications.length,
        applied: applications.filter(a => a.status === 'APPLIED').length,
        reviewed: applications.filter(a => a.status === 'REVIEWED').length,
        accepted: applications.filter(a => a.status === 'ACCEPTED').length,
        rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    const companyStats = {
        total: companies.length,
        verified: companies.filter(c => c.verificationStatus === 'VERIFIED').length,
        pending: companies.filter(c => c.verificationStatus === 'PENDING').length,
        suspended: companies.filter(c => c.isSuspended).length,
    };

    return {
        range: { start, end },
        summary: {
            users: userStats,
            jobs: jobStats,
            applications: applicationStats,
            companies: companyStats
        },
        data: {
            users,
            jobs,
            applications,
            companies
        }
    };
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    getAllJobs,
    deleteJob,
    getAllApplications,
    deleteApplication,
    verifyCompany,
    suspendCompany,
    getAdminNotifications,
    getAllCompanies,
    getSystemReport,
};
