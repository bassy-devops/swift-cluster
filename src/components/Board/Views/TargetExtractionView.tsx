import { useState } from 'react';

import { Filter, Download, Search, CheckSquare, Square, Mail } from 'lucide-react';
import { useAppStore } from '../../../context/AppContext';


export const TargetExtractionView: React.FC = () => {
    const { setView, addMessage } = useAppStore();
    const [selected, setSelected] = useState<number[]>([]);

    const users = [
        { id: 1, name: 'Alice Smith', email: 'alice@example.com', ltv: '$1,200', status: 'Active' },
        { id: 2, name: 'Bob Jones', email: 'bob@example.com', ltv: '$850', status: 'Inactive' },
        { id: 3, name: 'Charlie Day', email: 'charlie@example.com', ltv: '$2,300', status: 'VIP' },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', ltv: '$3,100', status: 'VIP' },
        { id: 5, name: 'Evan Wright', email: 'evan@example.com', ltv: '$150', status: 'Active' },
    ];

    const toggleSelect = (id: number) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleDraftEmail = () => {
        if (selected.length === 0) return;

        addMessage('assistant', `I've started a new email campaign draft targeted at the ${selected.length} users you selected.`);
        setView('email-campaign', { selectedUsers: selected });
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Filter className="text-indigo-400" />
                        Target Extraction
                    </h2>
                    <p className="text-gray-400 mt-1">Select and export user segments.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleDraftEmail}
                        disabled={selected.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Mail size={16} />
                        Draft Email ({selected.length})
                    </button>
                    <button className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm border border-gray-700 transition-colors">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-900/50 text-xs uppercase font-medium text-gray-400">
                        <tr>
                            <th className="px-6 py-4 w-12 text-center">
                                <button onClick={() => setSelected(selected.length === users.length ? [] : users.map(u => u.id))}>
                                    {selected.length === users.length ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} />}
                                </button>
                            </th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">LTV</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className={`hover:bg-gray-700/50 transition-colors ${selected.includes(user.id) ? 'bg-indigo-900/10' : ''}`}>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => toggleSelect(user.id)} className="text-gray-500 hover:text-indigo-400">
                                        {selected.includes(user.id) ?
                                            <CheckSquare size={16} className="text-indigo-500" /> :
                                            <Square size={16} />
                                        }
                                    </button>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-medium text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{user.name}</div>
                                            <div className="text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-white">{user.ltv}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' :
                                        user.status === 'VIP' ? 'bg-purple-500/10 text-purple-400' :
                                            'bg-gray-500/10 text-gray-400'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-400 hover:text-indigo-300 font-medium">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 border-t border-gray-700 text-xs text-gray-500 flex justify-between">
                    <span>Showing 5 of 124 users</span>
                    <div className="flex gap-2">
                        <button className="hover:text-white">Previous</button>
                        <button className="hover:text-white">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
