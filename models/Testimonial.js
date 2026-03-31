const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
