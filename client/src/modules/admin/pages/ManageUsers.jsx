import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreVertical, Mail, BookOpen, Trophy, Shield, X, Trash2, Eye, ChevronRight } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const ManageUsers = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { token } = useAuth();

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(null); // 'courses' | 'events' | null

    // Actions Dropdown State
    const [activeActionMenu, setActiveActionMenu] = useState(null);
    const actionMenuRef = useRef(null);

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    // Close actions menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
                setActiveActionMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const response = await axios.get('http://localhost:5000/api/admin/users', config);
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            // Placeholder: In a real app, call API
            console.log("Deleting user:", userId);
            // setUsers(users.filter(u => u._id !== userId));
        }
        setActiveActionMenu(null);
    };

    const toggleActionMenu = (e, userId) => {
        e.stopPropagation();
        setActiveActionMenu(activeActionMenu === userId ? null : userId);
    };

    const openModal = (user, type) => {
        setSelectedUser(user);
        setModalType(type);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setModalType(null);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100 font-sans selection:bg-blue-500/30">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Manage Users</h1>
                        <p className="text-slate-400">View and manage all registered users on the platform</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-900/80 border border-slate-700/50 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 w-64 md:w-80 transition-all shadow-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-all shadow-sm">
                            <Filter size={18} />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                    <div className="overflow-x-visible min-h-[400px]"> {/* Overflow visible for dropdowns */}
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800/60 bg-slate-900/60">
                                    <th className="p-4 pl-6 text-slate-400 font-medium text-sm uppercase tracking-wider">User Info</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Role</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Enrolled Courses</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Hackathons</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm uppercase tracking-wider">Joined Date</th>
                                    <th className="p-4 pr-6 text-slate-400 font-medium text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                <p>Loading users...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="p-12 text-center text-slate-500">No users found matching your search.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-slate-800/20 transition-colors group">
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{user.name}</h3>
                                                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                                                            <Mail size={14} />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${user.role === 'admin'
                                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                                                    : user.role === 'organiser'
                                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                                                    }`}>
                                                    {user.role === 'admin' && <Shield size={12} />}
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-300">
                                                <div
                                                    className="flex flex-col gap-1 cursor-pointer group/cell"
                                                    onClick={() => user.courses.length > 0 && openModal(user, 'courses')}
                                                >
                                                    <span className={`flex items-center gap-1.5 font-medium ${user.courses.length > 0 ? 'group-hover/cell:text-blue-400 transition-colors' : 'text-slate-500'}`}>
                                                        <BookOpen size={14} className={user.courses.length > 0 ? "text-blue-500" : "text-slate-600"} />
                                                        {user.courses.length} Active
                                                    </span>
                                                    {user.courses.length > 0 && (
                                                        <span className="text-xs text-slate-500 truncate max-w-[150px] group-hover/cell:text-slate-400">
                                                            Click to view full list
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300">
                                                <div
                                                    className="flex flex-col gap-1 cursor-pointer group/cell"
                                                    onClick={() => user.events.length > 0 && openModal(user, 'events')}
                                                >
                                                    <span className={`flex items-center gap-1.5 font-medium ${user.events.length > 0 ? 'group-hover/cell:text-amber-400 transition-colors' : 'text-slate-500'}`}>
                                                        <Trophy size={14} className={user.events.length > 0 ? "text-amber-500" : "text-slate-600"} />
                                                        {user.events.length} Events
                                                    </span>
                                                    {user.events.length > 0 && (
                                                        <span className="text-xs text-slate-500 truncate max-w-[150px] group-hover/cell:text-slate-400">
                                                            Click to view full list
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm font-mono">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 pr-6 text-right relative">
                                                <button
                                                    className={`p-2 rounded-lg transition-colors ${activeActionMenu === user._id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                                                    onClick={(e) => toggleActionMenu(e, user._id)}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeActionMenu === user._id && (
                                                    <div
                                                        ref={actionMenuRef}
                                                        className="absolute right-8 top-12 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                                                    >
                                                        <div className="py-1">
                                                            <button
                                                                className="w-full px-4 py-2.5 text-sm text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
                                                                onClick={() => console.log('View profile')}
                                                            >
                                                                <Eye size={16} className="text-blue-500" />
                                                                View Profile
                                                            </button>
                                                            <button
                                                                className="w-full px-4 py-2.5 text-sm text-left text-slate-300 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2 transition-colors border-t border-slate-800"
                                                                onClick={() => handleDeleteUser(user._id)}
                                                            >
                                                                <Trash2 size={16} />
                                                                Delete User
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder */}
                    <div className="flex items-center justify-between p-4 border-t border-slate-800/60 bg-slate-900/30 backdrop-blur-xl">
                        <span className="text-sm text-slate-500">Showing {filteredUsers.length} users</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-sm border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1.5 text-sm border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Details Modal */}
            {selectedUser && modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
                    <div
                        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    {modalType === 'courses' ? <BookOpen className="text-blue-500" /> : <Trophy className="text-amber-500" />}
                                    {modalType === 'courses' ? 'Enrolled Courses' : 'Registered Hackathons'}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    {selectedUser.name} • {selectedUser.email}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {(modalType === 'courses' ? selectedUser.courses : selectedUser.events).length > 0 ? (
                                <ul className="space-y-3">
                                    {(modalType === 'courses' ? selectedUser.courses : selectedUser.events).map((item, index) => (
                                        <li key={index} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-800 transition-all group">
                                            <span className="text-slate-200 font-medium">{item}</span>
                                            <ChevronRight size={16} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <p>No {modalType === 'courses' ? 'courses' : 'events'} found for this user.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
