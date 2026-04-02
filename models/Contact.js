const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[\d\s\-]{7,15}$/, "Please enter a valid mobile number"]
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 500,
      required: true
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Contact", contactSchema);