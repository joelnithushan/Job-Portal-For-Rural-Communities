const Company = require('../models/company.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

const createCompany = async (userId, data) => {
    const existing = await Company.findOne({ employerUserId: userId });
    if (existing) {
        throw { statusCode: 400, message: 'Company profile already exists' };
    }
    const company = await Company.create({ ...data, employerUserId: userId });

    try {
        const admins = await User.find({ role: 'ADMIN' }).select('_id');
        for (const admin of admins) {
            await Notification.create({
                userId: admin._id,
                title: 'New Company Registered',
                message: `"${company.businessName}" has been registered and is awaiting verification.`,
                type: 'INFO',
                link: '/admin/companies'
            });
        }
    } catch(e) { console.error('Notification error:', e); }

    return company;
};

const getCompanyByUserId = async (userId) => {
    const company = await Company.findOne({ employerUserId: userId });
    if (!company) {
        throw { statusCode: 404, message: 'Company profile not found' };
    }
    return company;
};

const updateCompany = async (userId, data) => {
    const company = await Company.findOne({ employerUserId: userId });
    if (!company) {
        throw { statusCode: 404, message: 'Company profile not found' };
    }
    Object.assign(company, data);
    await company.save();
    return company;
};

const getCompanyById = async (companyId) => {
    const company = await Company.findById(companyId).select(
        '-employerUserId -verificationStatus -isSuspended -__v'
    );
    if (!company) {
        throw { statusCode: 404, message: 'Company not found' };
    }
    return company;
};

const deleteCompany = async (userId) => {
    const company = await Company.findOneAndDelete({ employerUserId: userId });
    if (!company) {
        throw { statusCode: 404, message: 'Company profile not found' };
    }
    return company;
};

module.exports = {
    createCompany,
    getCompanyByUserId,
    getCompanyById,
    updateCompany,
    deleteCompany,
};
