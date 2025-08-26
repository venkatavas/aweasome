import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { downscaleImageIfNeeded, isValidImageFile, isWithinSizeLimit } from '../utils/imageUtils';

type UploadProps = {
  onImageReady: (dataUrl: string | null) => void;
};

export function Upload({ onImageReady }: UploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setStatus('Processing image…');
    if (!isValidImageFile(file)) {
      setStatus('Unsupported file type. Use PNG or JPG.');
      onImageReady(null);
      return;
    }
    if (!isWithinSizeLimit(file)) {
      setStatus('Large file detected. Downscaling…');
    }
    try {
      const dataUrl = await downscaleImageIfNeeded(file);
      onImageReady(dataUrl);
      setStatus('Ready');
    } catch {
      setStatus('Failed to read image');
      onImageReady(null);
    }
  };

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleFile(file);
  };

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  return (
    <div className="grid gap-2">
      <label htmlFor="image" className="text-sm font-medium">Upload image (PNG/JPG, ≤10MB)</label>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-2xl p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isDragging ? 'border-indigo-400' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-900`}
        tabIndex={0}
        role="button"
        aria-label="Drop image here or click to select"
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-sm text-zinc-500">Drag and drop or click to select</div>
      </div>
      <input
        ref={inputRef}
        id="image"
        name="image"
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={onChange}
        className="sr-only"
        aria-describedby="image-help"
      />
      <p id="image-help" className="text-xs text-zinc-500">Large images auto‑downscale to ≤1920px.</p>
      {status && (
        <p className="text-xs text-zinc-500" aria-live="polite">{status}</p>
      )}
    </div>
  );
}

export default Upload;


