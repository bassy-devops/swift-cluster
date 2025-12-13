export type Role = 'user' | 'assistant' | 'system';

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: number;
}

export type ViewType = 'default' | 'email-campaign' | 'kpi-dashboard' | 'target-extraction' | 'delivery-status' | 'campaign-summary' | 'user-segment';



export interface ViewState {
    type: ViewType;
    data?: any;
}

export interface AppState {
    messages: Message[];
    currentView: ViewState;
    isSidebarOpen: boolean;
}
