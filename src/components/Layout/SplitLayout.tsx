import React, { useState, useEffect, useCallback } from 'react';

interface SplitLayoutProps {
    left: React.ReactNode;
    right: React.ReactNode;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({ left, right }) => {
    const [leftWidth, setLeftWidth] = useState(400);
    const [isDragging, setIsDragging] = useState(false);

    const startResizing = useCallback(() => {
        setIsDragging(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsDragging(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isDragging) {
                const newWidth = mouseMoveEvent.clientX;
                // Limit min and max width
                if (newWidth > 300 && newWidth < 800) {
                    setLeftWidth(newWidth);
                }
            }
        },
        [isDragging]
    );

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <div className="flex h-screen w-full bg-gray-950 text-white overflow-hidden selection:bg-indigo-500/30">
            {/* Left Panel */}
            <div
                style={{ width: leftWidth }}
                className="flex-shrink-0 flex flex-col bg-gray-900/40 backdrop-blur-xl border-r border-gray-800 relative"
            >
                {left}

                {/* Drag Handle Overlay */}
                <div
                    className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-500 transition-colors z-50 ${isDragging ? 'bg-indigo-600' : 'bg-transparent'}`}
                    onMouseDown={startResizing}
                />
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-950 to-gray-900 relative overflow-hidden">
                {/* Pattern/Background decoration */}
                <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)'
                    }}
                />
                {right}
            </div>
        </div>
    );
};
