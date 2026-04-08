'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { LuggageRecord } from '@/lib/types'

const PAGE_SIZE = 20

export default function DashboardPage() {
  const [records, setRecords] = useState<LuggageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadRecords = useCallback(async (pageNum = 0, append = false) => {
    const from = pageNum * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('luggage_records')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Failed to load records:', error)
      if (!append) setLoading(false)
      return
    }

    const newData = data || []
    setHasMore(newData.length === PAGE_SIZE)

    if (append) {
      setRecords(prev => [...prev, ...newData])
    } else {
      setRecords(newData)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadRecords(0, false)
    }, 30_000)
    return () => clearInterval(interval)
  }, [loadRecords])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    loadRecords(next, true)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const markCollected = async (id: string) => {
    const record = records.find(r => r.id === id)
    const confirmed = window.confirm(
      `Confirm collection?\n\nRoom ${record?.room_number} · ${record?.guest_name}\n${record?.item_count} item(s)\n\nThis cannot be undone.`
    )
    if (!confirmed) return

    const { error } = await supabase
      .from('luggage_records')
      .update({ status: 'collected', collected_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      alert('Failed to update status. Please try again.')
      return
    }

    loadRecords()
  }

  const [search, setSearch] = useState('')

  const filtered = records.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return r.guest_name.toLowerCase().includes(q) || r.room_number.toLowerCase().includes(q)
  })

  const storedCount = records.filter(r => r.status === 'stored').length
  const todayStr = new Date().toDateString()
  const collectedTodayCount = records.filter(r =>
    r.status === 'collected' && r.collected_at && new Date(r.collected_at).toDateString() === todayStr
  ).length

  return (
    <div className="min-h-screen bg-[#F0E9E6]">
      {/* Header */}
      <header className="bg-[#002F61] text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Luggage Storage</h1>
            <p className="text-white/60 text-sm">Front Desk Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-white/70 hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <p className="text-sm text-[#002F61]/60">Currently Stored</p>
            <p className="text-3xl font-bold text-[#007293] mt-1">{storedCount}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-sm text-[#002F61]/60">Collected Today</p>
            <p className="text-3xl font-bold text-[#002F61] mt-1">{collectedTodayCount}</p>
          </div>
        </div>

        {/* New Check-in Button */}
        <button
          onClick={() => router.push('/dashboard/new')}
          className="w-full py-4 bg-[#007293] text-white font-medium rounded-2xl hover:bg-[#007293]/90 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Luggage Check-in
        </button>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#002F61]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by room number or guest name..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#002F61]/10 bg-white/80 text-[#002F61] placeholder:text-[#002F61]/30 focus:outline-none focus:ring-2 focus:ring-[#007293] transition"
          />
        </div>

        {/* Records List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#002F61]">
            {search ? `Results for "${search}"` : 'Recent Records'}
            {!loading && <span className="text-sm font-normal text-[#002F61]/40 ml-2">({filtered.length})</span>}
          </h2>

          {loading ? (
            <div className="glass-card p-8 text-center text-[#002F61]/50">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-8 text-center text-[#002F61]/50">
              {search ? `No records matching "${search}"` : 'No luggage records yet. Create your first check-in.'}
            </div>
          ) : (
            filtered.map((record) => (
              <div key={record.id} className="glass-card p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'stored'
                          ? 'bg-[#007293]/10 text-[#007293]'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {record.status === 'stored' ? '📦 Stored' : '✅ Collected'}
                      </span>
                    </div>
                    <p className="font-semibold text-[#002F61]">
                      Room {record.room_number} · {record.guest_name}
                    </p>
                    <p className="text-sm text-[#002F61]/60">
                      {record.item_count} item{record.item_count > 1 ? 's' : ''} ·{' '}
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                    {record.notes && (
                      <p className="text-sm text-[#002F61]/50 italic">"{record.notes}"</p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 sm:mt-0">
                    {record.status === 'stored' && (
                      <button
                        onClick={() => markCollected(record.id)}
                        className="flex-1 sm:flex-none px-3 py-2.5 sm:py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition"
                      >
                        Mark Collected
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/dashboard/record/${record.id}`)}
                      className="flex-1 sm:flex-none px-3 py-2.5 sm:py-1.5 text-sm border border-[#002F61]/20 text-[#002F61] rounded-lg hover:bg-[#002F61]/5 active:bg-[#002F61]/10 transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Load More */}
          {!search && hasMore && !loading && (
            <button
              onClick={loadMore}
              className="w-full py-3 border border-[#002F61]/20 text-[#002F61]/60 font-medium rounded-xl hover:bg-[#002F61]/5 transition text-sm"
            >
              Load More
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
