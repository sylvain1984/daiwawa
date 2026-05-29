import type { ReactNode } from 'react'
import type { Child } from '../types'

interface Props {
  child: Child
  children: ReactNode
}

export default function ChildSection({ child, children }: Props) {
  return (
    <div className="mb-4">
      <div
        className="flex items-center gap-2 mb-2 pl-3 py-1"
        style={{ borderLeft: `4px solid ${child.color}` }}
      >
        <span className="font-semibold text-gray-800 text-base">{child.name}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
