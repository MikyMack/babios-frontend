const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

// Ensure uploads folder exists for profile images etc.
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "admin_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/", userRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);

const apiRoutes = require("./routes/apiRoutes");
app.use("/api", apiRoutes);


app.use((req, res, next) => {
  res.status(404);

  if (req.originalUrl.startsWith("/api")) {
    return res.json({ success: false, message: "Route not found" });
  }
  return res.render("404", { message: "Page Not Found" });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode = err.statusCode || 500;

  if (req.originalUrl.startsWith("/api")) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }

  res.status(statusCode).render("error", {
    status: statusCode,
    message: err.message || "Something went wrong",
  });
});

module.exports = app;