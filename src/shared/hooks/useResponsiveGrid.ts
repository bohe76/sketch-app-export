import { useState, useRef, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '@/shared/config/constants';

export const useResponsiveGrid = (defaultCols = 2) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [columnCount, setColumnCount] = useState(defaultCols);

    const updateColumnCount = useCallback(() => {
        if (!containerRef.current) return;
        const width = containerRef.current.offsetWidth;
        const isMobileWidth = width < 640;

        if (isMobileWidth) {
            setColumnCount(2);
        } else {
            const gap = 16;
            const cardWidth = APP_CONFIG.DEFAULT_DIMENSION_DESKTOP;
            const padding = 48;
            const safetyMargin = 16;
            // Calculate max columns that fit
            const count = Math.max(2, Math.floor((width - padding - safetyMargin + gap) / (cardWidth + gap)));
            setColumnCount(count);
        }
    }, []);

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            updateColumnCount();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
            // Initial calculation
            setTimeout(updateColumnCount, 0);
        }

        return () => observer.disconnect();
    }, [updateColumnCount]);

    return { containerRef, columnCount };
};
