import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GenerationResponse, HistoryItem } from '../types';
import { abortRequest, generateImage, styleOptions } from '../services/api';

type UseGenerationState = {
    imageDataUrl: string | null;
    prompt: string;
    style: string;
    isLoading: boolean;
    error: string | null;
    result: GenerationResponse | null;
    history: HistoryItem[];
};

type UseGenerationApi = {
    setImageDataUrl: (dataUrl: string | null) => void;
    setPrompt: (value: string) => void;
    setStyle: (value: string) => void;
    generate: () => Promise<void>;
    abort: () => void;
    restoreFromHistory: (item: HistoryItem) => void;
    styleOptions: { id: string; name: string; description: string }[];
};

const STORAGE_KEY = 'ai-studio:history';
const HISTORY_LIMIT = 5;

const loadHistory = (): HistoryItem[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as HistoryItem[];
        return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
    } catch {
        return [];
    }
};

const saveHistory = (items: HistoryItem[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, HISTORY_LIMIT)));
    } catch {
        // ignore quota errors
    }
};

export function useGeneration(): UseGenerationState & UseGenerationApi {
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [style, setStyle] = useState<string>(styleOptions[0]?.id ?? 'editorial');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GenerationResponse | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());

    const inFlightRef = useRef<boolean>(false);

    useEffect(() => {
        saveHistory(history);
    }, [history]);

    const generate = useCallback(async () => {
        if (!imageDataUrl || !prompt || !style) {
            setError('Please provide an image, prompt, and style.');
            return;
        }

        if (inFlightRef.current) return;
        inFlightRef.current = true;

        setIsLoading(true);
        setError(null);
        setResult(null);

        const maxAttempts = 3;
        let attempt = 0;
        let lastError: string | null = null;

        while (attempt < maxAttempts) {
            try {
                const response = await generateImage({ imageDataUrl, prompt, style });
                setResult(response);
                setHistory((prev) => [response, ...prev].slice(0, HISTORY_LIMIT));
                setIsLoading(false);
                inFlightRef.current = false;
                return;
            } catch (e: unknown) {
                const message = (e as { message?: string })?.message ?? 'Unknown error';
                if (message === 'Request aborted') {
                    lastError = message;
                    break;
                }
                lastError = message;
                attempt += 1;
                if (attempt >= maxAttempts) break;
                // Exponential backoff: 500ms, 1000ms
                const delay = 500 * Math.pow(2, attempt - 1);
                await new Promise((r) => setTimeout(r, delay));
            }
        }

        setIsLoading(false);
        setError(lastError ?? 'Failed to generate image');
        inFlightRef.current = false;
    }, [imageDataUrl, prompt, style]);

    const abort = useCallback(() => {
        if (!inFlightRef.current) return;
        abortRequest();
    }, []);

    const restoreFromHistory = useCallback((item: HistoryItem) => {
        setImageDataUrl(item.imageUrl);
        setPrompt(item.prompt);
        setStyle(item.style);
        setResult(item);
        setError(null);
    }, []);

    const api: UseGenerationApi = useMemo(
        () => ({
            setImageDataUrl,
            setPrompt,
            setStyle,
            generate,
            abort,
            restoreFromHistory,
            styleOptions,
        }),
        [generate, abort, restoreFromHistory]
    );

    return {
        imageDataUrl,
        prompt,
        style,
        isLoading,
        error,
        result,
        history,
        ...api,
    };
}

export default useGeneration;


