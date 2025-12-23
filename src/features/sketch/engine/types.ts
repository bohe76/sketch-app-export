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

import { SKETCH_DEFAULTS } from '@/shared/config/constants';

export const DEFAULT_OPTIONS: SketchOptions = {
    drawSpeed: 160,
    branchProbability: SKETCH_DEFAULTS.BRANCH_PROBABILITY,
    maxHeads: SKETCH_DEFAULTS.MAX_HEADS,
    scaleFactor: SKETCH_DEFAULTS.SCALE_FACTOR,
    threshold: 640,
    minLife: 100,
    maxLife: 300,
    momentum: SKETCH_DEFAULTS.MOMENTUM,
    lineWidth: SKETCH_DEFAULTS.LINE_WIDTH,
    alpha: SKETCH_DEFAULTS.ALPHA,
    mode: 'bw'
};
