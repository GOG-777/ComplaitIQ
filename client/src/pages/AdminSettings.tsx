import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ShieldCheck, ArrowLeft } from 'lucide-react'

export default function AdminSettings() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') ?? 'admin'

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = async () => {
    setError('Password changing has been disabled by the developer as this is a public demo project.')
    setSuccess('')
    return
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleChange()
  }

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-2">Admin Settings</p>
      <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-1">Account Settings</h1>
      <p className="text-stone-500 mb-8">Manage your admin account credentials.</p>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-stone-800">{username}</p>
            <p className="text-xs text-stone-400">Administrator</p>
          </div>
        </div>

        <p className="text-sm font-semibold text-stone-700 mb-5">Change Password</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <p className="text-xs text-stone-400 mt-1.5">Minimum 8 characters.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 px-4 py-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-stone-100">
          <button
            onClick={handleChange}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-all"
          >
            Update Password
          </button>
        </div>
      </div>
    </main>
  )
}