import { DEFAULT_OPTIONS } from './types';
import type { SketchOptions, PixelData, DrawingHead } from './types';
import { ImageProcessor } from '../utils/ImageProcessor';
import { APP_CONFIG } from '@/shared/config/constants';





export class SketchEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private options: SketchOptions;

    private pixelMap: Map<string, PixelData>;
    private drawingHeads: DrawingHead[];
    private totalBlackPixels: number;
    private drawnBlackPixels: number;

    private img: HTMLImageElement;
    private isActive: boolean;
    private animationId: number | null;

    // Image properties
    private imageWidth: number = 0;
    private imageHeight: number = 0;
    private offsetX: number = 0;
    private offsetY: number = 0;

    constructor(canvas: HTMLCanvasElement, options: Partial<SketchOptions> = {}) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get 2D context');
        this.ctx = context;

        this.options = { ...DEFAULT_OPTIONS, ...options };

        this.pixelMap = new Map();
        this.drawingHeads = [];
        this.totalBlackPixels = 0;
        this.drawnBlackPixels = 0;

        this.img = new Image();
        this.isActive = false;
        this.animationId = null;
    }

    // --- Core Logic ---

    // The single fundamental drawing step
    private step() {
        if (this.drawnBlackPixels >= this.totalBlackPixels) return false;

        // Spawn new heads if needed
        if (this.drawingHeads.length < this.options.maxHeads && Math.random() < 0.1) {
            this.spawnHead();
        }

        // Process all active drawing heads
        for (let i = this.drawingHeads.length - 1; i >= 0; i--) {
            const head = this.drawingHeads[i];
            const key = `${head.x},${head.y}`;
            const currentPixel = this.pixelMap.get(key);

            if (currentPixel) {
                if (currentPixel.visitCount === 0) this.drawnBlackPixels++;
                currentPixel.visitCount++;
                head.life--;
            }

            if (head.life <= 0) {
                this.drawingHeads.splice(i, 1);
                continue;
            }

            // Find valid neighbors
            const neighbors = [];
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nKey = `${head.x + dx},${head.y + dy}`;
                    const np = this.pixelMap.get(nKey);
                    if (np && np.visitCount < 2) {
                        neighbors.push({ pixel: np, dx, dy });
                    }
                }
            }

            if (neighbors.length === 0) {
                this.drawingHeads.splice(i, 1);
            } else {
                // Movement with Momentum
                if (head.vx !== 0 || head.vy !== 0) {
                    neighbors.sort((a, b) => {
                        const dotA = a.dx * head.vx + a.dy * head.vy;
                        const dotB = b.dx * head.vx + b.dy * head.vy;
                        const momentum = this.options.momentum;
                        const scoreA = (dotA * momentum) + (a.pixel.intensity * 3) - (a.pixel.visitCount * 2);
                        const scoreB = (dotB * momentum) + (b.pixel.intensity * 3) - (b.pixel.visitCount * 2);
                        return scoreB - scoreA;
                    });
                } else {
                    neighbors.sort((a, b) => b.pixel.intensity - a.pixel.intensity);
                }

                const next = neighbors[0];
                if (next.pixel.visitCount > 10) {
                    this.drawingHeads.splice(i, 1);
                    continue;
                }

                head.x = next.pixel.x;
                head.y = next.pixel.y;
                head.vx = next.dx;
                head.vy = next.dy;

                // Draw path
                this.ctx.beginPath();
                this.ctx.moveTo(this.offsetX + (head.x - head.vx), this.offsetY + (head.y - head.vy));
                this.ctx.lineTo(this.offsetX + head.x, this.offsetY + head.y);

                const baseAlpha = this.options.alpha;
                const calculatedAlpha = Math.max(0.05, (next.pixel.intensity || 0.5) * (baseAlpha / 0.1) - (next.pixel.visitCount * 0.05));

                let strokeStyle = `rgba(0,0,0,${calculatedAlpha})`;
                if (this.options.mode === 'invert') {
                    strokeStyle = `rgba(255,255,255,${calculatedAlpha})`;
                } else if (this.options.mode === 'sepia') {
                    strokeStyle = `rgba(93,64,55,${calculatedAlpha})`;
                } else if (this.options.mode === 'color' && next.pixel.color) {
                    const { r, g, b } = next.pixel.color;
                    strokeStyle = `rgba(${r},${g},${b},${calculatedAlpha})`;
                }

                this.ctx.strokeStyle = strokeStyle;
                this.ctx.lineWidth = this.options.lineWidth;
                this.ctx.stroke();

                // Branching
                if (neighbors.length > 2 &&
                    this.drawingHeads.length < this.options.maxHeads &&
                    Math.random() < this.options.branchProbability) {
                    this.spawnHead();
                }
            }
        }
        return true;
    }

    // --- Execution Strategies ---

    /**
     * Strategy 1: Live Animation
     * Renders step-by-step using requestAnimationFrame for smooth progression.
     */
    renderLive(imageUrl: string, maxDimension?: number) {
        this.stop();
        this.isActive = true;
        this.loadImage(imageUrl, () => {
            this.prepareCanvas(maxDimension);

            const loop = () => {
                if (!this.isActive) return;
                // Run multiple steps per frame for speed control
                for (let i = 0; i < this.options.drawSpeed; i++) {
                    if (!this.step()) break;
                }
                this.animationId = requestAnimationFrame(loop);
            };
            this.animationId = requestAnimationFrame(loop);
        });
    }

    /**
     * Strategy 2: Instant Completion
     * Renders the entire sketch in a single synchronous loop without waiting for frames.
     * Perfect for thumbnails and static exports.
     */
    async renderInstant(imageUrl: string, maxDimension?: number) {
        return new Promise<void>((resolve) => {
            this.stop();
            this.loadImage(imageUrl, () => {
                this.prepareCanvas(maxDimension);

                // Run until completion (max 100,000 steps for high fidelity)
                let safety = 0;
                while (this.step() && safety < APP_CONFIG.MAX_STEPS_INSTANT) {
                    safety++;
                    // Stop if covering 99% of target pixels
                    if (this.drawnBlackPixels >= this.totalBlackPixels * 0.99) break;
                }

                resolve();
            });
        });
    }

    // --- Internal Helpers ---

    private loadImage(url: string, callback: () => void) {
        this.img.crossOrigin = "Anonymous";
        const isBlob = url.startsWith('blob:');
        this.img.src = isBlob ? url : `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
        this.img.onload = callback;
    }

    private prepareCanvas(maxDimension?: number) {
        this.resize(maxDimension);
        this.analyzeImage(maxDimension);
        this.initDrawing();
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    updateOptions(newOptions: Partial<SketchOptions>) {
        this.options = { ...this.options, ...newOptions };
    }

    resize(maxDimension?: number) {
        if (!this.canvas.parentElement && !maxDimension) return;

        let width, height;
        const rect = this.canvas.parentElement?.getBoundingClientRect();

        if (maxDimension && !rect) {
            // Fallback only if no parent exists (like in some headless tests)
            width = maxDimension;
            height = maxDimension;
        } else if (rect) {
            // Always respect the actual rendered size in the UI
            width = rect.width;
            height = rect.height;
        } else {
            return;
        }

        const dpr = maxDimension ? 1 : (window.devicePixelRatio || 1);
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
    }

    private analyzeImage(maxDimension?: number) {
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) return;

        const dpr = maxDimension ? 1 : (window.devicePixelRatio || 1);
        const canvasWidth = this.canvas.width / dpr;
        const canvasHeight = this.canvas.height / dpr;
        const aspect = this.img.width / this.img.height;
        const canvasAspect = canvasWidth / canvasHeight;

        // --- CRITICAL: Fit image to canvas area precisely ---
        if (aspect > canvasAspect) {
            // Image is wider than canvas
            this.imageWidth = canvasWidth * this.options.scaleFactor;
            this.imageHeight = this.imageWidth / aspect;
        } else {
            // Image is taller than canvas (like most masonry cards)
            this.imageHeight = canvasHeight * this.options.scaleFactor;
            this.imageWidth = this.imageHeight * aspect;
        }

        // Capping resolution for thumbnails (performance optimization)
        if (maxDimension) {
            const scale = Math.min(1, (maxDimension * 1.5) / Math.max(this.imageWidth, this.imageHeight));
            this.imageWidth *= scale;
            this.imageHeight *= scale;
        }

        this.offsetX = (canvasWidth - this.imageWidth) / 2;
        this.offsetY = (canvasHeight - this.imageHeight) / 2;

        offCanvas.width = this.imageWidth;
        offCanvas.height = this.imageHeight;
        offCtx.drawImage(this.img, 0, 0, this.imageWidth, this.imageHeight);

        const data = offCtx.getImageData(0, 0, this.imageWidth, this.imageHeight).data;
        this.pixelMap.clear();

        for (let y = 0; y < this.imageHeight; y++) {
            for (let x = 0; x < this.imageWidth; x++) {
                const i = (y * Math.floor(this.imageWidth) + x) * 4;
                if (data[i + 3] > 128) {
                    const r = data[i], g = data[i + 1], b = data[i + 2];
                    const brightness = ImageProcessor.getBrightness(r, g, b);
                    if (brightness < this.options.threshold) {
                        const key = `${Math.floor(x)},${Math.floor(y)}`;
                        this.pixelMap.set(key, {
                            x: Math.floor(x), y: Math.floor(y), visitCount: 0,
                            intensity: ImageProcessor.calculateIntensity(brightness, this.options.threshold),
                            color: { r, g, b }
                        });
                    }
                }
            }
        }
        this.totalBlackPixels = this.pixelMap.size;
        this.drawnBlackPixels = 0;

        // Expose bounds for download
        this.canvas.dataset.imgX = (this.offsetX * dpr).toString();
        this.canvas.dataset.imgY = (this.offsetY * dpr).toString();
        this.canvas.dataset.imgW = (this.imageWidth * dpr).toString();
        this.canvas.dataset.imgH = (this.imageHeight * dpr).toString();
    }

    private initDrawing() {
        this.drawingHeads = [];
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);

        if (this.options.transparent) {
            this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        } else {
            this.ctx.fillStyle = this.options.mode === 'invert' ? '#000000' : '#ffffff';
            this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        this.spawnHead();
    }

    private spawnHead() {
        if (this.drawnBlackPixels >= this.totalBlackPixels) return;
        let attempts = 0;
        while (attempts < 50) {
            const randX = Math.floor(Math.random() * this.imageWidth);
            const randY = Math.floor(Math.random() * this.imageHeight);
            const key = `${randX},${randY}`;
            const pixel = this.pixelMap.get(key);
            if (pixel && pixel.visitCount < 5) {
                this.drawingHeads.push({ x: randX, y: randY, vx: 0, vy: 0, life: 200 });
                return;
            }
            attempts++;
        }
        for (const pixel of this.pixelMap.values()) {
            if (pixel.visitCount === 0) {
                this.drawingHeads.push({ x: pixel.x, y: pixel.y, vx: 0, vy: 0, life: 200 });
                return;
            }
        }
    }
}
