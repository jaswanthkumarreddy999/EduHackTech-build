import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, CheckCircle, XCircle, Clock, Users, Loader2, RefreshCw, FileText, MessageSquare, X } from 'lucide-react';
import { getEvent, getEventRegistrations, updateRegistrationStatus, deleteRegistration, reviewProblemStatement } from '../../../services/event.service';
import { useAuth } from '../../../context/AuthContext';

const EventRegistrations = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updating, setUpdating] = useState(null);

    // Problem statement review modal state
    const [showProblemModal, setShowProblemModal] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(null);
    const [rejectRemarks, setRejectRemarks] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadData();
    }, [id, user, token]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [eventData, regData] = await Promise.all([
                getEvent(id),
                getEventRegistrations(id, token)
            ]);
            setEvent(eventData);
            setRegistrations(regData);
        } catch (err) {
            console.error('Failed to load data:', err);
            alert('Failed to load data. You may not have permission.');
            navigate('/my-events');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (regId, newStatus) => {
        setUpdating(regId);
        try {
            await updateRegistrationStatus(id, regId, newStatus, token);
            // Update local state
            setRegistrations(prev =>
                prev.map(r => r._id === regId ? { ...r, status: newStatus } : r)
            );
        } catch (err) {
            alert('Failed to update status: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    // Problem statement review handlers
    const handleApproveProblem = async (regId) => {
        setUpdating(regId);
        try {
            await reviewProblemStatement(id, regId, 'approved', '', token);
            setRegistrations(prev =>
                prev.map(r => r._id === regId ? {
                    ...r,
                    problemStatement: { ...r.problemStatement, status: 'approved' }
                } : r)
            );
            setShowProblemModal(null);
        } catch (err) {
            alert('Failed to approve: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    const handleRejectProblem = async () => {
        if (!showRejectModal) return;
        setUpdating(showRejectModal._id);
        try {
            await reviewProblemStatement(id, showRejectModal._id, 'rejected', rejectRemarks, token);
            setRegistrations(prev =>
                prev.map(r => r._id === showRejectModal._id ? {
                    ...r,
                    problemStatement: { ...r.problemStatement, status: 'rejected', adminRemarks: rejectRemarks }
                } : r)
            );
            setShowRejectModal(null);
            setRejectRemarks('');
        } catch (err) {
            alert('Failed to reject: ' + err.message);
        } finally {
            setUpdating(null);
        }
    };

    const handleDelete = async (regId) => {
        if (!window.confirm('Are you sure you want to remove this registration?')) return;
        try {
            await deleteRegistration(id, regId, token);
            setRegistrations(prev => prev.filter(r => r._id !== regId));
        } catch (err) {
            alert('Failed to delete registration');
        }
    };

    const exportToCSV = () => {
        const headers = ['Team Name', 'User Name', 'Email', 'Registered Date', 'Status'];
        const rows = filteredRegistrations.map(r => [
            r.teamName || 'Individual',
            r.user?.name || 'Unknown',
            r.user?.email || '',
            new Date(r.registeredAt).toLocaleDateString(),
            r.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event?.title || 'event'}_registrations.csv`;
        a.click();
    };

    const approveAll = async () => {
        if (!window.confirm('Approve all pending registrations?')) return;
        const pending = registrations.filter(r => r.status === 'pending');
        for (const reg of pending) {
            await handleStatusChange(reg._id, 'approved');
        }
    };

    const filteredRegistrations = registrations.filter(r => {
        const matchesSearch =
            (r.teamName?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (r.user?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (r.user?.email?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: registrations.length,
        pending: registrations.filter(r => r.status === 'pending').length,
        approved: registrations.filter(r => r.status === 'approved').length,
        rejected: registrations.filter(r => r.status === 'rejected').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/my-events')}
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{event?.title}</h1>
                        <p className="text-slate-400">Manage Registrations</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                        title="Refresh"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total" value={stats.total} icon={<Users />} color="text-blue-400" bg="bg-blue-500/10" />
                    <StatCard label="Pending" value={stats.pending} icon={<Clock />} color="text-yellow-400" bg="bg-yellow-500/10" />
                    <StatCard label="Approved" value={stats.approved} icon={<CheckCircle />} color="text-green-400" bg="bg-green-500/10" />
                    <StatCard label="Rejected" value={stats.rejected} icon={<XCircle />} color="text-red-400" bg="bg-red-500/10" />
                </div>

                {/* Actions Bar */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by team name, user, or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* Bulk Actions */}
                        <div className="flex gap-2">
                            {stats.pending > 0 && (
                                <button
                                    onClick={approveAll}
                                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Approve All
                                </button>
                            )}
                            <button
                                onClick={exportToCSV}
                                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition flex items-center gap-2"
                            >
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Registrations Table */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                    {filteredRegistrations.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            {registrations.length === 0 ? 'No registrations yet' : 'No matching registrations'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/50 text-left text-sm text-slate-400 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Team / User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Problem Statement</th>
                                        <th className="px-6 py-4">Registered</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredRegistrations.map(reg => (
                                        <tr key={reg._id} className="hover:bg-slate-800/30 transition">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-white">{reg.teamName || 'Individual'}</p>
                                                    <p className="text-sm text-slate-400">{reg.user?.name || 'Unknown'}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{reg.user?.email || '-'}</td>
                                            <td className="px-6 py-4">
                                                {reg.problemStatement?.title ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setShowProblemModal(reg)}
                                                            className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center gap-1"
                                                        >
                                                            <FileText size={14} /> View
                                                        </button>
                                                        <ProblemStatusBadge status={reg.problemStatement?.status} />
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm">
                                                {new Date(reg.registeredAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={reg.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {updating === reg._id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                                    ) : (
                                                        <>
                                                            {/* Problem Statement Actions */}
                                                            {reg.problemStatement?.title && reg.problemStatement?.status === 'pending_review' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApproveProblem(reg._id)}
                                                                        className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition"
                                                                        title="Approve Problem Statement"
                                                                    >
                                                                        <CheckCircle size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setShowRejectModal(reg)}
                                                                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                                                                        title="Reject with Remarks"
                                                                    >
                                                                        <MessageSquare size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {/* Registration Status Actions */}
                                                            {!reg.problemStatement?.title && (
                                                                <>
                                                                    {reg.status !== 'approved' && (
                                                                        <button
                                                                            onClick={() => handleStatusChange(reg._id, 'approved')}
                                                                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition"
                                                                            title="Approve"
                                                                        >
                                                                            <CheckCircle size={18} />
                                                                        </button>
                                                                    )}
                                                                    {reg.status !== 'rejected' && (
                                                                        <button
                                                                            onClick={() => handleStatusChange(reg._id, 'rejected')}
                                                                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition"
                                                                            title="Reject"
                                                                        >
                                                                            <XCircle size={18} />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(reg._id)}
                                                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition"
                                                                title="Remove"
                                                            >
                                                                ×
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Problem Statement View Modal */}
            {showProblemModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white">Problem Statement</h2>
                                <p className="text-blue-100 text-sm">Team: {showProblemModal.teamName}</p>
                            </div>
                            <button onClick={() => setShowProblemModal(null)} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="text-white" size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-slate-400 text-xs mb-1">Title</p>
                                <p className="text-white font-semibold">{showProblemModal.problemStatement?.title}</p>
                            </div>
                            <div className="mb-4">
                                <p className="text-slate-400 text-xs mb-1">Description</p>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{showProblemModal.problemStatement?.description}</p>
                            </div>
                            {showProblemModal.problemStatement?.techStack && (
                                <div className="mb-4">
                                    <p className="text-slate-400 text-xs mb-1">Tech Stack</p>
                                    <p className="text-slate-300 text-sm">{showProblemModal.problemStatement?.techStack}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-slate-400 text-xs">Status:</span>
                                <ProblemStatusBadge status={showProblemModal.problemStatement?.status} />
                            </div>
                            {showProblemModal.problemStatement?.status === 'pending_review' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApproveProblem(showProblemModal._id)}
                                        disabled={updating === showProblemModal._id}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button
                                        onClick={() => { setShowRejectModal(showProblemModal); setShowProblemModal(null); }}
                                        className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Remarks Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden">
                        <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Reject Problem Statement</h2>
                            <button onClick={() => { setShowRejectModal(null); setRejectRemarks(''); }} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="text-white" size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-slate-400 text-sm mb-4">
                                Rejecting: <span className="text-white font-medium">{showRejectModal.problemStatement?.title}</span>
                            </p>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Feedback for the team</label>
                            <textarea
                                value={rejectRemarks}
                                onChange={(e) => setRejectRemarks(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                placeholder="Explain why the problem statement was rejected and what changes are needed..."
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => { setShowRejectModal(null); setRejectRemarks(''); }}
                                    className="flex-1 py-3 border border-slate-600 text-slate-300 font-bold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectProblem}
                                    disabled={updating === showRejectModal._id}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition"
                                >
                                    {updating === showRejectModal._id ? 'Rejecting...' : 'Reject'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, icon, color, bg }) => (
    <div className={`${bg} rounded-xl p-4 border border-slate-800`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
            <div className={color}>{icon}</div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const config = {
        pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
        approved: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
        rejected: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
    };
    const { bg, text, border } = config[status] || config.pending;

    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize border ${bg} ${text} ${border}`}>
            {status}
        </span>
    );
};

const ProblemStatusBadge = ({ status }) => {
    const config = {
        pending_review: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Pending' },
        approved: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Approved' },
        rejected: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Rejected' }
    };
    const { bg, text, border, label } = config[status] || config.pending_review;

    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${bg} ${text} ${border}`}>
            {label}
        </span>
    );
};

export default EventRegistrations;

