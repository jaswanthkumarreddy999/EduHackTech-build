const mongoose = require('mongoose');

// Question schema for quizzes
const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['mcq', 'msq', 'numerical'],
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String
    }], // For MCQ/MSQ only
    correctAnswers: [{
        type: mongoose.Schema.Types.Mixed // Number indices for MCQ/MSQ, number value for numerical
    }],
    points: {
        type: Number,
        default: 1
    },
    explanation: {
        type: String,
        default: ''
    }
}, { _id: true });

// Quiz schema
const quizSchema = new mongoose.Schema({
    title: { type: String, default: 'Quiz' },
    questions: [questionSchema],
    passingScore: { type: Number, default: 60 }, // Percentage
    timeLimit: { type: Number, default: 0 }, // Minutes, 0 = unlimited
    shuffleQuestions: { type: Boolean, default: false }
}, { _id: false });

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'text', 'quiz'], required: true },
    content: { type: String, default: '' }, // Video URL or Text body
    duration: { type: Number, default: 0 }, // In minutes
    isPreview: { type: Boolean, default: false }, // Allow free preview
    quiz: quizSchema // Only for quiz type lessons
}, { _id: true });

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [lessonSchema]
}, { _id: true });

const courseContentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        unique: true
    },
    modules: [moduleSchema],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CourseContent', courseContentSchema);
