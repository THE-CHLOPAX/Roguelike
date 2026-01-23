import React from 'react';
import { useCurrentView } from '@tgdf';

interface ViewManagerProps {
    views: {
        [key: string]: React.ComponentType;
    };
}

export function ViewManager({ views }: ViewManagerProps) {
    const currentView = useCurrentView();

    // Get the component for the current view
    const ViewComponent = views[currentView];

    if (!ViewComponent) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh'
            }}>
                <p>View not found: {currentView}</p>
            </div>
        );
    }

    return (
        <>
            <ViewComponent />
        </>
    );
}
