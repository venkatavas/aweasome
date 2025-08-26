import { ChangeEvent } from 'react';
import { styleOptions } from '../services/api';

type PromptStyleProps = {
  prompt: string;
  style: string;
  onPromptChange: (value: string) => void;
  onStyleChange: (value: string) => void;
};

export function PromptStyle({ prompt, style, onPromptChange, onStyleChange }: PromptStyleProps) {
  const handlePrompt = (e: ChangeEvent<HTMLTextAreaElement>) => onPromptChange(e.target.value);
  const handleStyle = (e: ChangeEvent<HTMLSelectElement>) => onStyleChange(e.target.value);

  return (
    <div className="grid gap-3 md:gap-4">
      <div className="grid gap-1">
        <label htmlFor="prompt" className="text-sm font-medium">Prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={handlePrompt}
          rows={3}
          placeholder="Describe the look you want..."
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
      </div>
      <div className="grid gap-1">
        <label htmlFor="style" className="text-sm font-medium">Style</label>
        <select
          id="style"
          value={style}
          onChange={handleStyle}
          className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="Select a style"
        >
          {styleOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        <p className="text-xs text-zinc-500" aria-live="polite">
          {styleOptions.find((o) => o.id === style)?.description}
        </p>
      </div>
    </div>
  );
}

export default PromptStyle;


