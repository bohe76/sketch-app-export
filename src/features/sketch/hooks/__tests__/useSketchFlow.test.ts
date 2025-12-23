import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
// We will implement this hook
import { useSketchFlow } from '../useSketchFlow';
// Mock dependencies
import { useSketchStore } from '@/features/sketch/model/store';
import { useAuthStore } from '@/features/auth/model/store';
import { useModalStore } from '@/shared/model/modalStore';
import { usePublishModalStore } from '@/shared/model/publishModalStore';
import { useLoginModalStore } from '@/features/auth/model/loginModalStore';
import { useToastStore } from '@/shared/model/toastStore';
import { useUIStore } from '@/shared/model/uiStore';

// Mock Stores
vi.mock('@/features/sketch/model/store');
vi.mock('@/features/auth/model/store');
vi.mock('@/shared/model/modalStore');
vi.mock('@/shared/model/publishModalStore');
vi.mock('@/features/auth/model/loginModalStore');
vi.mock('@/shared/model/toastStore');
vi.mock('@/shared/model/uiStore');

describe('useSketchFlow', () => {
    const mockSetSourceImage = vi.fn();
    const mockSetViewMode = vi.fn();
    const mockOpenModal = vi.fn();
    const mockOpenPublishModal = vi.fn();
    const mockOpenLoginModal = vi.fn();
    const mockShowToast = vi.fn();
    const mockResetOptions = vi.fn();
    const mockSetOptions = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useSketchStore as any).mockReturnValue({
            setSourceImage: mockSetSourceImage,
            resetOptions: mockResetOptions,
            setOptions: mockSetOptions
        });
        (useUIStore as any).mockReturnValue({
            setViewMode: mockSetViewMode
        });
        (useModalStore as any).mockReturnValue({ openModal: mockOpenModal });
        (usePublishModalStore as any).mockReturnValue({ openPublishModal: mockOpenPublishModal });
        (useLoginModalStore as any).mockReturnValue({ openLoginModal: mockOpenLoginModal });
        (useToastStore as any).mockReturnValue({ showToast: mockShowToast });
        (useAuthStore as any).mockReturnValue({ user: { uid: 'test-user' } });
    });

    it('handleImageUpload should set source image and switch view mode', () => {
        const { result } = renderHook(() => useSketchFlow());

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        const event = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;

        // Mock URL.createObjectURL
        const mockUrl = 'blob:test';
        globalThis.URL.createObjectURL = vi.fn(() => mockUrl);

        act(() => {
            result.current.handleImageUpload(event);
        });

        expect(mockSetSourceImage).toHaveBeenCalledWith(mockUrl);
        expect(mockSetViewMode).toHaveBeenCalledWith('studio');
    });

    it('handleReset should open confirmation modal', () => {
        const { result } = renderHook(() => useSketchFlow());

        act(() => {
            result.current.handleReset();
        });

        expect(mockOpenModal).toHaveBeenCalled();
        // Verify onConfirm callback
        const modalArgs = mockOpenModal.mock.calls[0][0];
        expect(modalArgs.title).toBe('Reset Options');

        // Simulate confirm
        act(() => {
            modalArgs.onConfirm();
        });
        expect(mockResetOptions).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalled();
    });

    it('handlePublish should open login modal if user not logged in', () => {
        (useAuthStore as any).mockReturnValue({ user: null });
        const { result } = renderHook(() => useSketchFlow());

        act(() => {
            result.current.handlePublish();
        });

        expect(mockOpenLoginModal).toHaveBeenCalled();
        expect(mockOpenPublishModal).not.toHaveBeenCalled();
    });

    // Note: handleDownload requires DOM mocking which is complex here. 
    // We will verify it via integration or manual testing as it is heavily DOM-dependent.
});
