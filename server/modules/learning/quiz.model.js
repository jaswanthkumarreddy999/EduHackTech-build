const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswers: [mongoose.Schema.Types.Mixed], // Indices for MCQ/MSQ, value for numerical
        isCorrect: Boolean,
        pointsEarned: Number
    }],
    score: {
        type: Number,
        default: 0
    },
    totalPoints: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },
    passed: {
        type: Boolean,
        default: false
    },
    timeTaken: {
        type: Number, // In seconds
        default: 0
    },
    attemptNumber: {
        type: Number,
        default: 1
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
quizAttemptSchema.index({ user: 1, course: 1, lessonId: 1 });
quizAttemptSchema.index({ user: 1, lessonId: 1 }); // Removed unique constraint to allow retries

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
