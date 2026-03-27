import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  collection, doc, onSnapshot, addDoc, query,
  orderBy, serverTimestamp, getDocs, setDoc, where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)
export function useApp() { return useContext(AppContext) }

const DEFAULT_CHANNELS = [
  { id: 'general',       name: 'general',        description: 'Kênh chung cho cả trường' },
  { id: 'thong-bao',     name: 'thông-báo',       description: 'Thông báo từ ban giám hiệu' },
  { id: 'giao-vien',     name: 'giáo-viên',       description: 'Trao đổi chuyên môn giữa giáo viên' },
  { id: 'tuyen-sinh',    name: 'tuyển-sinh',      description: 'Cập nhật thông tin tuyển sinh' },
  { id: 'training',      name: 'training-nội-bộ', description: 'Tài liệu và kế hoạch đào tạo' },
]

export function AppProvider({ children }) {
  const { currentUser } = useAuth()
  const [channels, setChannels]           = useState([])
  const [users, setUsers]                 = useState([])
  const [activeView, setActiveView]       = useState('channel') // 'channel' | 'dm' | 'files' | 'activity'
  const [activeChannel, setActiveChannel] = useState(null)
  const [activeDmUser, setActiveDmUser]   = useState(null)
  const [showCreateChannel, setShowCreateChannel] = useState(false)

  // Seed default channels if they don't exist
  useEffect(() => {
    if (!currentUser) return
    DEFAULT_CHANNELS.forEach(async (ch) => {
      const ref = doc(db, 'channels', ch.id)
      const snap = await getDocs(query(collection(db, 'channels'), where('name', '==', ch.name)))
      if (snap.empty) {
        await setDoc(ref, {
          name: ch.name,
          description: ch.description,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid,
          isPrivate: false,
        })
      }
    })
  }, [currentUser])

  // Listen to channels
  useEffect(() => {
    if (!currentUser) return
    const q = query(collection(db, 'channels'), orderBy('name'))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setChannels(list)
      if (!activeChannel && list.length > 0) {
        setActiveChannel(list[0])
      }
    })
    return unsub
  }, [currentUser])

  // Listen to users
  useEffect(() => {
    if (!currentUser) return
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.id !== currentUser.uid))
    })
    return unsub
  }, [currentUser])

  async function sendChannelMessage(channelId, text) {
    if (!text.trim()) return
    await addDoc(collection(db, 'channels', channelId, 'messages'), {
      text: text.trim(),
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      createdAt: serverTimestamp(),
    })
  }

  async function sendDM(targetUserId, text) {
    if (!text.trim()) return
    const dmId = [currentUser.uid, targetUserId].sort().join('_')
    await addDoc(collection(db, 'dms', dmId, 'messages'), {
      text: text.trim(),
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      createdAt: serverTimestamp(),
    })
  }

  async function createChannel(name, description) {
    name = name.toLowerCase().replace(/\s+/g, '-')
    await addDoc(collection(db, 'channels'), {
      name,
      description,
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid,
      isPrivate: false,
    })
  }

  function openChannel(channel) {
    setActiveChannel(channel)
    setActiveDmUser(null)
    setActiveView('channel')
  }

  function openDM(user) {
    setActiveDmUser(user)
    setActiveChannel(null)
    setActiveView('dm')
  }

  function openFiles()    { setActiveView('files')    }
  function openActivity() { setActiveView('activity') }

  const value = {
    channels, users, activeView, activeChannel, activeDmUser,
    showCreateChannel, setShowCreateChannel,
    sendChannelMessage, sendDM, createChannel,
    openChannel, openDM, openFiles, openActivity,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
