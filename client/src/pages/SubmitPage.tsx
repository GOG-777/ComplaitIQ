import { useState } from 'react'
import { submitComplaint } from '../services/complaints.service'
import type { ComplaintCategory, ComplaintPriority } from '../types'
import { detectCategory } from '../utils'
import Spinner from '../components/ui/Spinner'
import {
  ShieldCheck,
  Clock,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Search,
  CheckCircle2,
  User,
  Mail,
  Tag,
  AlignLeft,
  Zap,
  MessageSquare,
  Lock,
} from 'lucide-react'

interface FormState {
  name: string
  email: string
  subject: string
  category: ComplaintCategory | ''
  priority: ComplaintPriority
  description: string
}

const categories: { value: ComplaintCategory; label: string; icon: string }[] = [
  { value: 'billing', label: 'Billing & Payments', icon: '💳' },
  { value: 'technical', label: 'Technical Issue', icon: '🔧' },
  { value: 'service', label: 'Service & Staff', icon: '🙍' },
  { value: 'delivery', label: 'Delivery & Logistics', icon: '📦' },
  { value: 'other', label: 'Other', icon: '📋' },
]

const trustBadges = [
  { icon: ShieldCheck, label: 'Secure & Private' },
  { icon: Clock, label: '24-48hr Response' },
  { icon: BarChart2, label: 'Fully Tracked' },
]

const howItWorks = [
  {
    icon: FileText,
    title: 'Submit',
    description: 'Fill in your complaint details. Takes less than 2 minutes.',
  },
  {
    icon: Search,
    title: 'We Review',
    description: 'Our team reviews and categorises your complaint promptly.',
  },
  {
    icon: CheckCircle2,
    title: 'Get Resolved',
    description: 'Receive a response via email and track progress anytime.',
  },
]

const sidebarFeatures = [
  {
    icon: Lock,
    title: 'Your data is safe',
    description: 'All submissions are encrypted and handled with strict confidentiality.',
  },
  {
    icon: MessageSquare,
    title: 'Two-way communication',
    description: 'Follow up on your complaint anytime using your ticket ID.',
  },
  {
    icon: Clock,
    title: 'Fast turnaround',
    description: 'We aim to respond to every complaint within 24 to 48 hours.',
  },
  {
    icon: BarChart2,
    title: 'Full visibility',
    description: 'Track the status of your complaint in real time from submission to resolution.',
  },
]

const TOTAL_STEPS = 3

