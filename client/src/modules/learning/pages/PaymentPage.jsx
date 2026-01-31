import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    CreditCard,
    Lock,
    ShieldCheck,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Loader2,
    Smartphone,
    Globe
} from "lucide-react";
import { getCourse } from "../../../services/course.service";
import { enrollInCourse } from "../../../services/enrollment.service";
import { useAuth } from "../../../context/AuthContext";

const PaymentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("card"); // card, upi, netbanking

    // Mock form state
    const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "", name: "" });
    const [upiId, setUpiId] = useState("");

    useEffect(() => {
        const loadCourse = async () => {
            try {
                setLoading(true);
                const data = await getCourse(id);
                if (!data) throw new Error("Course not found");
                setCourse(data);
            } catch (err) {
                setError(err.message || "Failed to load course details");
            } finally {
                setLoading(false);
            }
        };
        loadCourse();
    }, [id]);

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);

        // Simulate payment processing delay
        setTimeout(async () => {
            try {
                // In a real app, you would integrate Stripe/Razorpay here
                // For now, we assume payment success and proceed to enroll

                await enrollInCourse(id, token);

                // Success! Redirect to course or dashboard
                alert("Payment Successful! You are now enrolled.");
                // Success! Redirect to course or dashboard
                alert("Payment Successful! You are now enrolled.");
                navigate(`/course/${id}/learn`);
            } catch (err) {
                alert(err.message || "Enrollment failed after payment. Please contact support.");
            } finally {
                setProcessing(false);
            }
        }, 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-gray-600">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <p className="text-xl mb-4">{error || 'Something went wrong'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const price = course.price || 0;
    const tax = price * 0.18; // 18% GST assumption
    const total = price + tax;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition"
                >
                    <ArrowLeft size={20} /> Back to Course
                </button>

                <div className="grid lg:grid-cols-2 gap-12">

                    {/* LEFT COLUMN: Payment Details */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <ShieldCheck className="text-green-600" size={24} />
                                    Secure Checkout
                                </h2>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700">Select Payment Method</h3>

                                {/* Payment Methods Tabs */}
                                <div className="grid grid-cols-3 gap-3 mb-8">
                                    <MethodTab
                                        active={paymentMethod === 'card'}
                                        onClick={() => setPaymentMethod('card')}
                                        icon={<CreditCard size={20} />}
                                        label="Card"
                                    />
                                    <MethodTab
                                        active={paymentMethod === 'upi'}
                                        onClick={() => setPaymentMethod('upi')}
                                        icon={<Smartphone size={20} />}
                                        label="UPI"
                                    />
                                    <MethodTab
                                        active={paymentMethod === 'netbanking'}
                                        onClick={() => setPaymentMethod('netbanking')}
                                        icon={<Globe size={20} />}
                                        label="Net Banking"
                                    />
                                </div>

                                {/* Forms based on selection */}
                                <form onSubmit={handlePayment}>
                                    {paymentMethod === 'card' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="0000 0000 0000 0000"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                        required
                                                    />
                                                    <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC/CVV</label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="123"
                                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                            required
                                                        />
                                                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'upi' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                                                <input
                                                    type="text"
                                                    placeholder="username@bank"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Verify on your UPI app</p>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod === 'netbanking' && (
                                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <Globe size={32} className="mx-auto mb-2 opacity-50" />
                                            <p>Redirect to bank portal securely</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full mt-8 bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay ${total.toFixed(2)}
                                            </>
                                        )}
                                    </button>

                                    <div className="mt-4 text-center">
                                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                            <Lock size={12} /> SSL Encrypted Payment
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Order Summary</h3>

                            <div className="flex gap-4 mb-6">
                                {course.thumbnail ? (
                                    <img src={course.thumbnail} alt={course.title} className="w-24 h-16 object-cover rounded-lg bg-gray-100" />
                                ) : (
                                    <div className="w-24 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg" />
                                )}
                                <div>
                                    <h4 className="font-semibold text-gray-800 line-clamp-2">{course.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1 capitalize">{course.level} Level</p>
                                </div>
                            </div>

                            <div className="space-y-3 py-6 border-t border-b border-gray-100">
                                <div className="flex justify-between text-gray-600">
                                    <span>Price</span>
                                    <span>${price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (18% GST)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 mb-8">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-blue-600">${total.toFixed(2)}</span>
                            </div>

                            <div className="space-y-3">
                                <FeatureItem text="Instant Access" />
                                <FeatureItem text="Lifetime Updates" />
                                <FeatureItem text="Premium Support" />
                                <FeatureItem text="30-Day Money Back Guarantee" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const MethodTab = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all ${active
            ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
            : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-600'
            }`}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
);

const FeatureItem = ({ text }) => (
    <div className="flex items-center gap-2 text-sm text-gray-500">
        <CheckCircle size={16} className="text-green-500" />
        <span>{text}</span>
    </div>
);

export default PaymentPage;
