const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  images: {
    type: [{ type: String, trim: true }],
    validate: {
      validator: function (arr) {
        return arr.length > 0 && arr.length <= 4;
      },
      message: 'You can store minimum 1 and maximum 4 images'
    },
    required: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  /* ---------- SEO FIELDS ---------- */

  seoTitle: {
    type: String,
    trim: true
  },

  seoKeywords: [
    { type: String, trim: true }
  ],

  seoDescription: {
    type: String,
    trim: true
  },

  /* ---------- STATUS ---------- */

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
