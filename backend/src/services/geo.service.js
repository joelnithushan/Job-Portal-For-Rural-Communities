const axios = require('axios');

const geocodeDistrict = async (district) => {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
            q: district,
            format: 'json',
            limit: 1,
        },
        headers: {
            'User-Agent': 'JobPortalApp/1.0',
        },
    });

    if (!response.data || response.data.length === 0) {
        throw { statusCode: 404, message: 'Location not found' };
    }

    const { lat, lon } = response.data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
};

module.exports = {
    geocodeDistrict,
};
