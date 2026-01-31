const Course = require('./course.model');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find({ status: 'published' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get all courses (Admin - includes drafts)
// @route   GET /api/admin/courses
// @access  Private/Admin
exports.getAllCoursesAdmin = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Create new course
// @route   POST /api/admin/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
    }
};

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
exports.updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Update failed', error: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        await course.deleteOne();
        res.status(200).json({ success: true, message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
    }
};
