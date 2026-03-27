import AppLayout from '../components/layout/AppLayout'
import ChannelView from '../components/channel/ChannelView'
import DMView from '../components/dm/DMView'
import FilesView from '../components/files/FilesView'
import ActivityView from '../components/activity/ActivityView'
import ListView from '../components/lists/ListView'
import CreateChannelModal from '../components/modals/CreateChannelModal'
import { useApp } from '../contexts/AppContext'

export default function Dashboard() {
  const { activeView, showCreateChannel } = useApp()

  function MainContent() {
    if (activeView === 'channel')  return <ChannelView />
    if (activeView === 'dm')       return <DMView />
    if (activeView === 'lists')    return <ListView />
    if (activeView === 'files')    return <FilesView />
    if (activeView === 'activity') return <ActivityView />
    return <ChannelView />
  }

  return (
    <>
      <AppLayout>
        <MainContent />
      </AppLayout>
      {showCreateChannel && <CreateChannelModal />}
    </>
  )
}
