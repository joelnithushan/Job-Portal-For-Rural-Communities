const service = require("../services/application.service");
const { successResponse, errorResponse } = require("../utils/response");

// POST /applications — only JOB_SEEKER can apply
exports.apply = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return errorResponse(res, "jobId is required", 400);
    }

    const application = await service.applyToJob(jobId, req.user.id);
    return successResponse(res, "Application submitted successfully", { application }, 201);
  } catch (err) {
    // surface known service errors with proper status codes
    if (err.message === "Job not found") {
      return errorResponse(res, err.message, 404);
    }
    if (err.message === "You have already applied for this job") {
      return errorResponse(res, err.message, 409);
    }
    next(err);
  }
};