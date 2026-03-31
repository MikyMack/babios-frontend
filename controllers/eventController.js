const mongoose = require('mongoose');
const Event = require('../models/Events');

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
  
  try {
    const eventData = { ...req.body };
    
    // Generate slug from title
    eventData.slug = generateSlug(eventData.title);
    
    // Check if slug exists
    const existingEvent = await Event.findOne({ slug: eventData.slug });
    if (existingEvent) {
      eventData.slug = `${eventData.slug}-${Date.now()}`;
    }
    
    // Add main image path
    if (req.file) {
      eventData.mainImage = `/uploads/${req.file.filename}`;
    }
    
    // Parse JSON fields if they come as strings
    if (eventData.highlights && typeof eventData.highlights === 'string') {
      eventData.highlights = JSON.parse(eventData.highlights);
    }
    
    if (eventData.seo && typeof eventData.seo === 'string') {
      eventData.seo = JSON.parse(eventData.seo);
    }
    
    // Parse date object if it comes as string
    if (eventData.date && typeof eventData.date === 'string') {
      eventData.date = JSON.parse(eventData.date);
    }
    
    // For single-day events, set endDate = startDate (required by model)
    if (eventData.date && eventData.date.type === 'single' && eventData.date.startDate) {
      eventData.date.endDate = eventData.date.startDate;
    }
    
    // Handle custom event type
    if (eventData.eventType === 'Other' && eventData.customEventType) {
      eventData.eventType = eventData.customEventType;
    }
    
    const event = await Event.create(eventData);
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      eventType,
      sortBy = 'date.startDate',
      order = 'asc'
    } = req.query;

    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by event type
    if (eventType) {
      query.eventType = eventType;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }

    // Only show active events for public view (admin sees all)
    if (!req.session?.user?.isAdmin) {
      query.isActive = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const events = await Event.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('createdBy', 'name email');

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single event by slug or ID
// @route   GET /api/events/:identifier
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is MongoDB ID or slug
    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { slug: identifier };

    // For public view, only show active events (admin sees all)
    if (!req.session?.user?.isAdmin) {
      query.isActive = true;
    }

    const event = await Event.findOne(query).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment view count
    await event.incrementViewCount();

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const updateData = { ...req.body };

    // Update slug if title changed
    if (updateData.title && updateData.title !== event.title) {
      updateData.slug = generateSlug(updateData.title);
      
      // Check if new slug exists
      const existingEvent = await Event.findOne({ 
        slug: updateData.slug,
        _id: { $ne: event._id }
      });
      
      if (existingEvent) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }

    // Update main image if new file uploaded, or keep existing
    if (req.file) {
      updateData.mainImage = `/uploads/${req.file.filename}`;
    } else if (req.body.existingImage) {
      updateData.mainImage = req.body.existingImage;
    }

    // Parse JSON fields if they come as strings
    ['highlights', 'seo', 'date'].forEach(field => {
        if (updateData[field] && typeof updateData[field] === 'string') {
          try {
            updateData[field] = JSON.parse(updateData[field]);
          } catch (e) {}
        }
      });
      
      // 🔥 FIX DATE TYPES
      if (updateData.date) {
        updateData.date.startDate = new Date(updateData.date.startDate);
      
        if (updateData.date.endDate) {
          updateData.date.endDate = new Date(updateData.date.endDate);
        }
      
        // Ensure single-day logic
        if (updateData.date.type === 'single') {
          updateData.date.endDate = updateData.date.startDate;
        }
      }

    // Handle custom event type
    if (updateData.eventType === 'Other' && updateData.customEventType) {
      updateData.eventType = updateData.customEventType;
    }

    // For single-day events, ensure endDate = startDate
    if (updateData.date && updateData.date.type === 'single' && updateData.date.startDate) {
      updateData.date.endDate = updateData.date.startDate;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle event active status
// @route   PATCH /api/events/:id/toggle-status
// @access  Private/Admin
exports.toggleEventStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.isActive = !event.isActive;
    await event.save();

    res.status(200).json({
      success: true,
      data: { isActive: event.isActive },
      message: `Event ${event.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats/summary
// @access  Private/Admin
exports.getEventStats = async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { 
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          upcoming: {
            $sum: { $cond: [{ $eq: ['$category', 'upcoming'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$category', 'completed'] }, 1, 0] }
          },
          goingOn: {
            $sum: { $cond: [{ $eq: ['$category', 'going on'] }, 1, 0] }
          },
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);

    const eventTypeStats = await Event.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          active: 0,
          upcoming: 0,
          completed: 0,
          goingOn: 0,
          totalViews: 0
        },
        byEventType: eventTypeStats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming/featured
// @access  Public
exports.getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const events = await Event.find({
      category: 'upcoming',
      isActive: true
    })
      .sort({ 'date.startDate': 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};