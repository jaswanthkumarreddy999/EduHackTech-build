import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Trash2, Loader2, Clock, CheckCircle, GraduationCap, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/enrollments';

const MyCourses = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadEnrollments();
    }, [user, token]);

    const loadEnrollments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setEnrollments(data.data);
            }
        } catch (err) {
            console.error('Failed to load enrollments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnenroll = async (courseId) => {
        if (!window.confirm('Are you sure you want to unenroll from this course? Your progress will be lost.')) return;
        try {
            const res = await fetch(`${API_BASE}/${courseId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setEnrollments(prev => prev.filter(e => e.course._id !== courseId));
            } else {
                alert(data.message || 'Failed to unenroll');
            }
        } catch (err) {
            alert('Failed to unenroll');
        }
    };

    const filteredEnrollments = enrollments.filter(e => {
        if (filter === 'all') return true;
        if (filter === 'in-progress') return e.status === 'active' && e.progress < 100;
        if (filter === 'completed') return e.status === 'completed' || e.progress >= 100;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Courses</h1>
                        <p className="text-slate-400 mt-1">Continue learning and track your progress</p>
                    </div>
                    <button
                        onClick={() => navigate('/learning')}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                    >
                        <BookOpen size={20} /> Browse Courses
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-8">
                    {['all', 'in-progress', 'completed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : 'Completed'}
                        </button>
                    ))}
                </div>

                {filteredEnrollments.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                        <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {enrollments.length === 0 ? 'No Courses Yet' : 'No matching courses'}
                        </h3>
                        <p className="text-slate-400 mb-6">Start learning something new today!</p>
                        <button
                            onClick={() => navigate('/learning')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                        >
                            Explore Courses
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEnrollments.map(enrollment => (
                            <CourseCard
                                key={enrollment._id}
                                enrollment={enrollment}
                                onContinue={() => navigate(`/course/${enrollment.course._id}/learn`)}
                                onUnenroll={() => handleUnenroll(enrollment.course._id)}
                                onViewDetails={() => navigate(`/course/${enrollment.course._id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CourseCard = ({ enrollment, onContinue, onUnenroll, onViewDetails }) => {
    const { course, progress, status, enrolledAt, lastAccessedAt } = enrollment;
    const isCompleted = status === 'completed' || progress >= 100;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition group">
            {/* Thumbnail */}
            <div className="relative h-40 bg-gradient-to-br from-blue-900 to-indigo-900">
                {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition" />

                {/* Play button overlay */}
                <button
                    onClick={onContinue}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition">
                        <Play className="w-6 h-6 text-blue-600 ml-1" />
                    </div>
                </button>

                {/* Status badge */}
                {isCompleted && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> Completed
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{course.title}</h3>

                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    {course.level && <span className="capitalize">{course.level}</span>}
                    {course.duration && (
                        <span className="flex items-center gap-1">
                            <Clock size={14} /> {course.duration}
                        </span>
                    )}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onContinue}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                    >
                        {isCompleted ? 'Review' : 'Continue'} <ChevronRight size={16} />
                    </button>
                    <button
                        onClick={onViewDetails}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                        title="View Details"
                    >
                        <BookOpen size={18} />
                    </button>
                    <button
                        onClick={onUnenroll}
                        className="p-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                        title="Unenroll"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyCourses;
