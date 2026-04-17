import api from './api'
import type { Complaint, SubmitComplaintPayload, SubmitComplaintResponse } from '../types'

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

export const sendAdminResponse = async (
  id: string,
  content: string,
  status?: string
): Promise<Complaint> => {
  const res = await api.post(`/complaints/${id}/respond`, { content, status })
  return res.data
}