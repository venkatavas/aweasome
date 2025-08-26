import { describe, expect, it } from 'vitest';
import { isValidImageFile, isWithinSizeLimit } from '../utils/imageUtils';

const makeFile = (type: string, size: number) => new File([new Uint8Array(size)], 'x', { type });

describe('imageUtils', () => {
    it('validates file types', () => {
        expect(isValidImageFile(makeFile('image/png', 1))).toBe(true);
        expect(isValidImageFile(makeFile('image/jpeg', 1))).toBe(true);
        expect(isValidImageFile(makeFile('image/jpg', 1))).toBe(true);
        expect(isValidImageFile(makeFile('image/gif', 1))).toBe(false);
    });

    it('validates size limit 10MB', () => {
        expect(isWithinSizeLimit(makeFile('image/png', 10 * 1024 * 1024))).toBe(true);
        expect(isWithinSizeLimit(makeFile('image/png', 10 * 1024 * 1024 + 1))).toBe(false);
    });
});


