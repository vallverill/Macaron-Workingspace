import { Fragment, useState, useEffect, useRef } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import {
  HiViewBoards, HiViewList, HiPlus, HiCheck,
  HiCalendar, HiClipboardList,
} from 'react-icons/hi'
import { db } from '../../firebase'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import ItemDetailPanel from './ItemDetailPanel'

/* ── Config ── */
const STATUS_CONFIG = {
  'not-started': { label: 'Chưa làm',   badgeClass: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400'  },
  'in-progress': { label: 'Đang làm',   badgeClass: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'  },
  'done':        { label: 'Hoàn thành', badgeClass: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'blocked':     { label: 'Bị chặn',    badgeClass: 'bg-red-100 text-red-600',     dot: 'bg-red-500'   },
}
const PRIORITY_CONFIG = {
  'p0': { label: 'P0', desc: 'Khẩn cấp',   badgeClass: 'bg-red-100 text-red-600'       },
  'p1': { label: 'P1', desc: 'Trung bình',  badgeClass: 'bg-orange-100 text-orange-600' },
  'p2': { label: 'P2', desc: 'Thấp',        badgeClass: 'bg-blue-100 text-blue-600'     },
}

function colorFromName(name = '') {
  const colors = ['bg-blue-500','bg-emerald-500','bg-violet-500','bg-rose-500','bg-amber-500','bg-teal-500','bg-indigo-500','bg-pink-500']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % colors.length
  return colors[hash]
}
function initials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U'
}

/* ── Inline status dropdown ── */
function StatusCell({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const cfg = STATUS_CONFIG[value] || STATUS_CONFIG['not-started']

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${cfg.badgeClass}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-44">
          {Object.entries(STATUS_CONFIG).map(([k, c]) => (
            <button
              key={k}
              onClick={(e) => { e.stopPropagation(); onChange(k); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-left"
            >
              <span className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className={c.badgeClass.split(' ')[1]}>{c.label}</span>
              {value === k && <HiCheck className="ml-auto w-4 h-4 text-macaron-navy" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Inline priority dropdown ── */
function PriorityCell({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const cfg = PRIORITY_CONFIG[value] || PRIORITY_CONFIG['p2']

  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${cfg.badgeClass}`}
      >
        {cfg.label}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-44">
          {Object.entries(PRIORITY_CONFIG).map(([k, c]) => (
            <button
              key={k}
              onClick={(e) => { e.stopPropagation(); onChange(k); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-left"
            >
              <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${c.badgeClass}`}>{c.label}</span>
              <span className="text-gray-600">{c.desc}</span>
              {value === k && <HiCheck className="ml-auto w-4 h-4 text-macaron-navy" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Table row ── */
function ItemRow({ item, onSelect, onUpdate, allUsers }) {
  const owners   = (item.owners || []).map(uid => allUsers.find(u => u.id === uid)).filter(Boolean)
  const isDone   = item.status === 'done'
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !isDone

  return (
    <tr
      onClick={() => onSelect(item)}
      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
    >
      <td className="w-10 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onUpdate(item.id, { status: isDone ? 'not-started' : 'done' })}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {isDone && <HiCheck className="w-3 h-3" />}
        </button>
      </td>
      <td className="px-3 py-2.5 min-w-[200px]">
        <span className={`text-sm font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {item.title}
        </span>
      </td>
      <td className="px-3 py-2.5 w-40" onClick={(e) => e.stopPropagation()}>
        <StatusCell value={item.status || 'not-started'} onChange={(s) => onUpdate(item.id, { status: s })} />
      </td>
      <td className="px-3 py-2.5 w-28" onClick={(e) => e.stopPropagation()}>
        <PriorityCell value={item.priority || 'p2'} onChange={(p) => onUpdate(item.id, { priority: p })} />
      </td>
      <td className="px-3 py-2.5 w-32">
        <div className="flex -space-x-1">
          {owners.length === 0
            ? <span className="text-xs text-gray-300">—</span>
            : owners.slice(0, 3).map((u) => {
                const name = u.displayName || u.email || ''
                return (
                  <div
                    key={u.id}
                    title={name}
                    className={`w-6 h-6 rounded-full ${colorFromName(name)} flex items-center justify-center text-white text-[9px] font-bold border-2 border-white`}
                  >
                    {initials(name)}
                  </div>
                )
              })
          }
        </div>
      </td>
      <td className="px-3 py-2.5 w-32">
        {item.dueDate ? (
          <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            <HiCalendar className="w-3.5 h-3.5" />
            {item.dueDate}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>
    </tr>
  )
}

/* ── Add item row ── */
function AddItemRow({ listId }) {
  const { addListItem } = useApp()
  const [active, setActive] = useState(false)
  const [title, setTitle]   = useState('')

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    if (!title.trim()) { setActive(false); return }
    await addListItem(listId, { title: title.trim(), status: 'not-started', priority: 'p2', owners: [] })
    setTitle('')
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors"
      >
        <HiPlus className="w-4 h-4" />
        Thêm công việc
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center px-3 py-2 border-b border-gray-100 bg-blue-50/40">
      <div className="w-10 shrink-0" />
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSubmit}
        placeholder="Tên công việc..."
        className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400"
      />
      <button type="submit" className="shrink-0 text-xs text-macaron-navy font-semibold px-3 py-1 hover:underline">
        Thêm
      </button>
      <button type="button" onClick={() => { setTitle(''); setActive(false) }} className="shrink-0 text-xs text-gray-400 px-2">
        Huỷ
      </button>
    </form>
  )
}

/* ── Kanban card ── */
function KanbanCard({ item, onSelect, allUsers }) {
  const owners  = (item.owners || []).map(uid => allUsers.find(u => u.id === uid)).filter(Boolean)
  const isDone  = item.status === 'done'
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !isDone
  const priCfg  = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG['p2']

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white border border-gray-200 rounded-xl p-3 hover:border-macaron-navy cursor-pointer transition-colors shadow-sm"
    >
      <p className={`text-sm font-medium mb-2 ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
        {item.title}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${priCfg.badgeClass}`}>
          {priCfg.label}
        </span>
        <div className="flex items-center gap-2 ml-auto">
          {item.dueDate && (
            <span className={`text-xs flex items-center gap-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              <HiCalendar className="w-3 h-3" />
              {item.dueDate}
            </span>
          )}
          <div className="flex -space-x-1">
            {owners.slice(0, 2).map((u) => {
              const name = u.displayName || u.email || ''
              return (
                <div
                  key={u.id}
                  title={name}
                  className={`w-5 h-5 rounded-full ${colorFromName(name)} flex items-center justify-center text-white text-[9px] font-bold border border-white`}
                >
                  {initials(name)}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Kanban column ── */
function KanbanColumn({ status, items, onSelect, onUpdate, allUsers }) {
  const { activeList, addListItem } = useApp()
  const [adding, setAdding]   = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const cfg = STATUS_CONFIG[status]

  async function handleAdd(e) {
    if (e) e.preventDefault()
    if (!newTitle.trim()) { setAdding(false); return }
    await addListItem(activeList.id, { title: newTitle.trim(), status, priority: 'p2', owners: [] })
    setNewTitle('')
    setAdding(false)
  }

  return (
    <div className="flex flex-col w-64 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
        <span className="font-semibold text-sm text-gray-700">{cfg.label}</span>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{items.length}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1 min-h-[40px]">
        {items.map(item => (
          <KanbanCard key={item.id} item={item} onSelect={onSelect} allUsers={allUsers} />
        ))}
      </div>

      {/* Add */}
      {adding ? (
        <form onSubmit={handleAdd} className="mt-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleAdd}
            placeholder="Tên công việc..."
            className="w-full px-3 py-2 border border-macaron-navy/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-macaron-navy bg-white"
          />
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 w-full flex items-center gap-1 px-2 py-1.5 text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          Thêm
        </button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN ListView
══════════════════════════════════════ */
export default function ListView() {
  const { activeList, updateListItem, users } = useApp()
  const [items, setItems]             = useState([])
  const [viewMode, setViewMode]       = useState('table')
  const [groupBy, setGroupBy]         = useState('none')
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    if (!activeList) return
    const q = query(
      collection(db, 'lists', activeList.id, 'items'),
      orderBy('createdAt', 'asc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [activeList?.id])

  // Keep selected item synced with live data
  useEffect(() => {
    if (selectedItem) {
      const updated = items.find(i => i.id === selectedItem.id)
      if (updated) setSelectedItem(updated)
      else setSelectedItem(null)
    }
  }, [items])

  async function handleUpdateItem(itemId, data) {
    await updateListItem(activeList.id, itemId, data)
  }

  // Group by status
  const byStatus = {}
  Object.keys(STATUS_CONFIG).forEach(s => { byStatus[s] = items.filter(i => (i.status || 'not-started') === s) })

  // Group by priority
  const byPriority = {}
  Object.keys(PRIORITY_CONFIG).forEach(p => { byPriority[p] = items.filter(i => (i.priority || 'p2') === p) })

  if (!activeList) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <HiClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">Chọn một danh sách để bắt đầu</p>
          <p className="text-sm text-gray-400 mt-1">Hoặc tạo danh sách mới từ thanh bên trái</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 shrink-0 bg-white">
          <HiClipboardList className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-base leading-none truncate">{activeList.name}</h2>
            {activeList.description && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{activeList.description}</p>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Group by */}
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-macaron-navy/30 bg-white"
            >
              <option value="none">Không nhóm</option>
              <option value="status">Nhóm theo trạng thái</option>
              <option value="priority">Nhóm theo ưu tiên</option>
            </select>

            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                title="Bảng"
                className={`p-1.5 transition-colors ${viewMode === 'table' ? 'bg-macaron-navy text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <HiViewList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                title="Kanban"
                className={`p-1.5 transition-colors ${viewMode === 'kanban' ? 'bg-macaron-navy text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <HiViewBoards className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Table view ── */}
        {viewMode === 'table' && (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr>
                  <th className="w-10 px-3 py-2" />
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên công việc</th>
                  <th className="w-40 px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="w-28 px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ưu tiên</th>
                  <th className="w-32 px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phụ trách</th>
                  <th className="w-32 px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Đến hạn</th>
                </tr>
              </thead>
              <tbody>
                {groupBy === 'status' ? (
                  Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                    const group = byStatus[status]
                    if (group.length === 0) return null
                    return (
                      <Fragment key={status}>
                        <tr>
                          <td colSpan={6} className="px-4 py-2 bg-gray-50/80 border-y border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cfg.label}</span>
                              <span className="text-xs text-gray-400">({group.length})</span>
                            </div>
                          </td>
                        </tr>
                        {group.map(item => (
                          <ItemRow key={item.id} item={item} onSelect={setSelectedItem} onUpdate={handleUpdateItem} allUsers={users} />
                        ))}
                      </Fragment>
                    )
                  })
                ) : groupBy === 'priority' ? (
                  Object.entries(PRIORITY_CONFIG).map(([priority, cfg]) => {
                    const group = byPriority[priority]
                    if (group.length === 0) return null
                    return (
                      <Fragment key={priority}>
                        <tr>
                          <td colSpan={6} className="px-4 py-2 bg-gray-50/80 border-y border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${cfg.badgeClass}`}>{cfg.label}</span>
                              <span className="text-xs text-gray-500">{cfg.desc}</span>
                              <span className="text-xs text-gray-400">({group.length})</span>
                            </div>
                          </td>
                        </tr>
                        {group.map(item => (
                          <ItemRow key={item.id} item={item} onSelect={setSelectedItem} onUpdate={handleUpdateItem} allUsers={users} />
                        ))}
                      </Fragment>
                    )
                  })
                ) : (
                  items.map(item => (
                    <ItemRow key={item.id} item={item} onSelect={setSelectedItem} onUpdate={handleUpdateItem} allUsers={users} />
                  ))
                )}
              </tbody>
            </table>

            {items.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <HiClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">Chưa có công việc nào</p>
                <p className="text-xs mt-1">Nhấn bên dưới để thêm công việc đầu tiên</p>
              </div>
            )}

            <AddItemRow listId={activeList.id} />
          </div>
        )}

        {/* ── Kanban view ── */}
        {viewMode === 'kanban' && (
          <div className="flex-1 overflow-auto p-5 bg-gray-50">
            <div className="flex gap-4 h-full">
              {Object.keys(STATUS_CONFIG).map(status => (
                <KanbanColumn
                  key={status}
                  status={status}
                  items={byStatus[status]}
                  onSelect={setSelectedItem}
                  onUpdate={handleUpdateItem}
                  allUsers={users}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail panel ── */}
      {selectedItem && (
        <ItemDetailPanel
          item={selectedItem}
          listId={activeList.id}
          onClose={() => setSelectedItem(null)}
          onUpdate={handleUpdateItem}
        />
      )}
    </div>
  )
}
