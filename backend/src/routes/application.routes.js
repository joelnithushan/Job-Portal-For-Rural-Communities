const express = require("express");
const Joi = require("joi");
const controller = require("../controllers/application.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const verifyCaptcha = require("../middlewares/captcha.middleware");
const { uploadCV } = require("../config/cloudinary");

const router = express.Router();

const applySchema = {
  body: Joi.object().keys({
    jobId: Joi.string()
      .hex()
      .length(24)
      .required()
      .messages({
        "string.hex": "jobId must be a valid hex string",
        "string.length": "jobId must be exactly 24 characters",
      }),
    cvUrl: Joi.string().uri().optional(),
    captchaToken: Joi.string().optional(),
  }),
};

/**
 * @swagger
 * /api/applications/upload-cv:
 *   post:
 *     summary: Upload a CV for application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CV uploaded
 */
router.post(
  "/upload-cv",
  auth,
  requireRole("JOB_SEEKER"),
  uploadCV.single("cv"),
  controller.uploadCV
);

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [jobId]
 *             properties:
 *               jobId:
 *                 type: string
 *               cvUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string, example: "60f1b2c3d..." }
 *                 jobId: { type: string, example: "jobId123" }
 *                 applicantId: { type: string, example: "applicantId456" }
 *                 status: { type: string, example: "APPLIED" }
 */
router.post(
  "/",
  auth,
  requireRole("JOB_SEEKER"),
  verifyCaptcha,
  validate(applySchema),
  controller.apply
);

/**
 * @swagger
 * /api/applications/me:
 *   get:
 *     summary: Get my applications (Job Seeker)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications list for the current job seeker
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string, example: "60f1b2c3d..." }
 *                   jobId: { type: object, properties: { title: {type: string, example: "Frontend Dev"}, district: {type: string, example: "Colombo"} } }
 *                   status: { type: string, example: "REVIEWED" }
 */
router.get(
  "/me",
  auth,
  requireRole("JOB_SEEKER"),
  controller.getMyApplications
);

/**
 * @swagger
 * /api/applications/employer:
 *   get:
 *     summary: Get all applications for employer's jobs
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications list
 */
router.get(
  "/employer",
  auth,
  requireRole("EMPLOYER"),
  controller.getEmployerApplications
);

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Get applicants for a specific job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *     responses:
 *       200:
 *         description: Applicants list
 */
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

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string, example: "60f1b2c3d..." }
 *                 status: { type: string, example: "ACCEPTED" }
 *                 note: { type: string, example: "Great interview!" }
 */
router.patch(
  "/:id/status",
  auth,
  requireRole("EMPLOYER"),
  validate(updateStatusSchema),
  controller.updateStatus
);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Withdraw an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Application withdrawn
 */
router.delete(
  "/:id",
  auth,
  requireRole("JOB_SEEKER"),
  validate(objectIdParam),
  controller.withdrawApplication
);

module.exports = router;