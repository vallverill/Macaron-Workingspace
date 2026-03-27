import IconSidebar from './IconSidebar'
import LeftPanel from './LeftPanel'

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <IconSidebar />
      <LeftPanel />
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {children}
      </main>
    </div>
  )
}
