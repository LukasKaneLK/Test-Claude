/**
 * App.tsx
 * Root application component. Owns theme state, task state, and DnD context.
 * Layout: [left task column] | [timer] | [right task column]
 * Background and blob colours animate between phases for a visual cycle cue.
 */
import { useCallback, useEffect, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { TimerCard } from '@/components/TimerCard'
import { TaskColumn } from '@/components/tasks/TaskColumn'
import { TaskCard } from '@/components/tasks/TaskCard'
import { usePomodoro } from '@/features/pomodoro/usePomodoro'
import type { Phase } from '@/features/pomodoro/engine/types'
import type { Task } from '@/features/tasks/types'

/** Page background colours per phase, keyed by colour scheme. */
const BG: Record<Phase, { light: string; dark: string }> = {
  focus:      { light: '#fff1f2', dark: '#1a0508' },
  shortBreak: { light: '#f0fdf9', dark: '#021a16' },
  longBreak:  { light: '#eef2ff', dark: '#06071c' },
}

/** Radial gradient "blob" accent colours per phase, keyed by colour scheme. */
const BLOB: Record<Phase, { light: string; dark: string }> = {
  focus:      { light: '#fda4af', dark: '#9f1239' },
  shortBreak: { light: '#5eead4', dark: '#0d9488' },
  longBreak:  { light: '#a5b4fc', dark: '#4338ca' },
}

/** Load tasks from localStorage, returning an empty array on failure. */
function loadTasks(key: string): Task[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as Task[]
  } catch {
    return []
  }
}

export function App() {
  const timer = usePomodoro()
  const { phase, status, start, pause, resume, reset, skip } = timer

  // Initialise theme from localStorage, falling back to the OS preference.
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Task state — two independent columns, persisted to localStorage.
  const [leftTasks, setLeftTasks] = useState<Task[]>(() => loadTasks('tasks-left'))
  const [rightTasks, setRightTasks] = useState<Task[]>(() => loadTasks('tasks-right'))

  // Track the id of the last added task so its textarea can be auto-focused.
  const [newTaskId, setNewTaskId] = useState<string | null>(null)

  // The task currently being dragged — needed to render DragOverlay.
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Persist tasks whenever they change.
  useEffect(() => {
    localStorage.setItem('tasks-left', JSON.stringify(leftTasks))
  }, [leftTasks])

  useEffect(() => {
    localStorage.setItem('tasks-right', JSON.stringify(rightTasks))
  }, [rightTasks])

  // Sync the `dark` class on <html> and persist the preference whenever it changes.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Keyboard shortcuts for the timer.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore shortcuts when the user is typing in an input field.
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (status === 'running') pause()
        else if (status === 'paused') resume()
        else start()
      } else if (e.key === 'r' || e.key === 'R') {
        reset()
      } else if (e.key === 's' || e.key === 'S') {
        skip()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [status, start, pause, resume, reset, skip])

  // --- Task actions ---

  const addTask = useCallback((side: 'left' | 'right') => {
    const task: Task = { id: crypto.randomUUID(), text: '', done: false }
    setNewTaskId(task.id)
    if (side === 'left') setLeftTasks((prev) => [...prev, task])
    else setRightTasks((prev) => [...prev, task])
  }, [])

  const updateTask = useCallback((id: string, changes: Partial<Task>) => {
    const update = (tasks: Task[]) =>
      tasks.map((t) => (t.id === id ? { ...t, ...changes } : t))
    setLeftTasks(update)
    setRightTasks(update)
  }, [])

  const deleteTask = useCallback((id: string) => {
    setLeftTasks((prev) => prev.filter((t) => t.id !== id))
    setRightTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // --- Drag handlers ---

  function handleDragStart({ active }: DragStartEvent) {
    const task =
      leftTasks.find((t) => t.id === active.id) ??
      rightTasks.find((t) => t.id === active.id) ??
      null
    setActiveTask(task)
    setNewTaskId(null) // clear auto-focus while dragging
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over || active.id === over.id) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const activeInLeft = leftTasks.some((t) => t.id === activeId)
    const overInLeft =
      leftTasks.some((t) => t.id === overId) || overId === 'left-col'
    const overInRight =
      rightTasks.some((t) => t.id === overId) || overId === 'right-col'

    const sameColumn =
      (activeInLeft && overInLeft) || (!activeInLeft && overInRight)

    if (sameColumn) {
      // Reorder within the same column.
      const setter = activeInLeft ? setLeftTasks : setRightTasks
      const list = activeInLeft ? leftTasks : rightTasks
      setter(arrayMove(list, list.findIndex((t) => t.id === activeId), list.findIndex((t) => t.id === overId)))
    } else {
      // Move card across columns.
      if (activeInLeft) {
        const task = leftTasks.find((t) => t.id === activeId)!
        setLeftTasks((prev) => prev.filter((t) => t.id !== activeId))
        setRightTasks((prev) => {
          const idx = prev.findIndex((t) => t.id === overId)
          const copy = [...prev]
          copy.splice(idx >= 0 ? idx : copy.length, 0, task)
          return copy
        })
      } else {
        const task = rightTasks.find((t) => t.id === activeId)!
        setRightTasks((prev) => prev.filter((t) => t.id !== activeId))
        setLeftTasks((prev) => {
          const idx = prev.findIndex((t) => t.id === overId)
          const copy = [...prev]
          copy.splice(idx >= 0 ? idx : copy.length, 0, task)
          return copy
        })
      }
    }
  }

  // Pick the correct colour tokens for the current phase and theme.
  const bg = isDark ? BG[phase].dark : BG[phase].light
  const blob = isDark ? BLOB[phase].dark : BLOB[phase].light

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="relative flex min-h-screen flex-col overflow-hidden"
        style={{ backgroundColor: bg, transition: 'background-color 0.8s ease' }}
      >
        {/* Decorative gradient blob */}
        <div
          className="pointer-events-none absolute inset-0 -z-0"
          style={{
            background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${blob}55, transparent)`,
            transition: 'background 0.8s ease',
          }}
        />

        <div className="relative z-10 flex min-h-screen flex-col">
          <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} phase={phase} />

          {/* 3-column layout: tasks | timer | tasks */}
          <main className="flex flex-1 items-center justify-center px-4 py-8">
            <div className="grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-start gap-6">

              {/* Left task column */}
              <TaskColumn
                id="left-col"
                tasks={leftTasks}
                newTaskId={newTaskId}
                onAdd={() => addTask('left')}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />

              {/* Timer — centred horizontally and vertically within the column */}
              <div className="flex self-center justify-center">
                <TimerCard {...timer} isDark={isDark} />
              </div>

              {/* Right task column */}
              <TaskColumn
                id="right-col"
                tasks={rightTasks}
                newTaskId={newTaskId}
                onAdd={() => addTask('right')}
                onUpdate={updateTask}
                onDelete={deleteTask}
              />
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Drag overlay: renders a floating rotated copy of the card being dragged */}
      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            onUpdate={() => undefined}
            onDelete={() => undefined}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
