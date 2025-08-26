import React, { useState, useCallback, useRef } from 'react';
import { Upload as UploadIcon, X, Loader2, ImageIcon, Clock, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import { downscaleImageIfNeeded, isValidImageFile, isWithinSizeLimit } from '../utils/imageUtils';
import { generateImage, abortRequest } from '../services/api';
import type { GenerationResponse } from '../types';

type StyleOption = 'editorial' | 'streetwear' | 'vintage' | 'minimalist' | 'cinematic';

const STYLE_OPTIONS: { value: StyleOption; label: string; description: string }[] = [
  { value: 'editorial', label: 'Editorial', description: 'Clean, magazine-style aesthetic' },
  { value: 'streetwear', label: 'Streetwear', description: 'Urban, contemporary fashion' },
  { value: 'vintage', label: 'Vintage', description: 'Retro, classic styling' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple, refined elegance' },
  { value: 'cinematic', label: 'Cinematic', description: 'Dramatic, movie-like quality' }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_HISTORY = 5;
const STORAGE_KEY = 'ai-studio-history';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

const FileUpload: React.FC<{
  onFileSelect: (dataUrl: string) => void;
  disabled?: boolean;
}> = ({ onFileSelect, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFile = useCallback(async (file: File) => {
    setError('');

    if (!isValidImageFile(file)) {
      setError('Please upload a PNG or JPG image');
      return;
    }

    if (file.size > MAX_FILE_SIZE || !isWithinSizeLimit(file)) {
      // will be downscaled in util
    }

    try {
      const dataUrl = await downscaleImageIfNeeded(file);
      onFileSelect(dataUrl);
    } catch (err) {
      setError('Failed to process image');
      // eslint-disable-next-line no-console
      console.error('Image processing error:', err);
    }
  }, [onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="space-y-2">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          bg-white
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload image file"
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
          aria-hidden="true"
        />
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop your image here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          PNG or JPG up to 10MB
        </p>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm" role="alert">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};

const ImagePreview: React.FC<{
  src: string;
  alt: string;
  onRemove: () => void;
}> = ({ src, alt, onRemove }) => (
  <div className="relative group">
    <img
      src={src}
      alt={alt}
      className="w-full h-64 object-cover rounded-lg border border-gray-200"
    />
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
      aria-label="Remove image"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

const StyleSelector: React.FC<{
  value: StyleOption;
  onChange: (style: StyleOption) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => (
  <div className="space-y-2">
    <label htmlFor="style-select" className="block text-sm font-medium text-gray-700">
      Style
    </label>
    <select
      id="style-select"
      value={value}
      onChange={(e) => onChange(e.target.value as StyleOption)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      aria-describedby="style-description"
    >
      {STYLE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <p id="style-description" className="text-sm text-gray-500">
      {STYLE_OPTIONS.find((opt) => opt.value === value)?.description}
    </p>
  </div>
);

const GenerationHistory: React.FC<{
  history: GenerationResponse[];
  onSelect: (generation: GenerationResponse) => void;
}> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="mx-auto h-12 w-12 mb-4 text-gray-300" />
        <p>No generations yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Recent Generations</h3>
      <div className="space-y-3">
        {history.map((generation) => (
          <button
            key={generation.id}
            onClick={() => onSelect(generation)}
            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <div className="flex gap-3">
              <img
                src={generation.imageUrl}
                alt={`Generated: ${generation.prompt}`}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {generation.prompt}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {generation.style}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(generation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const LiveSummary: React.FC<{
  imageUrl?: string;
  prompt: string;
  style: StyleOption;
}> = ({ imageUrl, prompt, style }) => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
    <h3 className="font-medium text-gray-900">Live Preview</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Image</p>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-20 object-cover rounded border"
          />
        ) : (
          <div className="w-full h-20 bg-gray-200 rounded border flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Prompt</p>
        <p className="text-sm text-gray-600 bg-white p-2 rounded border min-h-[3rem] flex items-center">
          {prompt || 'No prompt entered'}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Style</p>
        <p className="text-sm text-gray-600 bg-white p-2 rounded border min-h-[3rem] flex items-center capitalize">
          {style}
        </p>
      </div>
    </div>
  </div>
);

export default function AIStudio() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<StyleOption>('editorial');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [history, setHistory] = useLocalStorage<GenerationResponse[]>(STORAGE_KEY, []);

  const canGenerate = imageUrl && prompt.trim() && !isGenerating;

  const addToHistory = useCallback((generation: GenerationResponse) => {
    setHistory((prev) => [generation, ...prev.slice(0, MAX_HISTORY - 1)]);
  }, [setHistory]);

  const generateWithRetry = useCallback(async (
    imageDataUrl: string,
    promptText: string,
    styleOption: string,
    attempt: number = 1
  ): Promise<GenerationResponse> => {
    try {
      return await generateImage({ imageDataUrl, prompt: promptText, style: styleOption });
    } catch (err) {
      if (attempt < 3) {
        const backoffDelay = Math.pow(2, attempt - 1) * 500; // 500, 1000
        setRetryCount(attempt);
        await sleep(backoffDelay);
        return generateWithRetry(imageDataUrl, promptText, styleOption, attempt + 1);
      }
      throw err as Error;
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setRetryCount(0);

    try {
      const result = await generateWithRetry(imageUrl, prompt, style);
      addToHistory(result);
      setSuccess('Generation completed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = (err as { message?: string })?.message ?? 'Generation failed';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, imageUrl, prompt, style, generateWithRetry, addToHistory]);

  const handleAbort = useCallback(() => {
    abortRequest();
    setIsGenerating(false);
    setError('Generation cancelled');
  }, []);

  const handleHistorySelect = useCallback((generation: GenerationResponse) => {
    setImageUrl(generation.imageUrl);
    setPrompt(generation.prompt);
    setStyle(generation.style as StyleOption);
    setError('');
    setSuccess('');
  }, []);

  const clearError = useCallback(() => setError(''), []);
  const clearSuccess = useCallback(() => setSuccess(''), []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Studio</h1>
          <p className="text-lg text-gray-600">Transform your images with AI-powered styling</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Image</h2>
              {!imageUrl ? (
                <FileUpload onFileSelect={setImageUrl} disabled={isGenerating} />
              ) : (
                <ImagePreview src={imageUrl} alt="Uploaded image" onRemove={() => setImageUrl('')} />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Prompt & Style</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 mb-2">Describe your vision</label>
                  <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your creative prompt here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isGenerating}
                  />
                </div>
                <StyleSelector value={style} onChange={setStyle} disabled={isGenerating} />
              </div>
            </div>

            <LiveSummary imageUrl={imageUrl} prompt={prompt} style={style} />

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Generate</h2>
                {retryCount > 0 && (
                  <span className="text-sm text-gray-500">Retry attempt: {retryCount}/3</span>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                  <button onClick={clearError} className="text-red-400 hover:text-red-600" aria-label="Dismiss error">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">{success}</span>
                  </div>
                  <button onClick={clearSuccess} className="text-green-400 hover:text-green-600" aria-label="Dismiss success message">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>

                {isGenerating && (
                  <button
                    onClick={handleAbort}
                    className="px-4 py-3 border border-red-300 text-red-700 rounded-md font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Abort
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <GenerationHistory history={history} onSelect={handleHistorySelect} />
          </div>
        </div>
      </div>
    </div>
  );
}


