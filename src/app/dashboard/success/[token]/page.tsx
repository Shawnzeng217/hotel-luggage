'use client'

import { useParams, useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

export default function SuccessPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const voucherUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/voucher/${token}`
    : `/voucher/${token}`

  return (
    <div className="min-h-screen bg-[#F0E9E6] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#002F61]">Check-in Successful!</h1>
          <p className="text-[#002F61]/60 mt-2">Luggage has been securely recorded</p>
        </div>

        {/* QR Code Card */}
        <div className="glass-card p-8 space-y-4">
          <p className="text-sm font-medium text-[#002F61]">
            Guest Voucher QR Code
          </p>

          <div className="inline-block p-4 bg-white rounded-2xl">
            <QRCodeSVG
              value={voucherUrl}
              size={200}
              level="M"
              includeMargin={false}
              fgColor="#002F61"
            />
          </div>

          <p className="text-xs text-[#002F61]/50 px-4">
            Ask the guest to scan this QR code to save their digital luggage voucher
          </p>

          <div className="bg-[#002F61]/5 rounded-xl p-3">
            <p className="text-xs text-[#002F61]/50 mb-1">Voucher Link</p>
            <p className="text-xs text-[#007293] break-all font-mono">{voucherUrl}</p>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 bg-[#002F61] text-white font-medium rounded-xl hover:bg-[#002F61]/90 transition"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
