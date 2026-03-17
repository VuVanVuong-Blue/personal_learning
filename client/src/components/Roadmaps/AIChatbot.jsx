import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Sparkles } from 'lucide-react';

const AIChatbot = ({ currentTask }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: 'Chào bạn! Mình là AI Mentor. Bạn đang gặp khó khăn gì ở bài học này không?' }] }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (currentTask && isOpen) {
            setMessages(prev => [
                ...prev,
                { role: 'model', parts: [{ text: `Mình thấy bạn đang học bài **${currentTask.title}**. Bạn cần mình giải thích thêm phần nào không?` }] }
            ]);
        }
    }, [currentTask?.title, isOpen]); // Only trigger when task title or open state changes

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message to UI
        const newMessages = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Prepare context
            const context = currentTask ? {
                title: currentTask.title,
                content: currentTask.content
            } : null;

            // Format history for Gemini API (user & model alternates)
            const history = messages.map(msg => ({
                role: msg.role === 'model' ? 'model' : 'user',
                parts: msg.parts
            }));

            const res = await axiosClient.post('/ai/mentor/chat', {
                message: userMessage,
                history,
                context
            });

            // Add AI response
            setMessages([...newMessages, { role: 'model', parts: [{ text: res.data.response }] }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages([...newMessages, { role: 'model', parts: [{ text: 'Xin lỗi, hệ thống AI đang bận hoặc quá tải. Bạn thử lại sau nhé!' }] }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
            >
                <Sparkles className="w-6 h-6 animate-pulse" />
                {/* <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"> */}
                {/* <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div> */}
                {/* </span> */}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50 h-[500px] max-h-[80vh] font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight">AI Learning Mentor</h3>
                        <p className="text-xs text-indigo-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-white/80 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <Minimize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-6 h-6 shrink-0 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                        )}
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'}`}>
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-6 h-6 shrink-0 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                            <Bot className="w-3.5 h-3.5 text-indigo-600" />
                        </div>
                        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] shrink-0">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Hỏi AI tại đây..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-4 pr-12 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all focus:ring-4 focus:ring-indigo-50"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-1 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                    >
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIChatbot;
