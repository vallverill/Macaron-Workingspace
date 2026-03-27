import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

function colorFromName(name = '') {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-rose-500',  'bg-amber-500',   'bg-teal-500',
    'bg-indigo-500','bg-pink-500',
  ]
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % colors.length
  return colors[hash]
}

export default function MessageItem({ message, prevMessage }) {
  const ts = message.createdAt?.toDate?.()
  const timeStr = ts ? format(ts, 'HH:mm', { locale: vi }) : ''

  const isSameUser = prevMessage && prevMessage.userId === message.userId
  const prevTs     = prevMessage?.createdAt?.toDate?.()
  const timeDiff   = ts && prevTs ? (ts - prevTs) / 1000 / 60 : 99
  const grouped    = isSameUser && timeDiff < 5

  if (grouped) {
    return (
      <div className="flex items-start gap-3 px-4 py-0.5 hover:bg-gray-50 group">
        <div className="w-9 shrink-0 flex items-center justify-center">
          <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 leading-none">
            {timeStr}
          </span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed flex-1">{message.text}</p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50 group">
      <div
        className={`w-9 h-9 rounded-full ${colorFromName(message.userName)} flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5`}
      >
        {getInitials(message.userName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-semibold text-sm text-gray-900">{message.userName}</span>
          <span className="text-xs text-gray-400">{timeStr}</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed">{message.text}</p>
      </div>
    </div>
  )
}
