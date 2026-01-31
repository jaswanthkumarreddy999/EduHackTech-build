import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, Trophy, Calendar, Play, ChevronLeft, ChevronRight, Clock, Star,
    Users, ArrowRight, Loader2, Flame, Target, Award, Zap
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getCourses } from '../../../services/course.service';
import { getEvents } from '../../../services/event.service';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadData();
    }, [user, token]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [enrollData, courseData, eventData] = await Promise.all([
                fetchEnrollments(),
                getCourses(),
                getEvents()
            ]);
            setEnrollments(enrollData);
            setCourses(courseData || []);
            setEvents(eventData || []);
        } catch (err) {
            console.error('Failed to load dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrollments = async () => {
        try {
            const res = await fetch(`${API_BASE}/enrollments/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            return data.success ? data.data : [];
        } catch {
            return [];
        }
    };

    const inProgressCourses = enrollments.filter(e => e.status === 'active' && e.progress < 100);
    const liveEvents = events.filter(e => e.status === 'live');
    const upcomingEvents = events.filter(e => e.status === 'upcoming').slice(0, 6);
    const recommendedCourses = courses.filter(c => !enrollments.some(e => e.course?._id === c._id)).slice(0, 8);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
            {/* Welcome Section */}
            <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Welcome back, {user?.name?.split(' ')[0] || 'Learner'}! 👋
                            </h1>
                            <p className="text-blue-100 mt-2">
                                {inProgressCourses.length > 0
                                    ? `You have ${inProgressCourses.length} course${inProgressCourses.length > 1 ? 's' : ''} in progress. Keep going!`
                                    : 'Ready to start your learning journey today?'}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4">
                            <StatBadge icon={<BookOpen size={20} />} value={enrollments.length} label="Courses" />
                            <StatBadge icon={<Trophy size={20} />} value={upcomingEvents.length} label="Events" />
                            <StatBadge icon={<Award size={20} />} value={enrollments.filter(e => e.progress >= 100).length} label="Completed" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                {/* Continue Learning */}
                {inProgressCourses.length > 0 && (
                    <Section
                        title="Continue Learning"
                        subtitle="Pick up where you left off"
                        onSeeAll={() => navigate('/my-courses')}
                    >
                        <Carousel>
                            {inProgressCourses.map(enrollment => (
                                <ContinueLearningCard
                                    key={enrollment._id}
                                    enrollment={enrollment}
                                    onResume={() => navigate(`/course/${enrollment.course._id}/learn`)}
                                />
                            ))}
                        </Carousel>
                    </Section>
                )}

                {/* Live Hackathons */}
                {liveEvents.length > 0 && (
                    <Section title="🔴 Live Now" subtitle="Events happening right now">
                        <div className="grid md:grid-cols-2 gap-6">
                            {liveEvents.slice(0, 2).map(event => (
                                <LiveEventCard key={event._id} event={event} onClick={() => navigate(`/competition/${event._id}`)} />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Recommended Courses */}
                {recommendedCourses.length > 0 && (
                    <Section
                        title="Recommended for You"
                        subtitle="Based on your interests"
                        onSeeAll={() => navigate('/learning')}
                    >
                        <Carousel>
                            {recommendedCourses.map(course => (
                                <CourseCard key={course._id} course={course} onClick={() => navigate(`/course/${course._id}`)} />
                            ))}
                        </Carousel>
                    </Section>
                )}

                {/* Upcoming Hackathons */}
                {upcomingEvents.length > 0 && (
                    <Section
                        title="Upcoming Hackathons"
                        subtitle="Register before spots fill up"
                        onSeeAll={() => navigate('/competition')}
                    >
                        <Carousel>
                            {upcomingEvents.map(event => (
                                <EventCard key={event._id} event={event} onClick={() => navigate(`/competition/${event._id}`)} />
                            ))}
                        </Carousel>
                    </Section>
                )}

                {/* Quick Actions */}
                <Section title="Quick Actions">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickAction icon={<BookOpen />} label="Browse Courses" onClick={() => navigate('/learning')} color="blue" />
                        <QuickAction icon={<Trophy />} label="Join Hackathon" onClick={() => navigate('/competition')} color="purple" />
                        <QuickAction icon={<Calendar />} label="Organize Event" onClick={() => navigate('/competition/organize')} color="green" />
                        <QuickAction icon={<Target />} label="My Progress" onClick={() => navigate('/my-courses')} color="orange" />
                    </div>
                </Section>
            </div>
        </div>
    );
};

/* ========== COMPONENTS ========== */

const StatBadge = ({ icon, value, label }) => (
    <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center min-w-[100px]">
        <div className="flex items-center justify-center text-white/70 mb-1">{icon}</div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-blue-100">{label}</p>
    </div>
);

const Section = ({ title, subtitle, children, onSeeAll }) => (
    <section>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
            </div>
            {onSeeAll && (
                <button onClick={onSeeAll} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition">
                    See All <ArrowRight size={16} />
                </button>
            )}
        </div>
        {children}
    </section>
);

const Carousel = ({ children }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -320 : 320;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition -translate-x-4"
            >
                <ChevronLeft size={24} />
            </button>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children}
            </div>
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition translate-x-4"
            >
                <ChevronRight size={24} />
            </button>
        </div>
    );
};

const ContinueLearningCard = ({ enrollment, onResume }) => {
    const { course, progress } = enrollment;
    return (
        <div className="min-w-[300px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition group cursor-pointer" onClick={onResume}>
            <div className="relative h-36">
                {course?.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700" />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform group-hover:scale-110">
                        <Play className="w-5 h-5 text-blue-600 ml-0.5" />
                    </div>
                </div>
            </div>
            <div className="p-4">
                <h4 className="font-semibold text-white line-clamp-1">{course?.title}</h4>
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span className="text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CourseCard = ({ course, onClick }) => (
    <div className="min-w-[260px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:scale-[1.02] transition cursor-pointer" onClick={onClick}>
        <div className="relative h-36">
            {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <BookOpen className="text-white/50" size={40} />
                </div>
            )}
            <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full capitalize">{course.level || 'Beginner'}</span>
        </div>
        <div className="p-4">
            <h4 className="font-semibold text-white line-clamp-2 text-sm">{course.title}</h4>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                {course.duration && <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>}
                {course.rating > 0 && <span className="flex items-center gap-1 text-yellow-400"><Star size={12} fill="currentColor" /> {course.rating.toFixed(1)}</span>}
            </div>
        </div>
    </div>
);

const EventCard = ({ event, onClick }) => (
    <div className="min-w-[280px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 hover:scale-[1.02] transition cursor-pointer" onClick={onClick}>
        <div className="relative h-36">
            {event.thumbnail ? (
                <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                    <Trophy className="text-white/50" size={40} />
                </div>
            )}
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full capitalize">{event.status}</span>
            {event.registrationFee > 0 && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">₹{event.registrationFee}</span>
            )}
        </div>
        <div className="p-4">
            <h4 className="font-semibold text-white line-clamp-1">{event.title}</h4>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(event.startDate).toLocaleDateString()}</span>
                {event.prizePool && <span className="flex items-center gap-1 text-yellow-400"><Trophy size={12} /> {event.prizePool}</span>}
            </div>
        </div>
    </div>
);

const LiveEventCard = ({ event, onClick }) => (
    <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-2xl p-6 hover:border-red-500/50 transition cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Live Now</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-4">{event.description}</p>
        <div className="flex items-center gap-4 text-sm">
            {event.prizePool && <span className="flex items-center gap-1 text-yellow-400"><Trophy size={16} /> {event.prizePool}</span>}
            <span className="flex items-center gap-1 text-slate-400"><Users size={16} /> {event.participantCount || 0} Participants</span>
        </div>
        <button className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center gap-2">
            <Zap size={16} /> Join Now
        </button>
    </div>
);

const QuickAction = ({ icon, label, onClick, color }) => {
    const colors = {
        blue: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600',
        purple: 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600',
        green: 'from-green-600 to-green-700 hover:from-green-500 hover:to-green-600',
        orange: 'from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600'
    };
    return (
        <button
            onClick={onClick}
            className={`bg-gradient-to-br ${colors[color]} p-5 rounded-xl text-white font-medium text-center transition hover:scale-[1.02] hover:shadow-lg`}
        >
            <div className="flex justify-center mb-2">{icon}</div>
            <span className="text-sm">{label}</span>
        </button>
    );
};

export default Dashboard;
