const axios = require('axios');

/**
 * Service to fetch jobs from the Adzuna API
 */
exports.getAdzunaJobs = async ({ what, where, category, page = 1, sort_by = 'relevance' }) => {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    
    // Fallback if not configured
    if (!appId || !appKey) {
        console.warn('Adzuna API credentials missing. Returning empty results.');
        return { count: 0, results: [] };
    }

    try {
        // Base API URL for US/UK/other region. "gb" (UK), "us" (US), etc.
        // Adzuna requires a country code in the URL. We'll use 'gb' as default or potentially a configured one.
        const country = process.env.ADZUNA_COUNTRY || 'gb';
        
        let url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
        
        const params = {
            app_id: appId,
            app_key: appKey,
            results_per_page: 10,
            sort_by
        };

        if (what) params.what = what;
        if (where) params.where = where;
        if (category) params.category = category;

        const response = await axios.get(url, { params });

        return {
            count: response.data.count,
            results: response.data.results.map(job => ({
                id: job.id,
                title: job.title,
                company: job.company?.display_name,
                location: job.location?.display_name,
                description: job.description,
                url: job.redirect_url,
                salary_min: job.salary_min,
                salary_max: job.salary_max,
                category: job.category?.label,
                contract_time: job.contract_time,
                created: job.created,
            }))
        };
    } catch (error) {
        console.error('Adzuna API Fetch Error:', error.response?.data || error.message);
        throw new Error('Failed to fetch from Adzuna API');
    }
};
