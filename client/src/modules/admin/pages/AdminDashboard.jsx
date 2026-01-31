import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();
    const [stats, setStats] = useState({
        courses: 0,
        events: 0,
        users: 0
    });

    // Fetch stats on mount (placeholder - connect to API later)
    useEffect(() => {
        // TODO: Fetch real stats from API
        setStats({ courses: 12, events: 5, users: 1240 });
    }, []);

    const statCards = [
        { label: 'Total Courses', value: stats.courses, icon: BookOpen, color: 'bg-blue-500', link: '/admin/courses' },
        { label: 'Active Events', value: stats.events, icon: Trophy, color: 'bg-indigo-500', link: '/admin/events' },
        { label: 'Registered Users', value: stats.users, icon: Users, color: 'bg-emerald-500', link: '/admin/users' },
        { label: 'Platform Growth', value: '+24%', icon: TrendingUp, color: 'bg-amber-500', link: '#' },
    ];

    const quickActions = [
        { label: 'Add New Course', icon: BookOpen, link: '/admin/courses', color: 'text-blue-400' },
        { label: 'Create Event', icon: Trophy, link: '/admin/events', color: 'text-indigo-400' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Main Content */}
            <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋
                    </h1>
                    <p className="text-slate-400">Here's what's happening on your platform today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statCards.map((stat, index) => (
                        <Link
                            key={index}
                            to={stat.link}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
                                    <stat.icon size={24} className="text-white" />
                                </div>
                                <ArrowRight size={18} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-slate-400 text-sm">{stat.label}</p>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-10">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.link}
                                className="flex items-center gap-3 px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all"
                            >
                                <Plus size={18} className={action.color} />
                                <span className="font-medium">{action.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                    <div className="text-center py-12 text-slate-500">
                        <p>Activity feed coming soon...</p>
                        <p className="text-sm mt-2">This section will show recent course additions, event updates, and user signups.</p>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AdminDashboard;
