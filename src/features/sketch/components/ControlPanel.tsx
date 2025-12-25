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
    { id: 'vintage', name: 'Vintage', mode: 'sepia', alpha: 0.1, momentum: 0.5, desc: 'Nostalgic Film' },
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
    const { options, setOptions, isDrawing, sourceImage } = useSketchStore();
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

    const handleStyleChange = (styleId: string) => {
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

        // Efficient Drawing Update (No artificial delay for mobile anymore)
        updateDrawing();
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
                    <div className="slider-popup-content relative flex flex-col">
                        <button
                            onClick={() => setActiveSetting(null)}
                            className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 z-10"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <div className="flex-1 w-full">
                            {activeSetting === 'style' && (
                                <div className="flex flex-col h-full pt-1 pb-2">
                                    {/* 1. Dynamic Header Info */}
                                    <div className="mb-3 px-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-black uppercase tracking-widest text-zinc-800">
                                                {STYLES.find(s => s.id === activeStyle)?.name}
                                            </span>
                                            {activeStyle === 'vintage' && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">
                                                    Tint Active
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-zinc-500 font-medium leading-tight block">
                                            {STYLES.find(s => s.id === activeStyle)?.desc}
                                        </span>
                                    </div>

                                    {/* 2. Horizontal Scrollable Thumbnails */}
                                    <div className="relative w-full">
                                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                                            {STYLES.map((style) => {
                                                const isActive = activeStyle === style.id;
                                                return (
                                                    <button
                                                        key={style.id}
                                                        onClick={() => handleStyleChange(style.id)}
                                                        className={`relative flex-shrink-0 group rounded-xl border transition-all duration-200 active:scale-95
                                                            ${isActive
                                                                ? 'border-zinc-800 ring-2 ring-zinc-800 ring-offset-2'
                                                                : 'border-zinc-200 hover:border-zinc-400'}`}
                                                    >
                                                        {/* Thumbnail Only */}
                                                        <div className="w-16 h-16 rounded-[10px] overflow-hidden bg-zinc-100 relative">
                                                            <div className={`absolute inset-0 z-10 ${isActive ? 'bg-transparent' : 'bg-black/5'}`} />
                                                            <img
                                                                src={`/images/thumb_${style.id}.png`}
                                                                alt={style.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        {/* Active Dot */}
                                                        {isActive && (
                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-zinc-800 rounded-full border-2 border-white shadow-sm z-20" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                            {/* Spacer for right padding */}
                                            <div className="w-1 flex-shrink-0" />
                                        </div>
                                    </div>

                                    {/* 3. Tint Picker Overlay (Only for Vintage) */}
                                    {activeStyle === 'vintage' && (
                                        <div className="absolute left-0 right-0 bottom-full mb-4 mx-0 animate-in slide-in-from-bottom-4 duration-300 z-50">
                                            <div className="bg-white/95 backdrop-blur-xl border border-zinc-200 shadow-2xl rounded-2xl p-4 mx-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                                                        Tint Color
                                                    </h4>
                                                    <div className="flex w-28 rounded-md border border-zinc-200 overflow-hidden h-7 shadow-sm">
                                                        <div
                                                            className="w-[45%] h-full border-r border-zinc-100"
                                                            style={{ backgroundColor: options.tintColor || '#5d4037' }}
                                                        />
                                                        <div className="w-[55%] h-full flex items-center justify-center bg-zinc-50 text-[10px] font-mono text-zinc-500 font-medium tracking-wide">
                                                            {options.tintColor || '#5d4037'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Fixed styles to prevent 1px gap and layout shift */}
                                                <style>{`
                                                    .custom-color-picker-wrapper .react-colorful {
                                                        height: 120px !important;
                                                        width: 100% !important;
                                                    }
                                                    .custom-color-picker-wrapper .react-colorful__saturation {
                                                        border-bottom: none !important;
                                                        border-radius: 8px 8px 0 0 !important;
                                                        margin-bottom: 0 !important;
                                                    }
                                                    .custom-color-picker-wrapper .react-colorful__hue {
                                                        height: 24px !important;
                                                        border-radius: 0 0 8px 8px !important;
                                                        margin-top: -1px !important; /* Overlap to hide gap */
                                                    }
                                                `}</style>
                                                <div className="custom-color-picker-wrapper overflow-hidden rounded-lg bg-black">
                                                    <HexColorPicker
                                                        color={options.tintColor || '#5d4037'}
                                                        onChange={(newColor) => setOptions({ tintColor: newColor })}
                                                    />
                                                </div>
                                            </div>
                                            {/* Pointer Arrow */}
                                            <div className="absolute left-1/2 -ml-2 -bottom-2 w-4 h-4 bg-white border-b border-r border-zinc-200 transform rotate-45" />
                                        </div>
                                    )}
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
