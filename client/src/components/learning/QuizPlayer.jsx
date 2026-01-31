import React, { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const QuizPlayer = ({ quiz, lessonTitle, onSubmit, onCancel, isSubmitting }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit * 60); // in seconds
    const [startTime] = useState(Date.now());

    // Timer
    useEffect(() => {
        if (quiz.timeLimit <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit when time runs out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz.timeLimit]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (questionId, value, type) => {
        setAnswers(prev => {
            const current = prev[questionId] || [];

            if (type === 'mcq' || type === 'numerical') {
                return { ...prev, [questionId]: [value] };
            } else if (type === 'msq') {
                const idx = current.indexOf(value);
                if (idx > -1) {
                    return { ...prev, [questionId]: current.filter(v => v !== value) };
                } else {
                    return { ...prev, [questionId]: [...current, value] };
                }
            }
            return prev;
        });
    };

    const handleSubmit = () => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const formattedAnswers = quiz.questions.map(q => ({
            questionId: q._id,
            selectedAnswers: answers[q._id] || []
        }));
        onSubmit(formattedAnswers, timeTaken);
    };

    const question = quiz.questions[currentQuestion];
    const isAnswered = answers[question._id]?.length > 0;
    const answeredCount = Object.keys(answers).filter(k => answers[k]?.length > 0).length;

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-lg">{lessonTitle}</h1>
                        <p className="text-sm text-slate-400">Question {currentQuestion + 1} of {quiz.questions.length}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {quiz.timeLimit > 0 && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                <Clock size={18} />
                                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                            </div>
                        )}
                        <span className="text-sm text-slate-400">{answeredCount}/{quiz.questions.length} answered</span>
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                    {/* Question Type Badge */}
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 ${question.type === 'mcq' ? 'bg-blue-500/20 text-blue-400' :
                            question.type === 'msq' ? 'bg-green-500/20 text-green-400' :
                                'bg-orange-500/20 text-orange-400'
                        }`}>
                        {question.type === 'mcq' ? 'Single Correct' :
                            question.type === 'msq' ? 'Multiple Correct' : 'Numerical'}
                    </span>

                    {/* Question Text */}
                    <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

                    {/* Options / Input */}
                    {question.type !== 'numerical' ? (
                        <div className="space-y-3">
                            {question.options.map((opt, idx) => {
                                const isSelected = answers[question._id]?.includes(idx);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(question._id, idx, question.type)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-${question.type === 'mcq' ? 'full' : 'md'} border-2 flex items-center justify-center ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-500'
                                                }`}>
                                                {isSelected && <CheckCircle size={14} />}
                                            </div>
                                            <span>{opt}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                value={answers[question._id]?.[0] ?? ''}
                                onChange={(e) => handleAnswer(question._id, parseFloat(e.target.value), 'numerical')}
                                placeholder="Enter your answer"
                                step="any"
                                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}

                    {/* Points */}
                    <p className="mt-4 text-sm text-slate-500">{question.points} point{question.points > 1 ? 's' : ''}</p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} /> Previous
                    </button>

                    <div className="flex gap-2">
                        {quiz.questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${idx === currentQuestion ? 'bg-blue-600' :
                                        answers[quiz.questions[idx]._id]?.length > 0 ? 'bg-green-600' :
                                            'bg-slate-700 hover:bg-slate-600'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    {currentQuestion < quiz.questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentQuestion(currentQuestion + 1)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 rounded-lg hover:bg-green-500 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                            Submit Quiz
                        </button>
                    )}
                </div>
            </div>

            {/* Question Palette */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 py-3">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-600"></div>
                            <span className="text-slate-400">Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-slate-700"></div>
                            <span className="text-slate-400">Not Answered</span>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-sm text-slate-400 hover:text-white"
                    >
                        Cancel Quiz
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizPlayer;
