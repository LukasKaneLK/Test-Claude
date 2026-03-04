/**
 * App.tsx
 * Root application component. Owns theme state, task state, and DnD context.
 * Layout: [left task column] | [timer] | [right task column]
 * Background and blob colours animate between phases for a visual cycle cue.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { TimerCard } from '@/components/TimerCard'
import { PhaseCompletePopup, type PopupKind } from '@/components/PhaseCompletePopup'
import { TutorialOverlay } from '@/components/TutorialOverlay'
import { SettingsDialog } from '@/components/SettingsDialog'
import { TaskColumn } from '@/components/tasks/TaskColumn'
import { MobilePlannedColumn } from '@/components/tasks/MobilePlannedColumn'
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

/**
 * Custom collision detection: if the pointer is directly over the timer drop zone,
 * prioritise it over any nearby sortable items (which closestCenter would pick instead).
 * Falls back to closestCenter for normal column reordering.
 */
const collisionDetection: CollisionDetection = (args) => {
  // Check rect intersection with the timer droppable manually (droppableContainers is a Map).
  const timerRect = args.droppableRects.get('timer-drop')
  if (timerRect) {
    const { top, left, bottom, right } = args.collisionRect
    const intersects =
      left < timerRect.right &&
      right > timerRect.left &&
      top < timerRect.bottom &&
      bottom > timerRect.top
    if (intersects) return [{ id: 'timer-drop' }]
  }
  return closestCenter(args)
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

  // Wrap skip so the popup effect can distinguish a manual skip from a natural completion.
  const skippedRef = useRef(false)
  const wrappedSkip = useCallback(() => { skippedRef.current = true; skip() }, [skip])

  const [showSettings, setShowSettings] = useState(false)

  // Show tutorial on first visit; can be re-opened via the header help button.
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('tutorial-seen'))
  const closeTutorial = () => {
    localStorage.setItem('tutorial-seen', '1')
    setShowTutorial(false)
  }

  // Detect natural phase completions (not manual skips) to show the popup.
  const [popup, setPopup] = useState<PopupKind | null>(null)
  const prevPhaseRef = useRef<Phase>(phase)
  useEffect(() => {
    const prev = prevPhaseRef.current
    prevPhaseRef.current = phase
    if (skippedRef.current) { skippedRef.current = false; return }
    if (prev === 'focus' && (phase === 'shortBreak' || phase === 'longBreak')) {
      setPopup('rest')
    } else if ((prev === 'shortBreak' || prev === 'longBreak') && phase === 'focus') {
      setPopup('focus')
    }
  }, [phase])

  // Initialise theme from localStorage, falling back to the OS preference.
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Task state — two independent columns, persisted to localStorage.
  const [leftTasks, setLeftTasks] = useState<Task[]>(() => loadTasks('tasks-left'))
  const [rightTasks, setRightTasks] = useState<Task[]>(() => loadTasks('tasks-right'))

  // Tasks queued into the timer by drag-and-drop.
  const [timerQueue, setTimerQueue] = useState<Task[]>(() => loadTasks('tasks-queue'))

  // Track the id of the last added task so its textarea can be auto-focused.
  const [newTaskId, setNewTaskId] = useState<string | null>(null)

  // The task currently being dragged — needed to render DragOverlay.
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Persist tasks whenever they change.
  useEffect(() => { localStorage.setItem('tasks-left', JSON.stringify(leftTasks)) }, [leftTasks])
  useEffect(() => { localStorage.setItem('tasks-right', JSON.stringify(rightTasks)) }, [rightTasks])
  useEffect(() => { localStorage.setItem('tasks-queue', JSON.stringify(timerQueue)) }, [timerQueue])

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
        wrappedSkip()
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

  // Remove a task from the timer queue when the user marks it done.
  const handleQueueTaskDone = useCallback((id: string) => {
    setTimerQueue((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Remove a task from the queue and return it to its original planned column.
  const handleQueueTaskReturn = useCallback((id: string) => {
    const task = timerQueue.find((t) => t.id === id)
    if (!task) return
    const { sourceColumn, ...restored } = task
    setTimerQueue((prev) => prev.filter((t) => t.id !== id))
    if (sourceColumn === 'right') setRightTasks((r) => [...r, restored])
    else setLeftTasks((l) => [...l, restored])
  }, [timerQueue])

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

    // --- Drop onto timer: move task into queue and start timer ---
    if (over.id === 'timer-drop') {
      const activeId = String(active.id)
      const task =
        leftTasks.find((t) => t.id === activeId) ??
        rightTasks.find((t) => t.id === activeId)
      if (task) {
        const sourceColumn = leftTasks.some((t) => t.id === activeId) ? 'left' : 'right'
        setLeftTasks((prev) => prev.filter((t) => t.id !== activeId))
        setRightTasks((prev) => prev.filter((t) => t.id !== activeId))
        setTimerQueue((prev) => [...prev, { ...task, sourceColumn }])
        // Auto-start only when the first task enters the queue.
        if (timerQueue.length === 0 && timer.status === 'idle') timer.start()
      }
      return
    }

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
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveTask(null) }}
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
          <Header isDark={isDark} onToggleTheme={() => setIsDark((d) => !d)} phase={phase} onOpenTutorial={() => setShowTutorial(true)} onOpenSettings={() => setShowSettings(true)} />

          {/* Responsive layout: single column on mobile, 3-column on md+ */}
          <main className="flex flex-1 items-center justify-center px-4 py-8">
            <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_auto_1fr]">

              {/* Desktop only: left task column */}
              <div className="order-2 hidden xl:order-1 xl:block">
                <TaskColumn
                  id="left-col"
                  tasks={leftTasks}
                  newTaskId={newTaskId}
                  onAdd={() => addTask('left')}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              </div>

              {/* Timer — first on mobile, centre on desktop */}
              <div className="order-1 flex justify-center self-center xl:order-2">
                <TimerCard
                  {...timer}
                  skip={wrappedSkip}
                  isDark={isDark}
                  timerQueue={timerQueue}
                  onQueueTaskDone={handleQueueTaskDone}
                  onQueueTaskReturn={handleQueueTaskReturn}
                />
              </div>

              {/* Desktop only: right task column */}
              <div className="order-3 hidden xl:block">
                <TaskColumn
                  id="right-col"
                  tasks={rightTasks}
                  newTaskId={newTaskId}
                  onAdd={() => addTask('right')}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              </div>

              {/* Mobile/tablet only: single merged Planned column */}
              <div className="order-2 xl:hidden">
                <MobilePlannedColumn
                  tasks={[...leftTasks, ...rightTasks]}
                  newTaskId={newTaskId}
                  onAdd={() => addTask('left')}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                />
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Phase-complete popup */}
      {popup && <PhaseCompletePopup kind={popup} onClose={() => setPopup(null)} />}

      {/* Settings dialog */}
      <SettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        config={timer.config}
        onUpdate={timer.updateConfig}
      />

      {/* Tutorial overlay */}
      {showTutorial && <TutorialOverlay onDone={closeTutorial} />}

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
