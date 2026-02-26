const companyService = require('../services/company.service');
const { successResponse } = require('../utils/response');

const createCompany = async (req, res, next) => {
    try {
        const company = await companyService.createCompany(req.user._id, req.body);
        successResponse(res, 'Company profile created successfully', { company }, 201);
    } catch (error) {
        next(error);
    }
};

const getMyCompany = async (req, res, next) => {
    try {
        const company = await companyService.getCompanyByUserId(req.user._id);
        successResponse(res, 'Company profile retrieved', { company });
    } catch (error) {
        next(error);
    }
};

const updateMyCompany = async (req, res, next) => {
    try {
        const company = await companyService.updateCompany(req.user._id, req.body);
        successResponse(res, 'Company profile updated successfully', { company });
    } catch (error) {
        next(error);
    }
};

const getCompanyById = async (req, res, next) => {
    try {
        const company = await companyService.getCompanyById(req.params.id);
        successResponse(res, 'Company profile retrieved', { company });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCompany,
    getMyCompany,
    updateMyCompany,
    getCompanyById,
};
