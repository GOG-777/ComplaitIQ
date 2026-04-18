import { useState } from 'react'
import type { Complaint } from '../types'
import { getComplaintByTicketId, submitFollowUp } from '../services/complaints.service'
import CategoryTag from '../components/ui/CategoryTag'
import StatusDot from '../components/ui/StatusDot'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../utils'

const steps: { status: Complaint['status']; label: string }[] = [
  { status: 'open', label: 'Submitted' },
  { status: 'pending', label: 'Under Review' },
  { status: 'resolved', label: 'Resolved' },
]

const statusOrder: Record<Complaint['status'], number> = {
  open: 0,
  pending: 1,
  resolved: 2,
}

export default function TrackPage() {
  const [ticketInput, setTicketInput] = useState('')
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [followUpSuccess, setFollowUpSuccess] = useState('')
  const [followUpError, setFollowUpError] = useState('')

  const handleTrack = async () => {
    const trimmed = ticketInput.trim().toUpperCase()
    if (!trimmed) {
      setError('Please enter a ticket ID.')
      return
    }
    setError('')
    setComplaint(null)
    setLoading(true)
    try {
      const data = await getComplaintByTicketId(trimmed)
      setComplaint(data)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTrack()
  }

  const handleFollowUp = async () => {
    if (!complaint) return
    setFollowUpError('')
    setFollowUpSuccess('')
    setFollowUpLoading(true)
    try {
      const result = await submitFollowUp(complaint.ticket_id, followUp)
      setFollowUpSuccess(result.message)
      setFollowUp('')
      const updated = await getComplaintByTicketId(complaint.ticket_id)
      setComplaint(updated)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setFollowUpError(msg ?? 'Failed to submit follow-up. Please try again.')
    } finally {
      setFollowUpLoading(false)
    }
  }

  const currentStep = complaint ? statusOrder[complaint.status] : -1

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-2">Ticket Tracker</p>
      <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-2">Track your complaint.</h1>
      <p className="text-stone-500 mb-6 sm:mb-8">Enter your ticket ID to check the status and view responses.</p>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. IQ-241201-101"
            value={ticketInput}
            onChange={e => setTicketInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono tracking-wider uppercase"
          />
          <button
            onClick={handleTrack}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
          >
            {loading ? <Spinner size="sm" /> : 'Track →'}
          </button>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {complaint && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-1">
                  {complaint.ticket_id}
                </p>
                <h2 className="font-serif text-lg sm:text-xl text-stone-900 truncate">{complaint.subject}</h2>
                <p className="text-xs text-stone-400 mt-1">Submitted {formatDate(complaint.created_at)}</p>
              </div>
              <div className="flex-shrink-0">
                <StatusDot status={complaint.status} />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              <CategoryTag category={complaint.category} />
              <Badge variant={complaint.priority} />
            </div>

            <div className="bg-stone-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Your Complaint</p>
              <p className="text-sm text-stone-700 leading-relaxed">{complaint.description}</p>
            </div>

            <div className="relative px-2">
              <div className="flex justify-between relative z-10">
                {steps.map((step, idx) => {
                  const reached = idx <= currentStep
                  return (
                    <div key={step.status} className="flex-1 flex flex-col items-center">
                      <div className={`
                        w-8 h-8 rounded-full border-2 flex items-center justify-center mb-2 transition-all text-xs font-bold
                        ${reached
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'bg-white border-stone-300 text-stone-300'}
                      `}>
                        {reached ? '✓' : <span className="w-2 h-2 rounded-full bg-current" />}
                      </div>
                      <p className={`text-xs font-semibold text-center ${reached ? 'text-stone-700' : 'text-stone-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div className="absolute top-4 left-[16%] right-[16%] h-0.5 bg-stone-200">
                <div
                  className="h-full bg-green-600 transition-all duration-500"
                  style={{ width: currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>
          </div>

          {complaint.responses && complaint.responses.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Responses</p>
              <div className="space-y-3">
                {complaint.responses.map(r => (
                  <div
                    key={r.id}
                    className={`rounded-xl p-4 sm:p-5 ${
                      r.type === 'auto'
                        ? 'bg-blue-50 border border-blue-100'
                        : r.type === 'user'
                        ? 'bg-stone-50 border border-stone-200'
                        : 'bg-green-50 border border-green-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                      <span className={`text-xs font-semibold uppercase tracking-widest ${
                        r.type === 'auto'
                          ? 'text-blue-500'
                          : r.type === 'user'
                          ? 'text-stone-500'
                          : 'text-green-600'
                      }`}>
                        {r.type === 'auto' ? 'Auto Response' : r.type === 'user' ? 'You' : 'Support Team'}
                      </span>
                      <span className="text-xs text-stone-400">{formatDate(r.created_at)}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      r.type === 'auto'
                        ? 'text-blue-800'
                        : r.type === 'user'
                        ? 'text-stone-700'
                        : 'text-green-800'
                    }`}>
                      {r.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {complaint.status !== 'resolved' && (
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">Send a Follow-up</p>
              <textarea
                rows={4}
                placeholder="Not satisfied with the response? Add more details or ask a follow-up question..."
                value={followUp}
                onChange={e => setFollowUp(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y mb-3"
              />
              {followUpError && (
                <div className="mb-3 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  {followUpError}
                </div>
              )}
              {followUpSuccess && (
                <div className="mb-3 px-4 py-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
                  {followUpSuccess}
                </div>
              )}
              <button
                onClick={handleFollowUp}
                disabled={followUpLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
              >
                {followUpLoading && <Spinner size="sm" />}
                {followUpLoading ? 'Sending...' : 'Send Follow-up'}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}