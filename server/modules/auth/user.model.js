// server/modules/auth/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Security: Password won't be returned in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'organiser', 'admin'],
    default: 'student'
  },

  // ========== PROFILE FIELDS ==========

  // Basic Info
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  headline: {
    type: String,
    maxlength: 120,
    default: ''
  },
  location: {
    city: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  phone: {
    type: String,
    default: ''
  },

  // Professional Info
  professional: {
    currentRole: { type: String, default: '' },
    company: { type: String, default: '' },
    yearsOfExperience: { type: Number, default: 0 },
    portfolioUrl: { type: String, default: '' },
    resumeUrl: { type: String, default: '' }
  },

  // Education
  education: [{
    degree: { type: String },
    fieldOfStudy: { type: String },
    institution: { type: String },
    graduationYear: { type: Number },
    current: { type: Boolean, default: false }
  }],

  // Skills & Interests
  skills: [{
    type: String,
    trim: true
  }],
  interests: [{
    type: String,
    trim: true
  }],
  preferredLanguages: [{
    type: String,
    trim: true
  }],

  // Learning Preferences
  learningPreferences: {
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    learningGoals: [{
      type: String
    }],
    availabilityHoursPerWeek: {
      type: Number,
      default: 5
    },
    preferredLearningStyle: {
      type: String,
      enum: ['video', 'reading', 'hands-on', 'mixed'],
      default: 'mixed'
    }
  },

  // Social Links
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' }
  },

  // Profile Completion
  profileCompletedAt: {
    type: Date
  },

  // Login Streak Tracking
  loginStreak: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    loginHistory: [{ type: Date }]
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function () {
  let score = 0;
  const total = 10;

  if (this.name) score++;
  if (this.bio) score++;
  if (this.headline) score++;
  if (this.location?.city) score++;
  if (this.professional?.currentRole) score++;
  if (this.education?.length > 0) score++;
  if (this.skills?.length > 0) score++;
  if (this.interests?.length > 0) score++;
  if (this.socialLinks?.github || this.socialLinks?.linkedin) score++;
  if (this.avatar) score++;

  return Math.round((score / total) * 100);
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);