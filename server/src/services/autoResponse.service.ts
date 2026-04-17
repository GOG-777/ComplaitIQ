import { ComplaintCategory } from '../types'

const templates: Record<ComplaintCategory, string> = {
  billing: 'Thank you for contacting us regarding your billing concern. Our finance team has been notified and will review your account within 1 to 2 business days. If a correction is required, it will be processed promptly.',
  technical: 'We have received your technical complaint and our engineering team is looking into it. We appreciate your patience and will provide an update as soon as a resolution is identified.',
  service: 'We sincerely apologize for the experience you had with our service. Your feedback has been escalated to the relevant team and we are taking steps to address this immediately.',
  delivery: 'We have logged your delivery complaint and have initiated an investigation with our logistics team. You can expect an update within 24 hours regarding the status of your shipment.',
  other: 'Thank you for reaching out. Your complaint has been received and assigned to the appropriate team. We will review and respond to your concern within 2 business days.',
}

export const generateAutoResponse = (category: ComplaintCategory): string => {
  return templates[category] ?? templates.other
}