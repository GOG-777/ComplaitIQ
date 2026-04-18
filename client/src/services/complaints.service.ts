import api from './api'
import type { Complaint, SubmitComplaintPayload, SubmitComplaintResponse, AnalyticsData } from '../types'

export const submitComplaint = async (payload: SubmitComplaintPayload): Promise<SubmitComplaintResponse> => {
    const res = await api.post('/complaints', payload)
    return res.data
}

export const getComplaints = async (params?: {
    status?: string
    category?: string
    search?: string
}): Promise<Complaint[]> => {
    const res = await api.get('/complaints', { params })
    return res.data
}

export const getComplaintById = async (id: string): Promise<Complaint> => {
    const res = await api.get(`/complaints/${id}`)
    return res.data
}

export const updateComplaintStatus = async (id: string, status: string): Promise<Complaint> => {
    const res = await api.patch(`/complaints/${id}/status`, { status })
    return res.data
}

export const getComplaintByTicketId = async (ticketId: string): Promise<Complaint> => {
    const res = await api.get(`/complaints/track/${ticketId}`)
    return res.data
}

export const sendAdminResponse = async (
    id: string,
    content: string,
    status?: string
): Promise<Complaint> => {
    const res = await api.post(`/complaints/${id}/respond`, { content, status })
    return res.data
}

export const submitFollowUp = async (ticketId: string, content: string): Promise<{ message: string }> => {
  const res = await api.post(`/complaints/track/${ticketId}/followup`, { content })
  return res.data
}

export const getAnalytics = async (): Promise<AnalyticsData> => {
  const res = await api.get('/complaints/analytics/summary')
  return res.data
}

export const exportComplaintsCSV = async (): Promise<void> => {
  const token = localStorage.getItem('token')
  const res = await fetch('http://localhost:5000/api/complaints/export/csv', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Export failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `complaints-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}