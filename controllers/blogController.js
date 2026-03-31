const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const slugify = require("../utils/slugify");
const fs = require("fs");
const path = require("path");

// Helper for deleting old images
const deleteImage = (imagePath) => {
  try {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  } catch (err) {
    console.error("Error deleting image:", err);
  }
};

// =============================
// CREATE BLOG
// =============================
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      createdBy,
      date,
      description,
      moreDescription,
      quoteOfTheDay,
      subTitle,
      subDescription,
      tags,
      extraPoints,
      extraTitle,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const slug = slugify(title);

  
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => {
        const ext = path.extname(file.originalname || file.filename);

        const seoFileName = `${slug}${ext}`;
  
        const oldPath = file.path;
        const newPath = path.join(path.dirname(file.path), seoFileName);
        fs.renameSync(oldPath, newPath);
        return seoFileName;
      });
    }

    function cleanArrayField(field) {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
  
          if (field.trim().startsWith('[')) return JSON.parse(field);
        } catch (e) { }

        return field.split(',').map(el => el.trim()).filter(Boolean);
      }
      return [];
    }

    const blog = new Blog({
      title,
      createdBy,
      date,
      description,
      moreDescription,
      quoteOfTheDay,
      subTitle,
      subDescription,
      tags: cleanArrayField(tags),
      extraPoints: cleanArrayField(extraPoints),
      extraTitle,
      slug,
      images,
      seoTitle,
      seoDescription,
      seoKeywords: cleanArrayField(seoKeywords)
    });

    await blog.save();

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating blog",
      error: error.message,
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid blog ID" });

    const blog = await Blog.findById(id);
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    const {
      title,
      createdBy,
      date,
      description,
      moreDescription,
      quoteOfTheDay,
      subTitle,
      subDescription,
      tags,
      extraPoints,
      extraTitle,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    function cleanArrayField(field) {
      if (!field) return undefined;
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          if (field.trim().startsWith('[')) return JSON.parse(field);
        } catch (e) { }
        return field.split(',').map(el => el.trim()).filter(Boolean);
      }
      return undefined;
    }

    if (title) {
      blog.title = title;
      blog.slug = slugify(title);
    }

    blog.createdBy = createdBy !== undefined ? createdBy : blog.createdBy;
    blog.date = date !== undefined ? date : blog.date;
    blog.description = description !== undefined ? description : blog.description;
    blog.moreDescription = moreDescription !== undefined ? moreDescription : blog.moreDescription;
    blog.quoteOfTheDay = quoteOfTheDay !== undefined ? quoteOfTheDay : blog.quoteOfTheDay;
    blog.subTitle = subTitle !== undefined ? subTitle : blog.subTitle;
    blog.subDescription = subDescription !== undefined ? subDescription : blog.subDescription;

    if (tags !== undefined) blog.tags = cleanArrayField(tags);
    if (extraPoints !== undefined) blog.extraPoints = cleanArrayField(extraPoints);
    blog.extraTitle = extraTitle !== undefined ? extraTitle : blog.extraTitle;

    blog.seoTitle = seoTitle !== undefined ? seoTitle : blog.seoTitle;
    blog.seoDescription = seoDescription !== undefined ? seoDescription : blog.seoDescription;
    if (seoKeywords !== undefined) blog.seoKeywords = cleanArrayField(seoKeywords);

    // Handle new images
    if (req.files && req.files.length > 0) {
      // Delete old images
      blog.images.forEach((img) => {
        deleteImage(path.join("uploads", img));
      });

      // SEO friendly renaming - NO TIMESTAMP IN IMAGE NAME
      const slugName = blog.slug || (title ? slugify(title) : 'blog');
      blog.images = req.files.map((file, index) => {
        const ext = path.extname(file.originalname || file.filename);
        const seoFileName = `${slugName}-${index + 1}${ext}`;
        const oldPath = file.path;
        const newPath = path.join(path.dirname(file.path), seoFileName);
        fs.renameSync(oldPath, newPath);
        return seoFileName;
      });
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};
// =============================
// GET ALL BLOGS
// =============================
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, blogs });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving blogs",
      error: error.message,
    });
  }
};

// =============================
// GET BLOG BY ID
// =============================
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid blog ID" });

    const blog = await Blog.findById(id);
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving blog",
      error: error.message,
    });
  }
};

// =============================
// UPDATE BLOG
// =============================


// =============================
// DELETE BLOG
// =============================
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid blog ID" });

    const blog = await Blog.findById(id);
    if (!blog)
      return res.status(404).json({ success: false, message: "Blog not found" });

    // delete images from local
    blog.images.forEach((img) => {
      deleteImage(path.join("uploads", img));
    });

    await Blog.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};
