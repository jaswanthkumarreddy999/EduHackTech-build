import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { post, put } from '../../services/api.client';
import { MessageCircle, X, Send, Smile } from 'lucide-react';
import './RobotPetDog.css';

const RobotPetDog = () => {
    const { user, token, loginUser } = useAuth();
    const navigate = useNavigate();
    const [showDialogue, setShowDialogue] = useState(false);
    const [dialogueText, setDialogueText] = useState('');
    const [showInterests, setShowInterests] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isAngry, setIsAngry] = useState(false);

    const [hasDismissedInterests, setHasDismissedInterests] = useState(false);

    // Pet Gesture State
    const [petState, setPetState] = useState('active'); // 'active' or 'watching'
    const clickTimer = useRef(null);

    // Chat State
    const [showChat, setShowChat] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! How can I help you today? I know a lot about career growth and tech!", sender: 'bot' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const domains = [
        'Web Development', 'Mobile Apps', 'AI/ML', 'Blockchain',
        'Cybersecurity', 'Cloud Computing', 'Data Science', 'IoT',
        'Game Dev', 'DevOps', 'UI/UX Design', 'AR/VR'
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, showChat]);

    // Global trigger for angry state
    useEffect(() => {
        const handleAngryTrigger = () => {
            if (!user) {
                setIsAngry(true);
                setDialogueText("GRRR! You can't see this unless you're one of my humans! Log in or Register first! 🦴");
                setShowDialogue(true);
                setIsVisible(true);
                setPetState('active'); // Ensure active if triggered

                // Redirect after a delay
                setTimeout(() => {
                    navigate('/login');
                    // Reset after redirecting
                    setTimeout(() => {
                        setIsAngry(false);
                        setShowDialogue(false);
                    }, 2000);
                }, 3000);
            }
        };

        window.addEventListener('robot-dog-trigger-angry', handleAngryTrigger);
        return () => window.removeEventListener('robot-dog-trigger-angry', handleAngryTrigger);
    }, [user, navigate]);

    // Visibility Logic - Always visible for logged-in users
    useEffect(() => {
        if (!user) {
            // For guests, always visible to remind them
            setIsVisible(true);
        } else if (user && (!user.interests || user.interests.length === 0) && !hasDismissedInterests) {
            // For new users without interests, show the modal directly and keep dog visible
            setIsVisible(true);
            setShowInterests(true);
        } else {
            // For logged-in users with interests, keep visible
            setIsVisible(true);
        }
    }, [user, showChat, hasDismissedInterests]);

    useEffect(() => {
        // Dialogue logic only if active
        if (petState === 'watching') {
            setShowDialogue(false);
            return;
        }

        // Initial State Logic
        if (!user) {
            if (!isAngry) {
                setDialogueText("Woof! You look new here! Why not log in or register to join the fun?");
                setShowDialogue(true);
            }
        } else if (user && (!user.interests || user.interests.length === 0) && !hasDismissedInterests) {
            setDialogueText("Woof woof! I want to show you the best stuff. What are you interested in? Pick 3!");
            setShowDialogue(true);
        } else {
            // If chat is NOT open, do the normal dialogue logic
            if (!showChat) {
                setDialogueText("I've sniffed out some great courses and hackathons for you! Check them out at the top!");
                const timer = setTimeout(() => setShowDialogue(false), 5000);
                return () => clearTimeout(timer);
            } else {
                setShowDialogue(false);
            }
        }
    }, [user, isAngry, showChat, hasDismissedInterests, petState]);

    const handleDogClick = (e) => {
        // Prevent default to avoid selection/etc
        if (e.detail === 1) {
            // Single Click Logic
            clickTimer.current = setTimeout(() => {
                if (!user) {
                    window.dispatchEvent(new CustomEvent('robot-dog-trigger-angry'));
                } else if (user && (!user.interests || user.interests.length === 0) && !hasDismissedInterests) {
                    setPetState('active');
                    setShowInterests(true);
                } else {
                    // Activate and Toggle Chat
                    if (petState === 'watching') {
                        setPetState('active');
                        // Optional: show a small greeting dialogue when appearing
                        setDialogueText("I'm back! How can I help? 🐾");
                        setShowDialogue(true);
                        setTimeout(() => setShowDialogue(false), 3000);
                    } else {
                        setShowChat(!showChat);
                        setShowDialogue(false);
                    }
                }
            }, 250); // Small delay to check for double click
        }
    };

    const handleDogDoubleClick = () => {
        // Clear single click timer
        if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
        }

        // Double Click Logic - HIDE
        setPetState('watching');
        setShowChat(false);
        setShowDialogue(false);
        setShowInterests(false);
    };

    const toggleInterest = (domain) => {
        if (selectedInterests.includes(domain)) {
            setSelectedInterests(selectedInterests.filter(i => i !== domain));
        } else if (selectedInterests.length < 3) {
            setSelectedInterests([...selectedInterests, domain]);
        }
    };

    const saveInterests = async () => {
        if (selectedInterests.length !== 3) return;

        setIsSaving(true);
        try {
            const response = await put('/auth/profile', { interests: selectedInterests }, token);
            if (response.success) {
                // Update local user state
                const updatedUser = { ...user, interests: selectedInterests };
                loginUser(updatedUser, token);
                setShowInterests(false);
                setDialogueText("Awesome! I've updated your feed! I'll pop up when you need more help! 🐾✨");
                setShowDialogue(true);
            }
        } catch (error) {
            console.error('Failed to save interests:', error);
        } finally {
            setIsSaving(false);
        }
    };

    /* --- Chat Logic with STREAMING --- */
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = inputMessage;
        // Optimistic Update
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setInputMessage('');
        setIsTyping(true);

        // Add placeholder for bot response
        const botMessageIndex = messages.length + 1;
        setMessages(prev => [...prev, { text: '', sender: 'bot', streaming: true }]);

        try {
            // Use fetch with ReadableStream for streaming POST requests
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    history: messages
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedText = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                // Decode the chunk
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.token && !data.done) {
                                // Append token to streaming message
                                streamedText += data.token;
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[botMessageIndex] = { text: streamedText, sender: 'bot', streaming: true };
                                    return updated;
                                });
                            }

                            if (data.done) {
                                // Finalize message
                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[botMessageIndex] = {
                                        text: data.fullResponse || streamedText,
                                        sender: 'bot',
                                        streaming: false
                                    };
                                    return updated;
                                });
                                setIsTyping(false);
                            }
                        } catch (err) {
                            console.error('Parse error:', err);
                        }
                    }
                }
            }

            setIsTyping(false);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => {
                const updated = [...prev];
                updated[botMessageIndex] = {
                    text: "Woof... I can't connect! Make sure Ollama is running! 🦴",
                    sender: 'bot'
                };
                return updated;
            });
            setIsTyping(false);
        }
    };

    // Hide completely for Admin
    if (user?.role === 'admin') return null;

    const currentStreak = user?.loginStreak?.currentStreak || 0;

    const getStreakColor = (streak) => {
        if (streak >= 30) return '#ff6b00';
        if (streak >= 14) return '#ff8800';
        if (streak >= 7) return '#ffa500';
        if (streak >= 3) return '#ffcc00';
        return '#ffd700';
    };

    return (
        <div className={`pet-dog-container ${isVisible ? 'visible' : ''} ${isAngry ? 'angry-shake' : ''} state-${petState}`}>

            {/* --- Chat Window --- */}
            {showChat && petState === 'active' && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h3><Smile size={18} className="text-blue-500" /> Robo-Pet Chat</h3>
                        <button onClick={() => setShowChat(false)} className="close-chat-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-input-area">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask for advice..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                        />
                        <button type="submit" className="send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* --- Interest Modal --- */}
            {showInterests && petState === 'active' && (
                <div className="interest-modal">
                    <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => {
                            setShowInterests(false);
                            setHasDismissedInterests(true);
                            setDialogueText("Okay, I won't bug you now! Bark at me if you need help! 🦴");
                            setShowDialogue(true);
                        }}
                    >
                        <X size={20} />
                    </button>
                    <h3>Pick 3 Interests 🐾</h3>
                    <div className="interest-grid">
                        {domains.map(domain => (
                            <div
                                key={domain}
                                className={`interest-item ${selectedInterests.includes(domain) ? 'selected' : ''}`}
                                onClick={() => toggleInterest(domain)}
                            >
                                {domain}
                            </div>
                        ))}
                    </div>
                    <button
                        className="save-btn"
                        disabled={selectedInterests.length !== 3 || isSaving}
                        onClick={saveInterests}
                    >
                        {isSaving ? 'Sniffing...' : 'Let\'s Go!'}
                    </button>
                </div>
            )}

            {showDialogue && !showChat && petState === 'active' && (
                <div className="speech-bubble">
                    {dialogueText}
                </div>
            )}

            <div
                className={`pet-dog-wrapper ${petState === 'watching' ? 'watching-mode' : ''}`}
                onClick={handleDogClick}
                onDoubleClick={handleDogDoubleClick}
            >
                <svg width="120" height="120" viewBox="0 0 200 200">
                    {/* Dog Body - Hide when watching */}
                    <g className="dog-body-part">
                        <rect x="60" y="100" width="80" height="60" rx="30" fill="#E2E8F0" />
                        <rect x="70" y="110" width="60" height="40" rx="20" fill="#CBD5E1" />

                        {/* Tail */}
                        <g className="dog-tail">
                            <path d="M140 130 Q160 110 170 130" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" fill="none" />
                        </g>

                        {/* Legs */}
                        <rect x="75" y="150" width="15" height="25" rx="7.5" fill="#94A3B8" />
                        <rect x="110" y="150" width="15" height="25" rx="7.5" fill="#94A3B8" />
                    </g>

                    {/* Head */}
                    <g className="dog-head">
                        <rect x="65" y="50" width="90" height="70" rx="35" fill="#F8FAFC" className="dog-body-part" />
                        <circle cx="95" cy="85" r="8" className={`dog-eye ${isAngry ? 'angry-eye' : ''}`} fill="#1E293B" />
                        <circle cx="135" cy="85" r="8" className={`dog-eye ${isAngry ? 'angry-eye' : ''}`} fill="#1E293B" />
                        <rect x="105" y="95" width="20" height="12" rx="6" fill="#475569" className="dog-body-part" /> {/* Nose */}

                        {/* Ears */}
                        <path d="M70 60 Q50 30 65 20" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="4" className="dog-body-part" />
                        <path d="M150 60 Q170 30 155 20" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="4" className="dog-body-part" />
                    </g>

                    {/* Antena (Robot feel) */}
                    <g className="dog-antenna">
                        <line x1="110" y1="50" x2="110" y2="30" stroke={isAngry ? "#ef4444" : "#3B82F6"} strokeWidth="4" />
                        <circle cx="110" cy="25" r="5" fill={isAngry ? "#ef4444" : "#3B82F6"}>
                            <animate attributeName="fill" values={isAngry ? "#ef4444;#f87171;#ef4444" : "#3B82F6;#60A5FA;#3B82F6"} dur="2s" repeatCount="indefinite" />
                        </circle>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default RobotPetDog;
