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
  createdBy: 'mom' | 'dad'
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
  createdBy: 'mom' | 'dad'
  createdAt: string
  updatedAt: string
}

export interface AssignedTask {
  id: string
  title: string
  childId?: string
  assignee: 'dad' | 'mom'
  dueDate?: string
  done: boolean
  doneAt?: string
  createdBy: 'mom' | 'dad'
  createdAt: string
  updatedAt: string
}

export interface FamilyData {
  children: Child[]
  weeklyTodos: WeeklyTodo[]
  homework: Homework[]
  assignedTasks: AssignedTask[]
  meta: { lastUpdatedBy: 'mom' | 'dad'; lastUpdatedAt: string }
}

export interface LocalSettings {
  role: 'mom' | 'dad'
  gistId?: string
  gistToken?: string
  remindersEnabled: boolean
}
