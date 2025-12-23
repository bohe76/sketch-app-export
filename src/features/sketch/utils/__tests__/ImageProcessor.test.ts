import { describe, it, expect } from 'vitest';
// We will implement this class in the next step
import { ImageProcessor } from '../ImageProcessor';

describe('ImageProcessor', () => {
    describe('getBrightness', () => {
        it('should return sum of RGB channels (legacy compatibility)', () => {
            // Existing logic uses simple sum: r + g + b
            expect(ImageProcessor.getBrightness(10, 20, 30)).toBe(60);
            expect(ImageProcessor.getBrightness(255, 255, 255)).toBe(765);
        });
    });

    describe('calculateIntensity', () => {
        it('should return normalized intensity inverted from threshold', () => {
            // Logic from SketchEngine: 1.0 - (brightness / threshold)
            const brightness = 100;
            const threshold = 200;
            // 1.0 - (100 / 200) = 0.5
            expect(ImageProcessor.calculateIntensity(brightness, threshold)).toBe(0.5);
        });

        it('should handle division by zero safely (defensive programming)', () => {
            expect(ImageProcessor.calculateIntensity(100, 0)).toBe(0);
        });
    });
});
