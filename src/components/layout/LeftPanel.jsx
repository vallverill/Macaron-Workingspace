import { useState } from 'react'
import {
  HiHashtag, HiChevronDown, HiChevronRight, HiPlus, HiSearch,
  HiPencil, HiFolder, HiDocumentText, HiClipboardList,
} from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

/* ─── helpers ─── */
function colorFromName(name = '') {
  const colors = ['bg-blue-500','bg-emerald-500','bg-violet-500','bg-rose-500','bg-amber-500','bg-teal-500','bg-indigo-500','bg-pink-500']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % colors.length
  return colors[hash]
}
function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

/* ═══════════════════════════════════════════════════
   PANEL: Channels (Home view)
═══════════════════════════════════════════════════ */
function ChannelPanel() {
  const { channels, users, activeChannel, activeDmUser, openChannel, openDM, setShowCreateChannel, channelReads } = useApp()
  const { currentUser } = useAuth()
  const [channelsOpen, setChannelsOpen] = useState(true)
  const [dmsOpen, setDmsOpen]           = useState(true)

  function hasUnread(ch) {
    if (activeChannel?.id === ch.id) return false
    const lastMsg  = ch.lastMessageAt?.toMillis?.() ?? 0
    const lastRead = channelReads[ch.id] ?? 0
    return lastMsg > lastRead && lastMsg > 0
  }

  return (
    <>
      {/* Workspace header */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base truncate">Macaron Schools</span>
          <HiChevronDown className="w-4 h-4 text-white/60 shrink-0" />
        </div>
        <p className="text-white/50 text-xs mt-0.5">Không gian làm việc</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {/* Channels */}
        <div className="mb-2">
          <div className="flex items-center justify-between px-3 py-1 cursor-pointer group" onClick={() => setChannelsOpen((v) => !v)}>
            <div className="flex items-center gap-1 text-white/70 hover:text-white">
              {channelsOpen ? <HiChevronDown className="w-3 h-3" /> : <HiChevronRight className="w-3 h-3" />}
              <span className="text-xs font-semibold uppercase tracking-wide">Kênh</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowCreateChannel(true) }}
              className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-white transition-opacity"
              title="Tạo kênh mới"
            >
              <HiPlus className="w-4 h-4" />
            </button>
          </div>
          {channelsOpen && (
            <ul className="mt-0.5">
              {channels.map((ch) => {
                const isActive = activeChannel?.id === ch.id
                const unread   = hasUnread(ch)
                return (
                  <li key={ch.id}>
                    <button
                      onClick={() => openChannel(ch)}
                      className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm rounded-md mx-1 transition-colors ${
                        isActive ? 'bg-macaron-sidebar-active text-white font-semibold' : 'text-white/70 hover:bg-macaron-sidebar-hover hover:text-white'
                      }`}
                    >
                      <HiHashtag className="w-4 h-4 shrink-0" />
                      <span className={`truncate flex-1 text-left ${unread ? 'font-semibold text-white' : ''}`}>{ch.name}</span>
                      {unread && <span className="w-2 h-2 rounded-full bg-white shrink-0" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* DMs */}
        <div>
          <div className="flex items-center justify-between px-3 py-1 cursor-pointer group" onClick={() => setDmsOpen((v) => !v)}>
            <div className="flex items-center gap-1 text-white/70 hover:text-white">
              {dmsOpen ? <HiChevronDown className="w-3 h-3" /> : <HiChevronRight className="w-3 h-3" />}
              <span className="text-xs font-semibold uppercase tracking-wide">Tin nhắn trực tiếp</span>
            </div>
          </div>
          {dmsOpen && (
            <ul className="mt-0.5">
              {users.length === 0 && <li className="px-4 py-1.5 text-white/40 text-xs">Chưa có thành viên nào</li>}
              {users.map((user) => {
                const name     = user.displayName || user.email || ''
                const initials = getInitials(name)
                const isActive = activeDmUser?.id === user.id
                return (
                  <li key={user.id}>
                    <button
                      onClick={() => openDM(user)}
                      className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm rounded-md mx-1 transition-colors ${
                        isActive ? 'bg-macaron-sidebar-active text-white font-semibold' : 'text-white/70 hover:bg-macaron-sidebar-hover hover:text-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${colorFromName(name)} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                        {initials}
                      </div>
                      <span className="truncate flex-1 text-left">{name}</span>
                      <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════
   PANEL: Direct Messages (DM view)
═══════════════════════════════════════════════════ */
function DMPanel() {
  const { users, activeDmUser, openDM } = useApp()
  const [search, setSearch] = useState('')

  const filtered = users.filter((u) => {
    const name = (u.displayName || u.email || '').toLowerCase()
    return name.includes(search.toLowerCase())
  })

  return (
    <>
      <div className="px-4 py-3 border-b border-white/10 shrink-0 flex items-center justify-between">
        <span className="text-white font-bold text-base">Tin nhắn trực tiếp</span>
        <button className="text-white/60 hover:text-white" title="Nhắn tin mới">
          <HiPencil className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
          <HiSearch className="w-4 h-4 text-white/50 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {filtered.length === 0 && (
          <p className="px-4 py-2 text-white/40 text-xs">Không tìm thấy thành viên</p>
        )}
        {filtered.map((user) => {
          const name     = user.displayName || user.email || ''
          const initials = getInitials(name)
          const isActive = activeDmUser?.id === user.id
          return (
            <button
              key={user.id}
              onClick={() => openDM(user)}
              className={`w-full flex items-center gap-3 px-4 py-2 transition-colors ${
                isActive ? 'bg-macaron-sidebar-active text-white' : 'text-white/70 hover:bg-macaron-sidebar-hover hover:text-white'
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-8 h-8 rounded-full ${colorFromName(name)} flex items-center justify-center text-white text-sm font-bold`}>
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-macaron-navy" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-sm truncate ${isActive ? 'font-semibold' : ''}`}>{name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════
   PANEL: Files view
═══════════════════════════════════════════════════ */
function FilesPanel() {
  const FILE_NAV = [
    { label: 'Tất cả tệp',       icon: HiFolder },
    { label: 'Tài liệu giảng dạy', icon: HiDocumentText },
    { label: 'Theo dõi công việc', icon: HiClipboardList },
  ]
  const [active, setActive] = useState(0)

  return (
    <>
      <div className="px-4 py-3 border-b border-white/10 shrink-0 flex items-center justify-between">
        <span className="text-white font-bold text-base">Tệp</span>
        <button onClick={() => toast('Tính năng đang phát triển 🚧', { icon: '🛠️' })} className="text-white/60 hover:text-white">
          <HiPlus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {FILE_NAV.map(({ label, icon: Icon }, i) => (
          <button
            key={label}
            onClick={() => setActive(i)}
            className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
              active === i ? 'bg-macaron-sidebar-active text-white font-semibold' : 'text-white/70 hover:bg-macaron-sidebar-hover hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════
   PANEL: Activity view
═══════════════════════════════════════════════════ */
function ActivityPanel() {
  const { channels, activeChannel, openChannel, channelReads } = useApp()

  const unreadChannels = channels.filter((ch) => {
    const lastMsg  = ch.lastMessageAt?.toMillis?.() ?? 0
    const lastRead = channelReads[ch.id] ?? 0
    return lastMsg > lastRead && lastMsg > 0
  })

  return (
    <>
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <span className="text-white font-bold text-base">Hoạt động</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        <p className="px-4 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-white/40">
          Chưa đọc
        </p>
        {unreadChannels.length === 0 && (
          <p className="px-4 py-1.5 text-white/40 text-xs">Không có tin chưa đọc</p>
        )}
        {unreadChannels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => openChannel(ch)}
            className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm rounded-md mx-1 transition-colors ${
              activeChannel?.id === ch.id ? 'bg-macaron-sidebar-active text-white font-semibold' : 'text-white/70 hover:bg-macaron-sidebar-hover hover:text-white'
            }`}
          >
            <HiHashtag className="w-4 h-4 shrink-0" />
            <span className="truncate font-semibold text-white">{ch.name}</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-white shrink-0" />
          </button>
        ))}
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════
   ROOT LeftPanel
═══════════════════════════════════════════════════ */
export default function LeftPanel() {
  const { activeView } = useApp()

  return (
    <div className="w-60 bg-macaron-navy flex flex-col shrink-0 overflow-hidden">
      {activeView === 'channel'  && <ChannelPanel />}
      {activeView === 'dm'       && <DMPanel />}
      {activeView === 'files'    && <FilesPanel />}
      {activeView === 'activity' && <ActivityPanel />}
    </div>
  )
}
