/**
 * TaskCard.tsx
 * A single draggable task card with inline text editing, a done checkbox,
 * and a delete button that appears on hover.
 */
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Task } from '@/features/tasks/types'
import { useLanguage } from '@/i18n/LanguageContext'

interface TaskCardProps {
  task: Task
  onUpdate: (id: string, changes: Partial<Task>) => void
  onDelete: (id: string) => void
  isOverlay?: boolean
  autoFocus?: boolean
}

export function TaskCard({ task, onUpdate, onDelete, isOverlay, autoFocus }: TaskCardProps) {
  const { t } = useLanguage()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    if (autoFocus) el.focus()
  }, [autoFocus])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
        <Tooltip text={t.tooltipDragReorder}>
          <button
            {...(isOverlay ? {} : { ...attributes, ...listeners })}
            className="mt-0.5 cursor-grab touch-none text-current opacity-20 hover:opacity-50 active:cursor-grabbing"
            aria-label={t.tooltipDragReorder}
            tabIndex={-1}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </Tooltip>

        <textarea
          ref={textareaRef}
          value={task.text}
          onChange={(e) => {
            onUpdate(task.id, { text: e.target.value })
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          onBlur={() => { if (!task.text.trim()) onDelete(task.id) }}
          placeholder={t.writeTask}
          rows={1}
          className={[
            'flex-1 resize-none overflow-hidden bg-transparent text-sm leading-relaxed outline-none',
            'placeholder:opacity-30',
            task.done ? 'line-through opacity-40' : '',
          ].join(' ')}
          aria-label={t.writeTask}
        />

        <Tooltip text={t.tooltipMarkDone}>
          <button
            onClick={() => onUpdate(task.id, { done: true })}
            className="self-center shrink-0 text-current opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-30"
            aria-label={t.tooltipMarkDone}
          >
            <Check className="h-4 w-4" />
          </button>
        </Tooltip>

        <Tooltip text={t.tooltipDeleteTask}>
          <button
            onClick={() => onDelete(task.id)}
            className="self-center shrink-0 text-current opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-30"
            aria-label={t.tooltipDeleteTask}
          >
            <X className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
