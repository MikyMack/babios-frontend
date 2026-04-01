const multer = require("multer");
const path = require("path");

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/_+/g, '-')
    .replace(/[^a-z0-9\-\.]+/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const slugified = slugify(baseName);
    const seoName = `${slugified}${ext}`;
    cb(null, seoName);
  },
});

const upload = multer({ storage });

// Profile image storage: unique filename to avoid overwrites
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

const uploadProfile = multer({ storage: profileStorage });

const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = (path.extname(file.originalname) || ".jpg").toLowerCase();
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const slug = slugify(baseName) || "banner";
    cb(null, `banner-${slug}-${Date.now()}${ext}`);
  },
});

const uploadBanner = multer({
  storage: bannerStorage,
  fileFilter: function (req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});



module.exports = upload;
module.exports.uploadProfile = uploadProfile;
module.exports.uploadBanner = uploadBanner;
