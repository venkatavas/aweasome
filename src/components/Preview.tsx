type PreviewProps = {
  imageDataUrl: string | null;
  prompt: string;
  styleName: string;
};

export function Preview({ imageDataUrl, prompt, styleName }: PreviewProps) {
  return (
    <section aria-label="Live summary" className="grid gap-3 md:gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
          {imageDataUrl ? (
            <img src={imageDataUrl} alt="Selected preview" className="h-full w-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
              No image selected
            </div>
          )}
        </div>
        <div className="grid content-start gap-2">
          <h3 className="text-lg md:text-xl font-semibold tracking-tight">Summary</h3>
          <dl className="grid gap-2">
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Prompt</dt>
              <dd className="text-sm">{prompt || '—'}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Style</dt>
              <dd className="text-sm">{styleName || '—'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export default Preview;


