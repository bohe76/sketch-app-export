import React, { useState, useEffect, useRef } from 'react';
import { useSketchStore } from '@/features/sketch/model/store';
import { SketchEngine } from '@/features/sketch/engine/SketchEngine';
import {
    AdjustmentsHorizontalIcon,
    PaintBrushIcon,
    SunIcon,
    SwatchIcon,
    Square3Stack3DIcon,
    XMarkIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { HexColorPicker } from 'react-colorful';

interface ControlPanelProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const STYLES = [
    { id: 'classic', name: 'Classic', mode: 'bw', alpha: 0.1, momentum: 0.5, desc: 'Graphite Fine Art' },
    { id: 'vintage', name: 'Vintage', mode: 'sepia', alpha: 0.2, momentum: 0.3, desc: 'Nostalgic Film' },
    { id: 'vivid', name: 'Vivid', mode: 'color', alpha: 0.3, momentum: 0.7, desc: 'Vibrant Ink' }
] as const;

// --- Sub-component for Style List Item (Static or Live) ---
const StyleCard: React.FC<{
    style: typeof STYLES[number];
    isActive: boolean;
    onClick: () => void;
    sourceImage: string | null;
}> = ({ style, isActive, onClick, sourceImage }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // CASE: User image exists -> Generate live preview snapshot
        if (sourceImage && canvasRef.current) {
            const engine = new SketchEngine(canvasRef.current, {
                mode: style.mode,
                alpha: style.alpha,
                momentum: style.momentum,
                scaleFactor: 1.2,
                threshold: 640
            });

            // Render instantly and capture as image for flicker-free zoom
            engine.renderInstant(sourceImage, 120).then(() => {
                if (canvasRef.current) {
                    setPreviewUrl(canvasRef.current.toDataURL('image/webp', 0.8));
                }
            });
        }

        // CASE: User image cleared (e.g. published) -> Reset to default
        if (!sourceImage) {
            Promise.resolve().then(() => setPreviewUrl(null));
        }
    }, [sourceImage, style.mode, style.alpha, style.momentum]);

    return (
        <button
            onClick={onClick}
            className={`relative group flex items-center gap-4 p-2 rounded-2xl border transition-all duration-300 active:scale-[0.98]
                ${isActive
                    ? 'border-zinc-800 bg-[var(--color-surface-selected)] shadow-xl'
                    : 'border-zinc-300 bg-white hover:border-zinc-800 shadow-sm'}`}
        >
            {/* Hidden canvas for background snapshot generation */}
            <canvas ref={canvasRef} width={80} height={80} className="hidden" />

            {/* 48px Thumbnail Container */}
            <div className="w-12 h-12 flex-shrink-0 relative overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100">
                <img
                    src={previewUrl || `/images/thumb_${style.id}.png`}
                    alt={style.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
            </div>

            <div className="flex-1 text-left min-w-0 pr-2">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`block text-[11px] font-black uppercase tracking-wider truncate
                        ${isActive ? 'text-white' : 'text-zinc-800'}`}>
                        {style.name}
                    </span>
                    {isActive && <SparklesIcon className="w-3 h-3 text-zinc-400 animate-pulse" />}
                </div>
                <span className={`block text-[10px] font-medium leading-tight truncate
                    ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {style.desc}
                </span>
            </div>

            {/* Selection indicator */}
            {isActive && (
                <div className="absolute -top-1 -right-1 bg-[var(--color-surface-selected)] border-2 border-white rounded-full p-0.5 shadow-sm">
                    <div className="w-2 h-2 bg-white rounded-full" />
                </div>
            )}
        </button>
    );
};

export const ControlPanel: React.FC<ControlPanelProps> = () => {
    const { options, setOptions, isDrawing, sourceImage, setIsPaused } = useSketchStore();
    const [activeSetting, setActiveSetting] = useState<string | null>(null);
    const [activeStyle, setActiveStyle] = useState('classic');

    // Sync UI selection when options change externally (e.g. Remix/Edit)
    useEffect(() => {
        const style = STYLES.find(s => s.mode === options.mode);
        if (style && style.id !== activeStyle) {
            // Use resolve to avoid synchronous cascading render warning in lint
            Promise.resolve().then(() => {
                setActiveStyle(style.id);
            });
        }
    }, [options.mode, activeStyle]);

    const styleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleStyleChange = (styleId: string) => {
        // Clear any pending style updates
        if (styleTimerRef.current) {
            clearTimeout(styleTimerRef.current);
        }

        const prevStyle = activeStyle;
        const nextStyle = styleId;
        const style = STYLES.find(s => s.id === styleId);

        // Immediate UI Update (for smooth CSS transitions)
        setActiveStyle(styleId);

        if (!style) return;

        const updateDrawing = () => {
            setOptions({
                mode: style.mode as any,
                alpha: style.alpha,
                momentum: style.momentum,
                // Boost speed when tuning
                drawSpeed: 150,
                maxHeads: 100
            });
        };

        // If entering or exiting Vintage mode, delay drawing to keep UI animations smooth
        const isVintageTransition = prevStyle === 'vintage' || nextStyle === 'vintage';
        const isMobile = window.innerWidth < 1024;

        if (isMobile && isVintageTransition) {
            // CRITICAL OPTIMIZATION: STOP and CLEAR drawing immediately to free up CPU for animation
            setIsPaused(true);

            styleTimerRef.current = setTimeout(() => {
                setIsPaused(false);
                updateDrawing();
            }, 500);
        } else {
            // Normal transition: Just update instantly
            updateDrawing();
        }
    };

    const handleChange = (key: string, value: number) => {
        setOptions({
            [key]: value,
            // Boost speed when tuning
            drawSpeed: 150,
            maxHeads: 100
        });
    };

    const renderSlider = (
        key: string,
        label: string,
        min: number,
        max: number,
        step: number,
        valueDisplay: string | number,
        icon: React.ReactNode
    ) => (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-zinc-600">{icon}</span>
                    <span>{label}</span>
                </div>
                <span className="text-zinc-900 tabular-nums">{valueDisplay}</span>
            </label>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={(options as any)[key] || 0}
                onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                className="input-range-premium"
                disabled={key === 'scaleFactor' && isDrawing}
            />
        </div>
    );

    return (
        <>
            {/* --- LEFT FLOATING TINT PANEL --- */}
            {activeStyle === 'vintage' && (
                <div className="fixed right-[344px] top-[120px] z-40 hidden lg:block animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="bg-white/90 backdrop-blur-xl border border-zinc-200/50 shadow-2xl rounded-2xl p-4 w-auto">
                        <div className="flex flex-col items-start gap-1.5 mb-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-800 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-zinc-800" />
                                Tint Color
                            </h3>
                            <div className="flex w-full rounded border border-zinc-200 overflow-hidden h-6 shadow-sm">
                                <div
                                    className="w-1/2 h-full border-r border-zinc-100/50"
                                    style={{ backgroundColor: options.tintColor || '#5d4037' }}
                                />
                                <div className="w-1/2 h-full flex items-center justify-center bg-zinc-50 text-[10px] font-mono text-zinc-500 tracking-wider">
                                    {options.tintColor || '#5d4037'}
                                </div>
                            </div>
                        </div>

                        {/* React Colorful Component */}
                        <div className="custom-color-picker-wrapper">
                            <HexColorPicker
                                color={options.tintColor || '#5d4037'}
                                onChange={(newColor) => setOptions({ tintColor: newColor })}
                                style={{ width: '100%', height: '160px' }}
                            />
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400">
                            <SparklesIcon className="w-3 h-3" />
                            <span>Pick a tone for vintage effect</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DESKTOP SIDEBAR --- */}
            <div className="control-panel-sidebar shadow-2xl border-l border-zinc-100 bg-white/90 backdrop-blur-xl">
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-zinc-50">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800">
                            Sketch Tuning
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">

                        {/* 1. Style Selection List */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                                <SwatchIcon className="w-4 h-4 text-zinc-600" />
                                <span>Style Mode</span>
                            </label>

                            <div className="flex flex-col gap-3">
                                {STYLES.map((style) => (
                                    <StyleCard
                                        key={style.id}
                                        style={style}
                                        isActive={activeStyle === style.id}
                                        onClick={() => handleStyleChange(style.id)}
                                        sourceImage={sourceImage}
                                    />
                                ))}
                            </div>
                        </div>


                        {/* 2. Visual Sliders */}
                        <div className="space-y-4 pt-2">
                            {renderSlider('momentum', 'Texture', 0.0, 1.0, 0.1, options.momentum?.toFixed(1) || '0.5', <Square3Stack3DIcon className="w-4 h-4" />)}
                            {renderSlider('alpha', 'Opacity', 0.1, 1.0, 0.1, options.alpha?.toFixed(1) || '0.1', <SunIcon className="w-4 h-4" />)}
                            {renderSlider('lineWidth', 'Thickness', 0.1, 2.0, 0.1, options.lineWidth?.toFixed(1) || '0.5', <PaintBrushIcon className="w-4 h-4" />)}
                            {renderSlider('threshold', 'Sensitivity', 100, 765, 5, options.threshold, <AdjustmentsHorizontalIcon className="w-4 h-4" />)}

                        </div>

                        <div className="pt-6 border-t border-zinc-50">
                            <p className="text-[10px] text-zinc-400 italic leading-relaxed">
                                Experience high-fidelity sketches with our optimized artistic engine.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MOBILE COMPACT TOOLBAR --- */}
            {activeSetting && (
                <div className="md:hidden slider-popup">
                    <div className="slider-popup-content relative">
                        <button
                            onClick={() => setActiveSetting(null)}
                            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <div className="flex-1 pr-6">
                            {activeSetting === 'style' && (
                                <div className="space-y-4 py-2">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600">Choose Style</h3>
                                    <div className="flex flex-col gap-3 pb-4">
                                        {STYLES.map((style) => (
                                            <StyleCard
                                                key={style.id}
                                                style={style}
                                                isActive={activeStyle === style.id}
                                                onClick={() => handleStyleChange(style.id)}
                                                sourceImage={sourceImage}
                                            />
                                        ))}
                                    </div>

                                    {/* Mobile Tint Picker (Smooth Expansion) */}
                                    <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${activeStyle === 'vintage' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden min-h-0">
                                            <div className="pt-4 mt-4 border-t border-zinc-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                                        Tint Color
                                                    </h4>
                                                    <div className="flex w-24 rounded border border-zinc-100 overflow-hidden h-5">
                                                        <div
                                                            className="w-1/3 h-full"
                                                            style={{ backgroundColor: options.tintColor || '#5d4037' }}
                                                        />
                                                        <div className="w-2/3 h-full flex items-center justify-center bg-zinc-50 text-[9px] font-mono text-zinc-400">
                                                            {options.tintColor || '#5d4037'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="custom-color-picker-wrapper">
                                                    <HexColorPicker
                                                        color={options.tintColor || '#5d4037'}
                                                        onChange={(newColor) => setOptions({ tintColor: newColor })}
                                                        style={{ width: '100%', height: '140px' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeSetting === 'texture' && renderSlider('momentum', 'Texture', 0.0, 1.0, 0.1, options.momentum?.toFixed(1) || '0.5', <Square3Stack3DIcon className="w-4 h-4" />)}
                            {activeSetting === 'opacity' && renderSlider('alpha', 'Opacity', 0.1, 1.0, 0.1, options.alpha?.toFixed(1) || '0.1', <SunIcon className="w-4 h-4" />)}
                            {activeSetting === 'thickness' && renderSlider('lineWidth', 'Thickness', 0.1, 2.0, 0.1, options.lineWidth?.toFixed(1) || '0.5', <PaintBrushIcon className="w-4 h-4" />)}
                            {activeSetting === 'sensitivity' && renderSlider('threshold', 'Sensitivity', 100, 765, 5, options.threshold, <AdjustmentsHorizontalIcon className="w-4 h-4" />)}
                        </div>
                    </div>
                </div>
            )}

            <div className="toolbar-wrapper">
                <div className="toolbar-pill bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl">
                    <button onClick={() => setActiveSetting(activeSetting === 'style' ? null : 'style')} className={`toolbar-icon ${activeSetting === 'style' ? 'toolbar-icon-active' : ''}`}><SwatchIcon className="w-6 h-6" /></button>
                    <button onClick={() => setActiveSetting(activeSetting === 'texture' ? null : 'texture')} className={`toolbar-icon ${activeSetting === 'texture' ? 'toolbar-icon-active' : ''}`}><Square3Stack3DIcon className="w-6 h-6" /></button>
                    <button onClick={() => setActiveSetting(activeSetting === 'opacity' ? null : 'opacity')} className={`toolbar-icon ${activeSetting === 'opacity' ? 'toolbar-icon-active' : ''}`}><SunIcon className="w-6 h-6" /></button>
                    <button onClick={() => setActiveSetting(activeSetting === 'thickness' ? null : 'thickness')} className={`toolbar-icon ${activeSetting === 'thickness' ? 'toolbar-icon-active' : ''}`}><PaintBrushIcon className="w-6 h-6" /></button>
                    <button onClick={() => setActiveSetting(activeSetting === 'sensitivity' ? null : 'sensitivity')} className={`toolbar-icon ${activeSetting === 'sensitivity' ? 'toolbar-icon-active' : ''}`}><AdjustmentsHorizontalIcon className="w-6 h-6" /></button>
                </div>
            </div>
        </>
    );
};
