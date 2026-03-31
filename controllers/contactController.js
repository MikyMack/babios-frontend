const Contact = require("../models/Contact");


// Create Contact
const nodemailer = require('nodemailer');

exports.createContact = async (req, res) => {
  try {
    const {
      fullName,
      dob,
      email,
      mobileNumber,
      place,
      instagramLink,
      height,
      weight,
      message
    } = req.body;

    if (!fullName || !dob || !email || !mobileNumber || !height || !weight) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // Profile image: save filename if uploaded (files are in uploads folder)
    const profileImage = req.file ? req.file.filename : undefined;

    // Save contact to DB
    const contact = await Contact.create({
      fullName,
      dob,
      email,
      mobileNumber,
      place,
      instagramLink,
      height,
      weight,
      message,
      profileImage
    });

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // Send confirmation mail to user
    const userMailOptions = {
      from: `"Miss Bhaarat" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Registration Received | Miss Bhaarat',
      html: `
        <div style="font-family: Arial, sans-serif; color: #330033;">
          <h2>Thank you for registering, ${fullName}!</h2>
          <p>We have received your registration for Miss Bhaarat.</p>
          <p>Our team will review your details and get in touch with you if you qualify for the next round.</p>
          <hr>
          <p><strong>Your Details:</strong></p>
          <ul>
            <li><b>Name:</b> ${fullName}</li>
            <li><b>Date of Birth:</b> ${new Date(dob).toLocaleDateString()}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Mobile:</b> ${mobileNumber}</li>
            ${place ? `<li><b>Place:</b> ${place}</li>` : ''}
            ${instagramLink ? `<li><b>Instagram:</b> ${instagramLink}</li>` : ''}
            <li><b>Height:</b> ${height} cm</li>
            <li><b>Weight:</b> ${weight} kg</li>
            ${message ? `<li><b>Message:</b> ${message}</li>` : ''}
          </ul>
          <hr>
          <p>With love,<br><b>Miss Bhaarat Team</b></p>
        </div>
      `
    };

    // Send notification mail to admin
    const adminMailOptions = {
      from: `"Miss Bhaarat Website" <${process.env.EMAIL_USER}>`,
      to: 'pk@missbhaarat.com',
      subject: `New Registration: ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #262b2f;">
          <h2>🎉 New Registration for Miss Bhaarat!</h2>
          <p>A new user has submitted the registration form:</p>
          ${profileImage ? `<p><b>Profile photo:</b> Check dashboard for uploaded image.</p>` : ''}
          <ul>
            <li><b>Name:</b> ${fullName}</li>
            <li><b>Date of Birth:</b> ${new Date(dob).toLocaleDateString()}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Mobile:</b> ${mobileNumber}</li>
            ${place ? `<li><b>Place:</b> ${place}</li>` : ''}
            ${instagramLink ? `<li><b>Instagram:</b> ${instagramLink}</li>` : ''}
            <li><b>Height:</b> ${height} cm</li>
            <li><b>Weight:</b> ${weight} kg</li>
            ${message ? `<li><b>Message:</b> ${message}</li>` : ''}
          </ul>
          <p style="margin-top:20px;"><i>Login to the admin dashboard to view &amp; manage registration entries.</i></p>
        </div>
      `
    };

    // Send emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(201).json({
      success: true,
      message: "Contact submitted successfully. Confirmation sent to user & admin.",
      data: contact
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



// Get All Contacts (Admin)
exports.getContacts = async (req, res) => {
  try {

    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: contacts
    });

  } catch (error) {

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

    await Contact.findByIdAndDelete(req.params.id);

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
    const totalContacts = await Contact.countDocuments();
    const readContacts = await Contact.countDocuments({ isRead: true });
    const unreadContacts = await Contact.countDocuments({ isRead: false });

    res.json({
      success: true,
      data: {
        total: totalContacts,
        read: readContacts,
        unread: unreadContacts
      }
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