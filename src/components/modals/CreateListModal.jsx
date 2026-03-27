import { useState } from 'react'
import { HiX } from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'
import toast from 'react-hot-toast'

export default function CreateListModal({ onClose }) {
  const { createList, openLists, lists } = useApp()
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading]         = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const id = await createList(name.trim(), description.trim())
      toast.success(`Đã tạo danh sách "${name.trim()}"`)
      // Navigate to the new list — it will appear in lists snapshot
      onClose()
    } catch {
      toast.error('Không thể tạo danh sách. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Tạo danh sách mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Tên danh sách <span className="text-red-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Kế hoạch tuyển sinh Q2"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macaron-navy text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Mô tả <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Danh sách này dùng để làm gì?"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macaron-navy text-sm"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-5 py-2 bg-macaron-navy text-white rounded-lg text-sm font-semibold hover:bg-macaron-navy-hover disabled:opacity-40 transition-colors"
            >
              {loading ? 'Đang tạo...' : 'Tạo danh sách'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
