// models/Banner.js

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    youtubeLink: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(v);
            },
            message: 'Invalid YouTube URL'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);