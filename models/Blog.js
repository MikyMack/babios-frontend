const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: false, trim: true },
  images: [{ type: String, trim: true }],
  createdBy: { type: String, required: false, trim: true },
  date: { type: Date, required: false },
  description: { type: String, required: false, trim: true },
  moreDescription: { type: String, required: false, trim: true },
  quoteOfTheDay: { type: String, required: false, trim: true },
  subTitle: { type: String, required: false, trim: true },
  subDescription: { type: String, required: false, trim: true },
  tags: [{ type: String, trim: true }],
  extraPoints: [{ type: String, trim: true }],
  extraTitle: { type: String, required: false, trim: true },
  slug: { type: String, required: false, trim: true },
  seoTitle: { type: String, required: false, trim: true },
  seoDescription: { type: String, required: false, trim: true },
  seoKeywords: [{ type: String, trim: true }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', BlogSchema);
