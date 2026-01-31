import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { getMessages, sendMessage, markConversationRead } from '../../services/chat.service';

const ChatModal = ({ isOpen, onClose, otherUser, conversation, currentUser, token, onMarkRead }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !conversation?._id || !token) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const data = await getMessages(conversation._id, token);
                setMessages(data || []);
                await markConversationRead(conversation._id, token);
                onMarkRead?.();
            } catch (err) {
                console.error('Failed to load messages', err);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [isOpen, conversation?._id, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !conversation?._id || sending) return;

        setSending(true);
        const text = newMessage.trim();
        setNewMessage('');

        try {
            const msg = await sendMessage(conversation._id, text, token);
            setMessages((prev) => [...prev, msg]);
        } catch (err) {
            console.error('Failed to send message', err);
            setNewMessage(text);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        if (diff < 24 * 60 * 60 * 1000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diff < 7 * 24 * 60 * 60 * 1000) return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString();
    };

    if (!isOpen) return null;

    const otherName = otherUser?.name || 'Teammate';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-600 w-full max-w-lg h-[500px] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/50 flex items-center justify-center text-indigo-300 font-bold">
                            {otherName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{otherName}</h3>
                            <p className="text-xs text-slate-400">Chat with your teammate</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-full transition"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Messages - WhatsApp-style: received left, sent right */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/30">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">
                            No messages yet. Say hi!
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const senderId = String(msg.sender?._id || msg.sender || '');
                            const myId = String(currentUser?.id || currentUser?._id || '');
                            const isMe = senderId && myId && senderId === myId;
                            return (
                                <div
                                    key={msg._id}
                                    className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                            isMe
                                                ? 'bg-emerald-600 text-white rounded-br-md rounded-bl-2xl shadow-md'
                                                : 'bg-slate-600 text-slate-100 rounded-bl-md rounded-br-2xl shadow-md'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                                        <p className={`text-[10px] mt-1.5 ${isMe ? 'text-emerald-100 text-right' : 'text-slate-400'}`}>
                                            {formatTime(msg.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-slate-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            maxLength={2000}
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;
