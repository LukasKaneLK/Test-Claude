/**
 * MobilePlannedColumn.tsx
 * Single "Planned" task list for mobile/tablet.
 * Merges both task columns into one list; no drag-and-drop required.
 */
import { Check, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { AddTaskCard } from './AddTaskCard'
import { Tooltip } from '@/components/ui/Tooltip'
import type { Task } from '@/features/tasks/types'
import { useLanguage } from '@/i18n/LanguageContext'

interface MobilePlannedColumnProps {
  tasks: Task[]
  newTaskId: string | null
  onAdd: () => void
  onUpdate: (id: string, changes: Partial<Task>) => void
  onDelete: (id: string) => void
}

function MobileTaskCard({
  task,
  autoFocus,
  onUpdate,
  onDelete,
}: {
  task: Task
  autoFocus: boolean
  onUpdate: (id: string, changes: Partial<Task>) => void
  onDelete: (id: string) => void
}) {
  const { t } = useLanguage()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    if (autoFocus) el.focus()
  }, [autoFocus])

  return (
    <div className="group relative rounded-2xl border border-black/10 bg-white/60 p-3 shadow-md backdrop-blur-xl dark:border-white/10 dark:bg-black/30">
      <div className="flex items-start gap-2">
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
            className="shrink-0 self-center text-current opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-30"
            aria-label={t.tooltipMarkDone}
          >
            <Check className="h-4 w-4" />
          </button>
        </Tooltip>
        <Tooltip text={t.tooltipDeleteTask}>
          <button
            onClick={() => onDelete(task.id)}
            className="shrink-0 self-center text-current opacity-0 transition-opacity hover:opacity-70 group-hover:opacity-30"
            aria-label={t.tooltipDeleteTask}
          >
            <X className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export function MobilePlannedColumn({
  tasks,
  newTaskId,
  onAdd,
  onUpdate,
  onDelete,
}: MobilePlannedColumnProps) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex">
        <span className="rounded-lg bg-black/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest opacity-50 dark:bg-white/8">
          {t.planned}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <MobileTaskCard
            key={task.id}
            task={task}
            autoFocus={task.id === newTaskId}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
        <AddTaskCard onClick={onAdd} />
      </div>
    </div>
  )
}
