const express = require('express');
const router = express.Router();


const Blog = require("../models/Blog");
const Testimonial = require("../models/Testimonial");
const Banner = require("../models/Banner");


const { getEmbedUrl } = require('../utils/youtube');



router.get('/', async (req, res) => {
    try {
        const [banners, blogs, testimonials] = await Promise.all([
            Banner.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).lean(),
            Blog.find().sort({ createdAt: -1 }).limit(3).lean(),

            Testimonial.find().sort({ createdAt: -1 }).limit(10).lean(),
        ]);

        // Map embed URLs for banners
        const bannersWithEmbed = banners.map(banner => ({
            ...banner,
            embedUrl: getEmbedUrl(banner.youtubeLink)
        }));

        res.render('home', {
            banners: bannersWithEmbed,
            blogs,
            testimonials,
        });

    } catch (err) {
        console.error("Error loading home page:", err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/about', async (req, res) => {
    try {
        const [testimonials, blogs] = await Promise.all([
            Testimonial.find().sort({ createdAt: -1 }).limit(10).lean(),
            Blog.find().sort({ createdAt: -1 }).limit(3).lean(),
        ]);

        res.render('about', {
            testimonials,
            blogs,
        });
    } catch (err) {
        console.error("Error loading about page:", err);
        res.status(500).send("Internal Server Error");
    }
});





router.get('/blogs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;

        const totalBlogs = await Blog.countDocuments();
        const totalPages = Math.ceil(totalBlogs / limit);

        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('blogs', {
            blogs,
            page,
            totalPages,
            limit,
            totalBlogs
        });
    } catch (err) {
        console.error("Error fetching blogs:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/blogDetails/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug });
        if (!blog) {
            return res.status(404).send("Blog not found");
        }
        res.render('blogDetails', { blog });
    } catch (err) {
        console.error("Error fetching blog details:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/contact', (req, res) => {
    res.render('contact');
});




module.exports = router;