export default function SubmitPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    category: '',
    priority: 'low',
    description: '',
  })
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

  const validateStep = (): string => {
    if (step === 1) {
      if (!form.name.trim()) return 'Full name is required.'
      if (!form.email.trim()) return 'Email address is required.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.'
    }
    if (step === 2) {
      if (!form.subject.trim()) return 'Subject is required.'
      if (!form.category) return 'Please select a category.'
    }
    if (step === 3) {
      if (!form.description.trim()) return 'Please describe your complaint.'
      if (form.description.trim().length < 10) return 'Description must be at least 10 characters.'
    }
    return ''
  }

  const handleNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setError('')
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')
    try {
      const result = await submitComplaint({
        ...form,
        category: form.category as ComplaintCategory,
      })
      setSuccess(result)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ name: '', email: '', subject: '', category: '', priority: 'low', description: '' })
    setDetectedCategory('')
    setStep(1)
    setSuccess(null)
    setError('')
  }

  if (success) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-stone-900 px-8 py-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Complaint Received</p>
              <p className="text-stone-400 text-xs">We will be in touch shortly</p>
            </div>
          </div>

          <div className="p-8 text-center">
            <p className="text-stone-500 text-sm mb-3">Your ticket ID is</p>
            <div className="inline-block bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl px-8 py-3 font-bold text-red-600 tracking-widest text-xl mb-6 font-mono">
              {success.ticket_id}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-left mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Auto Response</p>
              </div>
              <p className="text-stone-700 text-sm leading-relaxed">{success.auto_response}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Mail, label: 'Check your email', sub: 'Confirmation sent' },
                { icon: Search, label: 'Track anytime', sub: 'Use your ticket ID' },
                { icon: Clock, label: 'Response time', sub: '24 to 48 hours' },
              ].map(item => (
                <div key={item.label} className="bg-stone-50 rounded-xl p-3 text-center">
                  <item.icon className="w-4 h-4 text-stone-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-stone-700">{item.label}</p>
                  <p className="text-xs text-stone-400">{item.sub}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-lg border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-all"
            >
              Submit Another Complaint
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div>
      <section className="bg-stone-900 text-white py-14 sm:py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
            {trustBadges.map(badge => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1 text-xs font-medium text-stone-300"
              >
                <badge.icon className="w-3 h-3 text-red-400" />
                {badge.label}
              </span>
            ))}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4 leading-tight">
            We take your complaints <span className="text-red-400">seriously.</span>
          </h1>
          <p className="text-stone-400 text-base sm:text-lg max-w-xl mx-auto">
            Submit your issue in minutes. Our team reviews every complaint and responds promptly with a clear resolution.
          </p>
        </div>
      </section>

      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-stone-400 text-center mb-8">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            {howItWorks.map((item, idx) => (
              <div key={item.title} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-0 sm:text-center">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-stone-700" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <div className="sm:mt-4">
                  <p className="font-semibold text-stone-800 text-sm mb-1">{item.title}</p>
                  <p className="text-stone-500 text-xs leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 xl:gap-16 items-start">

          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-3">File a Complaint</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-3 leading-snug">
              Tell us what happened.
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed mb-8">
              Complete the form and we will review your complaint, assign it to the right team, and get back to you as fast as possible.
            </p>

            <div className="space-y-5">
              {sidebarFeatures.map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <f.icon className="w-4 h-4 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{f.title}</p>
                    <p className="text-xs text-stone-500 leading-relaxed mt-0.5">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-stone-200">
              <p className="text-xs text-stone-400">
                Already submitted?{' '}
                <a href="/track" className="text-red-500 font-semibold hover:underline">
                  Track your complaint
                </a>
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-6">
              {Array.from({ length: TOTAL_STEPS }).map((_, idx) => {
                const num = idx + 1
                const active = num === step
                const done = num < step
                return (
                  <div key={num} className="flex items-center flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0
                        ${done ? 'bg-green-600 text-white' : active ? 'bg-red-600 text-white' : 'bg-stone-200 text-stone-400'}
                      `}>
                        {done ? '✓' : num}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block whitespace-nowrap ${active ? 'text-stone-800' : 'text-stone-400'}`}>
                        {['Your Info', 'Issue Details', 'Description'][idx]}
                      </span>
                    </div>
                    {idx < TOTAL_STEPS - 1 && (
                      <div className="flex-1 h-px mx-3 bg-stone-200">
                        <div className={`h-full bg-green-600 transition-all duration-500 ${done ? 'w-full' : 'w-0'}`} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-6 sm:p-8">
              {step === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">Your Information</p>
                      <p className="text-xs text-stone-400">So we know who to get back to</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        placeholder="jane@email.com"
                        value={form.email}
                        onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <p className="text-xs text-stone-400 mt-1.5">Your ticket ID and updates will be sent here.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center">
                      <Tag className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">Issue Details</p>
                      <p className="text-xs text-stone-400">Help us understand what went wrong</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">Subject</label>
                      <input
                        type="text"
                        placeholder="Brief description of the issue..."
                        value={form.subject}
                        onChange={e => handleSubjectChange(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      {detectedCategory && (
                        <p className="text-xs text-stone-400 mt-1.5">
                          Auto-detected: <span className="text-red-500 font-semibold capitalize">{detectedCategory}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-2">Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map(c => (
                          <button
                            key={c.value}
                            onClick={() => setForm(prev => ({ ...prev, category: c.value }))}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left ${
                              form.category === c.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                                : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300 hover:bg-white'
                            }`}
                          >
                            <span className="text-base">{c.icon}</span>
                            <span className="text-xs">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-2">Priority</label>
                      <div className="flex gap-2">
                        {([
                          { value: 'low', label: 'Low', color: 'bg-green-50 border-green-200 text-green-700 ring-green-100' },
                          { value: 'medium', label: 'Medium', color: 'bg-amber-50 border-amber-200 text-amber-700 ring-amber-100' },
                          { value: 'high', label: 'High', color: 'bg-red-50 border-red-200 text-red-700 ring-red-100' },
                        ] as { value: ComplaintPriority; label: string; color: string }[]).map(p => (
                          <button
                            key={p.value}
                            onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                            className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                              form.priority === p.value
                                ? `${p.color} ring-2`
                                : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-white'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-9 h-9 bg-stone-100 rounded-xl flex items-center justify-center">
                      <AlignLeft className="w-4 h-4 text-stone-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">Describe Your Complaint</p>
                      <p className="text-xs text-stone-400">The more detail, the faster we can help</p>
                    </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-stone-500">
                      <span>
                        <span className="font-semibold text-stone-700">{form.name}</span>
                        {' '}&middot;{' '}
                        <span className="break-all">{form.email}</span>
                      </span>
                      <span className="capitalize font-medium text-stone-600 flex-shrink-0">
                        {form.category} &middot; {form.priority} priority
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={7}
                    placeholder="Please provide as much detail as possible. What happened, when did it happen, and how has it affected you?"
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-y"
                  />
                  <p className="text-xs text-stone-400 mt-1.5">{form.description.length} characters</p>
                </div>
              )}

              {error && (
                <div className="mt-5 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between mt-7 pt-6 border-t border-stone-100">
                {step > 1 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-stone-200 rounded-lg text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : <div />}

                {step < TOTAL_STEPS ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-60"
                  >
                    {loading && <Spinner size="sm" />}
                    {loading ? 'Submitting...' : 'Submit Complaint →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}