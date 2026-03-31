const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // Date and Time
  date: {
    type: {
      type: String,
      enum: ['single', 'multiple'],
      default: 'single'
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
        type: Date
      }
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  
  // Event Type
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: [
      'Award Show',
      'Film Show',
      'Concert',
      'Conference',
      'Workshop',
      'Seminar',
      'Exhibition',
      'Festival',
      'Sports Event',
      'Charity Event',
      'Corporate Event',
      'Other'
    ]
  },
  customEventType: {
    type: String,
    trim: true
  },
  
  // Organization and Venue
  organizer: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  
  // Media
  mainImage: {
    type: String,
    required: [true, 'Main image is required']
  },
  
  // Description
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  
  // SEO Fields
  seo: {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    keywords: [{
      type: String,
      trim: true
    }]
  },
  
  // Highlights
  highlights: [{
    title: {
      type: String,
      required: [true, 'Highlight title is required']
    },
    description: {
      type: String,
      required: [true, 'Highlight description is required']
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Status and Categories
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Auto-updated category based on date
  category: {
    type: String,
    enum: ['upcoming', 'completed', 'going on'],
    default: 'upcoming'
  },
  
  // Metadata
  viewCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-update category based on dates before saving (Mongoose 7+ uses async, no next)
eventSchema.pre('save', function() {
  const now = new Date();
  const startDate = new Date(this.date.startDate);
  const endDate = this.date.endDate ? new Date(this.date.endDate) : startDate;
  
  if (now < startDate) {
    this.category = 'upcoming';
  } else if (now > endDate) {
    this.category = 'completed';
  } else {
    this.category = 'going on';
  }
});

// Method to increment view count
eventSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to find by slug
eventSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

// Static method to get events by category
eventSchema.statics.getByCategory = function(category, limit = 10, skip = 0) {
  return this.find({ category, isActive: true })
    .sort({ 'date.startDate': 1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('Event', eventSchema);