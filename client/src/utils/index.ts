export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const detectCategory = (subject: string): string => {
  const s = subject.toLowerCase()
  if (/refund|charge|billing|invoice|payment|overcharged/.test(s)) return 'billing'
  if (/bug|error|crash|not working|glitch|technical|app|website|login/.test(s)) return 'technical'
  if (/rude|staff|service|agent|support|representative|attitude/.test(s)) return 'service'
  if (/delivery|shipment|package|tracking|arrived|missing item/.test(s)) return 'delivery'
  return 'other'
}

export const categoryLabel: Record<string, string> = {
  billing: 'Billing',
  technical: 'Technical',
  service: 'Service',
  delivery: 'Delivery',
  other: 'Other',
}

export const priorityLabel: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}