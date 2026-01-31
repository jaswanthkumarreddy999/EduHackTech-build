import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
} from "lucide-react";

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handlePayment = () => {
    // ✅ later this will be backend API
    alert("Payment Successful 🎉 You are Enrolled!");

    // go back to learning page
    navigate("/learning");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT — COURSE INFO */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">Course Enrollment</h2>
            <p className="mt-3 text-blue-100">
              Complete payment to start learning 🚀
            </p>

            <div className="mt-8 space-y-4">
              <Feature text="Lifetime Access" />
              <Feature text="Certificate Included" />
              <Feature text="Real Projects" />
              <Feature text="Hackathon Ready Skills" />
            </div>
          </div>

          <div className="mt-10">
            <p className="text-sm text-blue-100">Total Amount</p>
            <h3 className="text-4xl font-extrabold mt-1">₹999</h3>
            <p className="text-xs text-blue-200">One time payment</p>
          </div>
        </div>

        {/* RIGHT — PAYMENT FORM */}
        <div className="p-10">
          <h3 className="text-2xl font-bold">Payment Details</h3>
          <p className="text-sm text-gray-500 mt-1">Course ID: {id}</p>

          <div className="mt-6 space-y-4">
            <Input label="Card Holder Name" placeholder="John Doe" />
            <Input label="Card Number" placeholder="1234 5678 9012 3456" />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Expiry" placeholder="MM/YY" />
              <Input label="CVV" placeholder="123" type="password" />
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="mt-8 w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-lg"
          >
            <CreditCard className="w-5 h-5" />
            Pay & Enroll
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock className="w-4 h-4" />
            Secure encrypted payment
          </div>

          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-green-600">
            <ShieldCheck className="w-4 h-4" />
            Trusted Gateway
          </div>
        </div>
      </div>
    </div>
  );
};

/* SMALL COMPONENTS */

const Feature = ({ text }) => (
  <div className="flex items-center gap-2 text-sm">
    <CheckCircle2 className="w-5 h-5 text-green-300" />
    <span>{text}</span>
  </div>
);

const Input = ({ label, placeholder, type = "text" }) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="mt-1 w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default Payment;
