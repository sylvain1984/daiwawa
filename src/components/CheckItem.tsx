interface Props {
  title: string
  subtitle?: string
  done: boolean
  onToggle: () => void
  onDelete?: () => void
  accentColor?: string
}

export default function CheckItem({ title, subtitle, done, onToggle, onDelete, accentColor }: Props) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug truncate transition-colors ${
            done ? 'line-through text-gray-300' : 'text-gray-800'
          }`}
        >
          {title}
        </p>
        {subtitle && (
          <p className={`text-xs mt-0.5 ${done ? 'text-gray-200' : 'text-gray-400'}`}>
            {subtitle}
          </p>
        )}
      </div>
      {onDelete && !done && (
        <button
          onClick={onDelete}
          className="text-gray-300 hover:text-gray-400 text-lg leading-none shrink-0 px-1"
          aria-label="删除"
        >
          ×
        </button>
      )}
      <button
        onClick={onToggle}
        className="shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: done ? (accentColor ?? '#9b8ec4') : '#d1d5db',
          backgroundColor: done ? (accentColor ?? '#9b8ec4') : 'transparent',
        }}
        aria-label={done ? '标记未完成' : '标记完成'}
      >
        {done && (
          <svg viewBox="0 0 12 10" className="w-3.5 h-3.5" fill="none" stroke="white" strokeWidth="2">
            <polyline points="1,5 4.5,9 11,1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  )
}
