import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResponsiveGrid } from '../useResponsiveGrid';

describe('useResponsiveGrid', () => {
    let observeMock = vi.fn();
    let disconnectMock = vi.fn();

    beforeEach(() => {
        observeMock = vi.fn();
        disconnectMock = vi.fn();

        // Mock ResizeObserver
        globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
            observe: observeMock,
            disconnect: disconnectMock,
            unobserve: vi.fn(),
        }));
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default column count (2)', () => {
        const { result } = renderHook(() => useResponsiveGrid());
        expect(result.current.columnCount).toBe(2);
        expect(result.current.containerRef.current).toBeNull();
    });

    it('should set column count to 2 for mobile width (< 640px)', () => {
        const { result } = renderHook(() => useResponsiveGrid());

        // Mock container element
        const mockDiv = document.createElement('div');
        Object.defineProperty(mockDiv, 'offsetWidth', { configurable: true, value: 400 });

        (result.current.containerRef as any).current = mockDiv;

        expect(result.current.columnCount).toBe(2);
    });
});
