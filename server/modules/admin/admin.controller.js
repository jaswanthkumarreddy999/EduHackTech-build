const User = require('../auth/user.model');
const Enrollment = require('../learning/enrollment.model');
const Registration = require('../competition/registration.model');

// @desc    Get all users with their details
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        const userDetails = await Promise.all(users.map(async (user) => {
            const enrollments = await Enrollment.find({ user: user._id }).populate('course', 'title');
            const registrations = await Registration.find({ user: user._id }).populate('event', 'title');

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                courses: enrollments.map(e => e.course ? e.course.title : 'Unknown Course'),
                events: registrations.map(r => r.event ? r.event.title : 'Unknown Event')
            };
        }));

        res.json({ success: true, count: userDetails.length, data: userDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
