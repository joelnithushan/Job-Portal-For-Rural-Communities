const adminService = require('../services/admin.service');
const { successResponse } = require('../utils/response');

const getAllUsers = async (req, res, next) => {
    try {
        const users = await adminService.getAllUsers();
        successResponse(res, 'Users retrieved successfully', { users });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { status, reason } = req.body;
        const user = await adminService.updateUserStatus(req.params.id, status, reason);
        successResponse(res, 'User status updated successfully', { user });
    } catch (error) {
        next(error);
    }
};

const getAllJobs = async (req, res, next) => {
    try {
        const jobs = await adminService.getAllJobs();
        successResponse(res, 'Jobs retrieved successfully', { jobs });
    } catch (error) {
        next(error);
    }
};

const deleteJob = async (req, res, next) => {
    try {
        const job = await adminService.deleteJob(req.params.id);
        successResponse(res, 'Job deleted successfully', { job });
    } catch (error) {
        next(error);
    }
};

const getAllApplications = async (req, res, next) => {
    try {
        const applications = await adminService.getAllApplications();
        successResponse(res, 'Applications retrieved successfully', { applications });
    } catch (error) {
        next(error);
    }
};

const deleteApplication = async (req, res, next) => {
    try {
        const application = await adminService.deleteApplication(req.params.id);
        successResponse(res, 'Application deleted successfully', { application });
    } catch (error) {
        next(error);
    }
};

const verifyCompany = async (req, res, next) => {
    try {
        const company = await adminService.verifyCompany(req.params.id);
        successResponse(res, 'Company verified successfully', { company });
    } catch (error) {
        next(error);
    }
};

const suspendCompany = async (req, res, next) => {
    try {
        const { reason } = req.body || {};
        const company = await adminService.suspendCompany(req.params.id, reason);
        successResponse(res, 'Company suspension updated successfully', { company });
    } catch (error) {
        next(error);
    }
};

const getAllCompanies = async (req, res, next) => {
    try {
        const companies = await adminService.getAllCompanies();
        successResponse(res, 'Companies retrieved successfully', { companies });
    } catch (error) {
        next(error);
    }
};

const getAdminNotifications = async (req, res, next) => {
    try {
        const notifications = await adminService.getAdminNotifications();
        successResponse(res, 'Admin notifications retrieved', { notifications });
    } catch (error) {
        next(error);
    }
};

const getSystemReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (new Date(startDate) > new Date(endDate)) {
            throw { statusCode: 400, message: 'Start date cannot be after the end date.' };
        }

        if (new Date(endDate) > new Date()) {
            throw { statusCode: 400, message: 'End date cannot be in the future.' };
        }

        const report = await adminService.getSystemReport(startDate, endDate);
        successResponse(res, 'System report generated successfully', report);
    } catch (error) {
        next(error);
    }
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
    getAllCompanies,
    getAdminNotifications,
    getSystemReport,
};
