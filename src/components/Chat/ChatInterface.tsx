import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';



export const ChatInterface: React.FC = () => {
    const { state, addMessage, setView } = useAppStore();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [state.messages, isTyping]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userText = input;
        addMessage('user', userText);
        setInput('');
        setIsTyping(true);

        // Simulate AI processing and View dispatching
        setTimeout(() => {
            processCommand(userText);
            setIsTyping(false);
        }, 800);
    };

    const processCommand = (text: string) => {
        const lower = text.toLowerCase();

        const viewMappings: Record<string, { keywords: string[], msg: string, data?: any }> = {
            'email-campaign-new': {
                keywords: ['promo', 'promotion', 'product', 'new item'],
                msg: 'I have prepared the New Product Promotion email template for you.',
                data: { template: 'new-product' }
            },
            'campaign-summary': {
                keywords: ['summary', 'yesterday', '昨日', 'report', 'result'],
                msg: 'Here is the performance summary from yesterday\'s campaign.'
            },
            'email-campaign': {

                keywords: ['email', 'mail', 'メール'],
                msg: 'I have opened the Email Campaign configuration for you.'
            },
            'kpi-dashboard': {
                keywords: ['kpi', 'metric', 'stat'],
                msg: 'Here is the KPI Dashboard showing current performance metrics.'
            },
            'delivery-status': {
                keywords: ['delivery', 'status', '配信', 'situation'],
                msg: 'Checking the current delivery status for you.'
            },
            'target-extraction': {

                keywords: ['target', 'extract', 'segment', 'export', 'list', 'group'],
                msg: 'I\'ve pulled up the Target Extraction tool for you.'
            }
        };

        let lastIndex = -1;
        let selectedView = 'default';
        let responseMsg = 'I received your message. Try asking for "Email Settings", "KPIs", or "Target Extraction" to see the dynamic interface in action.';
        let viewData = undefined;

        Object.entries(viewMappings).forEach(([viewKey, config]) => {
            config.keywords.forEach(keyword => {
                const index = lower.lastIndexOf(keyword);
                if (index > lastIndex) {
                    lastIndex = index;
                    selectedView = viewKey === 'email-campaign-new' ? 'email-campaign' : viewKey;
                    responseMsg = config.msg;
                    viewData = config.data;
                }
            });
        });

        addMessage('assistant', responseMsg);
        setView(selectedView as any, viewData);
    };


    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-white tracking-tight">Marketing AI</h2>
                        <p className="text-xs text-indigo-300 font-medium">Assistant Active</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                    <Sparkles size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {state.messages.map((msg) => (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        key={msg.id}
                        className={clsx(
                            "flex gap-4 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        <div className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg mt-auto",
                            msg.role === 'assistant' ? "bg-gradient-to-br from-indigo-600 to-indigo-700" : "bg-gray-700"
                        )}>
                            {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} className="text-gray-300" />}
                        </div>

                        <div className={clsx(
                            "relative p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                            msg.role === 'assistant'
                                ? "bg-gray-800/80 text-gray-100 rounded-bl-none border border-white/5 glass-panel"
                                : "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none shadow-indigo-500/10"
                        )}>
                            {msg.content}
                            <span className="text-[10px] opacity-40 absolute bottom-1 right-3">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4 max-w-[85%]"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-600/50 flex items-center justify-center flex-shrink-0 mt-auto">
                            <Bot size={16} className="text-white/50" />
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-2xl rounded-bl-none flex gap-1 items-center h-10">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-0"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-5 border-t border-white/5 bg-gray-900/60 backdrop-blur-md">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-focus-within:opacity-100 transition duration-300 blur-sm"></div>
                    <div className="relative flex items-center bg-gray-900 rounded-xl p-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                    handleSend();
                                }
                            }}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none py-3 pl-4 pr-4 text-white placeholder-gray-500 focus:ring-0 focus:outline-none"
                        />

                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-600">AI can make mistakes. Verify important info.</p>
                </div>
            </div>
        </div>
    );
};
