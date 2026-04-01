// controllers/bannerController.js
const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner');



const UPLOADS_DIR = path.join(__dirname, '../uploads');

function imageUrl(req, filename) {
    return `${req.protocol}://${req.get('host')}/uploads/${path.basename(filename)}`;
}

function removeFile(filePath) {
    if (!filePath) return;
    const name = path.basename(filePath);
    const full = path.join(UPLOADS_DIR, name);
    fs.unlink(full, () => {});
}

// @desc    Create Banner
exports.createBanner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Banner image is required' });
        }

        const { title } = req.body;
        if (!title || !title.trim()) {
            removeFile(req.file.path);
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const banner = await Banner.create({
            title: title.trim(),
            imageUrl: imageUrl(req, req.file.filename)
        });

        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: banner
        });

    } catch (error) {
        if (req.file) removeFile(req.file.path);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Get All Banners
exports.getAllBanners = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const search = req.query.search ? req.query.search.trim() : '';

        const filter = search
            ? { title: { $regex: search, $options: 'i' } }
            : {};

        const [banners, total] = await Promise.all([
            Banner.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Banner.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            count: banners.length,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            data: banners
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Get Active Banner (for frontend)
exports.getActiveBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: banners
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Get Single Banner
exports.getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            data: banner
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Update Banner
exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            if (req.file) removeFile(req.file.path);
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        if (req.body.title && req.body.title.trim()) {
            banner.title = req.body.title.trim();
        }

        if (req.file) {
            removeFile(banner.imageUrl);
            banner.imageUrl = imageUrl(req, req.file.filename);
        }

        await banner.save();

        res.status(200).json({
            success: true,
            message: 'Banner updated successfully',
            data: banner
        });

    } catch (error) {
        if (req.file) removeFile(req.file.path);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc   Toggle Active Status   POST /api/bannerActive
exports.toggleBannerActive = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: 'Banner id is required' });

        const banner = await Banner.findById(id);
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        banner.isActive = !banner.isActive;
        await banner.save();

        res.status(200).json({
            success: true,
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
            data: banner
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Delete Banner
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

        removeFile(banner.imageUrl);

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};