import { useState, useEffect } from 'react'
import {
  HiFolder, HiDocumentText, HiClipboardList, HiPlus,
  HiSearch, HiDownload, HiPhotograph, HiX,
} from 'react-icons/hi'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { useApp } from '../../contexts/AppContext'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const TEMPLATES = [
  { icon: HiDocumentText, title: 'Nhật ký lớp học',    description: 'Ghi chép hàng ngày theo từng lớp',         color: 'bg-blue-100 text-blue-600' },
  { icon: HiClipboardList, title: 'Theo dõi công việc', description: 'Quản lý và giao task cho giáo viên',         color: 'bg-amber-100 text-amber-600' },
  { icon: HiFolder,        title: 'Tài liệu giảng dạy', description: 'Lưu trữ giáo án và tài liệu Montessori',   color: 'bg-green-100 text-green-600' },
]

function FileIcon({ type }) {
  if (type?.startsWith('image/')) return <HiPhotograph className="w-5 h-5 text-blue-500" />
  if (type?.includes('pdf'))      return <HiDocumentText className="w-5 h-5 text-red-500" />
  return <HiDocumentText className="w-5 h-5 text-gray-500" />
}

export default function FilesView() {
  const { channels } = useApp()
  const [search, setSearch]   = useState('')
  const [files, setFiles]     = useState([])   // { id, fileName, fileUrl, fileType, userName, channelName, createdAt }

  // Listen to all channels for messages with files
  useEffect(() => {
    if (!channels.length) return
    const unsubs = []
    const allFiles = {}

    channels.forEach((ch) => {
      const q = query(
        collection(db, 'channels', ch.id, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(50),
      )
      const unsub = onSnapshot(q, (snap) => {
        snap.docs.forEach((d) => {
          const data = d.data()
          if (data.fileUrl) {
            allFiles[d.id] = {
              id: d.id,
              fileName:    data.fileName || 'Tệp không tên',
              fileUrl:     data.fileUrl,
              fileType:    data.fileType || '',
              userName:    data.userName || '',
              channelName: ch.name,
              createdAt:   data.createdAt,
            }
          }
        })
        // Convert map to sorted array
        setFiles(
          Object.values(allFiles).sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? 0
            const tb = b.createdAt?.toMillis?.() ?? 0
            return tb - ta
          })
        )
      })
      unsubs.push(unsub)
    })

    return () => unsubs.forEach((u) => u())
  }, [channels.length])

  const filtered = files.filter((f) =>
    f.fileName.toLowerCase().includes(search.toLowerCase()) ||
    f.channelName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <HiFolder className="w-5 h-5 text-gray-500" />
          <h2 className="font-bold text-gray-900 text-base">Tệp &amp; Tài liệu</h2>
        </div>
        <button
          onClick={() => toast('Tính năng đang phát triển 🚧', { icon: '🛠️' })}
          className="flex items-center gap-1 px-3 py-1.5 bg-macaron-navy text-white text-sm font-medium rounded-lg hover:bg-macaron-navy-hover transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          <span>Tạo mới</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-content">
        {/* Search */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-macaron-navy/30 focus-within:border-macaron-navy transition-all bg-white">
            <HiSearch className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tệp..."
              className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <HiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="px-4">
          {/* Uploaded files */}
          {filtered.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {search ? `Kết quả tìm kiếm (${filtered.length})` : 'Tệp đã chia sẻ'}
              </h3>
              <div className="space-y-1">
                {filtered.map((f) => {
                  const ts = f.createdAt?.toDate?.()
                  const dateStr = ts ? format(ts, 'dd/MM/yyyy HH:mm', { locale: vi }) : ''
                  return (
                    <a
                      key={f.id}
                      href={f.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-macaron-navy hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        {f.fileType?.startsWith('image/') ? (
                          <img src={f.fileUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <FileIcon type={f.fileType} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-macaron-navy">{f.fileName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          #{f.channelName} · {f.userName} · {dateStr}
                        </p>
                      </div>
                      <HiDownload className="w-4 h-4 text-gray-400 group-hover:text-macaron-navy shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )
                })}
              </div>
            </div>
          ) : search ? (
            <div className="py-8 text-center text-gray-400">
              <HiSearch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Không tìm thấy tệp nào</p>
            </div>
          ) : null}

          {/* Templates */}
          {!search && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tạo nhanh</h3>
              <div className="grid grid-cols-1 gap-2 max-w-2xl">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.title}
                    onClick={() => toast('Tính năng đang phát triển 🚧', { icon: '🛠️' })}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-macaron-navy hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${t.color} flex items-center justify-center shrink-0`}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-macaron-navy">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!search && files.length === 0 && (
            <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 max-w-2xl mb-6">
              <HiFolder className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Chưa có tệp nào được chia sẻ</p>
              <p className="text-xs mt-1">Gửi ảnh hoặc tệp vào các kênh để xem tại đây</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
