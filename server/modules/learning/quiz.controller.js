const CourseContent = require('./content.model');
const QuizAttempt = require('./quiz.model');

// @desc    Submit quiz answers
// @route   POST /api/quiz/:courseId/:moduleId/:lessonId/submit
// @access  Private
exports.submitQuiz = async (req, res) => {
    try {
        const { courseId, moduleId, lessonId } = req.params;
        const { answers, timeTaken } = req.body;
        const userId = req.user.id;

        // Calculate attempt number
        const previousAttemptsCount = await QuizAttempt.countDocuments({
            user: userId,
            lessonId: lessonId
        });

        const attemptNumber = previousAttemptsCount + 1;

        // Get course content and find the quiz
        const content = await CourseContent.findOne({ course: courseId });
        if (!content) {
            return res.status(404).json({ success: false, message: 'Course content not found' });
        }

        const module = content.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const lesson = module.lessons.id(lessonId);
        if (!lesson || lesson.type !== 'quiz') {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const quiz = lesson.quiz;
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return res.status(400).json({ success: false, message: 'Quiz has no questions' });
        }

        // Grade the quiz
        let totalPoints = 0;
        let earnedPoints = 0;
        const gradedAnswers = [];

        for (const question of quiz.questions) {
            totalPoints += question.points || 1;

            const userAnswer = answers.find(a => a.questionId === question._id.toString());
            const selectedAnswers = userAnswer?.selectedAnswers || [];

            let isCorrect = false;
            let pointsEarned = 0;

            if (question.type === 'numerical') {
                // For numerical, check if the answer matches (with tolerance)
                const correctValue = question.correctAnswers[0];
                const userValue = parseFloat(selectedAnswers[0]);
                // Allow 0.01 tolerance for floating point
                isCorrect = Math.abs(correctValue - userValue) < 0.01;
            } else {
                // For MCQ/MSQ, check if arrays match
                const correctSet = new Set(question.correctAnswers.map(String));
                const userSet = new Set(selectedAnswers.map(String));
                isCorrect = correctSet.size === userSet.size &&
                    [...correctSet].every(val => userSet.has(val));
            }

            if (isCorrect) {
                pointsEarned = question.points || 1;
                earnedPoints += pointsEarned;
            }

            gradedAnswers.push({
                questionId: question._id,
                selectedAnswers,
                isCorrect,
                pointsEarned
            });
        }

        const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const passed = percentage >= (quiz.passingScore || 60);

        // Save attempt
        const attempt = await QuizAttempt.create({
            user: userId,
            course: courseId,
            moduleId,
            lessonId,
            answers: gradedAnswers,
            score: earnedPoints,
            totalPoints,
            percentage,
            passed,
            passed,
            timeTaken: timeTaken || 0,
            attemptNumber
        });

        res.status(201).json({
            success: true,
            data: {
                attempt,
                questions: quiz.questions.map((q, i) => ({
                    ...q.toObject(),
                    userAnswer: gradedAnswers[i]
                }))
            }
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get quiz result for a lesson
// @route   GET /api/quiz/:courseId/:moduleId/:lessonId/result
// @access  Private
exports.getQuizResult = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.id;

        const attempt = await QuizAttempt.findOne({
            user: userId,
            lessonId
        }).sort({ completedAt: -1 });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'No attempt found' });
        }

        res.json({ success: true, data: attempt });
    } catch (error) {
        console.error('Get quiz result error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get quiz with questions (for taking)
// @route   GET /api/quiz/:courseId/:moduleId/:lessonId
// @access  Private
exports.getQuiz = async (req, res) => {
    try {
        const { courseId, moduleId, lessonId } = req.params;

        const content = await CourseContent.findOne({ course: courseId });
        if (!content) {
            return res.status(404).json({ success: false, message: 'Course content not found' });
        }

        const module = content.modules.id(moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        const lesson = module.lessons.id(lessonId);
        if (!lesson || lesson.type !== 'quiz') {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        // Check if user has already attempted
        const existingAttempt = await QuizAttempt.findOne({
            user: req.user.id,
            lessonId
        }).sort({ completedAt: -1 });

        // Return quiz data
        // If attempted, show correct answers and explanation
        // If not attempted, hide them
        const quizData = {
            ...lesson.quiz.toObject(),
            questions: lesson.quiz.questions.map(q => {
                const questionData = {
                    _id: q._id,
                    type: q.type,
                    question: q.question,
                    options: q.options,
                    points: q.points
                };

                if (existingAttempt) {
                    questionData.correctAnswers = q.correctAnswers;
                    questionData.explanation = q.explanation;
                }

                return questionData;
            })
        };

        res.json({
            success: true,
            data: {
                lessonId: lesson._id,
                lessonTitle: lesson.title,
                quiz: quizData,
                hasAttempted: !!existingAttempt,
                previousAttempt: existingAttempt || null
            }
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
