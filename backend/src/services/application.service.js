const Application = require("../models/application.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");


exports.applyToJob = async (jobId, seekerId, cvUrl) => {

  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== 'OPEN') {
    throw new Error("This job is no longer accepting applications");
  }

  if (job.cvRequired && !cvUrl) {
    throw new Error("A CV is required to apply for this job");
  }

  const existing = await Application.findOne({ jobId, seekerId });
  if (existing) {
    throw new Error("You have already applied for this job");
  }

  const seekerForCheck = await User.findById(seekerId);
  if (!seekerForCheck.phone || !seekerForCheck.district || !seekerForCheck.nic || !seekerForCheck.bio) {
      const error = new Error("INCOMPLETE_PROFILE");
      error.statusCode = 403;
      throw error;
  }

  const application = await Application.create({
    jobId,
    seekerId,
    employerId: job.employerId,
    status: "APPLIED",
    cvUrl: cvUrl || null
  });

  try {
      const seeker = await User.findById(seekerId);
      await Notification.create({
          userId: job.employerId,
          title: 'New Job Application',
          message: `${seeker.name} has applied for your job: ${job.title}`,
          type: 'INFO',
          link: '/employer/applications'
      });
  } catch(e) {
      console.error('Failed to create notification', e);
  }

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

  try {
      await application.populate('jobId', 'title');
      const jobTitle = application.jobId.title;
      let notifType = 'INFO';
      if (status === 'ACCEPTED') notifType = 'SUCCESS';
      if (status === 'REJECTED') notifType = 'WARNING';
      
      await Notification.create({
          userId: application.seekerId,
          title: `Application ${status}`,
          message: `Your application for ${jobTitle} has been marked as ${status}.`,
          type: notifType,
          link: '/dashboard/applications'
      });
  } catch(e) {
      console.error('Failed to create notification', e);
  }

  return application;
};



exports.getAllApplications = async () => {
  return await Application.find()
    .populate("jobId seekerId");
};



exports.getApplicantsByJob = async (jobId, employerId) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job not found");
  }

  if (job.employerId.toString() !== employerId) {
    throw new Error("Not authorized to view applicants for this job");
  }

  return await Application.find({ jobId })
    .populate("seekerId", "name email phone nic district bio profilePicture")
    .populate("jobId", "title");
};


exports.getEmployerApplications = async (employerId) => {
  return await Application.find({ employerId })
    .populate("seekerId", "name email phone nic district bio profilePicture")
    .populate("jobId", "title");
};


exports.deleteApplication = async (applicationId) => {
  await Application.findByIdAndDelete(applicationId);
  return true;
};