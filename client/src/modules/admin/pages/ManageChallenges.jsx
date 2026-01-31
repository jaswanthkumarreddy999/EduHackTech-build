import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Save, Loader2, Code, Trophy } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../../../context/AuthContext';
import { getChallenges, createChallenge, updateChallenge, deleteChallenge } from '../../../services/challenge.service';
import { registerForEvent } from '../../../services/event.service'; // We might not need this here but assuming generic service imports

// We might need to fetch events to link challenges to them, so let's import it locally or use a service
// Assuming the user might want to select an event from a dropdown.
// For now, let's keep it simple and just manage challenges.

const ManageChallenges = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { token } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', difficulty: 'Medium', points: 10, category: 'General', testCases: []
    });

    const fetchAllChallenges = async () => {
        try {
            setLoading(true);
            const res = await getChallenges();
            if (res.success) setChallenges(res.data);
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllChallenges(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (challenge = null) => {
        if (challenge) {
            setEditingChallenge(challenge);
            setFormData({
                title: challenge.title,
                description: challenge.description,
                difficulty: challenge.difficulty,
                points: challenge.points,
                category: challenge.category,
                testCases: challenge.testCases || []
            });
        } else {
            setEditingChallenge(null);
            setFormData({ title: '', description: '', difficulty: 'Medium', points: 10, category: 'General', testCases: [] });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingChallenge) {
                await updateChallenge(editingChallenge._id, formData, token);
            } else {
                await createChallenge(formData, token);
            }
            setIsModalOpen(false);
            fetchAllChallenges();
        } catch (error) {
            alert('Failed to save challenge: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this challenge?')) return;
        try {
            await deleteChallenge(id, token);
            fetchAllChallenges();
        } catch (err) {
            alert('Failed to delete challenge');
        }
    };

    const filteredChallenges = challenges.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case 'Easy': return 'text-green-400 bg-green-400/10';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
            case 'Hard': return 'text-red-400 bg-red-400/10';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
            <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'} p-8`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Manage Challenges</h1>
                        <p className="text-slate-400">Create and manage coding challenges.</p>
                    </div>
                    <button onClick={() => openModal()} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20">
                        <Plus size={18} /> Create Challenge
                    </button>
                </div>

                <div className="relative max-w-md mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" placeholder="Search challenges..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
                    ) : filteredChallenges.length === 0 ? (
                        <div className="text-center py-20 text-slate-500">No challenges found.</div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-800/50 text-left text-sm text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Difficulty</th>
                                    <th className="px-6 py-4">Points</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredChallenges.map(challenge => (
                                    <tr key={challenge._id} className="hover:bg-slate-800/30 transition">
                                        <td className="px-6 py-4 font-medium text-white">{challenge.title}</td>
                                        <td className="px-6 py-4 text-slate-400">{challenge.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(challenge.difficulty)}`}>{challenge.difficulty}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">{challenge.points} pts</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openModal(challenge)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"><Pencil size={16} /></button>
                                            <button onClick={() => handleDelete(challenge._id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white">{editingChallenge ? 'Edit Challenge' : 'Create Challenge'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                                <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Difficulty</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500">
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Points</label>
                                    <input type="number" name="points" value={formData.points} onChange={handleChange} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                                <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Arrays, DP, Strings" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition">Cancel</button>
                                <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition">
                                    <Save size={18} /> {editingChallenge ? 'Update' : 'Create'} Challenge
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageChallenges;
