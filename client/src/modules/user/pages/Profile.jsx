import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, MapPin, Briefcase, GraduationCap, Code, Target, Link2, Edit2, Save, X,
    Loader2, Plus, Trash2, Github, Linkedin, Twitter, Globe, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/auth';

const Profile = () => {
    const navigate = useNavigate();
    const { user, token, loginUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editSection, setEditSection] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadProfile();
    }, [user, token]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
                setFormData(data.data);
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            setSaving(true);
            const res = await fetch(`${API_BASE}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setProfile(data.data);
                setEditSection(null);
                // Update auth context with new user data
                loginUser(token, { ...user, name: data.data.name });
            } else {
                alert(data.message || 'Failed to save');
            }
        } catch (err) {
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedField = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const addSkill = (skill) => {
        if (skill && !formData.skills?.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                skills: [...(prev.skills || []), skill]
            }));
        }
    };

    const removeSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills?.filter(s => s !== skill) || []
        }));
    };

    const addInterest = (interest) => {
        if (interest && !formData.interests?.includes(interest)) {
            setFormData(prev => ({
                ...prev,
                interests: [...(prev.interests || []), interest]
            }));
        }
    };

    const removeInterest = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests?.filter(i => i !== interest) || []
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const completion = profile?.profileCompletion || 0;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Header Card */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white border-4 border-white/30">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    profile?.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full text-blue-600 shadow-lg hover:bg-gray-100 transition">
                                <Edit2 size={14} />
                            </button>
                        </div>

                        {/* Name & Headline */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white">{profile?.name}</h1>
                            <p className="text-blue-100 mt-1">{profile?.headline || 'Add a headline to describe yourself'}</p>
                            {profile?.location?.city && (
                                <p className="text-blue-200 text-sm mt-2 flex items-center justify-center md:justify-start gap-1">
                                    <MapPin size={14} /> {profile.location.city}{profile.location.country && `, ${profile.location.country}`}
                                </p>
                            )}
                        </div>

                        {/* Completion Badge */}
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                            <div className="relative w-16 h-16 mx-auto">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" strokeWidth="4" fill="none" />
                                    <circle cx="32" cy="32" r="28" stroke="white" strokeWidth="4" fill="none"
                                        strokeDasharray={`${completion * 1.76} 176`} strokeLinecap="round" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{completion}%</span>
                            </div>
                            <p className="text-xs text-blue-100 mt-2">Profile Complete</p>
                        </div>
                    </div>
                </div>

                {/* Basic Info Section */}
                <ProfileSection
                    title="Basic Information"
                    icon={<User size={20} />}
                    isEditing={editSection === 'basic'}
                    onEdit={() => setEditSection('basic')}
                    onSave={saveProfile}
                    onCancel={() => { setEditSection(null); setFormData(profile); }}
                    saving={saving}
                >
                    {editSection === 'basic' ? (
                        <div className="space-y-4">
                            <Input label="Full Name" value={formData.name || ''} onChange={(v) => updateField('name', v)} />
                            <Input label="Headline" value={formData.headline || ''} onChange={(v) => updateField('headline', v)} placeholder="e.g. Full Stack Developer | AI Enthusiast" />
                            <TextArea label="Bio" value={formData.bio || ''} onChange={(v) => updateField('bio', v)} placeholder="Tell us about yourself..." />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="City" value={formData.location?.city || ''} onChange={(v) => updateNestedField('location', 'city', v)} />
                                <Input label="Country" value={formData.location?.country || ''} onChange={(v) => updateNestedField('location', 'country', v)} />
                            </div>
                            <Input label="Phone" value={formData.phone || ''} onChange={(v) => updateField('phone', v)} />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <InfoRow label="Bio" value={profile?.bio || 'Not added'} />
                            <InfoRow label="Location" value={profile?.location?.city ? `${profile.location.city}, ${profile.location.country}` : 'Not added'} />
                            <InfoRow label="Phone" value={profile?.phone || 'Not added'} />
                        </div>
                    )}
                </ProfileSection>

                {/* Professional Info */}
                <ProfileSection
                    title="Professional Experience"
                    icon={<Briefcase size={20} />}
                    isEditing={editSection === 'professional'}
                    onEdit={() => setEditSection('professional')}
                    onSave={saveProfile}
                    onCancel={() => { setEditSection(null); setFormData(profile); }}
                    saving={saving}
                >
                    {editSection === 'professional' ? (
                        <div className="space-y-4">
                            <Input label="Current Role" value={formData.professional?.currentRole || ''} onChange={(v) => updateNestedField('professional', 'currentRole', v)} placeholder="e.g. Software Engineer" />
                            <Input label="Company/Organization" value={formData.professional?.company || ''} onChange={(v) => updateNestedField('professional', 'company', v)} />
                            <Input label="Years of Experience" type="number" value={formData.professional?.yearsOfExperience || 0} onChange={(v) => updateNestedField('professional', 'yearsOfExperience', parseInt(v))} />
                            <Input label="Portfolio URL" value={formData.professional?.portfolioUrl || ''} onChange={(v) => updateNestedField('professional', 'portfolioUrl', v)} />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <InfoRow label="Current Role" value={profile?.professional?.currentRole || 'Not added'} />
                            <InfoRow label="Company" value={profile?.professional?.company || 'Not added'} />
                            <InfoRow label="Experience" value={profile?.professional?.yearsOfExperience ? `${profile.professional.yearsOfExperience} years` : 'Not added'} />
                            <InfoRow label="Portfolio" value={profile?.professional?.portfolioUrl || 'Not added'} isLink />
                        </div>
                    )}
                </ProfileSection>

                {/* Skills */}
                <ProfileSection
                    title="Skills"
                    icon={<Code size={20} />}
                    isEditing={editSection === 'skills'}
                    onEdit={() => setEditSection('skills')}
                    onSave={saveProfile}
                    onCancel={() => { setEditSection(null); setFormData(profile); }}
                    saving={saving}
                >
                    {editSection === 'skills' ? (
                        <div>
                            <TagInput
                                tags={formData.skills || []}
                                onAdd={addSkill}
                                onRemove={removeSkill}
                                placeholder="Add a skill (e.g. React, Python, AWS)"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profile?.skills?.length > 0 ? (
                                profile.skills.map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{skill}</span>
                                ))
                            ) : (
                                <p className="text-slate-500">No skills added yet</p>
                            )}
                        </div>
                    )}
                </ProfileSection>

                {/* Interests */}
                <ProfileSection
                    title="Interests & Topics"
                    icon={<Target size={20} />}
                    isEditing={editSection === 'interests'}
                    onEdit={() => setEditSection('interests')}
                    onSave={saveProfile}
                    onCancel={() => { setEditSection(null); setFormData(profile); }}
                    saving={saving}
                >
                    {editSection === 'interests' ? (
                        <div>
                            <TagInput
                                tags={formData.interests || []}
                                onAdd={addInterest}
                                onRemove={removeInterest}
                                placeholder="Add an interest (e.g. AI, Blockchain, FinTech)"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {profile?.interests?.length > 0 ? (
                                profile.interests.map((interest, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">{interest}</span>
                                ))
                            ) : (
                                <p className="text-slate-500">No interests added yet</p>
                            )}
                        </div>
                    )}
                </ProfileSection>

                {/* Learning Preferences */}
                <ProfileSection
                    title="Learning Preferences"
                    icon={<GraduationCap size={20} />}
                    isEditing={editSection === 'learning'}
                    onEdit={() => setEditSection('learning')}
                    onSave={saveProfile}
                    onCancel={() => { setEditSection(null); setFormData(profile); }}
                    saving={saving}
                >
                    {editSection === 'learning' ? (
                        <div className="space-y-4">
                            <Select
                                label="Experience Level"
                                value={formData.learningPreferences?.experienceLevel || 'beginner'}
                                onChange={(v) => updateNestedField('learningPreferences', 'experienceLevel', v)}
                                options={[
                                    { value: 'beginner', label: 'Beginner' },
                                    { value: 'intermediate', label: 'Intermediate' },
                                    { value: 'advanced', label: 'Advanced' },
                                    { value: 'expert', label: 'Expert' }
                                ]}
                            />
                            <Select
                                label="Preferred Learning Style"
                                value={formData.learningPreferences?.preferredLearningStyle || 'mixed'}
                                onChange={(v) => updateNestedField('learningPreferences', 'preferredLearningStyle', v)}
                                options={[
                                    { value: 'video', label: 'Video Tutorials' },
                                    { value: 'reading', label: 'Reading/Documentation' },
                                    { value: 'hands-on', label: 'Hands-on Projects' },
                                    { value: 'mixed', label: 'Mixed/All Formats' }
                                ]}
                            />
                            <Input
                                label="Hours Available Per Week"
                                type="number"
                                value={formData.learningPreferences?.availabilityHoursPerWeek || 5}
                                onChange={(v) => updateNestedField('learningPreferences', 'availabilityHoursPerWeek', parseInt(v))}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <InfoRow label="Experience Level" value={profile?.learningPreferences?.experienceLevel || 'Beginner'} className="capitalize" />
                            <InfoRow label="Learning Style" value={profile?.learningPreferences?.preferredLearningStyle || 'Mixed'} className="capitalize" />
                            <InfoRow label="Availability" value={`${profile?.learningPreferences?.availabilityHoursPerWeek || 5} hours/week`} />
                        </div>
                    )}
                </ProfileSection>

                {/* Social Links */}
                <ProfileSection
                    title="Social Links"
                    icon={<Link2 size={20} />}
                    isEditing={editSection === 'social'}
                    onEdit={() => setEditSection('social')}
                    onSave={saveProfile}
                    onCancel={() => { setEditSection(null); setFormData(profile); }}
                    saving={saving}
                >
                    {editSection === 'social' ? (
                        <div className="space-y-4">
                            <Input label="GitHub" value={formData.socialLinks?.github || ''} onChange={(v) => updateNestedField('socialLinks', 'github', v)} placeholder="https://github.com/username" icon={<Github size={16} />} />
                            <Input label="LinkedIn" value={formData.socialLinks?.linkedin || ''} onChange={(v) => updateNestedField('socialLinks', 'linkedin', v)} placeholder="https://linkedin.com/in/username" icon={<Linkedin size={16} />} />
                            <Input label="Twitter" value={formData.socialLinks?.twitter || ''} onChange={(v) => updateNestedField('socialLinks', 'twitter', v)} placeholder="https://twitter.com/username" icon={<Twitter size={16} />} />
                            <Input label="Website" value={formData.socialLinks?.website || ''} onChange={(v) => updateNestedField('socialLinks', 'website', v)} placeholder="https://yourwebsite.com" icon={<Globe size={16} />} />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            {profile?.socialLinks?.github && <SocialLink icon={<Github size={20} />} url={profile.socialLinks.github} label="GitHub" />}
                            {profile?.socialLinks?.linkedin && <SocialLink icon={<Linkedin size={20} />} url={profile.socialLinks.linkedin} label="LinkedIn" />}
                            {profile?.socialLinks?.twitter && <SocialLink icon={<Twitter size={20} />} url={profile.socialLinks.twitter} label="Twitter" />}
                            {profile?.socialLinks?.website && <SocialLink icon={<Globe size={20} />} url={profile.socialLinks.website} label="Website" />}
                            {!profile?.socialLinks?.github && !profile?.socialLinks?.linkedin && !profile?.socialLinks?.twitter && !profile?.socialLinks?.website && (
                                <p className="text-slate-500">No social links added yet</p>
                            )}
                        </div>
                    )}
                </ProfileSection>
            </div>
        </div>
    );
};

/* ========== SUB-COMPONENTS ========== */

const ProfileSection = ({ title, icon, children, isEditing, onEdit, onSave, onCancel, saving }) => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                {icon} {title}
            </h3>
            {isEditing ? (
                <div className="flex gap-2">
                    <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition">
                        <X size={18} />
                    </button>
                    <button onClick={onSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50">
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                    </button>
                </div>
            ) : (
                <button onClick={onEdit} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
                    <Edit2 size={18} />
                </button>
            )}
        </div>
        {children}
    </div>
);

const Input = ({ label, value, onChange, placeholder, type = 'text', icon }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        <div className="relative">
            {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 ${icon ? 'pl-10' : ''}`}
            />
        </div>
    </div>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
    </div>
);

const Select = ({ label, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const TagInput = ({ tags, onAdd, onRemove, placeholder }) => {
    const [input, setInput] = useState('');

    const handleAdd = () => {
        if (input.trim()) {
            onAdd(input.trim());
            setInput('');
        }
    };

    return (
        <div>
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                    <Plus size={18} />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-slate-800 text-white rounded-full text-sm">
                        {tag}
                        <button onClick={() => onRemove(tag)} className="text-slate-400 hover:text-red-400 transition">
                            <X size={14} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

const InfoRow = ({ label, value, isLink, className = '' }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
        <span className="text-slate-400">{label}</span>
        {isLink && value !== 'Not added' ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">{value}</a>
        ) : (
            <span className={`text-white ${className}`}>{value}</span>
        )}
    </div>
);

const SocialLink = ({ icon, url, label }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition"
    >
        {icon} {label}
    </a>
);

export default Profile;
