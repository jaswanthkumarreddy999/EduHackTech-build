import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, Home, ArrowLeft } from 'lucide-react';

const UnderProgress = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Under Development 🚧
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    This feature is currently under construction. We're working hard to bring it to you soon! Hang tight! 🐾✨
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-500/20 w-full sm:w-auto"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 w-full sm:w-auto"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnderProgress;
