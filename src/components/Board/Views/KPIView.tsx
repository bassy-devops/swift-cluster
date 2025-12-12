import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

const data = [
    { name: 'Mon', revenue: 4000, users: 2400, amt: 2400 },
    { name: 'Tue', revenue: 3000, users: 1398, amt: 2210 },
    { name: 'Wed', revenue: 2000, users: 9800, amt: 2290 },
    { name: 'Thu', revenue: 2780, users: 3908, amt: 2000 },
    { name: 'Fri', revenue: 1890, users: 4800, amt: 2181 },
    { name: 'Sat', revenue: 2390, users: 3800, amt: 2500 },
    { name: 'Sun', revenue: 3490, users: 4300, amt: 2100 },
];

const userActivityData = [
    { name: '06:00', value: 400 },
    { name: '09:00', value: 1200 },
    { name: '12:00', value: 3400 },
    { name: '15:00', value: 2800 },
    { name: '18:00', value: 5200 },
    { name: '21:00', value: 3800 },
];

export const KPIView: React.FC = () => {

    const metrics = [
        { label: 'Total Revenue', value: '$124,500', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        { label: 'Active Users', value: '45,200', change: '+5.2%', trend: 'up', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        { label: 'Bounce Rate', value: '24.8%', change: '-1.2%', trend: 'down', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', isGoodDown: true },
        { label: 'Avg. Order', value: '$85.00', change: '+2.4%', trend: 'up', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    ];

    return (
        <div className="p-8 h-full overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Activity className="text-indigo-400" />
                        Performance Dashboard
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Real-time overview of key metrics.</p>
                </div>
                <select className="bg-gray-800/50 border border-gray-700 text-white text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Quarter</option>
                </select>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className={`bg-gray-900/40 backdrop-blur-md border ${m.border} rounded-xl p-5 hover:bg-gray-800/60 transition-colors group relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 p-20 opacity-5 blur-3xl rounded-full ${m.bg.replace('/10', '/30')}`} />
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-2.5 rounded-lg ${m.bg} ${m.color}`}>
                                <m.icon size={20} />
                            </div>
                            <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-gray-950/50 border border-white/5 ${(m.trend === 'up' && !m.isGoodDown) || (m.trend === 'down' && m.isGoodDown)
                                ? 'text-emerald-400 shadow-emerald-500/10 shadow-lg'
                                : 'text-rose-400 shadow-rose-500/10 shadow-lg'
                                }`}>
                                {m.change}
                                {m.trend === 'up' ? <ArrowUpRight size={12} className="ml-1" /> : <ArrowDownRight size={12} className="ml-1" />}
                            </span>
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium relative z-10">{m.label}</h3>
                        <p className="text-3xl font-bold text-white mt-1 tracking-tight relative z-10">{m.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-xl p-6 backdrop-blur-md relative overflow-hidden">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        Revenue & Traffic
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Live</span>
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '8px', backdropFilter: 'blur(4px)' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Chart: Activity */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 backdrop-blur-md flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-6">Peak Activity</h3>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={userActivityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: '#374151', opacity: 0.2 }}
                                    contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {userActivityData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 4 ? '#8b5cf6' : '#4b5563'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-start gap-3">
                        <Clock className="text-indigo-400 shrink-0" size={18} />
                        <div>
                            <p className="text-xs text-indigo-200 font-medium">Suggestion</p>
                            <p className="text-xs text-gray-400 mt-0.5">Send emails around 18:00 for max engagement.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts Section */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { msg: 'Campaign "Summer Sale" reached 10k opens', time: '2m ago', type: 'success' },
                        { msg: 'Abnormal bounce rate detected in "Welcome Flow"', time: '15m ago', type: 'warning' },
                    ].map((alert, i) => (
                        <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${alert.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10' :
                            'bg-amber-500/5 border-amber-500/10 hover:bg-amber-500/10'
                            }`}>
                            <div className={`w-2 h-2 mt-2 rounded-full ring-4 ring-opacity-20 ${alert.type === 'success' ? 'bg-emerald-500 ring-emerald-500' :
                                'bg-amber-500 ring-amber-500'
                                }`} />
                            <div>
                                <p className="font-medium text-gray-200">{alert.msg}</p>
                                <span className="text-xs text-gray-500 mt-1 block">{alert.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
