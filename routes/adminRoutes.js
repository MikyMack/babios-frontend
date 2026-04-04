const express = require('express');
const router = express.Router();
const isAdmin = require("../middleware/isAdmin");


router.get('/login', (req, res) => {
    if (req.session && req.session.user && req.session.user.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/admin_login', { error: req.query.error || null });
});

router.post('/login', (req, res) => {
    const username = (req.body.username || '').trim();
    const password = (req.body.password || '').trim();
    if (username === 'admin@babios.com' && password === 'admin@admin') {
        req.session.user = { username, isAdmin: true };
        req.session.save((err) => {
            if (err) {
                return res.render('admin/admin_login', { error: 'Session error. Please try again.' });
            }
            return res.redirect('/admin/dashboard');
        });
        return;
    }
    res.render('admin/admin_login', { error: 'Invalid credentials. Please check your email and password.' });
});

router.get('/dashboard', isAdmin, (req, res) => {
    res.render('admin/admin_dashboard');
});



router.get('/blogs', isAdmin, (req, res) => {
    try {
        res.render('admin/admin_blogs', {
            blogs: [],
            categories: []
        });
    } catch (error) {
        console.error('Error rendering admin_blogs:', error);
        res.status(500).send('Error loading blogs page: ' + error.message);
    }
});

router.get('/blog', isAdmin, (req, res) => {
    try {
        res.render('admin/admin_blogs', {
            blogs: [],
            categories: []
        });
    } catch (error) {
        console.error('Error rendering admin_blogs:', error);
        res.status(500).send('Error loading blogs page: ' + error.message);
    }
});


router.get('/banner', isAdmin, (req, res) => {
    res.render('admin/admin_banner', { banners: [], posters: [] });
});


router.get('/testimonials', isAdmin, (req, res) => {
    res.render('admin/admin_testimonials', { testimonials: [] });
});



const Contact = require('../models/Contact');

router.get('/contact', isAdmin, async (req, res) => {
    try {
        // Fetch stats
        const totalCount = await Contact.countDocuments({});
        const unreadCount = await Contact.countDocuments({ isRead: false });
        const repliedCount = await Contact.countDocuments({ isRead: true });

        res.render('admin/admin_contact', {
            totalCount,
            unreadCount,
            repliedCount
        });
    } catch (error) {
        console.error('Error fetching contact stats:', error);
        res.status(500).send('Error loading contacts page: ' + error.message);
    }
});


router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/admin/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/admin/login');
    });
});

module.exports = router;