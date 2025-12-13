import React from 'react';
import { useAppStore } from '../../context/AppContext';
import { DefaultView } from './Views/DefaultView';
import { EmailCampaignView } from './Views/EmailCampaignView';
import { KPIView } from './Views/KPIView';
import { TargetExtractionView } from './Views/TargetExtractionView';
import { DeliveryStatusView } from './Views/DeliveryStatusView';
import { UserSegmentView } from './Views/UserSegmentView';
import { CampaignSummaryView } from './Views/CampaignSummaryView';
import { motion, AnimatePresence } from 'framer-motion';

export const BoardInterface: React.FC = () => {
    const { state } = useAppStore();

    const renderView = () => {
        switch (state.currentView.type) {
            case 'email-campaign':
                return <EmailCampaignView />;
            case 'kpi-dashboard':
                return <KPIView />;
            case 'target-extraction':
                return <TargetExtractionView />;
            case 'delivery-status':
                return <DeliveryStatusView />;
            case 'campaign-summary':
                return <CampaignSummaryView />;
            case 'user-segment':
                return <UserSegmentView />;
            default:
                return <DefaultView />;
        }
    };



    return (
        <div className="h-full w-full relative">
            {/* Could add a top bar or breadcrumbs here if needed */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={state.currentView.type}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
