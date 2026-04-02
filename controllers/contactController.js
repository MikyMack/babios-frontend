const Contact = require("../models/Contact");
const nodemailer = require('nodemailer');

exports.createContact = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      subject
    } = req.body;

    if (!fullName || !email || !mobileNumber || !subject) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }


    const contact = await Contact.create({
      fullName,
      email,
      mobileNumber,
      subject
    });

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });


    await transporter.sendMail({
      from: `"Miss Bhaarat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message | Miss Bhaarat",
      html: `
        <div style="font-family: Arial, sans-serif; color: #330033;">
          <h2>Thank you, ${fullName}!</h2>
          <p>We've received your message and will get back to you shortly.</p>
          <hr>
          <ul>
            <li><b>Name:</b> ${fullName}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Mobile:</b> ${mobileNumber}</li>
            <li><b>Subject:</b> ${subject}</li>
          </ul>
          <hr>
          <p>With love,<br><b>Miss Bhaarat Team</b></p>
        </div>
      `,
    });

    // Notification → admin
    await transporter.sendMail({
      from: `"Miss Bhaarat Website" <${process.env.EMAIL_USER}>`,
      to: "pk@missbhaarat.com",
      subject: `New Contact: ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #262b2f;">
          <h2>📬 New Contact Message</h2>
          <ul>
            <li><b>Name:</b> ${fullName}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Mobile:</b> ${mobileNumber}</li>
            <li><b>Subject:</b> ${subject}</li>
          </ul>
          <p><i>Login to the admin dashboard to manage this message.</i></p>
        </div>
      `,
    });



    res.status(201).json({
      success: true,
      message: "Contact submitted successfully. Confirmation sent to user & admin.",
      data: contact
    });

  } catch (error) {
    console.error("createContact error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "This email has already been submitted." });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};



// Get All Contacts (Admin)
exports.getContacts = async (req, res) => {
  try {

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();
    const status = req.query.status || ""; // "read" | "unread" | ""

    // ── Build query ──
    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobileNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "read") query.isRead = true;
    if (status === "unread") query.isRead = false;

    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Contact.countDocuments(query),
    ]);

    res.json({
      success: true,
      contacts,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });

  } catch (error) {
    console.error("getContacts error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching contacts"
    });

  }
};



// Mark Contact as Read
exports.markAsRead = async (req, res) => {
  try {

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    res.json({
      success: true,
      message: "Marked as read",
      data: contact
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error updating contact"
    });

  }
};



// Delete Contact
exports.deleteContact = async (req, res) => {
  try {

    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({
      success: true,
      message: "Contact deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error deleting contact"
    });

  }
};


// Get Contact Stats
exports.getContactStats = async (req, res) => {
  try {
    const [total, read, unread] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ isRead: true }),
      Contact.countDocuments({ isRead: false }),
    ]);
    res.json({
      success: true,
      data: { total, read, unread }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contact stats"
    });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching contact"
    });
  }
};