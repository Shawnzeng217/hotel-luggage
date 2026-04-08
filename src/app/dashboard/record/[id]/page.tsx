'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { LuggageRecord, LuggagePhoto } from '@/lib/types'

export default function RecordDetailPage() {
  const params = useParams()
  const router = useRouter()
  const recordId = params.id as string
  const [record, setRecord] = useState<LuggageRecord | null>(null)
  const [photos, setPhotos] = useState<LuggagePhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [collecting, setCollecting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const [recordRes, photosRes] = await Promise.all([
        supabase.from('luggage_records').select('*').eq('id', recordId).single(),
        supabase.from('luggage_photos').select('*').eq('record_id', recordId),
      ])
      setRecord(recordRes.data)
      setPhotos(photosRes.data || [])
      setLoading(false)
    }
    load()
  }, [recordId])

  const markCollected = async () => {
    if (!record) return
    const confirmed = window.confirm(
      `Confirm collection?\n\nRoom ${record.room_number} · ${record.guest_name}\n${record.item_count} item(s)\n\nThis cannot be undone.`
    )
    if (!confirmed) return

    setCollecting(true)
    const { error } = await supabase
      .from('luggage_records')
      .update({ status: 'collected', collected_at: new Date().toISOString() })
      .eq('id', record.id)

    if (error) {
      alert('Failed to update status. Please try again.')
      setCollecting(false)
      return
    }

    setRecord({ ...record, status: 'collected', collected_at: new Date().toISOString() })
    setCollecting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0E9E6] flex items-center justify-center">
        <p className="text-[#002F61]/50">Loading...</p>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[#F0E9E6] flex items-center justify-center">
        <p className="text-[#002F61]/50">Record not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0E9E6]">
      <header className="bg-[#002F61] text-white">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/dashboard" className="text-white/70 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </a>
          <div>
            <h1 className="text-lg font-bold">Record Detail</h1>
            <p className="text-white/60 text-xs">Room {record.room_number}</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="glass-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#002F61]">{record.guest_name}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              record.status === 'stored'
                ? 'bg-[#007293]/10 text-[#007293]'
                : 'bg-green-100 text-green-700'
            }`}>
              {record.status === 'stored' ? '📦 Stored' : '✅ Collected'}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-[#002F61]/10">
              <span className="text-[#002F61]/60">Room</span>
              <span className="font-medium text-[#002F61]">{record.room_number}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#002F61]/10">
              <span className="text-[#002F61]/60">Items</span>
              <span className="font-medium text-[#002F61]">{record.item_count}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#002F61]/10">
              <span className="text-[#002F61]/60">Checked in</span>
              <span className="font-medium text-[#002F61]">{new Date(record.created_at).toLocaleString()}</span>
            </div>
            {record.collected_at && (
              <div className="flex justify-between py-2 border-b border-[#002F61]/10">
                <span className="text-[#002F61]/60">Collected</span>
                <span className="font-medium text-[#002F61]">{new Date(record.collected_at).toLocaleString()}</span>
              </div>
            )}
            {record.notes && (
              <div className="flex justify-between py-2 border-b border-[#002F61]/10">
                <span className="text-[#002F61]/60">Notes</span>
                <span className="font-medium text-[#002F61] text-right max-w-[60%]">{record.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-semibold text-[#002F61]">Luggage Photos</h3>
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.photo_url}
                  alt="Luggage"
                  className="w-full h-40 object-cover rounded-xl border border-[#002F61]/10 cursor-pointer active:opacity-70 transition"
                  onClick={() => setLightboxSrc(photo.photo_url)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Signature */}
        {record.signature_url && (
          <div className="glass-card p-6 space-y-3">
            <h3 className="font-semibold text-[#002F61]">Guest Signature</h3>
            <div className="bg-white rounded-xl p-3 border border-[#002F61]/10 cursor-pointer active:opacity-70 transition" onClick={() => setLightboxSrc(record.signature_url!)}>
              <img src={record.signature_url} alt="Signature" className="h-20 mx-auto" />
            </div>
          </div>
        )}

        {/* Mark Collected button */}
        {record.status === 'stored' && (
          <button
            onClick={markCollected}
            disabled={collecting}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 active:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {collecting ? 'Updating...' : '✅ Mark as Collected'}
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
