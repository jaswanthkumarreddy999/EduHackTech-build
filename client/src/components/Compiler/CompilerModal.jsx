import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { X, Play, AlertCircle, Loader2, Terminal } from 'lucide-react';
import './CompilerModal.css';

const CompilerModal = ({ isOpen, onClose }) => {
    const [code, setCode] = useState('print("Hello World")');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [isRunning, setIsRunning] = useState(false);

    // Close on Escape key
    React.useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('');
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (data.output) {
                setOutput(data.output);
            }
            if (data.error) {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to connect to the compiler server. Is it running?');
            console.error(err);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="compiler-overlay">
            <div className="compiler-modal glass-panel animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="compiler-header">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-green-400" />
                        <h2 className="text-lg font-bold text-white">Python Playground</h2>
                    </div>
                    <button onClick={onClose} className="close-btn" title="Close Compiler (Esc)">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="compiler-body">
                    {/* Editor Section */}
                    <div className="editor-section">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 10 }
                            }}
                        />
                    </div>

                    {/* Output Section */}
                    <div className="output-section">
                        <div className="output-header">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output Terminal</span>
                            <button
                                onClick={handleRunCode}
                                disabled={isRunning}
                                className={`run-btn ${isRunning ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isRunning ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Running...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} fill="currentColor" />
                                        Run Code
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="output-console font-mono text-sm">
                            {error ? (
                                <div className="text-red-400 whitespace-pre-wrap flex gap-2 items-start p-2">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            ) : output ? (
                                <div className="text-green-300 whitespace-pre-wrap p-2">{output}</div>
                            ) : (
                                <div className="text-gray-500 italic p-2 select-none">
                                    Click "Run Code" to execute...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompilerModal;
