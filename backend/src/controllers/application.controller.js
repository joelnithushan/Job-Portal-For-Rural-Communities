const service = require("../services/application.service");
const { successResponse, errorResponse } = require("../utils/response");

exports.apply = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return errorResponse(res, "jobId is required", 400);
    }

    const application = await service.applyToJob(jobId, req.user.id);
    return successResponse(res, "Application submitted successfully", { application }, 201);
  } catch (err) {
    if (err.message === "Job not found") {
      return errorResponse(res, err.message, 404);
    }
    if (err.message === "You have already applied for this job") {
      return errorResponse(res, err.message, 409);
    }
    next(err);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await service.getMyApplications(req.user.id);
    return successResponse(res, "Applications fetched successfully", { applications });
  } catch (err) {
    next(err);
  }
};

exports.getApplicantsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const applications = await service.getApplicantsByJob(jobId, req.user.id);
    return successResponse(res, "Applicants fetched successfully", { applications });
  } catch (err) {
    if (err.message === "Job not found") {
      return errorResponse(res, err.message, 404);
    }
    if (err.message === "Not authorized to view applicants for this job") {
      return errorResponse(res, err.message, 403);
    }
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const application = await service.updateStatus(id, req.user.id, status, note);
    return successResponse(res, "Application status updated", { application });
  } catch (err) {
    if (err.message === "Application not found") {
      return errorResponse(res, err.message, 404);
    }
    if (err.message === "Not authorized to update this application") {
      return errorResponse(res, err.message, 403);
    }
    next(err);
  }
};

exports.withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    await service.withdrawApplication(id, req.user.id);
    return successResponse(res, "Application withdrawn successfully");
  } catch (err) {
    if (err.message === "Application not found") {
      return errorResponse(res, err.message, 404);
    }
    if (err.message === "Not authorized to withdraw this application") {
      return errorResponse(res, err.message, 403);
    }
    next(err);
  }
};