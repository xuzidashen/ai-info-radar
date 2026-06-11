import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';

interface AddKeywordFormProps {
  onAdd: (text: string) => Promise<void>;
}

export function AddKeywordForm({ onAdd }: AddKeywordFormProps) {
  const [text, setText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = text.trim();
    if (!value || isAdding) {
      return;
    }
    setIsAdding(true);
    try {
      await onAdd(value);
      setText('');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-3 text-[15px] text-stone-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
        placeholder="输入关键词"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-stone-950 text-white transition active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-400"
        type="submit"
        disabled={isAdding || !text.trim()}
        title="添加关键词"
        aria-label="添加关键词"
      >
        <Plus size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
