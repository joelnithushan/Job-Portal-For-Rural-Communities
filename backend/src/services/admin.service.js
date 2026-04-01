const User = require('../models/user.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const Company = require('../models/company.model');
const Notification = require('../models/notification.model');

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

    // -- CASCADE TO COMPANY (IF EMPLOYER) --
    if (user.role === 'EMPLOYER') {
        const company = await Company.findOne({ employerUserId: userId });
        if (company) {
            company.isSuspended = status === 'SUSPENDED';
            company.suspensionReason = status === 'SUSPENDED' ? reason : null;
            await company.save();
        }
    }

    try {
        await Notification.create({
            userId: user._id,
            title: status === 'SUSPENDED' ? 'Account Suspended' : 'Account Activated',
            message: status === 'SUSPENDED'
                ? `Your account has been suspended by the administrator.${reason ? ` Reason: ${reason}` : ''}`
                : 'Your account has been activated by the administrator.',
            type: status === 'SUSPENDED' ? 'WARNING' : 'SUCCESS',
            link: '/profile'
        });
    } catch(e) { console.error('Notification error:', e); }

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

    try {
        await Notification.create({
            userId: employerId,
            title: 'Job Removed by Admin',
            message: `Your job listing "${jobTitle}" was removed by the administrator.`,
            type: 'WARNING',
            link: '/employer/jobs'
        });
    } catch(e) { console.error('Notification error:', e); }

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

    try {
        await Notification.create({
            userId: company.employerUserId,
            title: 'Company Verified',
            message: `Your company "${company.businessName}" has been verified by the administrator.`,
            type: 'SUCCESS',
            link: '/employer/company'
        });
    } catch(e) { console.error('Notification error:', e); }

    return company;
};

const suspendCompany = async (companyId, reason = null) => {
    const company = await Company.findById(companyId);
    if (!company) {
        throw { statusCode: 404, message: 'Company not found' };
    }
    
    // Toggle suspension
    company.isSuspended = !company.isSuspended;
    company.suspensionReason = company.isSuspended ? reason : null;
    await company.save();

    // -- CASCADE TO EMPLOYER --
    const employer = await User.findById(company.employerUserId);
    if (employer) {
        employer.status = company.isSuspended ? 'SUSPENDED' : 'ACTIVE';
        employer.suspensionReason = company.isSuspended ? reason : null;
        await employer.save();
    }

    try {
        await Notification.create({
            userId: company.employerUserId,
            title: company.isSuspended ? 'Company Suspended' : 'Company Unsuspended',
            message: company.isSuspended
                ? `Your company "${company.businessName}" has been suspended.${reason ? ` Reason: ${reason}` : ''}`
                : `Your company "${company.businessName}" has been unsuspended.`,
            type: company.isSuspended ? 'WARNING' : 'SUCCESS',
            link: '/employer/company'
        });
    } catch(e) { console.error('Notification error:', e); }

    return company;
};

const getAdminNotifications = async () => {
    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    const adminIds = admins.map(a => a._id);
    const notifications = await Notification.find({ userId: { $in: adminIds } })
        .sort({ createdAt: -1 })
        .limit(50);
    return notifications;
};

const getAllCompanies = async () => {
    const companies = await Company.find().populate('employerUserId', 'name email');
    return companies;
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
};
