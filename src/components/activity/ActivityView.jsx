import { HiBell, HiCheckCircle } from 'react-icons/hi'

export default function ActivityView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 shrink-0">
        <HiBell className="w-5 h-5 text-gray-500" />
        <h2 className="font-bold text-gray-900 text-base">Hoạt động</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <HiCheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-700">Tất cả đã được đọc</p>
          <p className="text-sm text-gray-400 mt-1">Hiện chưa có thông báo mới.</p>
        </div>
      </div>
    </div>
  )
}
