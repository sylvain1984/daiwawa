export interface Child {
  id: string
  name: string
  color: string   // hex
  order: number
}

export interface WeeklyTodo {
  id: string
  childId: string
  weekOf: string      // YYYY-MM-DD (Monday of that week)
  title: string
  done: boolean
  doneAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Homework {
  id: string
  childId: string
  date: string        // YYYY-MM-DD
  subject?: string
  title: string
  done: boolean
  doneAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AssignedTask {
  id: string
  title: string
  childId?: string
  assignee: string
  dueDate?: string
  done: boolean
  doneAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface FamilyData {
  children: Child[]
  weeklyTodos: WeeklyTodo[]
  homework: Homework[]
  assignedTasks: AssignedTask[]
  meta: { lastUpdatedBy: string; lastUpdatedAt: string }
}

export interface LocalSettings {
  remindersEnabled: boolean
}
