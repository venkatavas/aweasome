import { describe, expect, it, vi } from 'vitest';
import { generateImage, abortRequest } from '../services/api';

describe('generateImage mock API', () => {
    it('resolves with a response shape', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.9); // force success
        const start = Date.now();
        const res = await generateImage({ imageDataUrl: 'data:', prompt: 'p', style: 'editorial' });
        const elapsed = Date.now() - start;
        expect(res).toHaveProperty('id');
        expect(res).toMatchObject({ imageUrl: 'data:', prompt: 'p', style: 'editorial' });
        expect(elapsed).toBeGreaterThanOrEqual(900); // ~1s
        (Math.random as unknown as { mockRestore: () => void }).mockRestore();
    });

    it('can abort a request', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.9);
        const promise = generateImage({ imageDataUrl: 'data:', prompt: 'p', style: 'editorial' });
        abortRequest();
        await expect(promise).rejects.toMatchObject({ message: 'Request aborted' });
        (Math.random as unknown as { mockRestore: () => void }).mockRestore();
    });
});


