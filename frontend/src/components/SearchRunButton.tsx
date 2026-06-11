import { Radar } from 'lucide-react';

interface SearchRunButtonProps {
  disabled: boolean;
  isRunning: boolean;
  onRun: () => Promise<void>;
}

export function SearchRunButton({ disabled, isRunning, onRun }: SearchRunButtonProps) {
  return (
    <button
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-[15px] font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-400 sm:w-auto"
      disabled={disabled || isRunning}
      onClick={onRun}
      type="button"
    >
      <Radar size={18} aria-hidden="true" />
      {isRunning ? '搜索中' : 'Run Search'}
    </button>
  );
}
