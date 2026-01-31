import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { createChallenge } from '../../../services/challenge.service';
import { useAuth } from '../../../context/AuthContext';

const CreateChallenge = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        points: 10,
        category: '',
        testCases: [{ input: '', output: '', isVisible: true }]
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...formData.testCases];
        newTestCases[index][field] = value;
        setFormData({ ...formData, testCases: newTestCases });
    };

    const addTestCase = () => {
        setFormData({
            ...formData,
            testCases: [...formData.testCases, { input: '', output: '', isVisible: false }]
        });
    };

    const removeTestCase = (index) => {
        const newTestCases = formData.testCases.filter((_, i) => i !== index);
        setFormData({ ...formData, testCases: newTestCases });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createChallenge(formData, token);
            alert('Challenge created successfully!');
            navigate('/competition'); // Or wherever appropriate
        } catch (error) {
            alert('Failed to create challenge: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-500">
                        Create New Challenge
                    </h1>
                    <p className="text-gray-400 mt-2">Design a coding problem for the community.</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
                                <Code size={20} /> Problem Details
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Challenge Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Reverse Linked List"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description (Markdown supported)</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={6}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Explain the problem statement, input/output format, and constraints..."
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Points</label>
                                    <input
                                        type="number"
                                        name="points"
                                        value={formData.points}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Algorithms"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Test Cases */}
                        <div className="space-y-4 pt-6 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-green-400">
                                    <CheckCircle size={20} /> Test Cases
                                </h3>
                                <button type="button" onClick={addTestCase} className="text-sm text-blue-400 hover:text-blue-300">
                                    + Add Test Case
                                </button>
                            </div>

                            {formData.testCases.map((tc, index) => (
                                <div key={index} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Case #{index + 1}</span>
                                        <button type="button" onClick={() => removeTestCase(index)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Input</label>
                                            <textarea
                                                rows={2}
                                                value={tc.input}
                                                onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                className="w-full bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                                                placeholder="Input data..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1">Expected Output</label>
                                            <textarea
                                                rows={2}
                                                value={tc.output}
                                                onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                                className="w-full bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                                                placeholder="Expected output..."
                                            />
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={tc.isVisible}
                                            onChange={(e) => handleTestCaseChange(index, 'isVisible', e.target.checked)}
                                            className="form-checkbox bg-slate-700 border-slate-600 rounded text-blue-600"
                                        />
                                        <span className="text-sm text-slate-400">Visible to user? (Sample case)</span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 rounded-xl border border-slate-700 text-gray-300 hover:bg-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-2"
                            >
                                {loading ? 'Creating...' : <><Save size={18} /> Create Challenge</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateChallenge;
