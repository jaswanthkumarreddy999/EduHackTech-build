import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Save, Type, Image as ImageIcon, AlignLeft, Users, Trophy } from 'lucide-react';
import { createEvent } from '../../../services/event.service';
import { useAuth } from '../../../context/AuthContext';

const OrganizeHackathon = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        teamSize: { min: 1, max: 4 },
        maxTeams: 100,
        prizePool: '',
        venue: 'Online',
        thumbnail: '',
        tags: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const eventData = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };
            await createEvent(eventData, token);
            navigate('/competition');
        } catch (error) {
            alert('Failed to create hackathon: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Organize Hackathon
                    </h1>
                    <p className="text-gray-400 mt-2">Create a new competition for the community.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
                                <Type size={20} /> Basic Details
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Hackathon Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. AI Innovation Challenge 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Describe the theme, goals, and details..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Rules & Guidelines</label>
                                <textarea
                                    name="rules"
                                    rows={4}
                                    value={formData.rules || ''}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Code of conduct, submission guidelines, restrictions..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Banner URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-3.5 text-gray-500" size={18} />
                                    <input
                                        type="url"
                                        name="thumbnail"
                                        value={formData.thumbnail}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="https://example.com/banner.jpg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Schedule */}
                        <div className="space-y-4 pt-6 border-t border-slate-800">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-green-400">
                                <Calendar size={20} /> Schedule
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        name="startDate"
                                        required
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                                    <input
                                        type="datetime-local"
                                        name="endDate"
                                        required
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="space-y-4 pt-6 border-t border-slate-800">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-purple-400">
                                <Users size={20} /> Participation Settings
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Min Team Size</label>
                                    <input
                                        type="number"
                                        name="teamSize.min"
                                        min="1"
                                        value={formData.teamSize.min}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Max Team Size</label>
                                    <input
                                        type="number"
                                        name="teamSize.max"
                                        min="1"
                                        value={formData.teamSize.max}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Prize Pool</label>
                                <div className="relative">
                                    <Trophy className="absolute left-3 top-3.5 text-yellow-500" size={18} />
                                    <input
                                        type="text"
                                        name="prizePool"
                                        value={formData.prizePool}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="$10,000 or Swag Kits"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="AI, Web3, Fintech"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/competition')}
                                className="px-6 py-3 rounded-xl border border-slate-700 text-gray-300 hover:bg-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-2"
                            >
                                {loading ? 'Creating...' : <><Save size={18} /> Create Hackathon</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrganizeHackathon;
