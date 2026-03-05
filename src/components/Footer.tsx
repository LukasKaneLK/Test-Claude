/**
 * Footer.tsx
 * Persistent footer that surfaces the available keyboard shortcuts to the user.
 * Pure presentational component — no props, no state.
 */
export function Footer() {
  return (
    <footer className="px-6 py-4 text-center text-xs opacity-40 space-y-1.5">
      <div>
        <kbd className="rounded border border-current px-1.5 py-0.5 font-mono text-[10px]">Space</kbd>
        {' '}start/pause
        {' · '}
        <kbd className="rounded border border-current px-1.5 py-0.5 font-mono text-[10px]">R</kbd>
        {' '}reset
        {' · '}
        <kbd className="rounded border border-current px-1.5 py-0.5 font-mono text-[10px]">S</kbd>
        {' '}skip
      </div>
      <div>
        Pomodoro Timer — created for personal productivity purposes &nbsp;·&nbsp; &copy; {new Date().getFullYear()} Andrii Khudiashov
      </div>
    </footer>
  )
}
