export function Spinner() {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading...
    </div>
  );
}

export default Spinner;


