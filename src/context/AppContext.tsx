import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { AppState, Message, ViewState, Role } from '../types';

type Action =
    | { type: 'ADD_MESSAGE'; payload: Message }
    | { type: 'SET_VIEW'; payload: ViewState }
    | { type: 'TOGGLE_SIDEBAR' };

const initialState: AppState = {
    messages: [
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I can help you with Email Marketing, KPI monitoring, and Target Extraction. What would you like to do?',
            timestamp: Date.now(),
        },
    ],
    currentView: { type: 'default' },
    isSidebarOpen: true,
};

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'ADD_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'SET_VIEW':
            return { ...state, currentView: action.payload };
        case 'TOGGLE_SIDEBAR':
            return { ...state, isSidebarOpen: !state.isSidebarOpen };
        default:
            return state;
    }
};

interface AppContextType {
    state: AppState;
    dispatch: Dispatch<Action>;
    addMessage: (role: Role, content: string) => void;
    setView: (type: ViewState['type'], data?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const addMessage = (role: Role, content: string) => {
        dispatch({
            type: 'ADD_MESSAGE',
            payload: {
                id: crypto.randomUUID(),
                role,
                content,
                timestamp: Date.now(),
            },
        });
    };

    const setView = (type: ViewState['type'], data?: any) => {
        dispatch({ type: 'SET_VIEW', payload: { type, data } });
    };

    return (
        <AppContext.Provider value={{ state, dispatch, addMessage, setView }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppStore must be used within an AppProvider');
    }
    return context;
};
