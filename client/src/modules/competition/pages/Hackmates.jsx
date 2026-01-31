import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Code2,
    Palette,
    Bot,
    Mic2,
    Monitor,
    Loader2,
    MessageCircle,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getHackmates } from '../../../services/teamFinder.service';
import { getOrCreateConversation } from '../../../services/chat.service';
import ChatModal from '../../../components/competition/ChatModal';

const ROLES = [
    { value: 'Frontend', icon: Monitor },
    { value: 'Backend', icon: Code2 },
    { value: 'Full Stack', icon: Monitor },
    { value: 'ML / AI', icon: Bot },
    { value: 'UI/UX', icon: Palette },
    { value: 'Pitch / Business', icon: Mic2 }
];
const ROLE_ICONS = Object.fromEntries(ROLES.map(({ value, icon }) => [value, icon]));

const Hackmates = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [hackmates, setHackmates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chatWith, setChatWith] = useState(null);

    useEffect(() => {
        if (!user || !token) {
            navigate('/login');
            return;
        }
        loadHackmates();
    }, [user, token]);

    const loadHackmates = async () => {
        setLoading(true);
        try {
            const data = await getHackmates(token);
            setHackmates(data || []);
        } catch (err) {
            console.error('Failed to load hackmates', err);
            setHackmates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChat = async (hackmate) => {
        try {
            const conv = await getOrCreateConversation(hackmate.user._id, token);
            setChatWith({ user: hackmate.user, conversation: conv });
        } catch (err) {
            console.error('Failed to open chat', err);
        }
    };

    const formatLastActive = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const diff = Date.now() - d.getTime();
        if (diff < 60 * 60 * 1000) return 'Just now';
        if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
        if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
        return d.toLocaleDateString();
    };

    if (!user || !token) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Hackmates</h1>
                    <p className="text-slate-400 mt-1">Your connected teammates — ready to build together</p>
                </div>

                {hackmates.length === 0 ? (
                    <div className="p-12 bg-slate-800/30 border border-slate-700 rounded-2xl text-center text-slate-400">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No hackmates yet</p>
                        <p className="text-sm mt-2">Connect with people on the Team Finder to add them here.</p>
                        <button
                            onClick={() => navigate('/team-finder')}
                            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium inline-flex items-center gap-2 transition"
                        >
                            Find Teammates <ExternalLink size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {hackmates.map((hackmate) => {
                            const card = hackmate.teamFinderCard;
                            const displayUser = hackmate.user;
                            const Icon = card ? (ROLE_ICONS[card.role] || Code2) : Code2;
                            return (
                                <div
                                    key={displayUser._id}
                                    className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-indigo-500/50 transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-indigo-600/30 flex items-center justify-center flex-shrink-0">
                                                <Icon className="text-indigo-400" size={28} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{displayUser?.name || 'Anonymous'}</h3>
                                                {card ? (
                                                    <>
                                                        <p className="text-slate-400 text-sm">
                                                            {card.role}
                                                            {card.secondaryRole && ` + ${card.secondaryRole}`} • {card.level}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {card.interests?.slice(0, 3).map((i) => (
                                                                <span key={i} className="px-2 py-0.5 bg-slate-700 rounded-lg text-xs text-slate-300">{i}</span>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {card.availability?.slice(0, 3).map((a) => (
                                                                <span key={a} className="px-2 py-0.5 bg-slate-600/50 rounded-lg text-xs text-slate-400">{a}</span>
                                                            ))}
                                                        </div>
                                                        {card.bio && (
                                                            <p className="text-slate-400 text-sm mt-2 italic">&quot;{card.bio}&quot;</p>
                                                        )}
                                                        <p className="text-slate-500 text-xs mt-1">
                                                            Last active: {formatLastActive(card.lastActiveAt)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-slate-500 text-sm">No Team Finder card</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleOpenChat(hackmate)}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium flex items-center gap-2 transition"
                                            >
                                                <MessageCircle size={18} /> Chat
                                            </button>
                                            <button
                                                onClick={() => navigate('/team-finder')}
                                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium flex items-center gap-2 transition"
                                            >
                                                <ExternalLink size={18} /> Find More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {chatWith && (
                <ChatModal
                    isOpen={!!chatWith}
                    onClose={() => { setChatWith(null); loadHackmates(); }}
                    otherUser={chatWith.user}
                    conversation={chatWith.conversation}
                    currentUser={user}
                    token={token}
                    onMarkRead={() => loadHackmates()}
                />
            )}
        </div>
    );
};

export default Hackmates;
