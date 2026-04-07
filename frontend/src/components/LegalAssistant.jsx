import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import axios from 'axios';
import { useDocumentStore } from '../store/useDocumentStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

function TypewriterText({ text, speed = 12 }) {
    const [displayed, setDisplayed] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        let i = 0;
        setDisplayed('');
        setShowCursor(true);
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                clearInterval(timer);
                setTimeout(() => setShowCursor(false), 600);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <span>
            {displayed}
            {showCursor && <span className="inline-block w-[2px] h-[14px] bg-cyan-400 ml-0.5 animate-pulse align-text-bottom" />}
        </span>
    );
}

export default function LegalAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your Rakshak AI Legal Assistant. Ask me anything about your uploaded contract — I\'ll reference specific clauses to help you understand the risks.', id: 'welcome' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [latestAiId, setLatestAiId] = useState('welcome');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const nextId = useRef(1);
    const docId = useDocumentStore(s => s.docId);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading || !docId) return;

        const userMsg = { role: 'user', content: input, id: `u${nextId.current++}` };
        setMessages(prev => [...prev, userMsg]);
        const query = input;
        setInput('');
        setIsLoading(true);

        try {
            const res = await axios.post(
                `${API_URL}/chat/${docId}`,
                { query }
            );
            const aiId = `a${nextId.current++}`;
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer || res.data.error, id: aiId }]);
            setLatestAiId(aiId);
        } catch {
            const errId = `e${nextId.current++}`;
            setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.', id: errId }]);
            setLatestAiId(errId);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <>
            {/* Floating Chat Bubble */}
            <motion.button
                id="legal-assistant-toggle"
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-slate-900 border-2 border-cyan-500/50 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <X className="w-6 h-6 text-cyan-400" /> : <MessageSquare className="w-6 h-6 text-cyan-400" />}
                {/* Pulse ring */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-ping" style={{ animationDuration: '2s' }} />
                )}
            </motion.button>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="fixed bottom-24 right-6 z-50 w-[400px] h-[520px] bg-slate-950 border border-cyan-500/30 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.15)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex-none px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900/80 to-cyan-950/30 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">Legal Assistant</h3>
                                <p className="text-[10px] text-cyan-500/60 font-mono">Powered by Rakshak AI</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                                <span className="text-[9px] text-cyan-500/50 font-mono uppercase">Online</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-up`}>
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700/80' : 'bg-cyan-500/10 border border-cyan-500/15'}`}>
                                        {msg.role === 'user'
                                            ? <User className="w-3.5 h-3.5 text-slate-300" />
                                            : <Bot className="w-3.5 h-3.5 text-cyan-400" />
                                        }
                                    </div>
                                    <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === 'user'
                                        ? 'bg-slate-800 text-slate-200 rounded-tr-sm border border-slate-700/50'
                                        : 'bg-cyan-500/5 border border-cyan-500/15 text-slate-300 rounded-tl-sm shadow-[0_0_10px_rgba(34,211,238,0.05)]'
                                        }`}>
                                        {msg.role === 'assistant' && msg.id === latestAiId && msg.id !== 'welcome'
                                            ? <TypewriterText text={msg.content} />
                                            : msg.content
                                        }
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-2.5 animate-fade-up">
                                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/15 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl rounded-tl-sm px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="flex-none p-3 border-t border-cyan-500/20 bg-slate-900/40">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={docId ? "Ask about your contract..." : "Upload a document first..."}
                                    disabled={!docId || isLoading}
                                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:shadow-[0_0_10px_rgba(34,211,238,0.1)] transition-all disabled:opacity-40 font-mono"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || isLoading || !docId}
                                    className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
