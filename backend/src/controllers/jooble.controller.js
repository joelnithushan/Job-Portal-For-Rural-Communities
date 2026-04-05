const { getJoobleJobs } = require('../services/jooble.service');
const { successResponse, errorResponse } = require('../utils/response');

exports.searchJobs = async (req, res, next) => {
    try {
        const { what, where, category, page } = req.query;

        // Jooble prefers search strings. We can combine 'what' and 'category' if needed
        const keywords = [what, category].filter(Boolean).join(' ');

        const data = await getJoobleJobs({
            keywords,
            location: where,
            page: page || 1
        });

        return successResponse(res, 'External jobs retrieved from Jooble', data);
    } catch (err) {
        console.error('Jooble Controller Error:', err);
        return errorResponse(res, 'Failed to retrieve external jobs', 500);
    }
};
