import React from 'react';
import { Sparkles } from 'lucide-react';

export const DefaultView: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={40} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Ready to Assist</h3>
            <p className="max-w-md">
                I can help you manage your marketing campaigns.
                Try identifying a segment, checking your active campaign KPIs, or setting up a new email blast.
            </p>
        </div>
    );
};
