const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middlewares/authMiddleware');
const {
    getCourses,
    getAllCoursesAdmin,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} = require('./course.controller');
const { getCourseContent, updateCourseContent } = require('./content.controller');

// Public Routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Admin Routes (Protected)
router.get('/admin/all', protect, authorize('admin'), getAllCoursesAdmin);
router.post('/admin', protect, authorize('admin'), createCourse);
router.put('/admin/:id', protect, authorize('admin'), updateCourse);
router.delete('/admin/:id', protect, authorize('admin'), deleteCourse);

// Content Management
router.get('/:id/content', getCourseContent);
router.put('/admin/:id/content', protect, authorize('admin'), updateCourseContent);

module.exports = router;
