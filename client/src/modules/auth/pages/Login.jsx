import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowRight, Loader2, User, Key, Mail, ShieldCheck } from 'lucide-react';
import Logo from '../../../components/assets/EduhackTech.jpeg';

import API_CONFIG from '../../../services/api.config';

const Login = () => {
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    // State
    // Steps: 'email' -> 'otp-login' (Existing) OR 'name-input' -> 'otp-register' (New)
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [displayOtp, setDisplayOtp] = useState(null);

    // Auto-hide OTP toast after 4 seconds
    useEffect(() => {
        if (displayOtp) {
            const timer = setTimeout(() => {
                setDisplayOtp(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [displayOtp]);

    // 1. Check Email Logic
    const handleCheckEmail = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.checkEmail}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            setTimeout(async () => {
                if (data.exists) {
                    // EXISTING USER: Send OTP immediately and go to Login
                    await sendOtpToUser();
                    setStep('otp-login');
                } else {
                    // NEW USER: Ask for Name first
                    setStep('name-input');
                }
                setIsLoading(false);
            }, 600);
        } catch (err) {
            setError('Connection failed.');
            setIsLoading(false);
        }
    };

    // Helper: Send OTP
    const sendOtpToUser = async () => {
        const res = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.sendOtp}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        // Display OTP toast for demo purposes
        if (data.otp) {
            setDisplayOtp(data.otp);
        }
    };

    // 2. Handle Name Submit (For New Users)
    const handleNameSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Send OTP now that we have the name
        await sendOtpToUser();
        setIsLoading(false);
        setStep('otp-register');
    };

    // 3. Login with OTP (Existing Users)
    const handleLoginOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();

            if (data.success) {
                loginUser(data.user, data.token);
                navigate('/');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Register with OTP (New Users)
    const handleRegisterOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.register}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, otp })
            });
            const data = await res.json();
            if (data.success) {
                loginUser(data.user, data.token);
                navigate('/');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0f172a] selection:bg-blue-500/30">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                {/* Gradient Background Layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900"></div>

                {/* Animated Blobs - Brighter for Contrast */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
                <div className="absolute top-[20%] left-[50%] w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[90px] animate-pulse delay-1000"></div>
            </div>

            {/* Glassmorphism OTP Toast */}
            {displayOtp && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
                    <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Key className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-white/70 font-medium">Your OTP Code</p>
                                <p className="text-2xl font-bold text-white tracking-[0.3em] font-mono">{displayOtp}</p>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-shrink"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Refined Card - Solid White, Professional */}
            <div className="relative z-10 w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-8 md:p-10 transition-all duration-300">

                {/* Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 mb-4 relative">
                        <img
                            src={Logo}
                            alt="EduHackTech Logo"
                            className="relative w-full h-full object-cover rounded-2xl shadow-md"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {step === 'email' && 'Welcome Back'}
                        {step === 'name-input' && 'Create Profile'}
                        {(step === 'otp-login' || step === 'otp-register') && 'Verify Login'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        {step === 'email' ? 'Enter your credentials to access your account' : email}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2 animate-shake">
                        <ShieldCheck size={16} /> {error}
                    </div>
                )}

                {/* Form Content */}
                <div className="relative">
                    {/* STEP 1: EMAIL */}
                    {step === 'email' && (
                        <form onSubmit={handleCheckEmail} className="flex flex-col gap-5 animate-fadeIn">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors h-5 w-5" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 font-medium"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button disabled={isLoading} className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Continue'}
                            </button>
                        </form>
                    )}

                    {/* STEP 2: NAME (Only for New Users) */}
                    {step === 'name-input' && (
                        <form onSubmit={handleNameSubmit} className="flex flex-col gap-5 animate-fadeIn">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors h-5 w-5" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 font-medium"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button disabled={isLoading} className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
                            </button>
                        </form>
                    )}

                    {/* STEP 3: OTP (Shared for Login & Register) */}
                    {(step === 'otp-login' || step === 'otp-register') && (
                        <form onSubmit={step === 'otp-login' ? handleLoginOtp : handleRegisterOtp} className="flex flex-col gap-5 animate-fadeIn">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">One-Time Password</label>
                                <div className="relative group">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors h-5 w-5" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 tracking-[0.5em] font-mono text-center font-bold text-lg"
                                        placeholder="••••"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Secure Login'}
                            </button>
                            <button type="button" onClick={() => setStep('email')} className="text-slate-500 text-xs font-medium hover:text-blue-600 transition-colors w-max mx-auto">
                                Use a different email address
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Protected by EduHackTech Security</p>
                </div>

            </div>
        </div>
    );
};

export default Login;