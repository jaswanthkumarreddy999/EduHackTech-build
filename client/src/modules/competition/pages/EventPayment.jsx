import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Building2, ShieldCheck, Lock, CheckCircle2, ArrowLeft, Trophy, Calendar, AlertCircle } from 'lucide-react';
import { getEvent, checkUserRegistration, completePayment } from '../../../services/event.service';
import { useAuth } from '../../../context/AuthContext';

const EventPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [event, setEvent] = useState(null);
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const eventData = await getEvent(id);
                setEvent(eventData);

                if (eventData?.registrationFee === 0) {
                    navigate(`/competition/${id}`);
                    return;
                }

                // Check registration and approval status
                if (user && token) {
                    const regStatus = await checkUserRegistration(id, token);
                    if (!regStatus.isRegistered) {
                        setError('You need to register first');
                        return;
                    }

                    setRegistration(regStatus.registration);

                    // Check if already paid
                    if (regStatus.registration?.paymentStatus === 'completed') {
                        setPaymentSuccess(true);
                        return;
                    }

                    // Check if problem statement is approved
                    if (regStatus.registration?.problemStatement?.status !== 'approved') {
                        setError('Your problem statement must be approved before payment');
                        return;
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load event data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, navigate, user, token]);

    const handlePayment = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setProcessing(true);
        try {
            // Mock payment delay - in production, integrate real gateway
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Complete payment via API
            await completePayment(id, token);
            setPaymentSuccess(true);
        } catch (error) {
            alert('Payment failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>;
    if (!event) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Event not found</div>;

    // Error Screen (not registered or not approved)
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] flex items-center justify-center px-4 py-12">
                <div className="bg-slate-900/80 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl border border-slate-800 p-10 text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Cannot Process Payment</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(`/competition/${id}`)}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                    >
                        Go Back to Event
                    </button>
                </div>
            </div>
        );
    }

    // Payment Success Screen
    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] flex items-center justify-center px-4 py-12">
                <div className="bg-slate-900/80 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl border border-slate-800 p-10 text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Payment Successful! 🎉</h2>
                    <p className="text-slate-400 mb-6">You are now registered for <span className="text-white font-semibold">{event.title}</span></p>

                    <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Amount Paid</span>
                            <span className="text-white font-semibold">₹{event.registrationFee}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Team Name</span>
                            <span className="text-white">{registration?.teamName || 'Your Team'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Event Date</span>
                            <span className="text-white">{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/competition/${id}`)}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                    >
                        Go to Event Page
                    </button>
                    <p className="text-xs text-slate-500 mt-4">A confirmation email has been sent to your registered email.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] flex items-center justify-center px-4 py-12">
            <div className="bg-slate-900/80 backdrop-blur-xl w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-slate-800">

                {/* LEFT — EVENT INFO */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-10 flex flex-col justify-between">
                    <div>
                        <button onClick={() => navigate(`/competition/${id}`)} className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition">
                            <ArrowLeft size={18} /> Back to Event
                        </button>
                        <h2 className="text-3xl font-extrabold">{event.title}</h2>
                        <p className="mt-3 text-blue-100 line-clamp-3">{event.description}</p>

                        <div className="mt-8 space-y-4">
                            <Feature icon={<Trophy size={18} />} text={`Prize Pool: ${event.prizePool || 'TBD'}`} />
                            <Feature icon={<Calendar size={18} />} text={`${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`} />
                            <Feature icon={<CheckCircle2 size={18} />} text="Instant Registration" />
                            <Feature icon={<CheckCircle2 size={18} />} text="Certificate of Participation" />
                        </div>
                    </div>

                    <div className="mt-10">
                        <p className="text-sm text-blue-100">Registration Fee</p>
                        <h3 className="text-4xl font-extrabold mt-1">₹{event.registrationFee}</h3>
                        <p className="text-xs text-blue-200">One time payment</p>
                    </div>
                </div>

                {/* RIGHT — PAYMENT FORM */}
                <div className="p-10 bg-slate-900">
                    <h3 className="text-2xl font-bold text-white">Payment Details</h3>
                    <p className="text-sm text-slate-400 mt-1">Complete payment for <span className="text-white">{registration?.teamName || 'your team'}</span></p>

                    {/* Payment Method Selection */}
                    <div className="mt-6">
                        <label className="text-sm font-medium text-slate-300 mb-3 block">Payment Method</label>
                        <div className="grid grid-cols-3 gap-3">
                            <PaymentOption
                                icon={<CreditCard size={20} />}
                                label="Card"
                                value="card"
                                selected={paymentMethod === 'card'}
                                onClick={() => setPaymentMethod('card')}
                            />
                            <PaymentOption
                                icon={<Smartphone size={20} />}
                                label="UPI"
                                value="upi"
                                selected={paymentMethod === 'upi'}
                                onClick={() => setPaymentMethod('upi')}
                            />
                            <PaymentOption
                                icon={<Building2 size={20} />}
                                label="Net Banking"
                                value="netbanking"
                                selected={paymentMethod === 'netbanking'}
                                onClick={() => setPaymentMethod('netbanking')}
                            />
                        </div>
                    </div>

                    {/* Payment Form based on method */}
                    <div className="mt-6 space-y-4">
                        {paymentMethod === 'card' && (
                            <>
                                <Input label="Card Holder Name" placeholder="John Doe" />
                                <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Expiry" placeholder="MM/YY" />
                                    <Input label="CVV" placeholder="123" type="password" />
                                </div>
                            </>
                        )}
                        {paymentMethod === 'upi' && (
                            <Input label="UPI ID" placeholder="yourname@upi" />
                        )}
                        {paymentMethod === 'netbanking' && (
                            <div>
                                <label className="text-sm font-medium text-slate-300">Select Bank</label>
                                <select className="mt-1 w-full border border-slate-700 bg-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Choose your bank</option>
                                    <option value="sbi">State Bank of India</option>
                                    <option value="hdfc">HDFC Bank</option>
                                    <option value="icici">ICICI Bank</option>
                                    <option value="axis">Axis Bank</option>
                                    <option value="kotak">Kotak Bank</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="mt-8 w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            'Processing...'
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Pay ₹{event.registrationFee} & Register
                            </>
                        )}
                    </button>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <Lock className="w-4 h-4" />
                        Secure encrypted payment
                    </div>

                    <div className="mt-1 flex items-center justify-center gap-2 text-xs text-green-500">
                        <ShieldCheck className="w-4 h-4" />
                        Trusted Gateway
                    </div>
                </div>
            </div>
        </div>
    );
};

/* SMALL COMPONENTS */

const Feature = ({ icon, text }) => (
    <div className="flex items-center gap-3 text-sm">
        <span className="text-green-300">{icon}</span>
        <span>{text}</span>
    </div>
);

const Input = ({ label, placeholder, type = 'text' }) => (
    <div>
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="mt-1 w-full border border-slate-700 bg-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

const PaymentOption = ({ icon, label, value, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition ${selected
            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
            }`}
    >
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </button>
);

export default EventPayment;
