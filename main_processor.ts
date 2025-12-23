/**
 * Pure utility class for image pixel processing.
 * Extracted from SketchEngine.ts during refactoring.
 */
export class ImageProcessor {
    /**
     * Calculates the brightness sum of a pixel.
     * Uses simple sum (R+G+B) to maintain legacy compatibility with SketchEngine logic.
     * @returns number between 0 and 765
     */
    static getBrightness(r: number, g: number, b: number): number {
        return r + g + b;
    }

    /**
     * Calculates the intensity validness of a pixel for drawing.
     * @param brightness The sum of RGB channels
     * @param threshold The threshold below which a pixel is considered 'dark' enough to draw
     * @returns Normalized intensity (0.0 to 1.0). Returns 0 if calculation is invalid.
     */
    static calculateIntensity(brightness: number, threshold: number): number {
        if (threshold === 0) return 0;
        const intensity = 1.0 - (brightness / threshold);
        return intensity < 0 ? 0 : intensity;
    }
}
