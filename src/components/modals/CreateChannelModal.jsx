import { useState } from 'react'
import { HiX, HiLockClosed, HiGlobe } from 'react-icons/hi'
import { useApp } from '../../contexts/AppContext'
import toast from 'react-hot-toast'

const MAX_NAME = 80

export default function CreateChannelModal() {
  const { setShowCreateChannel, createChannel } = useApp()
  const [step, setStep]             = useState(1)
  const [name, setName]             = useState('')
  const [description, setDesc]      = useState('')
  const [isPrivate, setIsPrivate]   = useState(false)
  const [loading, setLoading]       = useState(false)

  function handleNameChange(e) {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9\u00C0-\u024F\u1E00-\u1EFF\s-]/g, '').replace(/\s+/g, '-')
    if (val.length <= MAX_NAME) setName(val)
  }

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      await createChannel(name.trim(), description.trim(), isPrivate)
      toast.success(`Kênh #${name} đã được tạo!`)
      setShowCreateChannel(false)
    } catch {
      toast.error('Không thể tạo kênh. Thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tạo kênh</h2>
            {name && <p className="text-sm text-gray-400 mt-0.5"># {name}</p>}
          </div>
          <button onClick={() => setShowCreateChannel(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* ── STEP 1: Name ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Tên kênh
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Các kênh là nơi trao đổi xung quanh một chủ đề. Đặt tên dễ tìm và dễ nhớ.
                </p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">#</span>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="tên-kênh"
                    className="w-full pl-7 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macaron-navy text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {MAX_NAME - name.length}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Mô tả <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Kênh này dùng để làm gì?"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macaron-navy text-sm"
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: Visibility ── */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Chế độ hiển thị</label>
                <p className="text-xs text-gray-500 mb-4">Ai có thể xem kênh này?</p>
              </div>

              {/* Public */}
              <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${!isPrivate ? 'border-macaron-navy bg-macaron-navy/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className="mt-0.5 accent-macaron-navy"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <HiGlobe className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      Công khai — Mọi người trong Macaron Schools
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Bất kỳ ai cũng có thể xem và tham gia kênh này.</p>
                </div>
              </label>

              {/* Private */}
              <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${isPrivate ? 'border-macaron-navy bg-macaron-navy/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="visibility"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className="mt-0.5 accent-macaron-navy"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <HiLockClosed className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">Riêng tư — Chỉ người được mời</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Chỉ xem được khi được mời vào kênh.</p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">Bước {step} / 2</span>
          <div className="flex gap-3">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  disabled={!name.trim()}
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-macaron-navy text-white rounded-lg text-sm font-semibold hover:bg-macaron-navy-hover disabled:opacity-40 transition-colors"
                >
                  Tiếp theo
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCreate}
                  className="px-5 py-2 bg-macaron-navy text-white rounded-lg text-sm font-semibold hover:bg-macaron-navy-hover disabled:opacity-40 transition-colors"
                >
                  {loading ? 'Đang tạo...' : 'Tạo kênh'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
