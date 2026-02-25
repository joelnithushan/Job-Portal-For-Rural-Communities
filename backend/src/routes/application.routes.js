const express = require("express");
const Joi = require("joi");
const controller = require("../controllers/application.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

const applySchema = {
  body: Joi.object().keys({
    jobId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "jobId must be a vaid ObjectId",
      }),
  }),
};

router.post(
  "/",
  auth,
  requireRole("JOB_SEEKER"),
  validate(applySchema),
  controller.apply
);

router.get(
  "/me",
  auth,
  requireRole("JOB_SEEKER"),
  controller.getMyApplications
);

router.get(
  "/job/:jobId",
  auth,
  requireRole("EMPLOYER"),
  controller.getApplicantsByJob
);

const objectIdParam = {
  params: Joi.object().keys({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "id must be a valid ObjectId",
      }),
  }),
};

const updateStatusSchema = {
  params: objectIdParam.params,
  body: Joi.object().keys({
    status: Joi.string()
      .valid("APPLIED", "REVIEWED", "ACCEPTED", "REJECTED")
      .required(),
    note: Joi.string().trim().optional(),
  }),
};

router.patch(
  "/:id/status",
  auth,
  requireRole("EMPLOYER"),
  validate(updateStatusSchema),
  controller.updateStatus
);

router.delete(
  "/:id",
  auth,
  requireRole("JOB_SEEKER"),
  validate(objectIdParam),
  controller.withdrawApplication
);

module.exports = router;