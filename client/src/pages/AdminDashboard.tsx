import { useState, useEffect, useCallback } from 'react'
import type { Complaint, ComplaintStatus } from '../types'
import { getComplaints, getComplaintById, sendAdminResponse, updateComplaintStatus } from '../services/complaints.service'
import CategoryTag from '../components/ui/CategoryTag'
import StatusDot from '../components/ui/StatusDot'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../utils'

const autoTemplates = [
  { label: 'Acknowledge receipt', body: 'Thank you for reaching out. We have received your complaint and are currently reviewing it.' },
  { label: 'Request more info', body: 'Could you please provide additional details so we can investigate your concern further?' },
  { label: 'Resolved', body: 'We are pleased to inform you that your complaint has been resolved. Please let us know if you have further concerns.' },
]

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [selected, setSelected] = useState<Complaint | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [responseStatus, setResponseStatus] = useState<ComplaintStatus>('open')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getComplaints({
        status: filterStatus || undefined,
        category: filterCategory || undefined,
        search: search || undefined,
      })
      setComplaints(data)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterCategory, search])

  useEffect(() => {
    const timer = setTimeout(fetchComplaints, 300)
    return () => clearTimeout(timer)
  }, [fetchComplaints])

  const openModal = async (complaint: Complaint) => {
    setModalLoading(true)
    setSelected(complaint)
    setResponseText('')
    setSendError('')
    setResponseStatus(complaint.status)
    try {
      const full = await getComplaintById(complaint.id)
      setSelected(full)
    } finally {
      setModalLoading(false)
    }
  }

  const closeModal = () => {
    setSelected(null)
    setResponseText('')
    setSendError('')
  }

  const handleSend = async (resolveAfter: boolean) => {
    if (!selected) return
    setSendError('')
    setSending(true)
    try {
      const newStatus = resolveAfter ? 'resolved' : responseStatus
      await sendAdminResponse(selected.id, responseText, newStatus)
      closeModal()
      fetchComplaints()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setSendError(msg ?? 'Failed to send response.')
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (id: string, status: ComplaintStatus) => {
    await updateComplaintStatus(id, status)
    fetchComplaints()
  }

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-2">Admin Dashboard</p>
      <h1 className="font-serif text-4xl text-stone-900 mb-1">Complaints Inbox</h1>
      <p className="text-stone-500 mb-8">Review, respond, and resolve submitted complaints.</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Open', value: stats.open },
          { label: 'Pending', value: stats.pending },
          { label: 'Resolved', value: stats.resolved },
        ].map(s => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            <div className="font-serif text-3xl text-stone-900">{s.value}</div>
            <div className="text-xs text-stone-400 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="Search by name, subject or ticket..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm text-stone-900 outline-none focus:border-blue-500 transition-all"
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm text-stone-700 outline-none cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="service">Service</option>
          <option value="delivery">Delivery</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm text-stone-700 outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <div className="text-4xl mb-3">📭</div>
            <p>No complaints match your filters.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200">
                {['Ticket', 'Name', 'Subject', 'Category', 'Priority', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider text-stone-400 px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr
                  key={c.id}
                  onClick={() => openModal(c)}
                  className="border-b border-stone-100 hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-stone-700">{c.ticket_id}</td>
                  <td className="px-4 py-3 text-sm text-stone-700">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-stone-500 max-w-48 truncate">{c.subject}</td>
                  <td className="px-4 py-3"><CategoryTag category={c.category} /></td>
                  <td className="px-4 py-3"><Badge variant={c.priority} /></td>
                  <td className="px-4 py-3"><StatusDot status={c.status} /></td>
                  <td className="px-4 py-3 text-xs text-stone-400">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-5"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start p-7 pb-0">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-1">{selected.ticket_id}</p>
                <h2 className="font-serif text-xl text-stone-900">{selected.subject}</h2>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-500 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-7">
              {modalLoading ? (
                <div className="flex justify-center py-8"><Spinner /></div>
              ) : (
                <>
                  <div className="flex gap-2 flex-wrap mb-5">
                    <CategoryTag category={selected.category} />
                    <Badge variant={selected.priority} />
                    <StatusDot status={selected.status} />
                  </div>

                  <div className="bg-stone-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Complainant</p>
                    <p className="text-sm text-stone-700">
                      {selected.name} &middot;{' '}
                      <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">
                        {selected.email}
                      </a>
                    </p>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">Description</p>
                    <p className="text-sm text-stone-700 leading-relaxed">{selected.description}</p>
                  </div>

                  {selected.responses && selected.responses.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">Previous Responses</p>
                      {selected.responses.map(r => (
                        <div
                          key={r.id}
                          className={`rounded-xl p-4 mb-2 text-sm leading-relaxed ${
                            r.type === 'auto'
                              ? 'bg-blue-50 border border-blue-100 text-blue-800'
                              : 'bg-green-50 border border-green-100 text-green-800'
                          }`}
                        >
                          <span className="text-xs font-semibold uppercase tracking-widest opacity-60 block mb-1">
                            {r.type === 'auto' ? 'Auto Response' : 'Admin Response'}
                          </span>
                          {r.content}
                        </div>
                      ))}
                    </div>
                  )}

                  <hr className="border-stone-200 my-5" />

                  <p className="text-sm font-semibold text-stone-700 mb-3">Send Response</p>

                  <div className="flex gap-2 mb-3">
                    <select
                      onChange={e => setResponseText(e.target.value)}
                      defaultValue=""
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 outline-none cursor-pointer"
                    >
                      <option value="">Insert template...</option>
                      {autoTemplates.map(t => (
                        <option key={t.label} value={t.body}>{t.label}</option>
                      ))}
                    </select>
                    <select
                      value={responseStatus}
                      onChange={e => setResponseStatus(e.target.value as ComplaintStatus)}
                      className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700 outline-none cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <textarea
                    rows={4}
                    placeholder="Type your response here or use a template above..."
                    value={responseText}
                    onChange={e => setResponseText(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y mb-3"
                  />

                  {sendError && (
                    <div className="mb-3 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                      {sendError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSend(true)}
                      disabled={sending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
                    >
                      {sending && <Spinner size="sm" />}
                      Send & Resolve
                    </button>
                    <button
                      onClick={() => handleSend(false)}
                      disabled={sending}
                      className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
                    >
                      Send & Keep Open
                    </button>
                    <button
                      onClick={() => handleStatusChange(selected.id, responseStatus)}
                      className="ml-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-sm font-semibold transition-all"
                    >
                      Update Status Only
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}