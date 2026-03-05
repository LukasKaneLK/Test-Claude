/**
 * AddTaskCard.tsx
 * A dashed-border placeholder card with a "+" icon.
 * Clicking it creates a new task in the column.
 */
import { Plus } from 'lucide-react'

interface AddTaskCardProps {
  onClick: () => void
}

export function AddTaskCard({ onClick }: AddTaskCardProps) {
  return (
    <button
      onClick={onClick}
      data-tutorial="add-task"
      className={[
        'w-full rounded-2xl border-2 border-dashed border-black/20 p-4',
        'text-current opacity-30 transition-all',
        'hover:border-black/40 hover:opacity-60 hover:bg-black/5',
        'dark:border-white/20 dark:hover:border-white/40 dark:hover:bg-white/5',
        'active:scale-95',
      ].join(' ')}
      aria-label="Add new task"
    >
      <div className="flex items-center justify-center gap-2">
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add task</span>
      </div>
    </button>
  )
}
