import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Scale, User } from 'lucide-react';

import { api, errorMessage } from '../lib/api';
import { useDocumentStore } from '../store/useDocumentStore';

const SUGGESTIONS = [
    'What are my biggest risks here?',
    'Can I exit this agreement early?',
    'Is the penalty clause enforceable in India?',
];

const WELCOME = {
    role: 'assistant',
    id: 'welcome',
    content:
        "I'm your Rakshak AI legal assistant. Ask me anything about this document — I'll answer using Indian law and point you to the exact clause.",
};

export default function LegalAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const endRef = useRef(null);
    const inputRef = useRef(null);
    const nextId = useRef(1);

    const docId = useDocumentStore((s) => s.docId);
    const isProcessing = useDocumentStore((s) => s.isProcessing);
    const ready = Boolean(docId) && !isProcessing;

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 250);
    }, [isOpen]);

    const send = async (text) => {
        const query = (text ?? input).trim();
        if (!query || isLoading || !ready) return;

        setMessages((prev) => [...prev, { role: 'user', content: query, id: `u${nextId.current++}` }]);
        setInput('');
        setIsLoading(true);

        try {
            const { data } = await api.post(`/chat/${docId}`, { query });
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: data.answer, id: `a${nextId.current++}` },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: errorMessage(err, 'I could not answer that just now. Please try again.'),
                    id: `e${nextId.current++}`,
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <>
            <motion.button
                onClick={() => setIsOpen((v) => !v)}
                className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-none border-2 border-latte-ink bg-latte-ink transition-colors hover:border-latte-accent hover:bg-latte-accent sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isOpen ? 'Close legal assistant' : 'Open legal assistant'}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isOpen ? 'close' : 'open'}
                        initial={{ opacity: 0, rotate: -45 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 45 }}
                        transition={{ duration: 0.15 }}
                    >
                        {isOpen ? <X className="h-5 w-5 text-latte-bg" />
                            : <MessageSquare className="h-5 w-5 text-latte-bg" />}
                    </motion.span>
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        // top-20 keeps the panel clear of the fixed navbar on
                        // short screens instead of sliding underneath it.
                        className="fixed inset-x-3 bottom-20 top-20 z-50 flex flex-col overflow-hidden rounded-none border-2 border-latte-ink bg-latte-surface sm:inset-x-auto sm:right-6 sm:top-auto sm:bottom-24 sm:h-[540px] sm:w-[400px]"
                    >
                        <div className="flex flex-none items-center gap-3 border-b-2 border-latte-ink bg-latte-bg px-5 py-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-none border border-latte-ink bg-latte-ink">
                                <Scale className="h-4 w-4 text-latte-bg" />
                            </div>
                            <div>
                                <h3 className="font-serif text-xl font-medium uppercase tracking-[0.12em] text-latte-ink">Legal Assistant</h3>
                                <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.2em] text-latte-subtext">Indian law · document-aware</p>
                            </div>
                        </div>

                        <div className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`flex h-7 w-7 flex-none items-center justify-center rounded-none border border-latte-ink ${m.role === 'user' ? 'bg-latte-muted' : 'bg-latte-ink'}`}>
                                        {m.role === 'user'
                                            ? <User className="h-3.5 w-3.5 text-latte-ink" />
                                            : <Scale className="h-3.5 w-3.5 text-latte-bg" />}
                                    </div>
                                    <div
                                        className={`max-w-[78%] whitespace-pre-wrap rounded-none border px-3.5 py-2.5 font-sans text-[13px] leading-relaxed
                                            ${m.role === 'user'
                                                ? 'border-latte-ink bg-latte-ink text-latte-bg'
                                                : m.isError
                                                    ? 'border-red-800 bg-red-100 text-red-900'
                                                    : 'border-latte-muted bg-latte-bg text-latte-text'}`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-2.5">
                                    <div className="flex h-7 w-7 flex-none items-center justify-center rounded-none border border-latte-ink bg-latte-ink">
                                        <Scale className="h-3.5 w-3.5 text-latte-bg" />
                                    </div>
                                    <div className="flex items-center gap-1 rounded-none border border-latte-muted bg-latte-bg px-4 py-3">
                                        {[0, 1, 2].map((i) => (
                                            <span
                                                key={i}
                                                className="h-1.5 w-1.5 animate-bounce rounded-none bg-latte-ink"
                                                style={{ animationDelay: `${i * 140}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ready && messages.length === 1 && !isLoading && (
                                <div className="mt-1 flex flex-col gap-1.5">
                                    {SUGGESTIONS.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => send(s)}
                                            className="rounded-none border border-latte-muted bg-latte-bg px-3 py-2.5 text-left font-sans text-[11px] text-latte-subtext transition-colors hover:border-latte-ink hover:text-latte-ink"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div ref={endRef} />
                        </div>

                        <div className="flex-none border-t-2 border-latte-ink bg-latte-bg p-3">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    rows={1}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    disabled={!ready || isLoading}
                                    placeholder={ready ? 'Ask about this document…' : 'Upload a document first'}
                                    className="custom-scrollbar max-h-24 flex-1 resize-none rounded-none border-2 border-latte-border bg-latte-bg px-4 py-3 font-sans text-sm text-latte-text placeholder:text-latte-muted outline-none transition-colors duration-200 focus:outline-none focus:border-latte-accent disabled:opacity-50"
                                />
                                <button
                                    onClick={() => send()}
                                    disabled={!ready || isLoading || !input.trim()}
                                    className="flex h-11 w-11 flex-none items-center justify-center rounded-none border-2 border-latte-ink bg-latte-ink text-latte-bg transition-colors hover:border-latte-accent hover:bg-latte-accent disabled:border-latte-muted disabled:bg-latte-muted disabled:text-latte-subtext"
                                    aria-label="Send message"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
