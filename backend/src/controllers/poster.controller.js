const posterService = require('../services/poster.service');
const { successResponse, errorResponse } = require('../utils/response');

const generatePoster = async (req, res, next) => {
    try {
        const result = await posterService.generatePoster(req.user._id, req.body);
        return successResponse(res, 'Poster generated successfully', result);
    } catch (error) {
        if (error.statusCode) return errorResponse(res, error.message, error.statusCode);
        next(error);
    }
};

const createPoster = async (req, res, next) => {
    try {
        const poster = await posterService.createPoster(req.user._id, req.body);
        return successResponse(res, 'Poster saved successfully', { poster }, 201);
    } catch (error) {
        if (error.statusCode) return errorResponse(res, error.message, error.statusCode);
        next(error);
    }
};

const getPublicPosters = async (req, res, next) => {
    try {
        const { category, district, jobType, search, page, limit } = req.query;
        const result = await posterService.getPublicPosters({
            category,
            district,
            jobType,
            search,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 12,
        });
        return successResponse(res, 'Posters retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

const getAllPostersAdmin = async (req, res, next) => {
    try {
        const { search, status, page, limit } = req.query;
        const result = await posterService.getAllPostersAdmin({
            search,
            status,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 20,
        });
        return successResponse(res, 'All posters retrieved successfully', result);
    } catch (error) {
        next(error);
    }
};

const getMyPosters = async (req, res, next) => {
    try {
        const posters = await posterService.getPostersByEmployer(req.user._id);
        return successResponse(res, 'My posters retrieved successfully', { posters });
    } catch (error) {
        next(error);
    }
};

const getPosterById = async (req, res, next) => {
    try {
        const poster = await posterService.getPosterById(req.params.id);
        return successResponse(res, 'Poster retrieved successfully', { poster });
    } catch (error) {
        if (error.statusCode) return errorResponse(res, error.message, error.statusCode);
        next(error);
    }
};

const updatePoster = async (req, res, next) => {
    try {
        const poster = await posterService.updatePoster(req.params.id, req.user._id, req.body);
        return successResponse(res, 'Poster updated successfully', { poster });
    } catch (error) {
        if (error.statusCode) return errorResponse(res, error.message, error.statusCode);
        next(error);
    }
};

const deletePoster = async (req, res, next) => {
    try {
        await posterService.deletePoster(req.params.id, req.user);
        return successResponse(res, 'Poster deleted successfully');
    } catch (error) {
        if (error.statusCode) return errorResponse(res, error.message, error.statusCode);
        next(error);
    }
};

module.exports = {
    generatePoster,
    createPoster,
    getPublicPosters,
    getAllPostersAdmin,
    getMyPosters,
    getPosterById,
    updatePoster,
    deletePoster,
};
