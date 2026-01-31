import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class GlobalErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-950/20 px-4">
                    <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-red-600 p-8 text-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
                                <AlertTriangle className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                                System Error
                            </h2>
                        </div>

                        <div className="p-8 text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Oops! Something went wrong
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                We've encountered an unexpected issue while rendering this page. Don't worry, we've logged the problem and are looking into it.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all active:scale-95 w-full sm:w-auto"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Try Again
                                </button>

                                <button
                                    onClick={this.handleReset}
                                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95 w-full sm:w-auto"
                                >
                                    <Home className="w-4 h-4" />
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
