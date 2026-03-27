import { useState } from 'react'
import { HiX, HiHashtag, HiLockClosed, HiPencil, HiUserAdd, HiCheck } from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U'
}
function colorFromName(name = '') {
  const colors = ['bg-blue-500','bg-emerald-500','bg-violet-500','bg-rose-500','bg-amber-500','bg-teal-500','bg-indigo-500','bg-pink-500']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % colors.length
  return colors[hash]
}

export default function ChannelDetailsModal({ channel, onClose, initialTab = 'about' }) {
  const { users, updateChannelDescription } = useApp()
  const { currentUser } = useAuth()
  const [tab, setTab]                   = useState(initialTab)
  const [editingDesc, setEditingDesc]   = useState(false)
  const [descValue, setDescValue]       = useState(channel.description || '')
  const [savingDesc, setSavingDesc]     = useState(false)
  const [memberSearch, setMemberSearch] = useState('')

  const allMembers = [
    { id: currentUser.uid, displayName: currentUser.displayName, email: currentUser.email, isYou: true },
    ...users,
  ]
  const filteredMembers = allMembers.filter((u) => {
    const name = (u.displayName || u.email || '').toLowerCase()
    return name.includes(memberSearch.toLowerCase())
  })

  async function saveDescription() {
    setSavingDesc(true)
    try {
      await updateChannelDescription(channel.id, descValue.trim())
      toast.success('Đã cập nhật mô tả kênh')
      setEditingDesc(false)
    } catch {
      toast.error('Không thể lưu. Thử lại sau.')
    } finally {
      setSavingDesc(false)
    }
  }

  const TABS = [
    { id: 'about',   label: 'Về kênh' },
    { id: 'members', label: `Thành viên ${allMembers.length}` },
    { id: 'settings', label: 'Cài đặt' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            {channel.isPrivate
              ? <HiLockClosed className="w-5 h-5 text-gray-600" />
              : <HiHashtag className="w-5 h-5 text-gray-600" />
            }
            <h2 className="text-lg font-bold text-gray-900">{channel.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 shrink-0">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === id
                  ? 'border-macaron-navy text-macaron-navy'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── About tab ── */}
          {tab === 'about' && (
            <div className="p-6 space-y-5">
              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Mô tả</h3>
                  {!editingDesc && (
                    <button
                      onClick={() => { setEditingDesc(true); setDescValue(channel.description || '') }}
                      className="flex items-center gap-1 text-xs text-macaron-navy hover:underline"
                    >
                      <HiPencil className="w-3.5 h-3.5" />
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                {editingDesc ? (
                  <div className="space-y-2">
                    <textarea
                      autoFocus
                      value={descValue}
                      onChange={(e) => setDescValue(e.target.value)}
                      placeholder="Kênh này dùng để làm gì? Cho mọi người biết nhé."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-macaron-navy resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingDesc(false)}
                        className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={saveDescription}
                        disabled={savingDesc}
                        className="px-3 py-1.5 text-sm text-white bg-macaron-navy rounded-lg hover:bg-macaron-navy-hover disabled:opacity-50"
                      >
                        {savingDesc ? 'Đang lưu...' : 'Lưu'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {channel.description || <span className="text-gray-400 italic">Chưa có mô tả. Nhấn Chỉnh sửa để thêm.</span>}
                  </p>
                )}
              </div>

              {/* Channel type */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Chế độ</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {channel.isPrivate ? (
                    <><HiLockClosed className="w-4 h-4" /> Kênh riêng tư</>
                  ) : (
                    <><HiHashtag className="w-4 h-4" /> Kênh công khai</>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Members tab ── */}
          {tab === 'members' && (
            <div className="p-6 space-y-3">
              {/* Search */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-macaron-navy/30 focus-within:border-macaron-navy transition-all">
                <input
                  autoFocus
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Tìm thành viên"
                  className="flex-1 text-sm outline-none placeholder-gray-400"
                />
              </div>

              {/* Add people */}
              <button
                onClick={() => toast('Tính năng đang phát triển 🚧', { icon: '🛠️' })}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 hover:border-macaron-navy hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <HiUserAdd className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-gray-700">Thêm người vào kênh</span>
              </button>

              {/* Member list */}
              <div className="space-y-1">
                {filteredMembers.map((user) => {
                  const name = user.displayName || user.email || ''
                  return (
                    <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-9 h-9 rounded-full ${colorFromName(name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                        {getInitials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {name}{user.isYou && <span className="text-gray-400 font-normal ml-1">(bạn)</span>}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      {user.isYou && (
                        <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 shrink-0">
                          Quản lý
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Settings tab ── */}
          {tab === 'settings' && (
            <div className="p-6">
              <div className="space-y-3">
                {[
                  'Chỉnh sửa cài đặt thông báo',
                  'Chuyển đổi kênh sang riêng tư',
                  'Lưu trữ kênh',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => toast('Tính năng đang phát triển 🚧', { icon: '🛠️' })}
                    className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-macaron-navy hover:bg-gray-50 transition-colors"
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => toast('Tính năng đang phát triển 🚧', { icon: '🛠️' })}
                  className="w-full text-left px-4 py-3 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Rời khỏi kênh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
