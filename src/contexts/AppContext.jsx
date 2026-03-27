import { createContext, useContext, useEffect, useState } from 'react'
import {
  collection, doc, onSnapshot, addDoc, query,
  orderBy, serverTimestamp, getDocs, setDoc, where,
  updateDoc,
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
  const [activeView, setActiveView]       = useState('channel')
  const [activeChannel, setActiveChannel] = useState(null)
  const [activeDmUser, setActiveDmUser]   = useState(null)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  // unread: map of channelId -> lastReadAt (ms timestamp)
  const [channelReads, setChannelReads]   = useState({})

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

  // Listen to unread reads for current user
  useEffect(() => {
    if (!currentUser) return
    const readRef = doc(db, 'userReads', currentUser.uid)
    const unsub = onSnapshot(readRef, (snap) => {
      if (snap.exists()) {
        const channels = snap.data().channels || {}
        // Convert Firestore Timestamps to ms numbers
        const converted = {}
        for (const [id, ts] of Object.entries(channels)) {
          converted[id] = ts?.toMillis?.() ?? ts ?? 0
        }
        setChannelReads(converted)
      }
    })
    return unsub
  }, [currentUser])

  async function markChannelRead(channelId) {
    if (!currentUser) return
    // Optimistic local update
    setChannelReads((prev) => ({ ...prev, [channelId]: Date.now() }))
    const readRef = doc(db, 'userReads', currentUser.uid)
    await setDoc(readRef, { channels: { [channelId]: serverTimestamp() } }, { merge: true })
  }

  async function sendChannelMessage(channelId, text, fileData = null) {
    if (!text.trim() && !fileData) return
    const msgData = {
      text: text.trim(),
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      createdAt: serverTimestamp(),
    }
    if (fileData) {
      msgData.fileUrl  = fileData.url
      msgData.fileName = fileData.name
      msgData.fileType = fileData.type
    }
    await addDoc(collection(db, 'channels', channelId, 'messages'), msgData)
    // Best-effort: update lastMessageAt for unread badge (non-blocking)
    updateDoc(doc(db, 'channels', channelId), { lastMessageAt: serverTimestamp() }).catch(() => {})
  }

  async function sendDM(targetUserId, text, fileData = null) {
    if (!text.trim() && !fileData) return
    const dmId = [currentUser.uid, targetUserId].sort().join('_')
    const msgData = {
      text: text.trim(),
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email,
      createdAt: serverTimestamp(),
    }
    if (fileData) {
      msgData.fileUrl  = fileData.url
      msgData.fileName = fileData.name
      msgData.fileType = fileData.type
    }
    await addDoc(collection(db, 'dms', dmId, 'messages'), msgData)
  }

  async function createChannel(name, description, isPrivate = false) {
    name = name.toLowerCase().replace(/\s+/g, '-')
    await addDoc(collection(db, 'channels'), {
      name,
      description,
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid,
      isPrivate,
    })
  }

  async function updateChannelDescription(channelId, description) {
    await updateDoc(doc(db, 'channels', channelId), { description })
  }

  function openChannel(channel) {
    setActiveChannel(channel)
    setActiveDmUser(null)
    setActiveView('channel')
    markChannelRead(channel.id)
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
    channelReads, markChannelRead,
    sendChannelMessage, sendDM, createChannel, updateChannelDescription,
    openChannel, openDM, openFiles, openActivity,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
