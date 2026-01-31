const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Challenge title is required'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    points: {
        type: Number,
        default: 10
    },
    category: {
        type: String,
        default: 'General'
    },
    // Optional link to an Event (Hackathon)
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    testCases: [{
        input: String,
        output: String,
        isVisible: {
            type: Boolean,
            default: false
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

challengeSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Challenge', challengeSchema);
