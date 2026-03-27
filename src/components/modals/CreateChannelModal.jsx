import { useState } from 'react'
import { HiX } from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'
import toast from 'react-hot-toast'

export default function CreateChannelModal() {
  const { setShowCreateChannel, createChannel } = useApp()
  const [name, setName]         = useState('')
  const [description, setDesc]  = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await createChannel(name.trim(), description.trim())
      toast.success(`Kênh #${name.toLowerCase().replace(/\s+/g, '-')} đã được tạo!`)
      setShowCreateChannel(false)
    } catch {
      toast.error('Không thể tạo kênh. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Tạo kênh mới</h2>
          <button
            onClick={() => setShowCreateChannel(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên kênh <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="tên-kênh"
                required
                className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macaron-navy text-sm"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Dùng chữ thường, không dấu, cách bằng gạch ngang</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tuỳ chọn)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Kênh này dùng để..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macaron-navy text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateChannel(false)}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="flex-1 py-2.5 bg-macaron-navy text-white rounded-lg text-sm font-semibold hover:bg-macaron-navy-hover disabled:opacity-50 transition-colors"
            >
              {loading ? 'Đang tạo...' : 'Tạo kênh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
