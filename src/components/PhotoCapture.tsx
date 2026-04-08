'use client'

import { useRef } from 'react'

interface Props {
  photos: File[]
  previewUrls: string[]
  onCapture: (files: File[]) => void
  onRemove: (index: number) => void
}

export default function PhotoCapture({ photos, previewUrls, onCapture, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onCapture(Array.from(files))
    }
    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Luggage photo ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ×
              </button>
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                #{index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full py-10 border-2 border-dashed border-[#002F61]/20 rounded-2xl flex flex-col items-center gap-2 text-[#002F61]/50 hover:border-[#007293] hover:text-[#007293] active:bg-[#007293]/5 transition-colors"
      >
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
        <span className="text-sm font-medium">
          {photos.length === 0 ? 'Take Photo / 拍照' : 'Add Another Photo / 再拍一张'}
        </span>
      </button>
    </div>
  )
}
