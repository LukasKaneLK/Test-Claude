/** Represents a single user task card. */
export interface Task {
  id: string
  text: string
  done: boolean
  /** Which column the task was dragged from — set when moved to the timer queue. */
  sourceColumn?: 'left' | 'right'
}
