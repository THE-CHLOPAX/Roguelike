import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ViewsState = {
    currentView: string;
    viewHistory: string[];
    viewPaused: boolean;
    goBack: () => void;
    setView: (view: string) => void;
    setViewPaused: (paused: boolean) => void;
    registerView: (id: string, element: React.JSX.Element) => void;
    clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 5;

export const useViewsStore = create<ViewsState>()(
    devtools(
        (set, get) => ({
            currentView: 'menu',
            viewHistory: new Set<string>(['menu']),
            viewPaused: false,
            views: [],

            setView: (id: string) => {
                const { currentView, viewHistory } = get();
                // Don't change if already on this view
                if (currentView === id) return;
                // Add to history
                let newHistory = [...viewHistory, id];
                
                // Limit history size to MAX_HISTORY_SIZE
                if (newHistory.length > MAX_HISTORY_SIZE) {
                    newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
                }

                set({
                    currentView: id,
                    viewHistory: newHistory,
                });
            },
            setViewPaused: (paused: boolean) => {
                set({
                    viewPaused: paused,
                });
            },
            clearHistory: () => {
                const { currentView } = get();
                set({ viewHistory: [currentView] });
            },
            goBack: () => {
                const { viewHistory } = get();

                if (viewHistory.length <= 1) return; // Can't go back

                const previousView = viewHistory[viewHistory.length - 2];
                const newHistory = [...viewHistory, previousView];

                set({
                    currentView: previousView,
                    viewHistory: newHistory,
                });
            },
        }),
        {
            name: 'views-store',
        }
    )
);

export const useCurrentView = () => useViewsStore((state) => state.currentView);
export const useViewHistory = () => useViewsStore((state) => state.viewHistory);