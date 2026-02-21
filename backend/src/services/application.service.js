const Application = require("../models/application");
const Job = require("../models/job.model");


exports.applyToJob = async (jobId, seekerId) => {

  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }


  const existing = await Application.findOne({ jobId, seekerId });
  if (existing) {
    throw new Error("You have already applied for this job");
  }


  const application = await Application.create({
    jobId,
    seekerId,
    employerId: job.employerId,
    status: "APPLIED"
  });

  return application;
};



exports.getMyApplications = async (seekerId) => {
  return await Application.find({ seekerId })
    .populate("jobId");
};



exports.withdrawApplication = async (applicationId, seekerId) => {

  const application = await Application.findById(applicationId);

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.seekerId.toString() !== seekerId) {
    throw new Error("Not authorized to withdraw this application");
  }

  await application.deleteOne();
  return true;
};



exports.updateStatus = async (applicationId, employerId, status, note) => {

  const application = await Application.findById(applicationId);

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.employerId.toString() !== employerId) {
    throw new Error("Not authorized to update this application");
  }

  application.status = status;

  if (note) {
    application.note = note;
  }

  await application.save();
  return application;
};



exports.getAllApplications = async () => {
  return await Application.find()
    .populate("jobId seekerId");
};



exports.deleteApplication = async (applicationId) => {
  await Application.findByIdAndDelete(applicationId);
  return true;
};