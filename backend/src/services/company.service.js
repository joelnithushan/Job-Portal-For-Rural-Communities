const Company = require('../models/company.model');

const createCompany = async (userId, data) => {
    const existing = await Company.findOne({ employerUserId: userId });
    if (existing) {
        throw { statusCode: 400, message: 'Company profile already exists' };
    }
    const company = await Company.create({ ...data, employerUserId: userId });
    return company;
};

const getCompanyByUserId = async (userId) => {
    const company = await Company.findOne({ employerUserId: userId });
    if (!company) {
        throw { statusCode: 404, message: 'Company profile not found' };
    }
    return company;
};

module.exports = {
    createCompany,
    getCompanyByUserId,
};
