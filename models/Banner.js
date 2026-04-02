// models/Banner.js

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    subtitle: {
        type: String,
        trim: true,
        default: ''

    },
    description: {
        type: String,
        trim: true,
        default: ''

    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);