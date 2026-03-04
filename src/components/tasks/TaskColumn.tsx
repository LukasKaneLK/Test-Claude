/**
 * TaskColumn.tsx
 * A droppable column of sortable TaskCards.
 * Renders an AddTaskCard at the bottom so the user can always add more tasks.
 */
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import { AddTaskCard } from './AddTaskCard'
import type { Task } from '@/features/tasks/types'

interface TaskColumnProps {
  /** Unique droppable id for this column ('left-col' | 'right-col'). */
  id: string
  tasks: Task[]
  /** Id of the most recently added task — used to auto-focus its textarea. */
  newTaskId: string | null
  onAdd: () => void
  onUpdate: (id: string, changes: Partial<Task>) => void
  onDelete: (id: string) => void
}

export function TaskColumn({ id, tasks, newTaskId, onAdd, onUpdate, onDelete }: TaskColumnProps) {
  // Make the whole column a drop target so cards can be dropped onto empty columns.
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col gap-3">
      {/* Column tab header */}
      <div className="flex">
        <span className="rounded-lg bg-black/8 px-3 py-1 text-xs font-semibold uppercase tracking-widest opacity-50 dark:bg-white/8">
          Planned
        </span>
      </div>
    <div ref={setNodeRef} className="flex min-h-[80px] flex-col gap-3">
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
            autoFocus={task.id === newTaskId}
          />
        ))}
      </SortableContext>

      {/* Always show the add button at the bottom of the column */}
      <AddTaskCard onClick={onAdd} />
    </div>
    </div>
  )
}
