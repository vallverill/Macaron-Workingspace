import { useEffect, useRef } from 'react'
import MessageItem from './MessageItem'

export default function MessageList({ messages }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p className="text-sm">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-content py-4">
      {messages.map((msg, i) => (
        <MessageItem key={msg.id} message={msg} prevMessage={messages[i - 1] ?? null} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
