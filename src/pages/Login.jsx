import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      const msgs = {
        'auth/user-not-found':  'Email không tồn tại.',
        'auth/wrong-password':  'Mật khẩu không đúng.',
        'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
      }
      toast.error(msgs[err.code] || 'Đăng nhập thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-macaron-navy-dark px-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-macaron-gold flex items-center justify-center">
            <span className="text-macaron-navy-dark font-bold text-2xl">M</span>
          </div>
          <span className="text-white font-bold text-3xl tracking-wide">Macaron</span>
        </div>
        <p className="text-gray-400 text-sm">Không gian làm việc của Macaron Schools</p>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-macaron-navy mb-1">Đăng nhập</h1>
        <p className="text-gray-500 text-sm mb-6">Chào mừng bạn quay lại!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@macaronschools.vn"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macaron-navy text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-macaron-navy text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-macaron-navy hover:bg-macaron-navy-hover text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-macaron-navy font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <p className="mt-6 text-gray-600 text-xs">© 2025 Macaron Schools. Bảo lưu mọi quyền.</p>
    </div>
  )
}
