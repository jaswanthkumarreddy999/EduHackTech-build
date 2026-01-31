import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Trash2, Loader2, Edit2, Check, X, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/events';

const MyRegistrations = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editTeamName, setEditTeamName] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadRegistrations();
    }, [user, token]);

    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/my-registrations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRegistrations(data.data);
            }
        } catch (err) {
            console.error('Failed to load registrations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnregister = async (eventId, isPaid) => {
        const message = isPaid
            ? 'Are you sure you want to unregister? Note: Refunds are subject to event policies.'
            : 'Are you sure you want to unregister from this event?';

        if (!window.confirm(message)) return;

        try {
            const res = await fetch(`${API_BASE}/${eventId}/unregister`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRegistrations(prev => prev.filter(r => r.event._id !== eventId));
            } else {
                alert(data.message || 'Failed to unregister');
            }
        } catch (err) {
            alert('Failed to unregister');
        }
    };

    const startEditing = (reg) => {
        setEditingId(reg._id);
        setEditTeamName(reg.teamName || '');
    };

    const saveTeamName = async (eventId) => {
        try {
            const res = await fetch(`${API_BASE}/${eventId}/my-registration`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ teamName: editTeamName })
            });
            const data = await res.json();
            if (data.success) {
                setRegistrations(prev =>
                    prev.map(r => r._id === editingId ? { ...r, teamName: editTeamName } : r)
                );
                setEditingId(null);
            } else {
                alert(data.message || 'Failed to update');
            }
        } catch (err) {
            alert('Failed to update team name');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        }
    };

    const getEventStatusColor = (status) => {
        switch (status) {
            case 'live': return 'bg-red-500 text-white';
            case 'upcoming': return 'bg-blue-500 text-white';
            case 'past': return 'bg-slate-500 text-white';
            default: return 'bg-yellow-500 text-white';
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
                        <h1 className="text-3xl font-bold text-white">My Registrations</h1>
                        <p className="text-slate-400 mt-1">Manage your event and hackathon registrations</p>
                    </div>
                    <button
                        onClick={() => navigate('/competition')}
                        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                    >
                        <Trophy size={20} /> Browse Events
                    </button>
                </div>

                {registrations.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                        <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Registrations Yet</h3>
                        <p className="text-slate-400 mb-6">Join a hackathon and start competing!</p>
                        <button
                            onClick={() => navigate('/competition')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                        >
                            Explore Events
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {registrations.map(reg => (
                            <div key={reg._id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Event Thumbnail */}
                                    <div className="lg:w-64 h-48 lg:h-auto relative">
                                        {reg.event?.thumbnail ? (
                                            <img src={reg.event.thumbnail} alt={reg.event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-blue-900" />
                                        )}
                                        <span className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded-full capitalize ${getEventStatusColor(reg.event?.status)}`}>
                                            {reg.event?.status}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">{reg.event?.title || 'Unknown Event'}</h3>

                                                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} />
                                                        <span>{reg.event?.startDate ? new Date(reg.event.startDate).toLocaleDateString() : 'TBD'}</span>
                                                    </div>
                                                    {reg.event?.venue && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={16} />
                                                            <span>{reg.event.venue}</span>
                                                        </div>
                                                    )}
                                                    {reg.event?.prizePool && (
                                                        <div className="flex items-center gap-2">
                                                            <Trophy size={16} className="text-yellow-400" />
                                                            <span>{reg.event.prizePool}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Team Name with Edit */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Users size={16} className="text-slate-400" />
                                                    {editingId === reg._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={editTeamName}
                                                                onChange={(e) => setEditTeamName(e.target.value)}
                                                                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                                                                placeholder="Team name"
                                                            />
                                                            <button
                                                                onClick={() => saveTeamName(reg.event._id)}
                                                                className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingId(null)}
                                                                className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-lg transition"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white">{reg.teamName || 'Individual'}</span>
                                                            <button
                                                                onClick={() => startEditing(reg)}
                                                                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                                                                title="Edit team name"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Registration Status */}
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-slate-500">Registration Status:</span>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize border ${getStatusColor(reg.status)}`}>
                                                        {reg.status}
                                                    </span>
                                                    {reg.event?.registrationFee > 0 && (
                                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                            Paid: ₹{reg.event.registrationFee}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex lg:flex-col gap-2">
                                                <button
                                                    onClick={() => navigate(`/competition/${reg.event._id}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                                                >
                                                    View Event <ChevronRight size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleUnregister(reg.event._id, reg.event?.registrationFee > 0)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-medium rounded-lg transition"
                                                >
                                                    <Trash2 size={16} /> Unregister
                                                </button>
                                            </div>
                                        </div>
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

export default MyRegistrations;
