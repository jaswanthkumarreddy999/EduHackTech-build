import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                EduHack<span className="text-blue-500">Tech</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 mb-6">
                            Empowering the next generation of developers through learning and competition.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-slate-400 hover:text-white transition"><Github size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-blue-400 transition"><Twitter size={20} /></a>
                            <a href="#" className="text-slate-400 hover:text-blue-600 transition"><Linkedin size={20} /></a>
                        </div>
                    </div>

                    {/* Links - Learning */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Learning</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/learning" className="hover:text-blue-400 transition">All Courses</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Roadmaps</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Tutorials</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Community</a></li>
                        </ul>
                    </div>

                    {/* Links - Competition */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Competition</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/competition" className="hover:text-blue-400 transition">Hackathons</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Leaderboard</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Teams</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Prizes</a></li>
                        </ul>
                    </div>

                    {/* Links - Company */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Careers</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Blog</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© 2026 EduHackTech Inc. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <Heart size={12} className="text-red-500 fill-red-500" /> by EduHackTechTeam
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
