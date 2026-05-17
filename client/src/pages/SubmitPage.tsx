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
  const [userSelectedCategory, setUserSelectedCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ ticket_id: string; auto_response: string } | null>(null)

  const handleSubjectChange = (value: string) => {
    setForm(prev => ({ ...prev, subject: value }))
    const detected = detectCategory(value)
    setDetectedCategory(detected)
    if (!userSelectedCategory) {
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
    setUserSelectedCategory(false)
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
      <section className="bg-stone-900 text-white pt-16 pb-20 sm:pt-24 sm:pb-32 px-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-500/5 blur-3xl rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              {trustBadges.map(badge => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-stone-300"
                >
                  <badge.icon className="w-3.5 h-3.5 text-red-500" />
                  {badge.label}
                </span>
              ))}
            </div>
            <h1 className="font-serif text-5xl sm:text-7xl mb-6 leading-[1.1] tracking-tight">
              We take your complaints <span className="text-red-500">seriously.</span>
            </h1>
            <p className="text-stone-400 text-lg sm:text-xl max-w-lg leading-relaxed">
              Submit your issue in minutes. Our team reviews every complaint and responds promptly with a clear resolution.
            </p>
          </div>
          
          <div className="hidden lg:block relative h-[500px]">
            <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full scale-75 animate-pulse" />
            <div 
              className="relative z-10 w-full h-full bg-contain bg-center bg-no-repeat pointer-events-none select-none"
              style={{ 
                backgroundImage: 'url("/3d_shield_hero.png")',
                maskImage: 'radial-gradient(circle, black 40%, transparent 80%)',
                WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 80%)'
              }}
              role="presentation"
            />
          </div>
        </div>
      </section>

      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-stone-400 text-center mb-12">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16">
            {howItWorks.map((item, idx) => (
              <div key={item.title} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-white border border-stone-200 rounded-[2rem] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <item.icon className="w-8 h-8 text-stone-800" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white text-sm font-bold rounded-full flex items-center justify-center border-4 border-stone-50 shadow-sm">
                    {idx + 1}
                  </span>
                </div>
                <div>
                  <p className="font-serif text-xl text-stone-900 mb-2">{item.title}</p>
                  <p className="text-stone-500 text-sm leading-relaxed max-w-[200px]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 xl:gap-24 items-start">

          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-red-600 mb-4">File a Complaint</p>
            <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 mb-6 leading-tight">
              Tell us what happened.
            </h2>
            <p className="text-stone-500 text-base leading-relaxed mb-10">
              Complete the form and we will review your complaint, assign it to the right team, and get back to you as fast as possible.
            </p>

            <div className="space-y-8">
              {sidebarFeatures.map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <f.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-stone-900">{f.title}</p>
                    <p className="text-sm text-stone-500 leading-relaxed mt-1">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-stone-100">
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                <p className="text-sm text-stone-600 mb-4 font-medium">
                  Already submitted a complaint?
                </p>
                <button 
                  onClick={() => window.location.href = '/track'}
                  className="flex items-center gap-2 text-red-600 font-bold text-sm hover:gap-3 transition-all"
                >
                  Track your complaint status <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-8">
              {Array.from({ length: TOTAL_STEPS }).map((_, idx) => {
                const num = idx + 1
                const active = num === step
                const done = num < step
                return (
                  <div key={num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all flex-shrink-0
                        ${done ? 'bg-green-600 text-white' : active ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-stone-100 text-stone-400 border border-stone-200'}
                      `}>
                        {done ? '✓' : num}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block whitespace-nowrap ${active ? 'text-stone-900' : 'text-stone-400'}`}>
                        {['Your Info', 'Issue Details', 'Description'][idx]}
                      </span>
                    </div>
                    {idx < TOTAL_STEPS - 1 && (
                      <div className="flex-1 h-px mx-4 bg-stone-200 mb-6">
                        <div className={`h-full bg-green-600 transition-all duration-700 ease-in-out ${done ? 'w-full' : 'w-0'}`} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-white border border-stone-200 rounded-[2rem] shadow-xl shadow-stone-200/50 p-8 sm:p-12">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-stone-800" />
                    </div>
                    <div>
                      <p className="font-serif text-2xl text-stone-900">Your Information</p>
                      <p className="text-sm text-stone-400">So we know who to get back to</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="text"
                          placeholder="Jane Smith"
                          value={form.name}
                          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-11 pr-4 py-4 text-sm text-stone-900 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="email"
                          placeholder="jane@email.com"
                          value={form.email}
                          onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-11 pr-4 py-4 text-sm text-stone-900 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                        />
                      </div>
                      <p className="text-xs text-stone-400 mt-2 ml-1">Your ticket ID and updates will be sent here.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center">
                      <Tag className="w-6 h-6 text-stone-800" />
                    </div>
                    <div>
                      <p className="font-serif text-2xl text-stone-900">Issue Details</p>
                      <p className="text-sm text-stone-400">Help us understand what went wrong</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Subject</label>
                      <input
                        type="text"
                        placeholder="Brief description of the issue..."
                        value={form.subject}
                        onChange={e => handleSubjectChange(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-5 py-4 text-sm text-stone-900 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all"
                      />
                      {detectedCategory && form.category === detectedCategory && (
                        <p className="text-xs text-stone-500 mt-3 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-red-500" />
                          Auto-detected: <span className="text-red-600 font-bold uppercase tracking-tight">{categories.find(c => c.value === detectedCategory)?.label || detectedCategory}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Category</label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map(c => (
                          <button
                            key={c.value}
                            onClick={() => {
                              setForm(prev => ({ ...prev, category: c.value }))
                              setUserSelectedCategory(true)
                            }}
                            className={`flex items-center gap-3 px-4 py-4 rounded-xl border text-sm font-semibold transition-all text-left ${
                              form.category === c.value
                                ? 'border-red-600 bg-red-50 text-red-700 shadow-sm'
                                : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300 hover:bg-white'
                            }`}
                          >
                            <span className="text-lg">{c.icon}</span>
                            <span className="text-xs">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Priority</label>
                      <div className="flex gap-3">
                        {([
                          { value: 'low', label: 'Low', color: 'bg-green-50 border-green-200 text-green-700' },
                          { value: 'medium', label: 'Medium', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                          { value: 'high', label: 'High', color: 'bg-red-50 border-red-200 text-red-700' },
                        ] as { value: ComplaintPriority; label: string; color: string }[]).map(p => (
                          <button
                            key={p.value}
                            onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                            className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${
                              form.priority === p.value
                                ? `${p.color} border-2 shadow-sm`
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
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center">
                      <AlignLeft className="w-6 h-6 text-stone-800" />
                    </div>
                    <div>
                      <p className="font-serif text-2xl text-stone-900">Description</p>
                      <p className="text-sm text-stone-400">The more detail, the faster we can help</p>
                    </div>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs font-bold uppercase tracking-wider">
                      <span className="text-stone-700">{form.name}</span>
                      <span className="text-red-600">
                        {categories.find(c => c.value === form.category)?.label || form.category} &middot; {form.priority} priority
                      </span>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Please provide as much detail as possible. What happened, when did it happen, and how has it affected you?"
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-5 text-sm text-stone-900 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${form.description.length < 10 ? 'text-stone-400' : 'text-green-600'}`}>
                      {form.description.length} Characters
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-8 px-5 py-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium animate-in zoom-in-95 duration-300">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between mt-10 pt-8 border-t border-stone-100">
                {step > 1 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                ) : <div />}

                {step < TOTAL_STEPS ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-3 px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-60 active:scale-95"
                  >
                    {loading && <Spinner size="sm" />}
                    {loading ? 'Submitting...' : 'Submit Complaint'}
                    {!loading && <ChevronRight className="w-5 h-5" />}
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