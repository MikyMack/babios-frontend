const express = require("express");
const router = express.Router();
// Controllers

const blogController = require("../controllers/blogController");
const testimonialController = require("../controllers/testimonialController");
const bannerController = require("../controllers/bannerController");
const contactController = require("../controllers/contactController");
// Middleware
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/upload");


// ---------------------------
// BLOG ROUTES
// ---------------------------
router.post("/admin-blog-create", isAdmin, upload.array("images"), blogController.createBlog);
router.get("/admin-blog-list", isAdmin, blogController.getAllBlogs);
router.get("/admin-blog/:id", isAdmin, blogController.getBlogById);
router.put("/admin-blog/:id", isAdmin, upload.array("images"), blogController.updateBlog);
router.delete("/admin-blog/:id", isAdmin, blogController.deleteBlog);

// ---------------------------
// TESTIMONIAL ROUTES
// ---------------------------
router.post("/admin-testimonial-create", isAdmin, testimonialController.createTestimonial);
router.get("/admin-testimonial-list", isAdmin, testimonialController.getAllTestimonials);
router.get("/admin-testimonial/:id", isAdmin, testimonialController.getTestimonialById);
router.put("/admin-testimonial/:id", isAdmin, testimonialController.updateTestimonial);
router.delete("/admin-testimonial/:id", isAdmin, testimonialController.deleteTestimonial);

// ---------------------------
// BANNER ROUTES
// ---------------------------
// Create
router.post('/bannerCreate', upload.single('image'), bannerController.createBanner);

// Get All
router.get('/Banners', bannerController.getAllBanners);

// Get Active
router.get('/bannerActive', bannerController.getActiveBanners);

// Get Single
router.get('/getBanner/:id', bannerController.getBannerById);

// Update
router.put('/editBanner/:id', upload.single('image'), bannerController.updateBanner);

// Delete
router.delete('/deleteBanner/:id', bannerController.deleteBanner);
router.post('/bannerActive', bannerController.toggleBannerActive);

router.get('/activeBanners', bannerController.getActiveBanners);
router.post("/createContact", upload.uploadProfile.single("profileImage"), contactController.createContact);

router.get("/contact/list", isAdmin, contactController.getContacts);

router.put("/mark-read-contact/:id", isAdmin, contactController.markAsRead);

router.delete("/deleteContact/:id", isAdmin, contactController.deleteContact);

router.get("/contact/stats", isAdmin, contactController.getContactStats);

router.get("/contact/:id", isAdmin, contactController.getContactById);


module.exports = router;
