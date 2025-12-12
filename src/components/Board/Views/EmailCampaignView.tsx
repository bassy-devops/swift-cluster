import React from 'react';
import { Mail, Calendar, Users, Send, Info, Target, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../../context/AppContext';
import heroImage from '../../../assets/hero.png';

export const EmailCampaignView: React.FC = () => {
    const { state, setView, addMessage } = useAppStore();
    const data = state.currentView.data;

    const templateType = data?.template; // 'new-product' or undefined

    // Calculate "Tomorrow 17:00"
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    const defaultDateStr = tomorrow.toISOString().slice(0, 16);

    const defaultSubject = templateType === 'new-product'
        ? "Introducing our latest innovation - Available Now!"
        : (data?.selectedUsers ? "Exclusive offer for our VIPs" : "Special Offer just for you!");

    const handleLaunch = () => {
        addMessage('assistant', 'Campaign scheduled successfully. Launching delivery reservation page.');
        setView('delivery-status', { status: 'scheduled', scheduleTime: defaultDateStr });
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Mail className="text-indigo-400" />
                        Email Campaign Setup
                    </h2>
                    <p className="text-gray-400 mt-1">Configure your next blast.</p>
                </div>
                <button
                    onClick={handleLaunch}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                    <Send size={16} />
                    Launch Campaign
                </button>
            </div>

            <div className="space-y-6">
                {/* Marketer Info Section (New) */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mb-6">
                    <h3 className="text-indigo-300 font-semibold flex items-center gap-2 mb-3">
                        <Info size={18} />
                        Campaign Strategy
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div className="flex gap-3">
                            <Target className="text-indigo-400 shrink-0" size={16} />
                            <div>
                                <strong className="text-white block">Objective</strong>
                                Drive awareness and pre-orders for the new Q4 product line.
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <TrendingUp className="text-indigo-400 shrink-0" size={16} />
                            <div>
                                <strong className="text-white block">Projected Impact</strong>
                                Maintaining &gt;40% Open Rate is critical for Q4 revenue targets.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Card */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Campaign Details</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Subject Line</label>
                            <input
                                key={defaultSubject}
                                type="text"
                                defaultValue={defaultSubject}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Target Audience</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <select
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
                                        defaultValue={templateType === 'new-product' ? "Active Subscribers" : (data?.selectedUsers ? "custom" : "All Users")}
                                    >
                                        <option>All Users</option>
                                        <option>Active Subscribers</option>
                                        <option>Churn Risk</option>
                                        {data?.selectedUsers && (
                                            <option value="custom">Custom Segment ({data.selectedUsers.length} Users)</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Schedule</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input
                                        type="datetime-local"
                                        defaultValue={templateType === 'new-product' ? defaultDateStr : undefined}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pl-10 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Preview */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Content Preview</h3>
                    <div className="bg-white rounded-lg p-8 text-gray-900 min-h-[300px] shadow-sm">
                        {templateType === 'new-product' ? (
                            <>
                                <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 overflow-hidden relative group">
                                    <img src={heroImage} alt="Product Hero" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                        <span className="text-white font-bold text-lg tracking-wide">The Next Gen</span>

                                    </div>
                                </div>
                                <h1 className="text-3xl font-bold mb-4 tracking-tight text-gray-900">Meet the Future of Productivity</h1>
                                <p className="mb-4 text-gray-600 leading-relaxed">
                                    Hello [First Name],
                                    <br /><br />
                                    We are thrilled to announce our latest product that will revolutionize how you work.
                                    Designed with precision and built for performance, it is simply our best work yet.
                                </p>
                                <ul className="list-disc list-inside mb-6 text-gray-600 space-y-2">
                                    <li>Lightning fast processing</li>
                                    <li>Seamless cloud integration</li>
                                    <li>All-day battery life</li>
                                </ul>
                                <div className="text-center my-8">
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">Pre-order Now</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold mb-4">Hello [First Name],</h1>
                                <p className="mb-4">We noticed you usually shop for [Category] on weekends.</p>
                                <p className="mb-4">Here is an exclusive 20% discount coupon just for you!</p>
                                <div className="text-center my-8">
                                    <button className="bg-indigo-600 text-white px-6 py-3 rounded-md font-bold">Claim Offer</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
