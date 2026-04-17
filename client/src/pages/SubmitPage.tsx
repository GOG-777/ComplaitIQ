import { useState } from 'react'
import { submitComplaint } from '../services/complaints.service'
import type { ComplaintCategory, ComplaintPriority } from '../types'
import { detectCategory } from '../utils'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

interface FormState {
  name: string
  email: string
  subject: string
  category: ComplaintCategory | ''
  description: string
}

const categories: { value: ComplaintCategory; label: string }[] = [
  { value: 'billing', label: '💳 Billing & Payments' },
  { value: 'technical', label: '🔧 Technical Issue' },
  { value: 'service', label: '🙍 Service & Staff' },
  { value: 'delivery', label: '📦 Delivery & Logistics' },
  { value: 'other', label: '📋 Other' },
]

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', subject: '', category: '', description: '',
  })
  const [priority, setPriority] = useState<ComplaintPriority>('low')
  const [detectedCategory, setDetectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ ticket_id: string; auto_response: string } | null>(null)

  const handleSubjectChange = (value: string) => {
    setForm(prev => ({ ...prev, subject: value }))
    const detected = detectCategory(value)
    setDetectedCategory(detected)
    if (!form.category) {
      setForm(prev => ({ ...prev, category: detected as ComplaintCategory }))
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.name || !form.email || !form.subject || !form.category || !form.description) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const result = await submitComplaint({ ...form, category: form.category as ComplaintCategory, priority })
      setSuccess(result)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ name: '', email: '', subject: '', category: '', description: '' })
    setPriority('low')
    setDetectedCategory('')
    setSuccess(null)
    setError('')
  }

  if (success) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl">
            ✓
          </div>
          <h2 className="font-serif text-2xl text-stone-900 mb-2">Complaint Received</h2>
          <p className="text-stone-500 text-sm mb-4">Your ticket ID is</p>
          <div className="inline-block bg-stone-50 border-2 border-dashed border-stone-300 rounded-lg px-6 py-2 font-semibold text-red-600 tracking-widest text-lg mb-6">
            {success.ticket_id}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-left mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">Auto Response</p>
            <p className="text-stone-700 text-sm leading-relaxed">{success.auto_response}</p>
          </div>
          <p className="text-stone-400 text-sm mb-6">Keep this ticket ID for your records. We will follow up via email.</p>
          <button onClick={handleReset} className="px-6 py-2.5 rounded-lg border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-all">
            Submit Another
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-2">Complaint Portal</p>
      <h1 className="font-serif text-4xl text-stone-900 mb-2">Tell us what went wrong.</h1>
      <p className="text-stone-500 mb-8">We will categorise your issue and get back to you promptly.</p>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Full Name</label>
            <input
              type="text"
              placeholder="Jane Smith"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="jane@email.com"
              value={form.email}
              onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Subject</label>
          <input
            type="text"
            placeholder="Brief description of the issue..."
            value={form.subject}
            onChange={e => handleSubjectChange(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {detectedCategory && (
            <p className="text-xs text-stone-400 mt-1.5">
              Auto-detected: <span className="text-red-500 font-semibold capitalize">{detectedCategory}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(prev => ({ ...prev, category: e.target.value as ComplaintCategory }))}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
            >
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Priority</label>
            <div className="flex gap-2 mt-1">
              {(['low', 'medium', 'high'] as ComplaintPriority[]).map(p => (
                <Badge key={p} variant={p} selected={priority === p} onClick={() => setPriority(p)} />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">Describe your complaint</label>
          <textarea
            rows={5}
            placeholder="Please provide as much detail as possible — what happened, when, and how it affected you..."
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y"
          />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
          >
            {loading && <Spinner size="sm" />}
            {loading ? 'Submitting...' : 'Submit Complaint →'}
          </button>
          <span className="text-xs text-stone-400">We typically respond within 24 to 48 hours</span>
        </div>
      </div>
    </main>
  )
}