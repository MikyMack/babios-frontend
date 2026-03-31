// controllers/bannerController.js

const Banner = require('../models/Banner');


// @desc    Create Banner
exports.createBanner = async (req, res) => {
    try {
        const { title, youtubeLink, isActive } = req.body;

        const banner = new Banner({
            title,
            youtubeLink,
            isActive
        });

        await banner.save();

        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: banner
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Get All Banners
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: banners.length,
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
        const banners = await Banner.find({ isActive: true });

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
        const banner = await Banner.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Banner updated successfully',
            data: banner
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// @desc    Delete Banner
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

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