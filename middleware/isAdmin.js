module.exports = function (req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }
  // For API requests, return 401 JSON instead of redirect
  if (req.originalUrl.startsWith('/api')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  return res.redirect('/admin/login');
};
