import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { HiHashtag, HiUsers } from 'react-icons/hi'
import { db } from '../../firebase'
import { useApp } from '../../contexts/AppContext'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

export default function ChannelView() {
  const { activeChannel, sendChannelMessage } = useApp()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    if (!activeChannel) return
    const q = query(
      collection(db, 'channels', activeChannel.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200)
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [activeChannel?.id])

  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Chọn một kênh để bắt đầu.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 shrink-0 bg-white">
        <HiHashtag className="w-5 h-5 text-gray-500" />
        <div>
          <h2 className="font-bold text-gray-900 text-base leading-none">{activeChannel.name}</h2>
          {activeChannel.description && (
            <p className="text-xs text-gray-500 mt-0.5">{activeChannel.description}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1 text-gray-500 text-xs">
          <HiUsers className="w-4 h-4" />
          <span>Thành viên</span>
        </div>
      </div>

      {/* Welcome banner */}
      {messages.length === 0 && (
        <div className="px-4 py-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-macaron-navy flex items-center justify-center">
              <HiHashtag className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900"># {activeChannel.name}</h3>
          </div>
          <p className="text-gray-500 text-sm">
            {activeChannel.description || `Đây là kênh #${activeChannel.name}. Hãy bắt đầu cuộc trò chuyện!`}
          </p>
        </div>
      )}

      <MessageList messages={messages} />

      <MessageInput
        onSend={(text) => sendChannelMessage(activeChannel.id, text)}
        placeholder={`Nhắn tin đến #${activeChannel.name}`}
      />
    </div>
  )
}
