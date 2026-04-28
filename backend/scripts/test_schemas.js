const Joi = require('joi');

// Replicate schemas under test
const phoneRegex = /^(?:\+94|0)[0-9]{9}$/;
const nameRegex = /^[a-zA-Z\s.\-]+$/;
const pwdRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
const nicRegex = /^(?:\d{9}[vVxX]|\d{12})$/;

const registerSchema = Joi.object().keys({
    name: Joi.string().required().pattern(nameRegex),
    email: Joi.string().required().email(),
    password: Joi.string().required().pattern(pwdRegex),
    role: Joi.string().valid('EMPLOYER', 'JOB_SEEKER').required(),
    nic: Joi.string().pattern(nicRegex).optional(),
    phone: Joi.string().pattern(phoneRegex).optional(),
    gender: Joi.string().valid('MALE', 'FEMALE').optional(),
    dob: Joi.date().max('now').optional(),
    captchaToken: Joi.string().optional(),
    otp: Joi.string().length(6).required(),
});

const createJobSchema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    district: Joi.string().required(),
    contactPhone: Joi.string().required().pattern(phoneRegex),
    town: Joi.string(),
    category: Joi.string(),
    jobType: Joi.string().valid('FULL_TIME', 'PART_TIME', 'CONTRACT'),
    salaryMin: Joi.number(),
    salaryMax: Joi.number(),
    ageLimitMin: Joi.number().integer().min(0).max(120),
    ageLimitMax: Joi.number().integer().min(0).max(120),
    genderRequirement: Joi.string().valid('MALE', 'FEMALE', 'ANY'),
    cvRequired: Joi.boolean().default(false),
});

const applySchema = Joi.object().keys({
    jobId: Joi.string().hex().length(24).required(),
    cvUrl: Joi.string().uri().allow(null, '').optional(),
    captchaToken: Joi.string().optional(),
});

const cases = [
    {
        name: 'register seeker (with gender + dob)',
        schema: registerSchema,
        payload: {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'StrongPass1!',
            role: 'JOB_SEEKER',
            nic: '200228002211',
            phone: '0712345678',
            gender: 'MALE',
            dob: '2002-10-06',
            captchaToken: 'tok',
            otp: '123456',
        },
    },
    {
        name: 'register employer',
        schema: registerSchema,
        payload: {
            name: 'Jane Co',
            email: 'jane@co.com',
            password: 'StrongPass1!',
            role: 'EMPLOYER',
            nic: '986543210V',
            phone: '+94712345678',
            gender: 'FEMALE',
            dob: '1990-05-12',
            otp: '654321',
        },
    },
    {
        name: 'create job (with age + gender)',
        schema: createJobSchema,
        payload: {
            title: 'Driver',
            description: 'Need a delivery driver',
            district: 'Colombo',
            contactPhone: '0712345678',
            town: 'Nugegoda',
            category: 'Transport',
            jobType: 'FULL_TIME',
            salaryMin: 30000,
            salaryMax: 50000,
            ageLimitMin: 18,
            ageLimitMax: 45,
            genderRequirement: 'MALE',
            cvRequired: false,
        },
    },
    {
        name: 'create job (no age/gender)',
        schema: createJobSchema,
        payload: {
            title: 'Cleaner',
            description: 'Office cleaning',
            district: 'Kandy',
            contactPhone: '0772345678',
        },
    },
    {
        name: 'apply (with cvUrl null)',
        schema: applySchema,
        payload: {
            jobId: '6543210abcdef0123456789a',
            cvUrl: null,
            captchaToken: 'tok',
        },
    },
    {
        name: 'apply (with cvUrl uri)',
        schema: applySchema,
        payload: {
            jobId: '6543210abcdef0123456789a',
            cvUrl: 'https://res.cloudinary.com/foo/cv.pdf',
        },
    },
    {
        name: 'apply (no cvUrl)',
        schema: applySchema,
        payload: {
            jobId: '6543210abcdef0123456789a',
        },
    },
    {
        name: 'register: invalid gender (should fail)',
        schema: registerSchema,
        expectFail: true,
        payload: {
            name: 'X',
            email: 'x@x.com',
            password: 'StrongPass1!',
            role: 'JOB_SEEKER',
            gender: 'OTHER',
            otp: '123456',
        },
    },
    {
        name: 'create job: gender invalid (should fail)',
        schema: createJobSchema,
        expectFail: true,
        payload: {
            title: 'X',
            description: 'desc',
            district: 'Kandy',
            contactPhone: '0712345678',
            genderRequirement: 'XX',
        },
    },
];

for (const tc of cases) {
    const { error } = tc.schema.validate(tc.payload, { abortEarly: false });
    const passed = tc.expectFail ? !!error : !error;
    console.log(`${passed ? 'PASS' : 'FAIL'} ${tc.name}${error ? ' — ' + error.message : ''}`);
}
