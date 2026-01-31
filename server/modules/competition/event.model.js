const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        maxlength: 3000
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    registrationDeadline: {
        type: Date
    },
    prizePool: {
        type: String,
        default: '$0'
    },
    thumbnail: {
        type: String,
        default: '' // URL to event banner
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'upcoming', 'live', 'past'],
        default: 'draft'
    },
    maxTeams: {
        type: Number,
        default: 100
    },
    teamSize: {
        min: { type: Number, default: 1 },
        max: { type: Number, default: 4 }
    },
    venue: {
        type: String,
        default: 'Online'
    },
    organizer: {
        type: String,
        default: 'EduHackTech'
    },
    rules: {
        type: String,
        default: ''
    },
    registrationFee: {
        type: Number,
        default: 0 // 0 means free event
    },
    registeredTeams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
    participantCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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

// Update the updatedAt field before saving
eventSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual to auto-determine status based on dates
eventSchema.methods.updateStatus = function () {
    const now = new Date();
    if (now < this.startDate) {
        this.status = 'upcoming';
    } else if (now >= this.startDate && now <= this.endDate) {
        this.status = 'live';
    } else {
        this.status = 'past';
    }
};

module.exports = mongoose.model('Event', eventSchema);
