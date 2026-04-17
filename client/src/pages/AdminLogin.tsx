import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth.service'
import Spinner from '../components/ui/Spinner'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    if (!username || !password) {
      setError('Both fields are required.')
      return
    }
    setLoading(true)
    try {
      const data = await login({ username, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username)
      navigate('/admin')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-2">Admin Access</p>
          <h1 className="font-serif text-3xl text-stone-900">Sign in to dashboard</h1>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Username</label>
            <input
              type="text"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
          >
            {loading && <Spinner size="sm" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </main>
  )
}