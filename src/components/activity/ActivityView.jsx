import { useState } from 'react'
import { HiCheckCircle, HiAtSymbol, HiChat, HiEmojiHappy, HiStar, HiPlus } from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'

const FILTERS = [
  { id: 'unreads',   icon: HiChat,       label: 'Chưa đọc'  },
  { id: 'mentions',  icon: HiAtSymbol,   label: 'Đề cập'    },
  { id: 'reactions', icon: HiEmojiHappy, label: 'Reactions' },
  { id: 'starred',   icon: HiStar,       label: 'Đã ghim'   },
]

export default function ActivityView() {
  const [activeTab, setActiveTab]       = useState('all')
  const [activeFilter, setActiveFilter] = useState(null)
  const [showFilters, setShowFilters]   = useState(false)
  const { channels, channelReads, openChannel } = useApp()

  const unreadChannels = channels.filter((ch) => {
    const lastMsg  = ch.lastMessageAt?.toMillis?.() ?? 0
    const lastRead = channelReads[ch.id] ?? 0
    return lastMsg > lastRead && lastMsg > 0
  })

  const hasActivity = activeFilter === 'unreads' ? unreadChannels.length > 0 : false

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0 bg-white">
        <h2 className="font-bold text-gray-900 text-lg">Hoạt động</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-2 border-b border-gray-200 bg-white shrink-0">
        {['all', 'dms'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-macaron-navy text-macaron-navy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'all' ? 'Tất cả' : 'Tin nhắn'}
          </button>
        ))}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="ml-auto mb-1 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          <HiPlus className="w-3 h-3" />
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white shrink-0 overflow-x-auto">
        {FILTERS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(activeFilter === id ? null : id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              activeFilter === id
                ? 'bg-macaron-navy text-white border-macaron-navy'
                : 'bg-white text-gray-600 border-gray-300 hover:border-macaron-navy hover:text-macaron-navy'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeFilter === 'unreads' && unreadChannels.length > 0 ? (
          <div className="py-2">
            {unreadChannels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => openChannel(ch)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-macaron-navy flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">#</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{ch.name}</p>
                  <p className="text-xs text-gray-500">Có tin nhắn mới</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-macaron-navy shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <HiCheckCircle className="w-9 h-9 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-base">Đã cập nhật hết rồi!</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {activeFilter
                  ? 'Không có hoạt động nào trong mục này.'
                  : 'Hiện chưa có thông báo mới. Khi có tin nhắn hoặc đề cập mới, chúng sẽ xuất hiện ở đây.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
