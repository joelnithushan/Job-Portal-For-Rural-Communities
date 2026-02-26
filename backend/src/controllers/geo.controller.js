const geoService = require('../services/geo.service');
const { successResponse, errorResponse } = require('../utils/response');

const geocode = async (req, res, next) => {
    try {
        const { district } = req.body;
        if (!district) {
            return errorResponse(res, 'district is required', 400);
        }
        const data = await geoService.geocodeDistrict(district);
        successResponse(res, 'Geocoding successful', data);
    } catch (error) {
        if (error.statusCode) {
            return errorResponse(res, error.message, error.statusCode);
        }
        next(error);
    }
};

module.exports = {
    geocode,
};
