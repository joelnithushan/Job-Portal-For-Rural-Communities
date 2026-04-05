const Application = require("../models/application.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const sendEmail = require("../utils/sendEmail");
const sendSms = require("../utils/sendSms");



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

      // Send confirmation email to the Job Seeker
      await sendEmail({
          to: seeker.email,
          subject: `Application Submitted: ${job.title}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 40px; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #2e7d32; margin-bottom: 10px;">Application Successfully Received!</h2>
                    <div style="height: 4px; width: 60px; background-color: #4caf50; margin: auto;"></div>
                </div>
                <p style="font-size: 16px; color: #333;">Hello <strong>${seeker.name}</strong>,</p>
                <p style="font-size: 16px; color: #555; line-height: 1.6;">
                    Thank you for applying for the position of <strong>${job.title}</strong>! Your application has been successfully delivered to the employer.
                </p>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0; color: #333;"><strong>What's Next?</strong></p>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">The employer will review your profile and CV. You will receive an email if there's a status update on your application.</p>
                </div>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/applications" 
                       style="background-color: #2e7d32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                       View Your Applications
                    </a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">This is an automated notification from the Job Portal Platform. Do not reply to this email.</p>
            </div>
          `
      });
  } catch(e) {
      console.error('Failed to create notification or send email', e);
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
      const seeker = await User.findById(application.seekerId);
      const employer = await User.findById(application.employerId);
      const jobTitle = application.jobId.title;
      const companyName = employer.name;
      let notifType = 'INFO';
      let statusColor = '#2e7d32'; // Default green for ACCEPTED
      
      if (status === 'ACCEPTED') notifType = 'SUCCESS';
      if (status === 'REJECTED') {
          notifType = 'WARNING';
          statusColor = '#d32f2f'; // Red
      }
      
      await Notification.create({
          userId: application.seekerId,
          title: `Application ${status}`,
          message: `Your application for ${jobTitle} at ${companyName} has been marked as ${status}.`,
          type: notifType,
          link: '/dashboard/applications'
      });

      // Send status update email to the Job Seeker
      await sendEmail({
          to: seeker.email,
          subject: `Status Update: Your application for ${jobTitle} at ${companyName}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 40px; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #333; margin-bottom: 10px;">Application Update</h2>
                    <div style="height: 4px; width: 60px; background-color: ${statusColor}; margin: auto;"></div>
                </div>
                <p style="font-size: 16px; color: #333;">Hi <strong>${seeker.name}</strong>,</p>
                <p style="font-size: 16px; color: #555; line-height: 1.6;">
                    The status of your application for the position <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated to:
                </p>
                <div style="text-align: center; margin: 25px 0;">
                    <span style="font-size: 20px; font-weight: bold; color: ${statusColor}; border: 2px solid ${statusColor}; padding: 8px 20px; border-radius: 4px; display: inline-block; text-transform: uppercase;">
                        ${status}
                    </span>
                </div>
                ${note ? `
                <div style="background-color: #fcfcfc; border-left: 4px solid #ddd; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #666; font-size: 14px; font-style: italic;">
                        " ${note} "
                    </p>
                </div>` : ''}
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/applications" 
                       style="background-color: #333; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                       View Details
                    </a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">This is an automated notification from the Job Portal Platform.</p>
            </div>
          `
      });

      // Send SMS notification if status is ACCEPTED and user has a valid phone number
      if (status === 'ACCEPTED' && seeker.phone) {
          try {
              await sendSms({
                 to: seeker.phone,
                 body: `🎉 NextEra Job Portal\n\nDear ${seeker.name},\n\nGreat news! Your application for "${jobTitle}" at ${companyName} has been ACCEPTED by the employer.\n\n📋 Next Steps:\n• Check your email for detailed instructions\n• Visit your dashboard for more info\n\n🌐 ${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/applications\n\n— NextEra Team`
              });
          } catch(smsError) {
             console.error('Failed to send SMS notification:', smsError.message);
          }
      }

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