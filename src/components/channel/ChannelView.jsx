import { useEffect, useRef, useState } from 'react'
import {
  collection, query, orderBy, onSnapshot, limit,
  doc, updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { HiHashtag, HiUsers, HiDotsVertical, HiSearch, HiInformationCircle, HiPencil, HiLogout } from 'react-icons/hi'
import { db } from '../../firebase'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ChannelDetailsModal from '../modals/ChannelDetailsModal'
import toast from 'react-hot-toast'

export default function ChannelView() {
  const { activeChannel, sendChannelMessage, users } = useApp()
  const { currentUser } = useAuth()
  const [messages, setMessages]           = useState([])
  const [showDetails, setShowDetails]     = useState(false)
  const [detailsTab, setDetailsTab]       = useState('about')
  const [showMenu, setShowMenu]           = useState(false)
  const menuRef = useRef(null)

  const memberCount = users.length + 1 // all users + self

  useEffect(() => {
    if (!activeChannel) return
    const q = query(
      collection(db, 'channels', activeChannel.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200),
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [activeChannel?.id])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  async function handleReact(messageId, emoji) {
    const msgRef = doc(db, 'channels', activeChannel.id, 'messages', messageId)
    const msg = messages.find((m) => m.id === messageId)
    const alreadyReacted = (msg?.reactions?.[emoji] || []).includes(currentUser.uid)
    await updateDoc(msgRef, {
      [`reactions.${emoji}`]: alreadyReacted
        ? arrayRemove(currentUser.uid)
        : arrayUnion(currentUser.uid),
    })
  }

  function openDetails(tab = 'about') {
    setDetailsTab(tab)
    setShowDetails(true)
    setShowMenu(false)
  }

  if (!activeChannel) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Chọn một kênh để bắt đầu.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 shrink-0 bg-white">
        <HiHashtag className="w-5 h-5 text-gray-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-gray-900 text-base leading-none truncate">{activeChannel.name}</h2>
          {activeChannel.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{activeChannel.description}</p>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Member count */}
          <button
            onClick={() => openDetails('members')}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Xem thành viên"
          >
            <HiUsers className="w-4 h-4" />
            <span className="text-xs font-medium">{memberCount}</span>
          </button>

          {/* ⋮ Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Tùy chọn"
            >
              <HiDotsVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 z-30 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-56">
                <button
                  onClick={() => openDetails('about')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <HiInformationCircle className="w-4 h-4 text-gray-400" />
                  Xem thông tin kênh
                </button>
                <button
                  onClick={() => openDetails('about')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <HiPencil className="w-4 h-4 text-gray-400" />
                  Chỉnh sửa mô tả
                </button>
                <button
                  onClick={() => { setShowMenu(false); toast('Tính năng đang phát triển 🚧', { icon: '🛠️' }) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <HiSearch className="w-4 h-4 text-gray-400" />
                  Tìm kiếm trong kênh
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setShowMenu(false); toast('Tính năng đang phát triển 🚧', { icon: '🛠️' }) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <HiLogout className="w-4 h-4" />
                  Rời khỏi kênh
                </button>
              </div>
            )}
          </div>
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

      <MessageList messages={messages} onReact={handleReact} />

      <MessageInput
        onSend={(text, fileData) => sendChannelMessage(activeChannel.id, text, fileData)}
        placeholder={`Nhắn tin đến #${activeChannel.name}`}
      />

      {/* Channel details modal */}
      {showDetails && (
        <ChannelDetailsModal
          channel={activeChannel}
          initialTab={detailsTab}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  )
}
