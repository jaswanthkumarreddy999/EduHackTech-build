import React, { useState } from 'react';
import { X, Users, User, Mail, Phone, Building, MapPin, Plus, Trash2, ChevronRight, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';

const TeamRegistrationModal = ({ isOpen, onClose, event, user, onRegister, isLoading }) => {
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');

    const minSize = event?.teamSize?.min || 1;
    const maxSize = event?.teamSize?.max || 4;

    // Form State
    const [formData, setFormData] = useState({
        teamName: '',
        locality: { city: '', state: '', country: 'India' },
        teamMembers: [{
            name: user?.name || '',
            email: user?.email || '',
            phone: '',
            college: '',
            city: '',
            role: 'leader'
        }]
    });

    const addMember = () => {
        if (formData.teamMembers.length >= maxSize) {
            setError(`Maximum ${maxSize} members allowed`);
            return;
        }
        setFormData({
            ...formData,
            teamMembers: [...formData.teamMembers, { name: '', email: '', phone: '', college: '', city: '', role: 'member' }]
        });
        setError('');
    };

    const removeMember = (index) => {
        if (index === 0) return; // Can't remove leader
        if (formData.teamMembers.length <= minSize) {
            setError(`Minimum ${minSize} member${minSize > 1 ? 's' : ''} required`);
            return;
        }
        const updated = formData.teamMembers.filter((_, i) => i !== index);
        setFormData({ ...formData, teamMembers: updated });
        setError('');
    };

    const updateMember = (index, field, value) => {
        const updated = formData.teamMembers.map((m, i) =>
            i === index ? { ...m, [field]: value } : m
        );
        setFormData({ ...formData, teamMembers: updated });
    };

    const validateStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.teamName.trim()) {
                setError('Team name is required');
                return false;
            }
        }
        if (step === 2) {
            for (let i = 0; i < formData.teamMembers.length; i++) {
                const m = formData.teamMembers[i];
                if (!m.name.trim()) {
                    setError(`Member ${i + 1}: Name is required`);
                    return false;
                }
                if (!m.email.trim()) {
                    setError(`Member ${i + 1}: Email is required`);
                    return false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(m.email)) {
                    setError(`Member ${i + 1}: Invalid email`);
                    return false;
                }
            }
            if (formData.teamMembers.length < minSize) {
                setError(`Minimum ${minSize} team member${minSize > 1 ? 's' : ''} required`);
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = () => {
        if (!validateStep()) return;
        onRegister(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Team Registration</h2>
                        <p className="text-blue-100 text-sm">{event?.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                        <X className="text-white" size={20} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        {['Team Info', 'Members', 'Review'].map((label, i) => (
                            <div key={i} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-green-500 text-white' :
                                        step === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                                    }`}>
                                    {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                                </div>
                                <span className={`ml-2 text-sm hidden sm:block ${step === i + 1 ? 'text-white' : 'text-slate-400'}`}>{label}</span>
                                {i < 2 && <ChevronRight className="mx-2 text-slate-600" size={16} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Step 1: Team Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Users className="inline mr-2" size={16} /> Team Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.teamName}
                                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Code Warriors"
                                    maxLength={50}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <MapPin className="inline mr-2" size={16} /> City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.locality.city}
                                        onChange={(e) => setFormData({ ...formData, locality: { ...formData.locality, city: e.target.value } })}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Hyderabad"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                                    <input
                                        type="text"
                                        value={formData.locality.state}
                                        onChange={(e) => setFormData({ ...formData, locality: { ...formData.locality, state: e.target.value } })}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Telangana"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                <p className="text-blue-300 text-sm">
                                    <strong>Team Size:</strong> {minSize} - {maxSize} members allowed
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Team Members */}
                    {step === 2 && (
                        <div className="space-y-4 animate-fadeIn">
                            {formData.teamMembers.map((member, index) => (
                                <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-white">
                                            {index === 0 ? '👑 Team Leader' : `Member ${index + 1}`}
                                        </h4>
                                        {index > 0 && (
                                            <button
                                                onClick={() => removeMember(index)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Name *</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    value={member.name}
                                                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Email *</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="email"
                                                    value={member.email}
                                                    onChange={(e) => updateMember(index, 'email', e.target.value)}
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Phone</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="tel"
                                                    value={member.phone}
                                                    onChange={(e) => updateMember(index, 'phone', e.target.value)}
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="Phone Number"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">College/Institution</label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <input
                                                    type="text"
                                                    value={member.college}
                                                    onChange={(e) => updateMember(index, 'college', e.target.value)}
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    placeholder="College Name"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {formData.teamMembers.length < maxSize && (
                                <button
                                    onClick={addMember}
                                    className="w-full py-3 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-blue-500 hover:text-blue-400 transition flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Add Team Member
                                </button>
                            )}

                            <p className="text-xs text-slate-500 text-center">
                                {formData.teamMembers.length} of {maxSize} members added (min: {minSize})
                            </p>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                <h4 className="font-semibold text-white mb-3">Team Details</h4>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-slate-400">Team Name:</span> <span className="text-white font-medium">{formData.teamName}</span></p>
                                    <p><span className="text-slate-400">Location:</span> <span className="text-white">{formData.locality.city}, {formData.locality.state}</span></p>
                                    <p><span className="text-slate-400">Team Size:</span> <span className="text-white">{formData.teamMembers.length} members</span></p>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                <h4 className="font-semibold text-white mb-3">Team Members</h4>
                                <div className="space-y-3">
                                    {formData.teamMembers.map((member, index) => (
                                        <div key={index} className="flex items-center gap-3 py-2 border-b border-slate-700 last:border-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500' : 'bg-blue-600'}`}>
                                                {index === 0 ? '👑' : index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium text-sm">{member.name}</p>
                                                <p className="text-slate-400 text-xs">{member.email}</p>
                                            </div>
                                            {member.college && <span className="text-xs text-slate-500">{member.college}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                                <p className="text-green-300 text-sm">
                                    ✓ Click "Complete Registration" to confirm your team registration
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-between">
                    {step > 1 ? (
                        <button onClick={prevStep} className="px-4 py-2 text-slate-300 hover:text-white flex items-center gap-2">
                            <ChevronLeft size={18} /> Back
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white">
                            Cancel
                        </button>
                    )}

                    {step < 3 ? (
                        <button onClick={nextStep} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2">
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                            {isLoading ? 'Processing...' : 'Complete Registration'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamRegistrationModal;
