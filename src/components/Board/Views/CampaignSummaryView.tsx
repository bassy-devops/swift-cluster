import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { CheckCircle, MousePointer2, MailOpen, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

const funnelData = [
    { name: 'Sent', value: 12450, fill: '#6366f1' },
    { name: 'Delivered', value: 12200, fill: '#8b5cf6' },
    { name: 'Opened', value: 5490, fill: '#ec4899' },
    { name: 'Clicked', value: 1860, fill: '#14b8a6' },
    { name: 'Converted', value: 420, fill: '#10b981' },
];

const hourlyData = [
    { time: '08:00', opens: 120 }, { time: '09:00', opens: 340 }, { time: '10:00', opens: 890 },
    { time: '11:00', opens: 1200 }, { time: '12:00', opens: 980 }, { time: '13:00', opens: 850 },
    { time: '14:00', opens: 760 }, { time: '15:00', opens: 890 }, { time: '16:00', opens: 650 },
    { time: '17:00', opens: 540 }, { time: '18:00', opens: 430 }, { time: '19:00', opens: 320 },
];

export const CampaignSummaryView: React.FC = () => {
    return (
        <div className="p-8 h-full overflow-y-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <TrendingUp className="text-indigo-400" />
                        Campaign Summary: "New Product Launch"
                    </h2>
                    <p className="text-gray-400 mt-1">Impact analysis for yesterday's blast.</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium">
                    Completed Successfully
                </span>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Open Rate', value: '45.2%', delta: '+5.4%', icon: MailOpen, color: 'text-blue-400' },
                    { label: 'Click Rate', value: '15.3%', delta: '+2.1%', icon: MousePointer2, color: 'text-purple-400' },
                    { label: 'Conversion', value: '3.4%', delta: '+0.8%', icon: CheckCircle, color: 'text-emerald-400' },
                    { label: 'Bounce Rate', value: '1.2%', delta: '-0.3%', icon: AlertCircle, color: 'text-gray-400' },
                ].map((m, i) => (
                    <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <m.icon className={`${m.color}`} size={20} />
                            <span className={`text-xs font-medium ${m.delta.startsWith('+') ? 'text-emerald-400' : 'text-emerald-400'}`}>{m.delta}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{m.value}</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{m.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Funnel Chart */}
                <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-xl p-6 backdrop-blur-md">
                    <h3 className="text-lg font-semibold text-white mb-6">Engagement Funnel</h3>
                    <div className="h-[200px] w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" hide />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={80} tick={{ fill: '#e5e7eb', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {funnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-4">Hourly Engagement Trend</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={hourlyData}>
                                <defs>
                                    <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                                <XAxis dataKey="time" stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} />
                                <Area type="monotone" dataKey="opens" stroke="#ec4899" fillOpacity={1} fill="url(#colorOpens)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights Panel */}
                <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-6 backdrop-blur-md flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-indigo-400" />
                        AI Analysis
                    </h3>
                    <div className="space-y-4 flex-1 text-sm text-gray-300 leading-relaxed">
                        <p>
                            <strong className="text-white block mb-1">Strong Subject Line Performance</strong>
                            The subject "Introducing our latest innovation" achieved a <span className="text-emerald-400 font-bold">45.2%</span> open rate, significantly higher than the 32% average.
                        </p>
                        <div className="h-px bg-white/10 my-2" />
                        <p>
                            <strong className="text-white block mb-1">Peak Engagement Time</strong>
                            Highest click-throughs occurred between <span className="text-indigo-300 font-bold">10:00 - 12:00</span>. Consider scheduling future blasts in this window.
                        </p>
                        <div className="h-px bg-white/10 my-2" />
                        <p>
                            <strong className="text-white block mb-1">Recommendation</strong>
                            Mobile clicks accounted for 68% of traffic. Optimize the next landing page for vertical scrolling.
                        </p>
                    </div>
                    <button className="mt-6 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                        Download Full Report <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
