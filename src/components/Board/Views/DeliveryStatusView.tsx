import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, Smartphone, MailOpen, MousePointer2, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../context/AppContext';

export const DeliveryStatusView: React.FC = () => {
    const { state } = useAppStore();
    const status = state.currentView.data?.status || 'sending'; // 'sending' | 'scheduled'
    const scheduleTime = state.currentView.data?.scheduleTime;

    const total = 1245;

    // Independent counters for simulation
    const [sentCount, setSentCount] = useState(0);
    const [deliveredCount, setDeliveredCount] = useState(0);
    const [openedCount, setOpenedCount] = useState(0);
    const [clickedCount, setClickedCount] = useState(0);

    const [activityLog, setActivityLog] = useState<string[]>([
        "Campaign initialization...",
        "SMTP connection established.",
        "Starting batch delivery...",
    ]);

    useEffect(() => {
        if (status !== 'sending') return;

        const interval = setInterval(() => {
            // 1. Sending Logic (Fastest)
            setSentCount(prev => {
                if (prev >= total) return total;
                const increment = Math.floor(Math.random() * 25) + 5;
                return Math.min(prev + increment, total);
            });

            // 2. Delivery Logic (Follows sending closely)
            setDeliveredCount(prev => {
                if (sentCount === 0) return 0;
                const target = Math.floor(sentCount * 0.99); // 99% delivery rate
                if (prev >= target) return prev;
                const increment = Math.floor(Math.random() * 20) + 5;
                return Math.min(prev + increment, target);
            });

            // 3. Open Logic (Lags behind, continues after sending)
            setOpenedCount(prev => {
                if (deliveredCount < 50) return 0; // Delay starts
                // Target ~42% open rate eventually
                const targetMax = Math.floor(total * 0.42);
                // Dynamic cap based on delivered so far, but allows growth
                const currentCap = Math.floor(deliveredCount * 0.45);

                if (prev >= targetMax) return prev;

                // Random chance to increment to simulate human behavior
                if (Math.random() > 0.3) {
                    const increment = Math.floor(Math.random() * 3) + 1;
                    return Math.min(prev + increment, currentCap, targetMax);
                }
                return prev;
            });

            // 4. Click Logic (Lags significantly, fractions of opens)
            setClickedCount(prev => {
                if (openedCount < 20) return 0;
                // Target ~12% click rate eventually
                const targetMax = Math.floor(total * 0.12);
                const currentCap = Math.floor(openedCount * 0.30);

                if (prev >= targetMax) return prev;

                if (Math.random() > 0.6) {
                    const increment = Math.floor(Math.random() * 2) + 1;
                    return Math.min(prev + increment, currentCap, targetMax);
                }
                return prev;
            });

        }, 200); // 5 ticks per second

        return () => clearInterval(interval);
    }, [status, sentCount, deliveredCount, openedCount, clickedCount]);

    // Log generation based on milestones
    useEffect(() => {
        if (sentCount === total && !activityLog.includes("Batch sending completed.")) {
            setActivityLog(prev => ["Batch sending completed.", ...prev]);
        }
        if (sentCount > 0 && sentCount % 300 < 30 && sentCount < total) {
            setActivityLog(prev => [`Processed batch of ${sentCount} emails...`, ...prev.slice(0, 4)]);
        }
        if (clickedCount > 0 && clickedCount % 10 === 0) {
            setActivityLog(prev => ["User clicked link: https://store.demo.com/prod...", ...prev.slice(0, 4)]);
        }
    }, [sentCount, clickedCount]);


    if (status === 'scheduled') {
        return (
            <div className="p-8 h-full overflow-y-auto flex flex-col items-center justify-center text-center">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-12 rounded-3xl border border-indigo-500/30 backdrop-blur-md max-w-2xl w-full">
                    <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/40">
                        <Calendar className="text-white" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Campaign Scheduled!</h2>
                    <p className="text-gray-300 text-lg mb-8">Your "New Product Launch" campaign is reserved for delivery.</p>

                    <div className="flex items-center justify-center gap-8 mb-8">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Scheduled Date</p>
                            <p className="text-xl text-white font-medium">{scheduleTime ? new Date(scheduleTime).toLocaleDateString() : 'Tomorrow'}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-700"></div>
                        <div className="text-left">
                            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Time</p>
                            <p className="text-xl text-white font-medium flex items-center gap-2">
                                <Clock size={18} className="text-indigo-400" />
                                {scheduleTime ? new Date(scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '17:00'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 mb-8 inline-block text-left w-full">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Target Audience</span>
                            <span className="text-white font-medium text-sm">Active Subscribers</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Est. Recipients</span>
                            <span className="text-white font-medium text-sm">~{total.toLocaleString()} users</span>
                        </div>
                    </div>

                    <button className="bg-white text-indigo-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const progressPercent = Math.min((sentCount / total) * 100, 100);

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Send className="text-indigo-400" />
                        Delivery Status
                    </h2>
                    <p className="text-gray-400 mt-1">{progressPercent === 100 ? 'Campaign sent. Tracking engagement...' : 'Sending in progress...'}</p>
                </div>
                {progressPercent < 100 && (
                    <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                        Sending...
                    </div>
                )}
            </div>

            {/* Progress Section */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8 backdrop-blur-sm">
                <div className="flex justify-between text-sm mb-2 text-gray-400">
                    <span>Sending Progress</span>
                    <span>{sentCount.toLocaleString()} / {total.toLocaleString()}</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ ease: "linear", duration: 0.2 }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] w-full h-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                    </motion.div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2"><CheckCircle className="text-emerald-400" /></div>
                    <p className="text-2xl font-bold text-white">{deliveredCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase">Delivered</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2"><MailOpen className="text-blue-400" /></div>
                    <p className="text-2xl font-bold text-white">{openedCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase">Opened</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2"><MousePointer2 className="text-purple-400" /></div>
                    <p className="text-2xl font-bold text-white">{clickedCount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase">Clicked</p>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2"><Smartphone className="text-pink-400" /></div>
                    <p className="text-2xl font-bold text-white">{Math.floor(openedCount * 0.65).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase">Mobile</p>
                </div>
            </div>

            {/* Live Feed */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Live Activity Feed</h3>
                <div className="space-y-3 font-mono text-xs">
                    {activityLog.map((log, i) => (
                        <div key={i} className="flex gap-3 text-gray-300 border-b border-gray-800/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-indigo-500">{new Date().toLocaleTimeString()}</span>
                            <span>{log}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
