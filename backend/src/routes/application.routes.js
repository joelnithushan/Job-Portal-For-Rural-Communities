const express = require("express");
const router = express.Router();
const controller = require("../controllers/application.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

router.post(
  "/",
  auth,
  requireRole("JOB_SEEKER"),
  controller.apply
);

module.exports = router;