import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock, ChevronRight, Plus, Edit, Eye, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getMyEvents } from '../../../services/event.service';
import { useAuth } from '../../../context/AuthContext';

const MyEvents = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadEvents();
    }, [user, token]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const data = await getMyEvents(token);
            setEvents(data);
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'live': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'past': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

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
                        <h1 className="text-3xl font-bold text-white">My Events</h1>
                        <p className="text-slate-400 mt-1">Manage your organized hackathons and competitions</p>
                    </div>
                    <button
                        onClick={() => navigate('/competition/organize')}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg"
                    >
                        <Plus size={20} /> Organize New Event
                    </button>
                </div>

                {events.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                        <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Events Yet</h3>
                        <p className="text-slate-400 mb-6">Start organizing your first hackathon!</p>
                        <button
                            onClick={() => navigate('/competition/organize')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                        >
                            Organize Event
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {events.map((event) => (
                            <div key={event._id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Event Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Live Indicator Dot */}
                                            {event.status === 'live' && (
                                                <div className="relative flex items-center justify-center">
                                                    <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold text-white">{event.title}</h3>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize border ${getStatusColor(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm line-clamp-2 mb-4">{event.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar size={16} />
                                                <span>{new Date(event.startDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Trophy size={16} />
                                                <span>{event.prizePool || 'No Prize'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Users size={16} />
                                                <span>{event.participantCount || 0} Participants</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Cards */}
                                    <div className="flex gap-4">
                                        <StatCard
                                            icon={<Users size={20} />}
                                            label="Total"
                                            value={event.stats?.totalRegistrations || 0}
                                            color="text-blue-400"
                                            bg="bg-blue-500/10"
                                        />
                                        <StatCard
                                            icon={<AlertCircle size={20} />}
                                            label="Pending"
                                            value={event.stats?.pending || 0}
                                            color="text-yellow-400"
                                            bg="bg-yellow-500/10"
                                        />
                                        <StatCard
                                            icon={<CheckCircle size={20} />}
                                            label="Approved"
                                            value={event.stats?.approved || 0}
                                            color="text-green-400"
                                            bg="bg-green-500/10"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex lg:flex-col gap-2">
                                        <button
                                            onClick={() => navigate(`/my-events/${event._id}/registrations`)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
                                        >
                                            <Eye size={16} /> Manage Registrations
                                        </button>
                                        <button
                                            onClick={() => navigate(`/competition/${event._id}`)}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition"
                                        >
                                            <ChevronRight size={16} /> View Event
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color, bg }) => (
    <div className={`${bg} rounded-xl p-4 text-center min-w-[80px]`}>
        <div className={`${color} mb-1 flex justify-center`}>{icon}</div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
    </div>
);

export default MyEvents;
