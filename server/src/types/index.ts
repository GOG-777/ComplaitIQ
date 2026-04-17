export type ComplaintCategory = 'billing' | 'technical' | 'service' | 'delivery' | 'other'
export type ComplaintPriority = 'low' | 'medium' | 'high'
export type ComplaintStatus = 'open' | 'pending' | 'resolved'
export type ResponseType = 'auto' | 'admin'

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
  created_at: Date
  updated_at: Date
}

export interface Response {
  id: string
  complaint_id: string
  content: string
  type: ResponseType
  admin_id: string | null
  created_at: Date
}

export interface Admin {
  id: string
  username: string
  password_hash: string
  created_at: Date
}

export interface JwtPayload {
  id: string
  username: string
}