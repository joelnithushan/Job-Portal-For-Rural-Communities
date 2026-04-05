const axios = require('axios');

/**
 * Service to fetch jobs from the Jooble API
 */
exports.getJoobleJobs = async ({ keywords, location, page = 1 }) => {
    const apiKey = process.env.JOOBLE_API_KEY;
    
    if (!apiKey) {
        console.warn('Jooble API key missing. Returning empty results.');
        return { count: 0, results: [] };
    }

    try {
        const url = `https://jooble.org/api/${apiKey}`;
        
        const body = {
            keywords: keywords || '',
            location: location || '',
            // Jooble strictly requires these to be integers, NOT strings!
            page: parseInt(page, 10) || 1,
            resultonpage: 10
        };

        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        return {
            count: data.totalCount || 0,
            results: (data.jobs || []).map(job => ({
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.snippet,
                url: job.link,
                salary: job.salary,
                source: job.source,
                type: job.type,
                created: job.updated,
            }))
        };
    } catch (error) {
        // Detailed error logging to avoid silent 500s
        console.error('Jooble API Fetch Error:', error.response?.data || error.message);
        throw new Error('Failed to fetch from Jooble API');
    }
};
