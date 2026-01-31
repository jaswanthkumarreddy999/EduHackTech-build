import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    PlayCircle, FileText, CheckCircle, ChevronDown, ChevronRight,
    Menu, X, ArrowLeft, Loader2, Award, ClipboardList
} from 'lucide-react';
import { getCourseContent, getCourse } from '../../../services/course.service';
import { checkEnrollment, updateProgress } from '../../../services/enrollment.service';
import { getQuiz, submitQuiz, getQuizResult } from '../../../services/quiz.service';
import { useAuth } from '../../../context/AuthContext';
import QuizPlayer from '../../../components/learning/QuizPlayer';
import QuizResults from '../../../components/learning/QuizResults';

const CoursePlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [course, setCourse] = useState(null);
    const [content, setContent] = useState(null);
    const [enrollment, setEnrollment] = useState(null);

    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Quiz State
    const [quizData, setQuizData] = useState(null);
    const [quizResult, setQuizResult] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizLoading, setQuizLoading] = useState(false);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [courseData, contentData, enrollmentData] = await Promise.all([
                getCourse(id),
                getCourseContent(id),
                checkEnrollment(id, token)
            ]);

            if (!enrollmentData.enrolled && user.role !== 'admin') {
                alert('You must be enrolled to view this content');
                navigate(`/course/${id}`);
                return;
            }

            setCourse(courseData);
            setContent(contentData);
            setEnrollment(enrollmentData.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const currentModule = content?.modules[activeModuleIndex];
    const currentLesson = currentModule?.lessons[activeLessonIndex];

    // Reset quiz state when changing lessons
    useEffect(() => {
        if (currentLesson?.type === 'quiz') {
            loadQuizData();
        } else {
            setQuizData(null);
            setQuizResult(null);
            setQuizStarted(false);
        }
    }, [currentLesson?._id]);

    const loadQuizData = async () => {
        setQuizLoading(true);
        try {
            // Load previous result if any
            const result = await getQuizResult(id, currentModule._id, currentLesson._id, token);
            if (result) {
                setQuizResult(result.data);
            }

            // Load quiz details
            const data = await getQuiz(id, currentModule._id, currentLesson._id, token);
            setQuizData(data.data);
        } catch (err) {
            console.error('Failed to load quiz data', err);
        } finally {
            setQuizLoading(false);
        }
    };

    const handleStartQuiz = () => {
        setQuizStarted(true);
    };

    const handleSubmitQuiz = async (answers, timeTaken) => {
        setSubmittingQuiz(true);
        try {
            const result = await submitQuiz(id, currentModule._id, currentLesson._id, answers, timeTaken, token);
            setQuizResult(result.data.attempt);
            setQuizStarted(false);

            // Reload quiz data to get updated attempt status/details if needed
            const data = await getQuiz(id, currentModule._id, currentLesson._id, token);
            setQuizData(data.data);

        } catch (err) {
            console.error('Failed to submit quiz', err);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const handleRetakeQuiz = () => {
        setQuizResult(null);
        setQuizStarted(true);
    };

    const handleLessonComplete = async () => {
        if (!currentLesson || updating) return;

        // Check if already completed
        if (enrollment?.completedModules?.includes(currentLesson._id)) {
            return;
        }

        // For quizzes, ensure passed
        if (currentLesson.type === 'quiz') {
            if (!quizResult?.passed) {
                alert('You must pass the quiz to complete this lesson.');
                return;
            }
        }

        setUpdating(true);
        try {
            // Calculate new progress
            const totalLessons = content.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            const completedCount = (enrollment.completedModules?.length || 0) + 1;
            const progressPercent = Math.round((completedCount / totalLessons) * 100);

            const updated = await updateProgress(id, {
                progress: progressPercent,
                completedModule: currentLesson._id
            }, token);

            setEnrollment(updated);
        } catch (err) {
            console.error('Failed to update progress', err);
        } finally {
            setUpdating(false);
        }
    };

    const isCompleted = (lessonId) => {
        return enrollment?.completedModules?.includes(lessonId);
    };

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        // Handle various YouTube formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return null;
    };

    const embedUrl = getYoutubeEmbedUrl(currentLesson?.content);

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

    const renderQuizContent = () => {
        if (quizLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
        if (!quizData) return <div className="text-center p-12 text-gray-400">Failed to load quiz.</div>;

        // 1. Show Results if available and not retaking
        if (quizResult && !quizStarted) {
            return (
                <QuizResults
                    result={quizResult}
                    questions={quizData.quiz.questions}
                    onRetry={!quizResult.passed ? handleRetakeQuiz : null}
                    onContinue={handleLessonComplete}
                />
            );
        }

        // 2. Show Player if started
        if (quizStarted) {
            return (
                <QuizPlayer
                    quiz={quizData.quiz}
                    lessonTitle={currentLesson.title}
                    onSubmit={handleSubmitQuiz}
                    onCancel={() => setQuizStarted(false)}
                    isSubmitting={submittingQuiz}
                />
            );
        }

        // 3. Show Start Screen
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-900 rounded-xl border border-gray-800 p-8 text-center max-w-2xl mx-auto mt-10">
                <div className="w-20 h-20 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mb-6">
                    <ClipboardList size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-4">{currentLesson.title}</h2>
                <div className="flex gap-6 text-gray-400 mb-8">
                    <span>{quizData.quiz.questions.length} Questions</span>
                    <span>•</span>
                    <span>Pass: {quizData.quiz.passingScore}%</span>
                    <span>•</span>
                    <span>{quizData.quiz.timeLimit > 0 ? `${quizData.quiz.timeLimit} Mins` : 'No Time Limit'}</span>
                </div>

                {quizResult && !quizResult.passed && (
                    <div className="mb-6 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        Previous Attempt: Failed ({quizResult.percentage}%) - Attempt #{quizResult.attemptNumber || 1}
                    </div>
                )}

                <button
                    onClick={handleStartQuiz}
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-purple-600/20 transition transform hover:scale-105"
                >
                    Start Quiz
                </button>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">

            {/* Sidebar Content List */}
            <div
                className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}
            >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="font-bold truncate pr-4">Course Content</h2>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {content?.modules.map((module, mIndex) => (
                        <div key={mIndex} className="border-b border-gray-700/50">
                            <div className="p-4 bg-gray-800/50 font-medium text-sm text-gray-300">
                                {module.title}
                            </div>
                            <div>
                                {module.lessons.map((lesson, lIndex) => {
                                    const isActive = mIndex === activeModuleIndex && lIndex === activeLessonIndex;
                                    const completed = isCompleted(lesson._id);

                                    return (
                                        <button
                                            key={lIndex}
                                            onClick={() => { setActiveModuleIndex(mIndex); setActiveLessonIndex(lIndex); }}
                                            className={`w-full text-left p-3 flex items-start gap-3 transition hover:bg-gray-700/50 ${isActive ? 'bg-gray-700 border-l-4 border-blue-500' : ''}`}
                                        >
                                            <div className={`mt-0.5 ${completed ? 'text-green-400' : 'text-gray-500'}`}>
                                                {completed ? <CheckCircle size={16} /> : (
                                                    lesson.type === 'video' ? <PlayCircle size={16} /> :
                                                        lesson.type === 'quiz' ? <ClipboardList size={16} /> :
                                                            <FileText size={16} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>{lesson.title}</p>
                                                <p className="text-xs text-gray-600 mt-1">{lesson.duration} min</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative">
                {/* Top Bar */}
                <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg">
                                <Menu size={20} />
                            </button>
                        )}
                        <button onClick={() => navigate(`/course/${id}`)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400">Your Progress</span>
                            <div className="w-32 h-2 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-500"
                                    style={{ width: `${enrollment?.progress || 0}%` }}
                                />
                            </div>
                        </div>
                        {enrollment?.progress === 100 && <Award className="text-yellow-500" />}
                    </div>
                </div>

                {/* Content View */}
                <div className="flex-1 overflow-y-auto bg-black flex flex-col items-center">
                    {currentLesson ? (
                        <div className="w-full max-w-6xl">
                            {currentLesson.type === 'quiz' ? (
                                renderQuizContent()
                            ) : (
                                <div className="p-6 md:p-10 w-full max-w-5xl mx-auto">
                                    {currentLesson.type === 'video' ? (
                                        <div className="aspect-video w-full bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                                            {embedUrl ? (
                                                <iframe
                                                    src={embedUrl}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                    title={currentLesson.title}
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center flex-col">
                                                    <PlayCircle size={64} className="text-gray-700 mb-4" />
                                                    <p className="text-gray-500">Video Player Placeholder (Non-YouTube URL)</p>
                                                    <a href={currentLesson.content} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline mt-2 text-sm">{currentLesson.content}</a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-8 min-h-[50vh] prose lg:prose-xl max-w-none">
                                            <h1 className="text-3xl font-bold mb-6">{currentLesson.title}</h1>
                                            <div className="whitespace-pre-wrap">{currentLesson.content}</div>
                                        </div>
                                    )}

                                    {/* Action Bar */}
                                    <div className="mt-8 flex justify-between items-center">
                                        <h1 className="text-xl md:text-2xl font-bold text-white">{currentLesson.title}</h1>

                                        <button
                                            onClick={handleLessonComplete}
                                            disabled={isCompleted(currentLesson?._id)}
                                            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${isCompleted(currentLesson?._id)
                                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                                                }`}
                                        >
                                            {isCompleted(currentLesson?._id) ? (
                                                <> <CheckCircle size={20} /> Completed </>
                                            ) : (
                                                <> Mark as Complete </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a lesson to start learning
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CoursePlayer;
