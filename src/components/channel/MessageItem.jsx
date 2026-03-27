import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { HiDownload, HiDocument } from 'react-icons/hi'
import { useAuth } from '../../contexts/AuthContext'

const EMOJIS = ['👍', '❤️', '😄', '😮', '😢', '🎉']

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

export default function MessageItem({ message, prevMessage, onReact }) {
  const { currentUser } = useAuth()
  const [showPicker, setShowPicker] = useState(false)

  const ts      = message.createdAt?.toDate?.()
  const timeStr = ts ? format(ts, 'HH:mm', { locale: vi }) : ''

  const isSameUser = prevMessage && prevMessage.userId === message.userId
  const prevTs     = prevMessage?.createdAt?.toDate?.()
  const timeDiff   = ts && prevTs ? (ts - prevTs) / 1000 / 60 : 99
  const grouped    = isSameUser && timeDiff < 5

  const reactions        = message.reactions || {}
  const hasAnyReaction   = Object.values(reactions).some((arr) => arr?.length > 0)

  // --- Reaction bar ---
  const reactionBar = hasAnyReaction && (
    <div className="flex flex-wrap gap-1 mt-1">
      {EMOJIS.map((emoji) => {
        const users = reactions[emoji] || []
        if (users.length === 0) return null
        const mine = users.includes(currentUser?.uid)
        return (
          <button
            key={emoji}
            onClick={() => onReact?.(message.id, emoji)}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors ${
              mine
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        )
      })}
    </div>
  )

  // --- File / image block ---
  const fileBlock = message.fileUrl && (
    <div className="mt-1">
      {message.fileType?.startsWith('image/') ? (
        <a href={message.fileUrl} target="_blank" rel="noreferrer">
          <img
            src={message.fileUrl}
            alt={message.fileName}
            className="max-w-xs max-h-60 rounded-lg border border-gray-200 object-cover hover:opacity-90 transition-opacity"
          />
        </a>
      ) : (
        <a
          href={message.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-colors"
        >
          <HiDocument className="w-5 h-5 text-gray-500 shrink-0" />
          <span className="text-sm text-gray-700 max-w-xs truncate">{message.fileName}</span>
          <HiDownload className="w-4 h-4 text-gray-400 shrink-0" />
        </a>
      )}
    </div>
  )

  // --- Emoji picker popup ---
  const emojiPicker = showPicker && (
    <div className="absolute right-0 bottom-full mb-1 z-20 bg-white rounded-xl shadow-lg border border-gray-200 p-1.5 flex gap-0.5">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => { onReact?.(message.id, emoji); setShowPicker(false) }}
          className="text-xl p-1.5 rounded-lg hover:bg-gray-100 hover:scale-125 transition-all"
        >
          {emoji}
        </button>
      ))}
    </div>
  )

  // --- Reaction toggle button ---
  const reactBtn = (
    <div className="opacity-0 group-hover:opacity-100 relative shrink-0">
      <button
        onClick={() => setShowPicker((v) => !v)}
        className="text-gray-400 hover:text-gray-600 text-sm p-1 rounded hover:bg-gray-100 transition-colors leading-none"
        title="Thêm reaction"
      >
        😊
      </button>
      {emojiPicker}
    </div>
  )

  if (grouped) {
    return (
      <div className="flex items-start gap-3 px-4 py-0.5 hover:bg-gray-50 group relative">
        <div className="w-9 shrink-0 flex items-center justify-center">
          <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 leading-none">
            {timeStr}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {message.text && <p className="text-sm text-gray-800 leading-relaxed">{message.text}</p>}
          {fileBlock}
          {reactionBar}
        </div>
        {reactBtn}
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50 group relative">
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
        {message.text && <p className="text-sm text-gray-800 leading-relaxed">{message.text}</p>}
        {fileBlock}
        {reactionBar}
      </div>
      {reactBtn}
    </div>
  )
}
