import { useState, useEffect } from 'react'
import { HiX, HiTrash, HiCalendar, HiChat } from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'not-started', label: 'Chưa làm'    },
  { value: 'in-progress', label: 'Đang làm'    },
  { value: 'done',        label: 'Hoàn thành'  },
  { value: 'blocked',     label: 'Bị chặn'     },
]

const PRIORITY_OPTIONS = [
  { value: 'p0', label: 'P0 — Khẩn cấp'   },
  { value: 'p1', label: 'P1 — Trung bình' },
  { value: 'p2', label: 'P2 — Thấp'       },
]

function colorFromName(name = '') {
  const colors = ['bg-blue-500','bg-emerald-500','bg-violet-500','bg-rose-500','bg-amber-500','bg-teal-500','bg-indigo-500','bg-pink-500']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % colors.length
  return colors[hash]
}

export default function ItemDetailPanel({ item, listId, onClose, onUpdate }) {
  const { users, deleteListItem } = useApp()
  const [title, setTitle]               = useState(item.title)
  const [description, setDescription]   = useState(item.description || '')

  useEffect(() => {
    setTitle(item.title)
    setDescription(item.description || '')
  }, [item.id])

  function saveTitle() {
    const trimmed = title.trim()
    if (trimmed && trimmed !== item.title) onUpdate(item.id, { title: trimmed })
  }

  function saveDescription() {
    if (description !== (item.description || '')) onUpdate(item.id, { description })
  }

  async function handleDelete() {
    if (!window.confirm('Xoá công việc này?')) return
    await deleteListItem(listId, item.id)
    onClose()
  }

  function toggleOwner(uid) {
    const owners = item.owners || []
    onUpdate(item.id, {
      owners: owners.includes(uid) ? owners.filter(id => id !== uid) : [...owners, uid],
    })
  }

  return (
    <div className="w-80 border-l border-gray-200 flex flex-col bg-white shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <span className="text-sm font-semibold text-gray-700">Chi tiết công việc</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            title="Xoá"
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
          >
            <HiTrash className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="w-full text-base font-semibold text-gray-900 outline-none border-b border-transparent hover:border-gray-200 focus:border-macaron-navy py-1 bg-transparent transition-colors"
        />

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Trạng thái</label>
          <select
            value={item.status || 'not-started'}
            onChange={(e) => onUpdate(item.id, { status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-macaron-navy"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Ưu tiên</label>
          <select
            value={item.priority || 'p2'}
            onChange={(e) => onUpdate(item.id, { priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-macaron-navy"
          >
            {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Due date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
            <HiCalendar className="w-3.5 h-3.5" />
            Ngày đến hạn
          </label>
          <input
            type="date"
            value={item.dueDate || ''}
            onChange={(e) => onUpdate(item.id, { dueDate: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-macaron-navy"
          />
        </div>

        {/* Owners */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-2">Người phụ trách</label>
          <div className="space-y-1 max-h-44 overflow-y-auto">
            {users.length === 0 && (
              <p className="text-xs text-gray-400 px-2 py-1">Chưa có thành viên nào</p>
            )}
            {users.map((u) => {
              const name    = u.displayName || u.email || ''
              const checked = (item.owners || []).includes(u.id)
              const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U'
              return (
                <button
                  key={u.id}
                  onClick={() => toggleOwner(u.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    checked ? 'bg-macaron-navy/10 text-macaron-navy' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full ${colorFromName(name)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                    {initials}
                  </div>
                  <span className="truncate flex-1 text-left">{name}</span>
                  {checked && <span className="w-2 h-2 rounded-full bg-macaron-navy shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveDescription}
            placeholder="Thêm mô tả cho công việc này..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-macaron-navy resize-none"
          />
        </div>

        {/* Comments placeholder */}
        <button
          onClick={() => toast('Tính năng đang phát triển 🚧', { icon: '🛠️' })}
          className="w-full flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-macaron-navy hover:text-macaron-navy transition-colors"
        >
          <HiChat className="w-4 h-4" />
          Thêm bình luận...
        </button>
      </div>
    </div>
  )
}
