const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const {
    enrollInCourse,
    getMyEnrollments,
    checkEnrollment,
    updateProgress,
    unenroll,
    getCourseUsers,
    adminUnenrollUser
} = require('./enrollment.controller');

// All routes require authentication
router.use(protect);

// Enrollment routes
router.post('/:courseId', enrollInCourse);
router.get('/my', getMyEnrollments);
router.get('/check/:courseId', checkEnrollment);
router.put('/:courseId/progress', updateProgress);
router.delete('/:courseId', unenroll);

// Admin Routes
router.get('/course/:courseId/users', authorize('admin'), getCourseUsers);
router.delete('/admin/:courseId/:userId', authorize('admin'), adminUnenrollUser);

module.exports = router;
