const Gallery = require('../models/Gallery');

// Create a new gallery item
exports.createGallery = async (req, res) => {
    try {
        const { title, category } = req.body;
        let image;

        // Expect image to come from req.file provided by multer
        if (req.file && req.file.filename) {
            image = req.file.filename;
        } else {
            return res.status(400).json({ message: 'Image file is required.' });
        }

        if (!title || !category) {
            return res.status(400).json({ message: 'Title and category are required.' });
        }

        const gallery = new Gallery({
            title,
            category,
            image
        });

        await gallery.save();

        res.status(201).json({ message: 'Gallery item created successfully.', gallery });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// List all gallery items
exports.listGallery = async (req, res) => {
    try {
        // Query params for pagination and filter
        const page = parseInt(req.query.page) || 1;
        const limit = req.query.limit === 'all' ? 0 : parseInt(req.query.limit) || 20;
        const category = req.query.category;

        // Build query object
        let query = {};
        if (category) {
            query.category = category;
        }

        const options = {
            sort: { createdAt: -1 }
        };

        // For pagination
        let galleries, total, totalPages;
        if (limit === 0) {
            // No pagination, return all
            galleries = await Gallery.find(query, null, options);
            total = galleries.length;
            totalPages = 1;
        } else {
            total = await Gallery.countDocuments(query);
            totalPages = Math.ceil(total / limit) || 1;
            galleries = await Gallery.find(query, null, options)
                .skip((page - 1) * limit)
                .limit(limit);
        }

        res.status(200).json({
            galleries,
            page,
            limit: limit === 0 ? 'all' : limit,
            total,
            totalPages
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Edit an existing gallery item
exports.editGallery = async (req, res) => {
    try {
        const galleryId = req.params.id;
        const { title, category } = req.body;

        const gallery = await Gallery.findById(galleryId);
        if (!gallery) {
            return res.status(404).json({ message: 'Gallery item not found.' });
        }

        // Update fields if provided
        if (title) gallery.title = title;
        if (category) gallery.category = category;

        // Handle image update
        if (req.file && req.file.filename) {
            gallery.image = req.file.filename;
        }

        await gallery.save();

        res.status(200).json({ message: 'Gallery item updated successfully.', gallery });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete a gallery item
exports.deleteGallery = async (req, res) => {
    try {
        const galleryId = req.params.id;
        const gallery = await Gallery.findByIdAndDelete(galleryId);

        if (!gallery) {
            return res.status(404).json({ message: 'Gallery item not found.' });
        }

        res.status(200).json({ message: 'Gallery item deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};