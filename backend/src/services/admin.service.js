const User = require('../models/user.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const Company = require('../models/company.model');

const getAllUsers = async () => {
    const users = await User.find().select('-password -__v');
    return users;
};

const updateUserStatus = async (userId, status) => {
    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: 'User not found' };
    }
    user.status = status;
    await user.save();
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
    await job.deleteOne();
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
    return company;
};

const suspendCompany = async (companyId) => {
    const company = await Company.findById(companyId);
    if (!company) {
        throw { statusCode: 404, message: 'Company not found' };
    }
    company.isSuspended = true;
    await company.save();
    return company;
};

const getAdminNotifications = async () => {
    const notifications = [];

    // 1. Pending Companies
    const pendingCompanies = await Company.find({ verificationStatus: 'PENDING' })
        .sort({ createdAt: -1 })
        .limit(10);
        
    pendingCompanies.forEach(company => {
        notifications.push({
            id: `company_${company._id}`,
            type: 'COMPANY_VERIFICATION',
            title: 'Pending Verification',
            message: `Company "${company.businessName}" is waiting for verification.`,
            isRead: false,
            createdAt: company.createdAt,
            link: '/admin/companies'
        });
    });

    // We can add more aggregations here later (e.g., reported users, pending jobs)

    // Sort all aggregated notifications by date descending
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
