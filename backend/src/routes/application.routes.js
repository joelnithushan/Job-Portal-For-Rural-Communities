const express = require("express");
const Joi = require("joi");
const controller = require("../controllers/application.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

// validate that jobId is a valid mongo ObjectId
const applySchema = {
  body: Joi.object().keys({
    jobId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.pattern.base": "jobId must be a valid ObjectId",
      }),
  }),
};

// POST /applications — submit a job application
router.post(
  "/",
  auth,
  requireRole("JOB_SEEKER"),
  validate(applySchema),
  controller.apply
);

module.exports = router;