const mongoose = require('mongoose');

const ROLES = ['Frontend', 'Backend', 'Full Stack', 'ML / AI', 'UI/UX', 'Pitch / Business'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const AVAILABILITY = ['Weekdays', 'Weekends', 'Nights', 'Full-time'];
const INTERESTS = ['Web', 'AI', 'Web3', 'Mobile', 'Open Innovation'];
const LOOKING_FOR = ['Team', 'Teammates'];

const teamFinderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ROLES
    },
    secondaryRole: {
        type: String,
        enum: [...ROLES, ''],
        default: ''
    },
    level: {
        type: String,
        required: true,
        enum: LEVELS
    },
    availability: [{
        type: String,
        enum: AVAILABILITY
    }],
    interests: [{
        type: String,
        enum: INTERESTS
    }],
    lookingFor: {
        type: String,
        enum: LOOKING_FOR,
        default: 'Teammates'
    },
    bio: {
        type: String,
        maxlength: 140,
        default: ''
    },
    active: {
        type: String,
        enum: ['actively_looking', 'busy', 'not_looking'],
        default: 'actively_looking'
    },
    eventFilter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        default: null
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
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

teamFinderSchema.index({ role: 1, active: 1 });
teamFinderSchema.index({ interests: 1 });
teamFinderSchema.index({ active: 1 });

teamFinderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    this.lastActiveAt = Date.now();
    next();
});

module.exports = mongoose.model('TeamFinder', teamFinderSchema);
