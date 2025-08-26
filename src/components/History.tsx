import type { HistoryItem } from '../types';

type HistoryProps = {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
};

export function History({ items, onSelect }: HistoryProps) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-sm text-zinc-500">No history yet.</div>
    );
  }
  return (
    <ul className="grid gap-2" aria-label="History list">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Restore generation from ${new Date(item.createdAt).toLocaleString()}`}
          >
            <img src={item.imageUrl} alt="" className="h-12 w-12 rounded object-cover" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{item.prompt || 'Untitled'}</div>
              <div className="truncate text-xs text-zinc-500">
                {item.style} • {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default History;


