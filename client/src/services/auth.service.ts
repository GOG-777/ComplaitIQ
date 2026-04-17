import api from './api'
import type { AdminLoginPayload, AdminLoginResponse } from '../types'

export const login = async (payload: AdminLoginPayload): Promise<AdminLoginResponse> => {
  const res = await api.post('/auth/login', payload)
  return res.data
}

export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token')
}