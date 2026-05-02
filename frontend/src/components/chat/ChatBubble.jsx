import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const markdownComponents = {
    p: ({ node, ...props }) => <p className="leading-relaxed mb-2 last:mb-0" {...props} />,
    strong: ({ node, ...props }) => <strong className="font-bold text-[#1A1A1A]" {...props} />,
    em: ({ node, ...props }) => <em className="italic" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
    a: ({ node, ...props }) => (
        <a
            className="text-brand-green underline font-semibold break-all"
            target={props.href?.startsWith('http') ? '_blank' : undefined}
            rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            {...props}
        />
    ),
    code: ({ node, inline, ...props }) =>
        inline ? (
            <code className="bg-gray-100 text-[#8B1A1A] px-1 py-0.5 rounded text-[12px] font-mono" {...props} />
        ) : (
            <code className="block bg-gray-50 border border-gray-200 p-2 rounded my-2 text-[12px] font-mono whitespace-pre-wrap break-words" {...props} />
        ),
    h1: ({ node, ...props }) => <h3 className="text-sm font-bold text-[#1A1A1A] mt-2 mb-1" {...props} />,
    h2: ({ node, ...props }) => <h3 className="text-sm font-bold text-[#1A1A1A] mt-2 mb-1" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-[#1A1A1A] mt-2 mb-1" {...props} />,
    blockquote: ({ node, ...props }) => (
        <blockquote className="border-l-2 border-brand-green pl-3 italic text-gray-600 my-2" {...props} />
    ),
};

const ALLOWED_PATHS = ['/', '/dashboard'];

export const ChatBubble = () => {
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { t } = useTranslation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: 'Hello! I am your AI assistant for the Job Portal. How can I help you today? \n\nආයුබෝවන්! මම ඔබට කෙසේද උදව් කරන්නේ? \n\nவணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?'
            }]);
        }
    }, [isOpen]);

    if (!ALLOWED_PATHS.includes(pathname)) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${apiBaseUrl}/chat`, {
                message: userMessage,
                conversationHistory: messages
            });

            if (response.data.success) {
                setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again later or contact support.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl shadow-xl w-[90vw] md:w-[400px] h-[500px] max-h-[80vh] flex flex-col overflow-hidden border border-gray-100 mb-4"
                    >
                        {/* Header */}
                        <div className="bg-brand-green text-white p-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center relative">
                                    <Bot size={20} />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-brand-green rounded-full" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm flex items-center gap-1">
                                        {t('chat_title', { defaultValue: 'NextEra Assistant' })}
                                        <Sparkles size={12} className="text-yellow-300" />
                                    </h3>
                                    <p className="text-xs text-brand-cream opacity-90">{t('chat_subtitle', { defaultValue: 'Job Portal Support' })}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-brand-sand flex flex-col gap-3">
                            {messages.map((msg, index) => (
                                <div 
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                            msg.role === 'user'
                                                ? 'bg-brand-green text-white rounded-br-sm'
                                                : 'bg-white border border-gray-200 shadow-sm text-gray-800 rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.role === 'user' ? (
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        ) : (
                                            <div className="markdown-body text-sm">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                                        <div className="flex space-x-1.5">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={t('chat_placeholder', { defaultValue: 'Type your message...' })}
                                    className="flex-1 bg-brand-sand border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                                    disabled={isLoading}
                                />
                                <button 
                                    type="submit"
                                    disabled={!message.trim() || isLoading}
                                    className="bg-brand-green text-white p-2.5 rounded-xl hover:bg-brand-greenLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] cursor-pointer"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    boxShadow: '0 0 0 3px #E2B325, 0 8px 20px rgba(139, 26, 26, 0.35), 0 0 18px rgba(226, 179, 37, 0.45)',
                }}
                className={`${
                    isOpen ? 'bg-brand-terra' : 'bg-brand-green'
                } text-white p-4 rounded-full flex items-center justify-center hover:bg-brand-terraLight transition-colors relative z-50 cursor-pointer ring-2 ring-offset-2 ring-offset-transparent ring-[#E2B325]`}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <>
                        <Bot size={26} />
                        {!isOpen && (
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full animate-pulse" />
                        )}
                    </>
                )}
            </motion.button>
        </div>
    );
};
