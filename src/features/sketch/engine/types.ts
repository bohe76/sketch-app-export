export interface SketchOptions {
    drawSpeed: number;
    branchProbability: number;
    maxHeads: number;
    scaleFactor: number;
    transparent?: boolean;
    threshold: number;
    minLife: number;
    maxLife: number;
    momentum: number;
    lineWidth: number;
    alpha: number;
    mode: 'bw' | 'sepia' | 'color' | 'invert';
}

export interface PixelData {
    x: number;
    y: number;
    visitCount: number;
    intensity: number;
    color?: { r: number; g: number; b: number };
}

export interface DrawingHead {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

export const DEFAULT_OPTIONS: SketchOptions = {
    drawSpeed: 160,
    branchProbability: 0.05,
    maxHeads: 64,
    scaleFactor: 0.8,
    threshold: 640,
    minLife: 100,
    maxLife: 300,
    momentum: 0.5,
    lineWidth: 0.5,
    alpha: 0.1,
    mode: 'bw'
};
