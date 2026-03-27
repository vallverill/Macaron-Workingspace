import { useState } from 'react'
import { HiPaperAirplane, HiPaperClip, HiEmojiHappy } from 'react-icons/hi'

export default function MessageInput({ onSend, placeholder = 'Nhắn tin...' }) {
  const [text, setText] = useState('')

  function handleSend() {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <div className="flex items-end gap-2 border border-gray-300 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-macaron-navy/30 focus-within:border-macaron-navy transition-all">
        <button className="text-gray-400 hover:text-gray-600 mb-1 transition-colors" title="Đính kèm">
          <HiPaperClip className="w-5 h-5" />
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent leading-relaxed max-h-32 overflow-y-auto"
          style={{ minHeight: '1.5rem' }}
        />
        <button className="text-gray-400 hover:text-gray-600 mb-1 transition-colors" title="Biểu cảm">
          <HiEmojiHappy className="w-5 h-5" />
        </button>
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-8 h-8 rounded-lg bg-macaron-navy hover:bg-macaron-navy-hover disabled:bg-gray-200 flex items-center justify-center transition-colors mb-0.5 shrink-0"
          title="Gửi (Enter)"
        >
          <HiPaperAirplane className="w-4 h-4 text-white disabled:text-gray-400 rotate-90" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1 pl-1">
        Nhấn <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> để gửi · <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Shift+Enter</kbd> để xuống dòng
      </p>
    </div>
  )
}
