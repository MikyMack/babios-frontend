const Product = require("../models/Product");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/* ================= CREATE PRODUCT ================= */
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      seoTitle,
      seoKeywords,
      seoDescription,
      isActive
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required."
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required."
      });
    }

    if (req.files.length > 4) {
      return res.status(400).json({
        success: false,
        message: "Maximum 4 images allowed."
      });
    }

    const slug = slugify(title.trim());
    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: "Product with this title already exists."
      });
    }

    const images = req.files.map(f => f.filename);

    const parsedSeoKeywords = seoKeywords
      ? Array.isArray(seoKeywords)
        ? seoKeywords
        : seoKeywords.split(",").map(k => k.trim())
      : [];

    const product = new Product({
      title: title.trim(),
      slug,
      images,
      seoTitle,
      seoKeywords: parsedSeoKeywords,
      seoDescription,
      isActive: isActive === "true" || isActive === true
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });

  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ================= UPDATE PRODUCT ================= */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const {
      title,
      seoTitle,
      seoKeywords,
      seoDescription,
      isActive,
      existingImages,
      removedExistingImages,
      appendImages
    } = req.body;

    const updateData = {};

    /* ---- TITLE & SLUG ---- */
    if (title) {
      const newSlug = slugify(title.trim());
      const exists = await Product.findOne({ slug: newSlug, _id: { $ne: id } });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Another product with this title already exists."
        });
      }
      updateData.title = title.trim();
      updateData.slug = newSlug;
    }

    if (seoTitle) updateData.seoTitle = seoTitle;
    if (seoDescription) updateData.seoDescription = seoDescription;

    if (typeof isActive !== "undefined") {
      updateData.isActive = isActive === "true" || isActive === true;
    }

    if (typeof seoKeywords !== "undefined") {
      updateData.seoKeywords = Array.isArray(seoKeywords)
        ? seoKeywords
        : seoKeywords.split(",").map(k => k.trim());
    }

    /* ---- IMAGE HANDLING ---- */
    let currentImages = [];
    if (existingImages) {
      try {
        currentImages = JSON.parse(existingImages);
      } catch {
        currentImages = [];
      }
    }

    // Delete removed images from disk
    if (removedExistingImages) {
      try {
        const removed = JSON.parse(removedExistingImages);
        const uploadPath = path.join(__dirname, "..", "uploads");

        removed.forEach(img => {
          const filePath = path.join(uploadPath, img);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      } catch {}
    }

    if (req.files?.length > 0) {
      const newImages = req.files.map(f => f.filename);
      updateData.images =
        appendImages === "true"
          ? [...currentImages, ...newImages]
          : newImages;
    } else {
      updateData.images = currentImages;
    }

    if (!updateData.images.length) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required."
      });
    }

    if (updateData.images.length > 4) {
      return res.status(400).json({
        success: false,
        message: "Maximum 4 images allowed."
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ================= GET ALL PRODUCTS ================= */
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (typeof isActive !== "undefined") {
      query.isActive = isActive === "true";
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const count = await Product.countDocuments(query);

    return res.json({
      success: true,
      products,
      totalProducts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error("Fetch products error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET BY ID ================= */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET BY SLUG ================= */
// exports.getProductBySlug = async (req, res) => {
//   try {
//     const product = await Product.findOne({ slug: req.params.slug });
//     if (!product) {
//       return res.status(404).json({ success: false, message: "Product not found" });
//     }
//     return res.json({ success: true, product });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const uploadPath = path.join(__dirname, "..", "uploads");
    product.images.forEach(img => {
      const filePath = path.join(uploadPath, img);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Product.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ================= TOGGLE STATUS ================= */
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    return res.json({
      success: true,
      message: `Product ${product.isActive ? "activated" : "deactivated"}`,
      product
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
