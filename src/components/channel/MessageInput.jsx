import { useState, useRef, useEffect } from 'react'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import { HiPaperAirplane, HiPaperClip, HiEmojiHappy, HiX, HiDocument } from 'react-icons/hi'

export default function MessageInput({ onSend, placeholder = 'Nhắn tin...' }) {
  const [text, setText]           = useState('')
  const [file, setFile]           = useState(null)   // { raw: File, preview: string|null }
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const fileInputRef              = useRef(null)

  // Clean up object URL on unmount or file change
  useEffect(() => {
    return () => { if (file?.preview) URL.revokeObjectURL(file.preview) }
  }, [file])

  function handleFileSelect(e) {
    const selected = e.target.files[0]
    if (!selected) return
    const preview = selected.type.startsWith('image/') ? URL.createObjectURL(selected) : null
    setFile({ raw: selected, preview })
    e.target.value = ''
  }

  function removeFile() {
    if (file?.preview) URL.revokeObjectURL(file.preview)
    setFile(null)
  }

  async function handleSend() {
    if (!text.trim() && !file) return

    let fileData = null
    if (file) {
      setUploading(true)
      setProgress(0)
      try {
        const path = `uploads/${Date.now()}_${file.raw.name}`
        const sRef = storageRef(storage, path)
        const task = uploadBytesResumable(sRef, file.raw)

        await new Promise((resolve, reject) => {
          task.on(
            'state_changed',
            (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            resolve,
          )
        })

        const url = await getDownloadURL(sRef)
        fileData = { url, name: file.raw.name, type: file.raw.type }
      } catch (err) {
        console.error('Upload lỗi:', err)
        setUploading(false)
        return
      }
      setUploading(false)
      setProgress(0)
    }

    onSend(text, fileData)
    setText('')
    removeFile()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = (text.trim() || file) && !uploading

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      {/* File preview bar */}
      {file && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          {file.preview ? (
            <img src={file.preview} alt="" className="w-12 h-12 rounded object-cover shrink-0" />
          ) : (
            <HiDocument className="w-6 h-6 text-gray-500 shrink-0" />
          )}
          <span className="text-sm text-gray-700 flex-1 truncate">{file.raw.name}</span>
          {uploading ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-macaron-navy rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-blue-500">{progress}%</span>
            </div>
          ) : (
            <button onClick={removeFile} className="text-gray-400 hover:text-gray-600 shrink-0">
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-end gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-macaron-navy/30 focus-within:border-macaron-navy transition-all">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-gray-400 hover:text-gray-600 mb-1 transition-colors disabled:opacity-40"
          title="Đính kèm file"
        >
          <HiPaperClip className="w-5 h-5" />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={uploading}
          className="flex-1 resize-none outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent leading-relaxed max-h-32 overflow-y-auto disabled:opacity-60"
          style={{ minHeight: '1.5rem' }}
        />
        <button
          className="text-gray-400 hover:text-gray-600 mb-1 transition-colors"
          title="Biểu cảm"
        >
          <HiEmojiHappy className="w-5 h-5" />
        </button>
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="w-8 h-8 rounded-lg bg-macaron-navy hover:bg-macaron-navy-hover disabled:bg-gray-200 flex items-center justify-center transition-colors mb-0.5 shrink-0"
          title="Gửi (Enter)"
        >
          <HiPaperAirplane className="w-4 h-4 text-white rotate-90" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1 pl-1">
        Nhấn <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> để gửi ·{' '}
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Shift+Enter</kbd> để xuống dòng
      </p>
    </div>
  )
}
