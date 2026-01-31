import React from 'react';
import { CheckCircle, XCircle, Trophy, Clock, Target, ArrowRight, RotateCcw, Hash } from 'lucide-react';

const QuizResults = ({ result, questions, onRetry, onContinue }) => {
    const { score, totalPoints, percentage, passed, timeTaken, answers, attemptNumber } = result;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getQuestionResult = (questionId) => {
        return answers.find(a => a.questionId === questionId);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white py-12">
            <div className="max-w-3xl mx-auto px-6">
                {/* Result Card */}
                <div className={`rounded-3xl p-8 mb-8 ${passed
                    ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30'
                    : 'bg-gradient-to-br from-red-600/20 to-rose-600/20 border border-red-500/30'
                    }`}>
                    <div className="text-center">
                        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                            {passed ? <Trophy size={40} /> : <XCircle size={40} />}
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            {passed ? 'Congratulations! 🎉' : 'Keep Practicing!'}
                        </h1>
                        <p className={`text-lg ${passed ? 'text-green-300' : 'text-red-300'}`}>
                            {passed ? 'You passed the quiz!' : 'You didn\'t pass this time.'}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <Target className="mx-auto mb-2 text-blue-400" size={24} />
                            <p className="text-3xl font-bold">{percentage}%</p>
                            <p className="text-sm text-slate-400">Score</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <CheckCircle className="mx-auto mb-2 text-green-400" size={24} />
                            <p className="text-3xl font-bold">{score}/{totalPoints}</p>
                            <p className="text-sm text-slate-400">Points</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <Clock className="mx-auto mb-2 text-purple-400" size={24} />
                            <p className="text-3xl font-bold">{formatTime(timeTaken)}</p>
                            <p className="text-sm text-slate-400">Time Taken</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <Hash className="mx-auto mb-2 text-yellow-400" size={24} />
                            <p className="text-3xl font-bold">{attemptNumber || 1}</p>
                            <p className="text-sm text-slate-400">Attempt</p>
                        </div>
                    </div>
                </div>

                {/* Question Analysis */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="font-bold text-lg">Question Analysis</h2>
                    </div>
                    <div className="divide-y divide-slate-700">
                        {questions.map((q, idx) => {
                            const result = getQuestionResult(q._id);
                            const isCorrect = result?.isCorrect;

                            return (
                                <div key={idx} className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-1 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-700">
                                                    Q{idx + 1}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.type === 'mcq' ? 'bg-blue-500/20 text-blue-400' :
                                                    q.type === 'msq' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                    {q.type.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-slate-500 ml-auto">
                                                    {result?.pointsEarned || 0}/{q.points} pts
                                                </span>
                                            </div>
                                            <p className="text-slate-300 mb-3">{q.question}</p>

                                            {/* Show answers */}
                                            {q.type !== 'numerical' ? (
                                                <div className="space-y-2 text-sm">
                                                    {q.options.map((opt, optIdx) => {
                                                        const isUserAnswer = result?.selectedAnswers?.includes(optIdx);
                                                        const isCorrectAnswer = q.userAnswer?.isCorrect && isUserAnswer ||
                                                            q.correctAnswers?.includes(optIdx);

                                                        return (
                                                            <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isCorrectAnswer ? 'bg-green-500/20 text-green-300' :
                                                                isUserAnswer ? 'bg-red-500/20 text-red-300' :
                                                                    'bg-slate-700/50 text-slate-400'
                                                                }`}>
                                                                {isCorrectAnswer && <CheckCircle size={14} className="text-green-400" />}
                                                                {isUserAnswer && !isCorrectAnswer && <XCircle size={14} className="text-red-400" />}
                                                                <span>{opt}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-sm">
                                                    <p className="text-slate-400">
                                                        Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>
                                                            {result?.selectedAnswers?.[0] ?? 'Not answered'}
                                                        </span>
                                                    </p>
                                                    {!isCorrect && (
                                                        <p className="text-green-400">
                                                            Correct answer: {q.correctAnswers?.[0]}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Explanation */}
                                            {q.explanation && (
                                                <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                                    <p className="text-xs font-semibold text-blue-400 mb-1">Explanation</p>
                                                    <p className="text-sm text-slate-300">{q.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4 mt-8">
                    {!passed && onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition"
                        >
                            <RotateCcw size={18} /> Retry Quiz
                        </button>
                    )}
                    <button
                        onClick={onContinue}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition"
                    >
                        Continue <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResults;
