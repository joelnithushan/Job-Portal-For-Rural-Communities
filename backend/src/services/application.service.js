const Application = require("../models/application.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");
const { notifyUser } = require("../utils/notify");



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

  if (job.employerId.toString() === seekerId.toString()) {
    const error = new Error("You cannot apply to your own job listing");
    error.statusCode = 400;
    throw error;
  }

  const employerForCheck = await User.findById(job.employerId).select('status');
  if (!employerForCheck || employerForCheck.status !== 'ACTIVE') {
    const error = new Error("The employer for this job is currently unavailable");
    error.statusCode = 400;
    throw error;
  }

  const existing = await Application.findOne({ jobId, seekerId });
  if (existing) {
    throw new Error("You have already applied for this job");
  }

  const seekerForCheck = await User.findById(seekerId);
  if (!seekerForCheck.phone || !seekerForCheck.district || !seekerForCheck.nic) {
      const error = new Error("INCOMPLETE_PROFILE");
      error.statusCode = 403;
      throw error;
  }

  let seekerAge = null;
  if (seekerForCheck.dob) {
      const dob = new Date(seekerForCheck.dob);
      const today = new Date();
      let age = today.getUTCFullYear() - dob.getUTCFullYear();
      const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate())) {
          age--;
      }
      seekerAge = age;
  }

  if (job.genderRequirement && job.genderRequirement !== 'ANY') {
      if (!seekerForCheck.gender || seekerForCheck.gender !== job.genderRequirement) {
          const error = new Error(`This job requires a ${job.genderRequirement.toLowerCase()} applicant.`);
          error.statusCode = 400;
          throw error;
      }
  }

  if (job.ageLimitMin !== null && job.ageLimitMin !== undefined) {
      if (seekerAge === null || seekerAge < job.ageLimitMin) {
          const error = new Error(`You must be at least ${job.ageLimitMin} years old to apply.`);
          error.statusCode = 400;
          throw error;
      }
  }

  if (job.ageLimitMax !== null && job.ageLimitMax !== undefined) {
      if (seekerAge === null || seekerAge > job.ageLimitMax) {
          const error = new Error(`You must be at most ${job.ageLimitMax} years old to apply.`);
          error.statusCode = 400;
          throw error;
      }
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
      const employer = await User.findById(job.employerId);

      await notifyUser(seeker, {
          title: 'Application Submitted',
          message: `Your application for "${job.title}" has been delivered to the employer. You'll be notified when the status changes.`,
          type: 'SUCCESS',
          link: '/dashboard/applications',
      });

      await notifyUser(employer, {
          title: 'New Job Application',
          message: `${seeker.name} has applied for your job: ${job.title}.`,
          type: 'INFO',
          link: '/employer/applications',
      });
  } catch(e) {
      console.error('Failed to create application notifications', e);
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

  if (application.seekerId.toString() !== seekerId.toString()) {
    throw new Error("Not authorized to withdraw this application");
  }

  if (application.status === 'ACCEPTED' || application.status === 'REJECTED') {
    const error = new Error(`Cannot withdraw a ${application.status.toLowerCase()} application`);
    error.statusCode = 400;
    throw error;
  }

  const employerId = application.employerId;
  const jobIdRef = application.jobId;
  await application.deleteOne();

  try {
    const [employer, seeker, job] = await Promise.all([
      User.findById(employerId).select('name email phone'),
      User.findById(seekerId).select('name'),
      Job.findById(jobIdRef).select('title'),
    ]);
    if (employer) {
      await notifyUser(employer, {
        title: 'Application Withdrawn',
        message: `${seeker?.name || 'An applicant'} has withdrawn their application for "${job?.title || 'your job'}".`,
        type: 'INFO',
        link: '/employer/applications',
        channels: { inApp: true, email: true, sms: false },
      });
    }
  } catch (e) {
    console.error('Failed to notify employer of withdrawal:', e.message);
  }

  return true;
};



const ALLOWED_STATUS_TRANSITIONS = {
  APPLIED: ['REVIEWED', 'ACCEPTED', 'REJECTED'],
  REVIEWED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
};

exports.updateStatus = async (applicationId, employerId, status, note) => {

  const application = await Application.findById(applicationId);

  if (!application) {
    throw new Error("Application not found");
  }

  if (application.employerId.toString() !== employerId.toString()) {
    throw new Error("Not authorized to update this application");
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[application.status] || [];
  if (status !== application.status && !allowed.includes(status)) {
    const error = new Error(`Cannot change status from ${application.status} to ${status}`);
    error.statusCode = 400;
    throw error;
  }

  application.status = status;

  if (note) {
    application.note = note;
  }

  await application.save();

  try {
      await application.populate('jobId', 'title');
      const seeker = await User.findById(application.seekerId);
      const employer = await User.findById(application.employerId);
      const jobTitle = application.jobId.title;
      const companyName = employer?.name || 'the employer';
      let notifType = 'INFO';
      if (status === 'ACCEPTED') notifType = 'SUCCESS';
      if (status === 'REJECTED') notifType = 'WARNING';

      const noteLine = note ? `\n\nNote from employer: ${note}` : '';
      const smsBody = status === 'ACCEPTED'
          ? `NextEra Job Portal\n\nDear ${seeker?.name || 'Applicant'},\n\nGreat news! Your application for "${jobTitle}" at ${companyName} has been ACCEPTED.\n\nNext Steps:\n- Check your email for details\n- Visit your dashboard\n\n${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/applications\n\n- NextEra Team`
          : undefined;

      await notifyUser(seeker, {
          title: `Application ${status}`,
          message: `Your application for "${jobTitle}" at ${companyName} has been marked as ${status}.${noteLine}`,
          type: notifType,
          link: '/dashboard/applications',
          sms: smsBody ? { body: smsBody } : undefined,
      });

  } catch(e) {
      console.error('Failed to create notification, email, or sms', e);
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

  if (job.employerId.toString() !== employerId.toString()) {
    throw new Error("Not authorized to view applicants for this job");
  }

  return await Application.find({ jobId })
    .populate("seekerId", "name email phone nic district bio profilePicture gender dob")
    .populate("jobId", "title");
};


exports.getEmployerApplications = async (employerId) => {
  return await Application.find({ employerId })
    .populate("seekerId", "name email phone nic district bio profilePicture gender dob")
    .populate("jobId", "title");
};


exports.deleteApplication = async (applicationId) => {
  await Application.findByIdAndDelete(applicationId);
  return true;
};