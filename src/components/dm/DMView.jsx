import { useEffect, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot, limit,
  doc, updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import MessageList from '../channel/MessageList'
import MessageInput from '../channel/MessageInput'

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

export default function DMView() {
  const { activeDmUser, sendDM } = useApp()
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])

  const dmId = activeDmUser
    ? [currentUser.uid, activeDmUser.id].sort().join('_')
    : null

  useEffect(() => {
    if (!dmId) return
    const q = query(
      collection(db, 'dms', dmId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200),
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [dmId])

  async function handleReact(messageId, emoji) {
    const msgRef = doc(db, 'dms', dmId, 'messages', messageId)
    const msg = messages.find((m) => m.id === messageId)
    const alreadyReacted = (msg?.reactions?.[emoji] || []).includes(currentUser.uid)
    await updateDoc(msgRef, {
      [`reactions.${emoji}`]: alreadyReacted
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid),
    })
  }

  if (!activeDmUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Chọn một người để nhắn tin.</p>
      </div>
    )
  }

  const name = activeDmUser.displayName || activeDmUser.email

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0 bg-white">
        <div className="w-9 h-9 rounded-full bg-macaron-navy flex items-center justify-center text-white text-sm font-bold">
          {getInitials(name)}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-base leading-none">{name}</h2>
          <p className="text-xs text-green-500 mt-0.5">Đang hoạt động</p>
        </div>
      </div>

      {/* Welcome banner */}
      {messages.length === 0 && (
        <div className="px-4 py-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-full bg-macaron-navy flex items-center justify-center text-white text-xl font-bold">
              {getInitials(name)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{name}</h3>
              <p className="text-gray-500 text-sm">{activeDmUser.email}</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Đây là nơi bắt đầu cuộc trò chuyện riêng tư của bạn với <strong>{name}</strong>.
          </p>
        </div>
      )}

      <MessageList messages={messages} onReact={handleReact} />

      <MessageInput
        onSend={(text, fileData) => sendDM(activeDmUser.id, text, fileData)}
        placeholder={`Nhắn tin đến ${name}`}
      />
    </div>
  )
}
