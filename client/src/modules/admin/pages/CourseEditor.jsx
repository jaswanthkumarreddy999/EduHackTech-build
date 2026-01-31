import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, Save, GripVertical, ChevronDown, ChevronRight,
    Video, FileText, ArrowLeft, Loader2, ClipboardList, HelpCircle, X
} from 'lucide-react';
import { getCourseContent, updateCourseContent, getCourse } from '../../../services/course.service';
import { useAuth } from '../../../context/AuthContext';

const CourseEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [editingQuiz, setEditingQuiz] = useState(null); // { moduleIndex, lessonIndex }

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [courseData, contentData] = await Promise.all([
                getCourse(id),
                getCourseContent(id)
            ]);
            setCourse(courseData);
            if (contentData && contentData.modules) {
                setModules(contentData.modules);
                const expanded = {};
                contentData.modules.forEach((_, i) => expanded[i] = true);
                setExpandedModules(expanded);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateCourseContent(id, { modules }, token);
            alert('Course content saved successfully!');
        } catch (err) {
            alert('Failed to save content');
        } finally {
            setSaving(false);
        }
    };

    const addModule = () => {
        const newModule = { title: 'New Module', lessons: [] };
        setModules([...modules, newModule]);
        setExpandedModules({ ...expandedModules, [modules.length]: true });
    };

    const deleteModule = (index) => {
        if (confirm('Delete this module?')) {
            const newModules = modules.filter((_, i) => i !== index);
            setModules(newModules);
        }
    };

    const updateModuleTitle = (index, title) => {
        const newModules = [...modules];
        newModules[index].title = title;
        setModules(newModules);
    };

    const addLesson = (moduleIndex, type) => {
        const newLesson = {
            title: type === 'video' ? 'New Video Lecture' : type === 'quiz' ? 'New Quiz' : 'New Note',
            type,
            content: '',
            duration: 0
        };

        if (type === 'quiz') {
            newLesson.quiz = {
                title: 'Quiz',
                questions: [],
                passingScore: 60,
                timeLimit: 0
            };
        }

        const newModules = [...modules];
        newModules[moduleIndex].lessons.push(newLesson);
        setModules(newModules);

        // Open quiz editor immediately for new quizzes
        if (type === 'quiz') {
            setEditingQuiz({
                moduleIndex,
                lessonIndex: newModules[moduleIndex].lessons.length - 1
            });
        }
    };

    const updateLesson = (moduleIndex, lessonIndex, field, value) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex][field] = value;
        setModules(newModules);
    };

    const deleteLesson = (moduleIndex, lessonIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
        setModules(newModules);
    };

    const toggleExpand = (index) => {
        setExpandedModules({ ...expandedModules, [index]: !expandedModules[index] });
    };

    // Quiz editing functions
    const addQuestion = (type) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        const quiz = newModules[moduleIndex].lessons[lessonIndex].quiz;

        const newQuestion = {
            type,
            question: '',
            options: type !== 'numerical' ? ['', '', '', ''] : [],
            correctAnswers: [],
            points: 1,
            explanation: ''
        };

        quiz.questions.push(newQuestion);
        setModules(newModules);
    };

    const updateQuestion = (qIndex, field, value) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex].quiz.questions[qIndex][field] = value;
        setModules(newModules);
    };

    const updateQuestionOption = (qIndex, optIndex, value) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex].quiz.questions[qIndex].options[optIndex] = value;
        setModules(newModules);
    };

    const toggleCorrectAnswer = (qIndex, optIndex) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        const question = newModules[moduleIndex].lessons[lessonIndex].quiz.questions[qIndex];

        if (question.type === 'mcq') {
            question.correctAnswers = [optIndex];
        } else if (question.type === 'msq') {
            const idx = question.correctAnswers.indexOf(optIndex);
            if (idx > -1) {
                question.correctAnswers.splice(idx, 1);
            } else {
                question.correctAnswers.push(optIndex);
            }
        }
        setModules(newModules);
    };

    const setNumericalAnswer = (qIndex, value) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex].quiz.questions[qIndex].correctAnswers = [parseFloat(value) || 0];
        setModules(newModules);
    };

    const deleteQuestion = (qIndex) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex].quiz.questions.splice(qIndex, 1);
        setModules(newModules);
    };

    const addOption = (qIndex) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex].quiz.questions[qIndex].options.push('');
        setModules(newModules);
    };

    const removeOption = (qIndex, optIndex) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        const question = newModules[moduleIndex].lessons[lessonIndex].quiz.questions[qIndex];
        question.options.splice(optIndex, 1);
        // Also remove from correct answers if it was selected
        question.correctAnswers = question.correctAnswers
            .filter(i => i !== optIndex)
            .map(i => i > optIndex ? i - 1 : i);
        setModules(newModules);
    };

    const updateQuizSettings = (field, value) => {
        if (!editingQuiz) return;
        const { moduleIndex, lessonIndex } = editingQuiz;
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex].quiz[field] = value;
        setModules(newModules);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const currentQuiz = editingQuiz
        ? modules[editingQuiz.moduleIndex]?.lessons[editingQuiz.lessonIndex]?.quiz
        : null;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-slate-100 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                Edit Content: <span className="text-blue-600">{course?.title}</span>
                            </h1>
                            <p className="text-xs text-slate-500">{modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons • {modules.length} Modules</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20 disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">

                {modules.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
                        <p className="text-slate-500 mb-4">Start building your curriculum</p>
                        <button onClick={addModule} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium shadow-sm">
                            + Add First Module
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {modules.map((module, mIndex) => (
                        <div key={mIndex} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">

                            {/* Module Header */}
                            <div className="bg-slate-50/80 p-4 flex items-center gap-3 border-b border-slate-100">
                                <button onClick={() => toggleExpand(mIndex)} className="text-slate-400 hover:text-slate-600">
                                    {expandedModules[mIndex] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                                        className="w-full bg-transparent font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
                                        placeholder="Module Title (e.g., Introduction)"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => deleteModule(mIndex)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {expandedModules[mIndex] && (
                                <div className="p-4 bg-white">
                                    <div className="space-y-4">
                                        {module.lessons.map((lesson, lIndex) => (
                                            <div key={lIndex} className="flex gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/30 group">
                                                <div className="pt-2 text-slate-300">
                                                    <GripVertical size={20} />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-1.5 rounded-lg ${lesson.type === 'video' ? 'bg-indigo-100 text-indigo-600' :
                                                                lesson.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                                                                    'bg-emerald-100 text-emerald-600'
                                                            }`}>
                                                            {lesson.type === 'video' ? <Video size={16} /> :
                                                                lesson.type === 'quiz' ? <ClipboardList size={16} /> :
                                                                    <FileText size={16} />}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={lesson.title}
                                                            onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                                                            className="flex-1 bg-transparent font-medium text-slate-700 outline-none border-b border-transparent focus:border-blue-200 focus:bg-white px-1 transition"
                                                            placeholder="Lesson Title"
                                                        />
                                                        <button onClick={() => deleteLesson(mIndex, lIndex)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Content Inputs */}
                                                    {lesson.type !== 'quiz' ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-10">
                                                            <div className="md:col-span-3">
                                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">
                                                                    {lesson.type === 'video' ? 'Video URL' : 'Content / Description'}
                                                                </label>
                                                                {lesson.type === 'video' ? (
                                                                    <input
                                                                        type="text"
                                                                        value={lesson.content}
                                                                        onChange={(e) => updateLesson(mIndex, lIndex, 'content', e.target.value)}
                                                                        placeholder="https://youtube.com/..."
                                                                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 outline-none"
                                                                    />
                                                                ) : (
                                                                    <textarea
                                                                        value={lesson.content}
                                                                        onChange={(e) => updateLesson(mIndex, lIndex, 'content', e.target.value)}
                                                                        placeholder="Enter text content..."
                                                                        rows={2}
                                                                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-100 outline-none"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 block">Duration (min)</label>
                                                                <input
                                                                    type="number"
                                                                    value={lesson.duration}
                                                                    onChange={(e) => updateLesson(mIndex, lIndex, 'duration', e.target.value)}
                                                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none"
                                                                    min="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // Quiz Summary
                                                        <div className="pl-10">
                                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                                <span>{lesson.quiz?.questions?.length || 0} questions</span>
                                                                <span>•</span>
                                                                <span>Pass: {lesson.quiz?.passingScore || 60}%</span>
                                                                {lesson.quiz?.timeLimit > 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{lesson.quiz.timeLimit} min</span>
                                                                    </>
                                                                )}
                                                                <button
                                                                    onClick={() => setEditingQuiz({ moduleIndex: mIndex, lessonIndex: lIndex })}
                                                                    className="ml-auto px-3 py-1 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition"
                                                                >
                                                                    Edit Quiz
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Lesson Buttons */}
                                    <div className="mt-4 flex gap-3 pl-14">
                                        <button
                                            onClick={() => addLesson(mIndex, 'video')}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                        >
                                            <Video size={14} /> Add Video
                                        </button>
                                        <button
                                            onClick={() => addLesson(mIndex, 'text')}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                                        >
                                            <FileText size={14} /> Add Note
                                        </button>
                                        <button
                                            onClick={() => addLesson(mIndex, 'quiz')}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                                        >
                                            <ClipboardList size={14} /> Add Quiz
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Module Button */}
                    <button
                        onClick={addModule}
                        className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-2xl text-slate-500 hover:text-blue-500 font-medium transition flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Add New Module
                    </button>
                </div>
            </div>

            {/* Quiz Editor Modal */}
            {editingQuiz && currentQuiz && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Quiz Editor</h2>
                            <button onClick={() => setEditingQuiz(null)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="text-white" size={20} />
                            </button>
                        </div>

                        {/* Quiz Settings */}
                        <div className="px-6 py-4 bg-slate-50 border-b flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-slate-600">Passing Score:</label>
                                <input
                                    type="number"
                                    value={currentQuiz.passingScore}
                                    onChange={(e) => updateQuizSettings('passingScore', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border rounded-lg text-sm"
                                    min="0" max="100"
                                />
                                <span className="text-sm text-slate-500">%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-slate-600">Time Limit:</label>
                                <input
                                    type="number"
                                    value={currentQuiz.timeLimit}
                                    onChange={(e) => updateQuizSettings('timeLimit', parseInt(e.target.value))}
                                    className="w-16 px-2 py-1 border rounded-lg text-sm"
                                    min="0"
                                />
                                <span className="text-sm text-slate-500">min (0 = unlimited)</span>
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {currentQuiz.questions.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <HelpCircle size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>No questions yet. Add your first question below.</p>
                                </div>
                            )}

                            {currentQuiz.questions.map((q, qIndex) => (
                                <div key={qIndex} className="border border-slate-200 rounded-xl p-4 bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700' :
                                                    q.type === 'msq' ? 'bg-green-100 text-green-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {q.type.toUpperCase()}
                                            </span>
                                            <span className="text-sm text-slate-500">Q{qIndex + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={q.points}
                                                onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                                className="w-12 px-2 py-1 border rounded text-sm text-center"
                                                min="1"
                                            />
                                            <span className="text-xs text-slate-500">pts</span>
                                            <button onClick={() => deleteQuestion(qIndex)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <textarea
                                        value={q.question}
                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                        placeholder="Enter your question..."
                                        className="w-full p-3 border border-slate-200 rounded-lg mb-3 text-sm"
                                        rows={2}
                                    />

                                    {q.type !== 'numerical' ? (
                                        <div className="space-y-2">
                                            {q.options.map((opt, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-2">
                                                    <input
                                                        type={q.type === 'mcq' ? 'radio' : 'checkbox'}
                                                        checked={q.correctAnswers.includes(optIndex)}
                                                        onChange={() => toggleCorrectAnswer(qIndex, optIndex)}
                                                        className="w-4 h-4"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => updateQuestionOption(qIndex, optIndex, e.target.value)}
                                                        placeholder={`Option ${optIndex + 1}`}
                                                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                    />
                                                    {q.options.length > 2 && (
                                                        <button onClick={() => removeOption(qIndex, optIndex)} className="p-1 text-slate-400 hover:text-red-500">
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addOption(qIndex)}
                                                className="text-sm text-blue-600 hover:underline mt-2"
                                            >
                                                + Add Option
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">Correct Answer:</span>
                                            <input
                                                type="number"
                                                value={q.correctAnswers[0] || ''}
                                                onChange={(e) => setNumericalAnswer(qIndex, e.target.value)}
                                                placeholder="Enter number"
                                                className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                step="any"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-3">
                                        <input
                                            type="text"
                                            value={q.explanation}
                                            onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                                            placeholder="Explanation (shown after quiz)"
                                            className="w-full px-3 py-2 border border-slate-100 rounded-lg text-sm text-slate-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Question Buttons */}
                        <div className="px-6 py-4 bg-slate-50 border-t flex gap-3 justify-center">
                            <button
                                onClick={() => addQuestion('mcq')}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition"
                            >
                                + MCQ (Single)
                            </button>
                            <button
                                onClick={() => addQuestion('msq')}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition"
                            >
                                + MSQ (Multiple)
                            </button>
                            <button
                                onClick={() => addQuestion('numerical')}
                                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition"
                            >
                                + Numerical
                            </button>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t flex justify-end">
                            <button
                                onClick={() => setEditingQuiz(null)}
                                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseEditor;
