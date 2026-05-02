const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ruralwork/profiles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        public_id: (req, file) => `user_${req.user._id}_${Date.now()}`,
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG, and WEBP images are allowed.'), false);
        }
    },
});

const cvStorage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        const original = (file.originalname || '').toLowerCase();
        const dot = original.lastIndexOf('.');
        const rawExt = dot >= 0 ? original.substring(dot + 1) : '';
        const ext = ['pdf', 'doc', 'docx'].includes(rawExt) ? rawExt : 'pdf';
        return {
            folder: 'ruralwork/cvs',
            allowed_formats: ['pdf', 'doc', 'docx'],
            resource_type: 'raw',
            // Append the extension to the public_id so the resulting URL ends
            // in .pdf/.doc/.docx — required by Cloudinary's raw delivery and
            // by browsers / preview viewers that key off file extension.
            public_id: `cv_${req.user._id}_${Date.now()}.${ext}`,
        };
    },
});

const uploadCV = multer({
    storage: cvStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Word documents are allowed.'), false);
        }
    },
});

module.exports = { cloudinary, upload, uploadCV };
