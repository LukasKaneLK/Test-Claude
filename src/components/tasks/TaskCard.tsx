/**
 * TaskCard.tsx
 * A single draggable task card with inline text editing, a done checkbox,
 * and a delete button that appears on hover.
 */
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Task } from '@/features/tasks/types'

interface TaskCardProps {
  task: Task
  onUpdate: (id: string, changes: Partial<Task>) => void
  onDelete: (id: string) => void
  /** When true, the card is rendered inside DragOverlay (no ref, slight tilt). */
  isOverlay?: boolean
  /** Auto-focus the textarea on mount (used for newly created cards). */
  autoFocus?: boolean
}

export function TaskCard({ task, onUpdate, onDelete, isOverlay, autoFocus }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus the text area when a card is first created.
  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus()
  }, [autoFocus])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Keep a ghost placeholder in place while dragging; the overlay shows the moving card.
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? { transform: 'rotate(2deg)' } : style}
      className={[
        'group relative rounded-2xl border border-black/10 bg-white/60 p-3',
        'shadow-md backdrop-blur-xl transition-shadow',
        'dark:border-white/10 dark:bg-black/30',
        isOverlay ? 'shadow-2xl' : 'hover:shadow-lg',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...(isOverlay ? {} : { ...attributes, ...listeners })}
          className="mt-0.5 cursor-grab touch-none text-current opacity-20 hover:opacity-50 active:cursor-grabbing"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Done checkbox */}
        <input
          type="checkbox"
          checked={task.done}
          onChange={(e) => onUpdate(task.id, { done: e.target.checked })}
          className="mt-1 cursor-pointer accent-current"
          aria-label="Mark task complete"
        />

        {/* Editable task text */}
        <textarea
          ref={textareaRef}
          value={task.text}
          onChange={(e) => {
            onUpdate(task.id, { text: e.target.value })
            // Auto-grow: reset height then set to scrollHeight
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          placeholder="Write your task…"
          rows={1}
          className={[
            'flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none',
            'placeholder:opacity-30',
            task.done ? 'line-through opacity-40' : '',
          ].join(' ')}
          aria-label="Task description"
        />

        {/* Delete button — visible on hover */}
        <button
          onClick={() => onDelete(task.id)}
          className="shrink-0 text-current opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-30"
          aria-label="Delete task"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
