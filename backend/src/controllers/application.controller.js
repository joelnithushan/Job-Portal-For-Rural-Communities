const service = require("../services/application.service");

exports.apply = async (req, res, next) => {
  try {
    const result = await service.applyToJob(
      req.body.jobId,
      req.user.id
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};