export function today(): string {
  const d = new Date()
  return toDateStr(d)
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function mondayOf(date?: Date): string {
  const d = date ? new Date(date) : new Date()
  const day = d.getDay() // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const m = d.getMonth() + 1
  const day = d.getDate()
  const wd = WEEKDAY_NAMES[d.getDay()]
  return `${m}月${day}日 ${wd}`
}

export function formatWeek(mondayStr: string): string {
  const d = new Date(mondayStr + 'T00:00:00')
  const m = d.getMonth() + 1
  const day = d.getDate()
  const thisMon = mondayOf()
  const label = mondayStr === thisMon ? '这周' : mondayStr < thisMon ? '上周' : '下周'
  return `${m}月${day}日 ${label}`
}
