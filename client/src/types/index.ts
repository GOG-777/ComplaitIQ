export type ComplaintCategory = 'billing' | 'technical' | 'service' | 'delivery' | 'other'
export type ComplaintPriority = 'low' | 'medium' | 'high'
export type ComplaintStatus = 'open' | 'pending' | 'resolved'

export interface Complaint {
  id: string
  ticket_id: string
  name: string
  email: string
  subject: string
  category: ComplaintCategory
  priority: ComplaintPriority
  description: string
  status: ComplaintStatus
  created_at: string
  updated_at: string
  latest_response?: string
  response_type?: string
  responses?: ComplaintResponse[]
}

export interface ComplaintResponse {
  id: string
  complaint_id: string
  content: string
  type: 'auto' | 'admin'
  admin_id: string | null
  created_at: string
}

export interface SubmitComplaintPayload {
  name: string
  email: string
  subject: string
  category: ComplaintCategory
  priority: ComplaintPriority
  description: string
}

export interface SubmitComplaintResponse {
  ticket_id: string
  auto_response: string
}

export interface AdminLoginPayload {
  username: string
  password: string
}

export interface AdminLoginResponse {
  token: string
  username: string
}