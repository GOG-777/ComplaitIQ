import { useState, useEffect } from 'react'
import type { AnalyticsData } from '../types'
import { getAnalytics } from '../services/complaints.service'
import Spinner from '../components/ui/Spinner'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
  billing: '#C8892F',
  technical: '#2F6BC8',
  service: '#C84B2F',
  delivery: '#2A7A52',
  other: '#888',
}

const STATUS_COLORS: Record<string, string> = {
  open: '#C84B2F',
  pending: '#C8892F',
  resolved: '#2A7A52',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#2A7A52',
  medium: '#C8892F',
  high: '#C84B2F',
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setError('Failed to load analytics data.'))
      .finally(() => setLoading(false))
  }, [])

  const resolutionRate = data
    ? data.totals.total > 0
      ? Math.round((data.totals.resolved / data.totals.total) * 100)
      : 0
    : 0

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 flex justify-center">
        <Spinner />
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <p className="text-xs font-semibold tracking-widest uppercase text-red-500 mb-2">Admin Analytics</p>
      <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-1">Platform Overview</h1>
      <p className="text-stone-500 mb-6 sm:mb-8">Complaint trends, category breakdown, and resolution performance.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'Total Complaints', value: data?.totals.total ?? 0 },
          { label: 'Open', value: data?.totals.open ?? 0 },
          { label: 'Pending', value: data?.totals.pending ?? 0 },
          { label: 'Resolution Rate', value: `${resolutionRate}%` },
        ].map(s => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="font-serif text-2xl sm:text-3xl text-stone-900">{s.value}</div>
            <div className="text-xs text-stone-400 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-5 sm:mb-6">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">By Category</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.byCategory.map(d => ({ ...d, category: capitalize(d.category) }))}>
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data?.byCategory.map(entry => (
                  <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? '#888'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">By Status</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data?.byStatus.map(d => ({ ...d, name: capitalize(d.status) }))}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={3}
                label={({ name, percent }: { name: string, percent: number }) => `${name} ${Math.round(percent * 100)}%`}
                labelLine={false}
              >
                {data?.byStatus.map(entry => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#888'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        <div className="md:col-span-2 bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Complaints Over Time (Last 30 Days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.overTime.map(d => ({
              ...d,
              date: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#C84B2F"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Complaints"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">By Priority</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data?.byPriority.map(d => ({ ...d, name: capitalize(d.priority) }))}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                paddingAngle={3}
                label={({ name, percent }: { name: string, percent: number }) => `${name} ${Math.round(percent * 100)}%`}
                labelLine={false}
              >
                {data?.byPriority.map(entry => (
                  <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? '#888'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  )
}