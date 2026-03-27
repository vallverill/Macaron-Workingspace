import { HiHome, HiChatAlt2, HiBell, HiFolder, HiClipboardList } from 'react-icons/hi'
import { HiEllipsisHorizontal } from 'react-icons/hi2'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { id: 'home',     icon: HiHome,          label: 'Trang chủ',  view: 'channel'  },
  { id: 'dms',      icon: HiChatAlt2,      label: 'Tin nhắn',   view: 'dm'       },
  { id: 'activity', icon: HiBell,          label: 'Hoạt động',  view: 'activity' },
  { id: 'lists',    icon: HiClipboardList, label: 'Danh sách',  view: 'lists'    },
  { id: 'files',    icon: HiFolder,        label: 'Tệp',        view: 'files'    },
]

export default function IconSidebar() {
  const { activeView, activeChannel, activeDmUser, activeList, openChannel, openDM, openFiles, openActivity, openLists, channels, users, lists } = useApp()
  const { currentUser, logout } = useAuth()

  const initials = (currentUser?.displayName || currentUser?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function handleNav(view) {
    if (view === 'channel') {
      // Go back to the last active channel, or first channel
      if (activeChannel) {
        openChannel(activeChannel)
      } else if (channels.length > 0) {
        openChannel(channels[0])
      }
    } else if (view === 'dm') {
      if (activeDmUser) {
        openDM(activeDmUser)
      } else if (users.length > 0) {
        openDM(users[0])
      }
    } else if (view === 'lists') {
      openLists(activeList || lists[0] || null)
    } else if (view === 'files') {
      openFiles()
    } else if (view === 'activity') {
      openActivity()
    }
  }

  async function handleLogout() {
    await logout()
    toast.success('Đã đăng xuất.')
  }

  return (
    <div className="w-16 bg-macaron-navy-dark flex flex-col items-center py-3 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-macaron-gold flex items-center justify-center mb-4 cursor-pointer shrink-0">
        <span className="text-macaron-navy-dark font-bold text-lg leading-none">M</span>
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-white/10 mb-3" />

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1 w-full px-2">
        {NAV_ITEMS.map(({ id, icon: Icon, label, view }) => (
          <button
            key={id}
            onClick={() => handleNav(view)}
            title={label}
            className={`w-full flex flex-col items-center gap-0.5 py-2 rounded-lg transition-colors group ${
              activeView === view
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] leading-none font-medium">{label}</span>
          </button>
        ))}

        <button
          title="Thêm"
          className="w-full flex flex-col items-center gap-0.5 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <HiEllipsisHorizontal className="w-5 h-5" />
          <span className="text-[10px] leading-none font-medium">Thêm</span>
        </button>
      </nav>

      {/* User avatar */}
      <button
        onClick={handleLogout}
        title={`${currentUser?.displayName || currentUser?.email}\nBấm để đăng xuất`}
        className="w-9 h-9 rounded-full bg-macaron-navy flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-macaron-gold transition-all mt-2 shrink-0"
      >
        {initials}
      </button>
    </div>
  )
}
