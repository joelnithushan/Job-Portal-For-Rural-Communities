const Job = require('../models/job.model');
const Company = require('../models/company.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const geoService = require('./geo.service');

const createJob = async (jobData) => {
    const company = await Company.findOne({ employerUserId: jobData.employerId });
    if (!company || !company.businessName || !company.district || !company.town || !company.contactPhone) {
        const error = new Error("INCOMPLETE_COMPANY");
        error.statusCode = 403;
        throw error;
    }

    if (jobData.district && (!jobData.location || !jobData.location.coordinates)) {
        try {
            const query = jobData.town ? `${jobData.town}, ${jobData.district}, Sri Lanka` : `${jobData.district}, Sri Lanka`;
            const coords = await geoService.geocodeDistrict(query);
            jobData.location = {
                type: 'Point',
                coordinates: [coords.lng, coords.lat],
            };
        } catch (error) {
            console.error('Failed to geocode job location:', error.message);
            // Fallback to district if town fails
            if (jobData.town) {
                try {
                    const fallbackCoords = await geoService.geocodeDistrict(`${jobData.district}, Sri Lanka`);
                    jobData.location = {
                        type: 'Point',
                        coordinates: [fallbackCoords.lng, fallbackCoords.lat],
                    };
                } catch (fallbackError) {
                    console.error('Fallback geocode failed:', fallbackError.message);
                }
            }
        }
    }
    const job = await Job.create(jobData);

    try {
        const admins = await User.find({ role: 'ADMIN' }).select('_id');
        for (const admin of admins) {
            await Notification.create({
                userId: admin._id,
                title: 'New Job Posted',
                message: `A new job "${job.title}" has been posted in ${job.district}.`,
                type: 'INFO',
                link: '/admin/jobs'
            });
        }
    } catch(e) { console.error('Notification error:', e); }

    return job;
};

const getJobs = async ({ district, category, jobType, search, sort, salaryMin, salaryMax, page = 1, limit = 10 }) => {
    const filter = {};
    if (district) filter.district = district;
    if (category) filter.category = category;
    if (jobType) filter.jobType = jobType;

    // Text search on title (case-insensitive regex)
    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }

    // Salary range filtering
    if (salaryMin) {
        filter.salaryMax = { ...(filter.salaryMax || {}), $gte: Number(salaryMin) };
    }
    if (salaryMax) {
        filter.salaryMin = { ...(filter.salaryMin || {}), $lte: Number(salaryMax) };
    }

    // Dynamic sorting
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'salaryDesc') {
        sortOption = { salaryMax: -1, createdAt: -1 };
    } else if (sort === 'salaryAsc') {
        sortOption = { salaryMin: 1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
        Job.find(filter)
            .populate('employerId', 'name email profilePicture')
            .sort(sortOption)
            .skip(skip)
            .limit(limit),
        Job.countDocuments(filter),
    ]);

    return {
        jobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

const getJobById = async (jobId) => {
    const job = await Job.findById(jobId).populate('employerId', 'name email profilePicture phone');
    if (!job) {
        const error = new Error('Job not found');
        error.statusCode = 404;
        throw error;
    }
    return job;
};

const updateJob = async (jobId, updateData, userId) => {
    const job = await Job.findById(jobId);
    if (!job) {
        const error = new Error('Job not found');
        error.statusCode = 404;
        throw error;
    }
    if (job.employerId.toString() !== userId.toString()) {
        const error = new Error('Forbidden: you can only update your own jobs');
        error.statusCode = 403;
        throw error;
    }

    if ((updateData.district || updateData.town) && !updateData.location) {
        const queryDistrict = updateData.district || job.district;
        const queryTown = updateData.town !== undefined ? updateData.town : job.town;
        const query = queryTown ? `${queryTown}, ${queryDistrict}, Sri Lanka` : `${queryDistrict}, Sri Lanka`;
        try {
            const coords = await geoService.geocodeDistrict(query);
            updateData.location = {
                type: 'Point',
                coordinates: [coords.lng, coords.lat],
            };
        } catch (error) {
            console.error('Failed to geocode updated job location:', error.message);
            if (queryTown) {
                try {
                    const fallbackCoords = await geoService.geocodeDistrict(`${queryDistrict}, Sri Lanka`);
                    updateData.location = {
                        type: 'Point',
                        coordinates: [fallbackCoords.lng, fallbackCoords.lat],
                    };
                } catch (fallbackError) {
                    console.error('Fallback geocode failed:', fallbackError.message);
                }
            }
        }
    }

    Object.assign(job, updateData);
    await job.save();
    return job;
};

const deleteJob = async (jobId, user) => {
    const job = await Job.findById(jobId);
    if (!job) {
        const error = new Error('Job not found');
        error.statusCode = 404;
        throw error;
    }
    const isOwner = job.employerId.toString() === user._id.toString();
    const isAdmin = user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
        const error = new Error('Forbidden: only the job owner or an admin can delete');
        error.statusCode = 403;
        throw error;
    }
    await job.deleteOne();
};

const getNearbyJobs = async (lat, lng, radiusKm = 10) => {
    const radiusInMeters = radiusKm * 1000;
    const jobs = await Job.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
                $maxDistance: radiusInMeters,
            },
        },
    }).populate('employerId', 'name email profilePicture');
    return jobs;
};

const getJobsByEmployer = async (employerId, page = 1, limit = 100) => {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
        Job.find({ employerId })
            .populate('employerId', 'name email profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Job.countDocuments({ employerId }),
    ]);

    return {
        jobs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getNearbyJobs,
    getJobsByEmployer,
};
