const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/authMiddleware');
const {
    submitQuiz,
    getQuizResult,
    getQuiz
} = require('./quiz.controller');

// All routes require authentication
router.use(protect);

// Get quiz for taking (without answers)
router.get('/:courseId/:moduleId/:lessonId', getQuiz);

// Submit quiz answers
router.post('/:courseId/:moduleId/:lessonId/submit', submitQuiz);

// Get quiz result
router.get('/:courseId/:moduleId/:lessonId/result', getQuizResult);

module.exports = router;
