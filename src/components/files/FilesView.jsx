import { HiFolder, HiDocumentText, HiClipboardList, HiPlus } from 'react-icons/hi'

const TEMPLATES = [
  {
    icon: HiDocumentText,
    title: 'Nhật ký lớp học',
    description: 'Ghi chép hàng ngày theo từng lớp',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: HiClipboardList,
    title: 'Theo dõi công việc',
    description: 'Quản lý và giao task cho giáo viên',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: HiFolder,
    title: 'Tài liệu giảng dạy',
    description: 'Lưu trữ giáo án và tài liệu Montessori',
    color: 'bg-green-100 text-green-600',
  },
]

export default function FilesView() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <HiFolder className="w-5 h-5 text-gray-500" />
          <h2 className="font-bold text-gray-900 text-base">Tệp & Tài liệu</h2>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-macaron-navy text-white text-sm font-medium rounded-lg hover:bg-macaron-navy-hover transition-colors">
          <HiPlus className="w-4 h-4" />
          <span>Tạo mới</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-content p-4">
        {/* Quick actions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Tạo nhanh</h3>
          <div className="grid grid-cols-1 gap-2 max-w-2xl">
            {TEMPLATES.map((t) => (
              <button
                key={t.title}
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

        {/* Empty state */}
        <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 max-w-2xl">
          <HiFolder className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Chưa có tệp nào</p>
          <p className="text-xs mt-1">Tạo canvas hoặc danh sách mới để bắt đầu</p>
        </div>
      </div>
    </div>
  )
}
