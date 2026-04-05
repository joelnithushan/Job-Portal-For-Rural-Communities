const { getAdzunaJobs } = require('../services/adzuna.service');
const { successResponse, errorResponse } = require('../utils/response');

exports.searchJobs = async (req, res, next) => {
    try {
        const { what, where, category, page, sort } = req.query;

        const data = await getAdzunaJobs({
            what,
            where,
            category,
            page: page || 1,
            sort_by: sort || 'relevance'
        });

        return successResponse(res, 'External jobs retrieved', data);
    } catch (err) {
        console.error('Adzuna Controller Error:', err);
        return errorResponse(res, 'Failed to retrieve external jobs', 500);
    }
};
