const mongoose = require("mongoose");
const Testimonial = require("../models/Testimonial");

// =============================
// CREATE TESTIMONIAL
// =============================
exports.createTestimonial = async (req, res) => {
  try {
    const { title, rating, content, name, designation } = req.body;

    // Required field validation
    if (!title || !rating || !content || !name || !designation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create testimonial
    const testimonial = new Testimonial({
      title,
      rating,
      content,
      name,
      designation,
    });

    await testimonial.save();

    return res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      testimonial,
    });
  } catch (error) {
    console.error("Create Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating testimonial",
      error: error.message,
    });
  }
};

// =============================
// GET ALL TESTIMONIALS
// =============================
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ created_at: -1 });

    return res.status(200).json({ success: true, testimonials });
  } catch (error) {
    console.error("Get Testimonials Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving testimonials",
      error: error.message,
    });
  }
};

// =============================
// GET TESTIMONIAL BY ID
// =============================
exports.getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const testimonial = await Testimonial.findById(id);

    if (!testimonial)
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });

    return res.status(200).json({ success: true, testimonial });
  } catch (error) {
    console.error("Get Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving testimonial",
      error: error.message,
    });
  }
};

// =============================
// UPDATE TESTIMONIAL
// =============================
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    let testimonial = await Testimonial.findById(id);
    if (!testimonial)
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });

    const { title, rating, content, name, designation } = req.body;

    testimonial.title = title || testimonial.title;
    testimonial.rating = rating || testimonial.rating;
    testimonial.content = content || testimonial.content;
    testimonial.name = name || testimonial.name;
    testimonial.designation = designation || testimonial.designation;

    await testimonial.save();

    return res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    console.error("Update Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating testimonial",
      error: error.message,
    });
  }
};

// =============================
// DELETE TESTIMONIAL
// =============================
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const testimonial = await Testimonial.findById(id);

    if (!testimonial)
      return res
        .status(404)
        .json({ success: false, message: "Testimonial not found" });

    await Testimonial.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Delete Testimonial Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting testimonial",
      error: error.message,
    });
  }
};
