const CourseContent = require('./content.model');
const Course = require('./course.model');

// @desc    Get course content (Syllabus)
// @route   GET /api/courses/:id/content
// @access  Public (Partial) / Private (Full)
exports.getCourseContent = async (req, res) => {
    try {
        const content = await CourseContent.findOne({ course: req.params.id });

        if (!content) {
            // Return empty structure if not found (for builder)
            return res.status(200).json({ success: true, data: { modules: [] } });
        }

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Update course content
// @route   PUT /api/admin/courses/:id/content
// @access  Private/Admin
exports.updateCourseContent = async (req, res) => {
    try {
        const { modules } = req.body;

        let content = await CourseContent.findOne({ course: req.params.id });

        if (content) {
            // Update existing
            content.modules = modules;
            content.updatedAt = Date.now();
            await content.save();
        } else {
            // Create new
            content = await CourseContent.create({
                course: req.params.id,
                modules
            });
        }

        // Calculate total duration and update main course info
        let totalDuration = 0;
        let totalLessons = 0;

        modules.forEach(mod => {
            mod.lessons.forEach(lesson => {
                totalDuration += parseInt(lesson.duration || 0);
                totalLessons++;
            });
        });

        // Update Course Metadata (optional but good for display)
        // Convert minutes to readable string if needed, or store as number
        // For now, we just touch the course updated time
        await Course.findByIdAndUpdate(req.params.id, {
            updatedAt: Date.now()
        });

        res.status(200).json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Update failed', error: error.message });
    }
};
