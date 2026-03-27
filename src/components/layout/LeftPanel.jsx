import { useState } from 'react'
import { HiHashtag, HiChevronDown, HiChevronRight, HiPlus, HiUser } from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'

export default function LeftPanel() {
  const {
    channels, users, activeChannel, activeDmUser,
    openChannel, openDM, setShowCreateChannel,
  } = useApp()

  const [channelsOpen, setChannelsOpen] = useState(true)
  const [dmsOpen, setDmsOpen]           = useState(true)

  return (
    <div className="w-60 bg-macaron-navy flex flex-col shrink-0 overflow-hidden">
      {/* Workspace header */}
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base truncate">Macaron Schools</span>
          <HiChevronDown className="w-4 h-4 text-white/60 shrink-0" />
        </div>
        <p className="text-white/50 text-xs mt-0.5">Không gian làm việc</p>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">

        {/* Channels section */}
        <div className="mb-2">
          <div
            className="flex items-center justify-between px-3 py-1 cursor-pointer group"
            onClick={() => setChannelsOpen((v) => !v)}
          >
            <div className="flex items-center gap-1 text-white/70 hover:text-white">
              {channelsOpen
                ? <HiChevronDown  className="w-3 h-3" />
                : <HiChevronRight className="w-3 h-3" />}
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
              {channels.map((ch) => (
                <li key={ch.id}>
                  <button
                    onClick={() => openChannel(ch)}
                    className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm rounded-md mx-1 transition-colors ${
                      activeChannel?.id === ch.id
                        ? 'bg-macaron-sidebar-active text-white font-semibold'
                        : 'text-white/70 hover:bg-macaron-sidebar-hover hover:text-white'
                    }`}
                  >
                    <HiHashtag className="w-4 h-4 shrink-0" />
                    <span className="truncate">{ch.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DMs section */}
        <div>
          <div
            className="flex items-center justify-between px-3 py-1 cursor-pointer group"
            onClick={() => setDmsOpen((v) => !v)}
          >
            <div className="flex items-center gap-1 text-white/70 hover:text-white">
              {dmsOpen
                ? <HiChevronDown  className="w-3 h-3" />
                : <HiChevronRight className="w-3 h-3" />}
              <span className="text-xs font-semibold uppercase tracking-wide">Tin nhắn trực tiếp</span>
            </div>
          </div>

          {dmsOpen && (
            <ul className="mt-0.5">
              {users.length === 0 && (
                <li className="px-4 py-1.5 text-white/40 text-xs">Chưa có thành viên nào</li>
              )}
              {users.map((user) => {
                const initials = (user.displayName || user.email || 'U')
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
                return (
                  <li key={user.id}>
                    <button
                      onClick={() => openDM(user)}
                      className={`w-full flex items-center gap-2 px-4 py-1.5 text-sm rounded-md mx-1 transition-colors ${
                        activeDmUser?.id === user.id
                          ? 'bg-macaron-sidebar-active text-white font-semibold'
                          : 'text-white/70 hover:bg-macaron-sidebar-hover hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-macaron-gold/80 flex items-center justify-center text-macaron-navy-dark text-[10px] font-bold shrink-0">
                        {initials}
                      </div>
                      <span className="truncate">{user.displayName || user.email}</span>
                      <span className="ml-auto w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
