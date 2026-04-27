const mongoose = require('mongoose');

const posterSchema = mongoose.Schema(
    {
        employerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            trim: true,
        },
        district: {
            type: String,
            trim: true,
        },
        town: {
            type: String,
            trim: true,
        },
        jobType: {
            type: String,
            enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT'],
        },
        salaryMin: {
            type: Number,
        },
        salaryMax: {
            type: Number,
        },
        contactPhone: {
            type: String,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        stylePreset: {
            type: String,
            enum: ['CLASSIC', 'MINIMAL', 'VIBRANT'],
            default: 'CLASSIC',
        },
        prompt: {
            type: String,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        imagePublicId: {
            type: String,
        },
        status: {
            type: String,
            enum: ['DRAFT', 'PUBLISHED'],
            default: 'PUBLISHED',
        },
    },
    { timestamps: true }
);

posterSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Poster', posterSchema);
