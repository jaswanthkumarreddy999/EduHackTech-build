import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, User, Mail, Phone, Building, MapPin,
    Plus, Trash2, ChevronRight, ChevronLeft, Loader2, CheckCircle,
    FileText, Code, Trophy, Calendar, Clock
} from 'lucide-react';
import { getEvent, registerForEvent, checkUserRegistration, resubmitProblemStatement } from '../../../services/event.service';
import { useAuth } from '../../../context/AuthContext';

const HackathonRegistration = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isResubmit, setIsResubmit] = useState(false);
    const [existingRegistration, setExistingRegistration] = useState(null);

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
        }],
        problemStatement: {
            title: '',
            description: '',
            techStack: ''
        }
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getEvent(id);
                setEvent(data);

                // Check if already registered
                if (user && token) {
                    try {
                        const regStatus = await checkUserRegistration(id, token);
                        if (regStatus.isRegistered) {
                            const registration = regStatus.registration;

                            // Check if problem statement was rejected - allow resubmission
                            if (registration?.problemStatement?.status === 'rejected') {
                                setIsResubmit(true);
                                setExistingRegistration(registration);

                                // Pre-fill the form with existing data
                                setFormData({
                                    teamName: registration.teamName || '',
                                    locality: registration.locality || { city: '', state: '', country: 'India' },
                                    teamMembers: registration.teamMembers || [{
                                        name: user?.name || '',
                                        email: user?.email || '',
                                        phone: '',
                                        college: '',
                                        city: '',
                                        role: 'leader'
                                    }],
                                    problemStatement: {
                                        title: registration.problemStatement?.title || '',
                                        description: registration.problemStatement?.description || '',
                                        techStack: registration.problemStatement?.techStack || ''
                                    }
                                });

                                // Jump directly to problem statement step (step 3)
                                setStep(3);
                            } else {
                                // Already registered and not rejected - redirect back
                                navigate(`/competition/${id}`, {
                                    state: { alreadyRegistered: true }
                                });
                            }
                        }
                    } catch (err) {
                        console.log('Registration check:', err);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (!user) {
            navigate('/login');
            return;
        }
        load();
    }, [id, user, token, navigate]);

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
        if (index === 0) return;
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
        if (step === 3) {
            // Problem statement is required for paid events
            if (event?.registrationFee && event.registrationFee > 0) {
                if (!formData.problemStatement.title.trim()) {
                    setError('Problem statement title is required');
                    return false;
                }
                if (!formData.problemStatement.description.trim()) {
                    setError('Problem statement description is required');
                    return false;
                }
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
        // In resubmit mode, don't go back beyond step 3
        if (isResubmit && step <= 3) {
            navigate(`/competition/${id}`);
            return;
        }
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setSubmitting(true);
        try {
            if (isResubmit) {
                // Resubmit problem statement for rejected registration
                await resubmitProblemStatement(id, formData.problemStatement, token);
                navigate(`/competition/${id}`, {
                    state: {
                        registrationSuccess: true,
                        message: 'Problem statement resubmitted for review!'
                    }
                });
            } else {
                // New registration
                await registerForEvent(id, formData, token);
                const hasFee = event?.registrationFee && event.registrationFee > 0;
                navigate(`/competition/${id}`, {
                    state: {
                        registrationSuccess: true,
                        hasFee: hasFee
                    }
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
                <Loader2 className="animate-spin mr-2" size={24} />
                Loading...
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
                Event not found
            </div>
        );
    }

    const hasFee = event.registrationFee && event.registrationFee > 0;
    const totalSteps = hasFee ? 4 : 3;
    const stepLabels = hasFee
        ? ['Team Info', 'Members', 'Problem Statement', 'Review']
        : ['Team Info', 'Members', 'Review'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate(`/competition/${id}`)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
                >
                    <ArrowLeft size={18} /> Back to Event
                </button>

                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden">
                    {/* Event Header */}
                    <div className={`bg-gradient-to-r ${isResubmit ? 'from-amber-600 to-orange-600' : 'from-indigo-600 to-blue-600'} p-6`}>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            {isResubmit ? 'Resubmit Problem Statement' : `Register for ${event.title}`}
                        </h1>
                        {isResubmit && existingRegistration?.problemStatement?.adminRemarks && (
                            <div className="bg-black/20 rounded-lg p-3 mt-3 mb-2">
                                <p className="text-xs text-amber-200 mb-1">Admin Feedback:</p>
                                <p className="text-sm text-white">{existingRegistration.problemStatement.adminRemarks}</p>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-blue-100 text-sm mt-3">
                            <span className="flex items-center gap-1"><Trophy size={14} /> {event.prizePool || 'TBD'}</span>
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.startDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Users size={14} /> {minSize}-{maxSize} members</span>
                            {hasFee && <span className="flex items-center gap-1"><Clock size={14} /> ₹{event.registrationFee}</span>}
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
                        {isResubmit ? (
                            <div className="flex items-center justify-center">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 3 ? 'bg-amber-600 text-white' : 'bg-green-500 text-white'}`}>
                                        {step > 3 ? <CheckCircle size={16} /> : 1}
                                    </div>
                                    <span className="text-sm text-white">Edit Problem Statement</span>
                                    <ChevronRight className="mx-2 text-slate-600" size={16} />
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 4 ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                        2
                                    </div>
                                    <span className={`text-sm ${step === 4 ? 'text-white' : 'text-slate-400'}`}>Review & Submit</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                {stepLabels.map((label, i) => (
                                    <div key={i} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step > i + 1 ? 'bg-green-500 text-white' :
                                            step === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                                        </div>
                                        <span className={`ml-2 text-sm hidden sm:block ${step === i + 1 ? 'text-white' : 'text-slate-400'}`}>
                                            {label}
                                        </span>
                                        {i < stepLabels.length - 1 && <ChevronRight className="mx-2 text-slate-600" size={16} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
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

                        {/* Step 3: Problem Statement (for paid events) */}
                        {step === 3 && hasFee && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                                    <p className="text-amber-300 text-sm">
                                        <strong>📝 Problem Statement Required:</strong> Submit your project idea for admin approval before payment.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <FileText className="inline mr-2" size={16} /> Problem Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.problemStatement.title}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            problemStatement: { ...formData.problemStatement, title: e.target.value }
                                        })}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. AI-Powered Healthcare Assistant"
                                        maxLength={200}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <FileText className="inline mr-2" size={16} /> Problem Description *
                                    </label>
                                    <textarea
                                        value={formData.problemStatement.description}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            problemStatement: { ...formData.problemStatement, description: e.target.value }
                                        })}
                                        rows={5}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Describe your problem statement, the solution you're proposing, and its impact..."
                                        maxLength={2000}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.problemStatement.description.length}/2000 characters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <Code className="inline mr-2" size={16} /> Tech Stack (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.problemStatement.techStack}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            problemStatement: { ...formData.problemStatement, techStack: e.target.value }
                                        })}
                                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. React, Node.js, MongoDB, TensorFlow"
                                        maxLength={500}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Review Step */}
                        {((step === 4 && hasFee) || (step === 3 && !hasFee)) && (
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

                                {hasFee && formData.problemStatement.title && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                                        <h4 className="font-semibold text-white mb-3">Problem Statement</h4>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="text-slate-400">Title:</span> <span className="text-white font-medium">{formData.problemStatement.title}</span></p>
                                            <p className="text-slate-300">{formData.problemStatement.description}</p>
                                            {formData.problemStatement.techStack && (
                                                <p><span className="text-slate-400">Tech Stack:</span> <span className="text-white">{formData.problemStatement.techStack}</span></p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {hasFee ? (
                                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                                        <p className="text-amber-300 text-sm">
                                            ⏳ After submission, your problem statement will be reviewed by the admin.
                                            Once approved, you can proceed to payment of <strong>₹{event.registrationFee}</strong>.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                                        <p className="text-green-300 text-sm">
                                            ✓ Click "Complete Registration" to confirm your team registration
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-between">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-4 py-2 text-slate-300 hover:text-white flex items-center gap-2">
                                <ChevronLeft size={18} /> {isResubmit && step === 3 ? 'Cancel' : 'Back'}
                            </button>
                        ) : (
                            <button onClick={() => navigate(`/competition/${id}`)} className="px-4 py-2 text-slate-300 hover:text-white">
                                Cancel
                            </button>
                        )}

                        {step < totalSteps ? (
                            <button onClick={nextStep} className={`px-6 py-2 ${isResubmit ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'} text-white font-semibold rounded-xl flex items-center gap-2`}>
                                Next <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`px-6 py-2 ${isResubmit ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'} text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50`}
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                {submitting ? 'Submitting...' : (isResubmit ? 'Resubmit for Review' : (hasFee ? 'Submit for Review' : 'Complete Registration'))}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonRegistration;
