import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Trophy, Users, ArrowRight, Tag, Filter, Plus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getEvents } from '../../../services/event.service';
import { useAuth } from '../../../context/AuthContext';

const HackathonList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    // Update local search state if URL param changes
    useEffect(() => {
        const query = searchParams.get('search');
        if (query) {
            setSearchTerm(query);
        }
    }, [searchParams]);

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);
    const slides = [
        "from-indigo-900 via-slate-900 to-slate-900", // Deep Blue
        "from-slate-900 via-purple-900 to-slate-900", // Deep Purple
        "from-slate-900 via-cyan-900 to-slate-900"    // Deep Cyan
    ];

    useEffect(() => {
        const fetchHackathons = async () => {
            setLoading(true);
            try {
                const data = await getEvents();
                if (data && Array.isArray(data)) {
                    setHackathons(data);
                } else if (data && data.data) {
                    setHackathons(data.data);
                }
            } catch (error) {
                console.error("Failed to load hackathons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHackathons();

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredHackathons = hackathons
        .filter(h => {
            const matchesFilter = filter === 'All' || (h.status && h.status.toLowerCase() === filter.toLowerCase());
            const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
            if (!user || !user.interests || user.interests.length === 0) return 0;

            const aMatches = a.tags ? a.tags.some(tag => user.interests.includes(tag)) : false;
            const bMatches = b.tags ? b.tags.some(tag => user.interests.includes(tag)) : false;

            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;
            return 0;
        });

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30 pb-20">

            {/* --- HERO SECTION WITH CAROUSEL --- */}
            <div className="relative w-full h-[450px] flex items-center justify-center overflow-hidden">
                {/* Carousel Backgrounds */}
                {slides.map((gradient, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    />
                ))}

                {/* Overlay Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                {/* Animated Orbs (Persist over slides) */}
                <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                </div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Trophy size={14} className="text-yellow-400" /> Global Developer League 2026
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        Compete. Build. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">Win.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                        Join the world's most innovative hackathons. Push your limits, collaborate with top talent, and turn your ideas into reality.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-lg mx-auto group animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative flex items-center bg-[#0f172a]/80 backdrop-blur-xl rounded-xl border border-white/10 p-2 shadow-2xl">
                            <Search className="ml-4 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for hackathons..."
                                className="w-full bg-transparent text-white px-4 py-2 focus:outline-none placeholder-slate-500"
                            />
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/20">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">

                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="text-indigo-400" /> Upcoming Events
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            {['All', 'Live', 'Upcoming', 'Past'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === f
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {user && (
                            <button
                                onClick={() => navigate('/competition/organize')}
                                className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
                            >
                                <Plus size={18} /> Organize
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading hackathons...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredHackathons.map((hackathon) => (
                            <div key={hackathon._id} className="group relative bg-[#0f172a] border border-white/5 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/20 hover:-translate-y-1">

                                {/* Image / Banner */}
                                <div className={`h-40 w-full bg-slate-800 relative overflow-hidden`}>
                                    {hackathon.thumbnail ? (
                                        <img src={hackathon.thumbnail} alt={hackathon.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900"></div>
                                    )}

                                    <div className="flex justify-between items-start relative z-10 p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20 shadow-lg capitalize ${hackathon.status === 'live' ? 'bg-red-500/80 text-white' :
                                            hackathon.status === 'upcoming' ? 'bg-blue-500/80 text-white' : 'bg-slate-600/80 text-slate-200'
                                            }`}>
                                            {hackathon.status}
                                        </span>
                                    </div>

                                    {/* Live Indicator Dot - Bottom Right */}
                                    {hackathon.status === 'live' && (
                                        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
                                            <span className="text-xs font-bold text-white uppercase tracking-wider drop-shadow-lg bg-red-500/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                                Live
                                            </span>
                                            <div className="relative flex items-center justify-center">
                                                {/* Pulse Ring Animation */}
                                                <span className="absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                                                {/* Static Dot */}
                                                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{hackathon.title}</h3>
                                            <p className="text-slate-400 text-sm line-clamp-2">{hackathon.description}</p>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Trophy size={16} className="text-yellow-500" />
                                            <span className="font-semibold text-slate-200">{hackathon.prizePool || 'TBD'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Users size={16} className="text-blue-400" />
                                            <span>{hackathon.participantCount || 0} Joined</span>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2 text-slate-400 text-sm">
                                            <Calendar size={16} />
                                            <span>{new Date(hackathon.startDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                window.dispatchEvent(new CustomEvent('robot-dog-trigger-angry'));
                                            } else {
                                                navigate(`/competition/${hackathon._id}`);
                                            }
                                        }}
                                        className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-indigo-600 hover:border-indigo-600 transition-all group-hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        View Details <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredHackathons.length === 0 && (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hackathons found</h3>
                        <p className="text-slate-400">Try adjusting your filters or search criteria.</p>
                        <button
                            onClick={() => { setFilter('All'); setSearchTerm(''); }}
                            className="mt-6 px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default HackathonList;
