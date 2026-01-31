import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Trophy, Settings, ChevronLeft, Users, LogOut, Code } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const AdminSidebar = ({ collapsed, setCollapsed }) => {
    const { user, logoutUser } = useAuth();

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
        { path: '/admin/events', icon: Trophy, label: 'Events' },
        { path: '/admin/challenges', icon: Code, label: 'Challenges' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 z-50 ${collapsed ? 'w-20' : 'w-64'}`}>

            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                {!collapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <span className="text-white font-bold">Admin Panel</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition ${collapsed ? 'mx-auto rotate-180' : ''}`}
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
              ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }
              ${collapsed ? 'justify-center' : ''}
            `}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User & Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
                {!collapsed && user && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-slate-800/50">
                        <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-slate-400 text-xs truncate">{user.email}</p>
                    </div>
                )}
                <button
                    onClick={logoutUser}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={20} />
                    {!collapsed && <span className="font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
