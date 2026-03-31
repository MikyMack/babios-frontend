function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/_+/g, '-')       // Replace underscores with -
    .replace(/[^a-z0-9\-\.]+/g, '') // Remove invalid chars
    .replace(/\-+/g, '-')      // Collapse repeated -
    .replace(/^\-+|\-+$/g, ''); // Trim - from start/end
}

module.exports = slugify;
