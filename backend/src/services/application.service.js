const Application = require("../models/application");
const Job = require("../models/job.model");


exports.applyToJob = async (jobId, seekerId) => {

  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  // 2️⃣ Prevent duplicate apply
  const existing = await Application.findOne({ jobId, seekerId });
  if (existing) {
    throw new Error("You have already applied for this job");
  }

  // 3️⃣ Create application
  const application = await Application.create({
    jobId,
    seekerId,
    employerId: job.employerId,
    status: "APPLIED"
  });

  return application;
};


// 🔹 Get My Applications (Job Seeker)
exports.getMyApplications = async (seekerId) => {
  return await Application.find({ seekerId })
    .populate("jobId");
};


// 🔹 Withdraw Application (Job Seeker)
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


// 🔹 Update Application Status (Employer)
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


// 🔹 Admin - View All Applications
exports.getAllApplications = async () => {
  return await Application.find()
    .populate("jobId seekerId");
};


// 🔹 Admin - Delete Application
exports.deleteApplication = async (applicationId) => {
  await Application.findByIdAndDelete(applicationId);
  return true;
};