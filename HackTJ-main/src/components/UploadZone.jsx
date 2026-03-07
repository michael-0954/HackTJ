import { useState, useRef } from "react"

export default function UploadZone({ onFileSelected }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  function validateFile(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PNG, JPG, WEBP, or GIF image.')
      return false
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File too large. Maximum size is 20MB.')
      return false
    }
    return true
  }

  function handleFile(file) {
    setError(null)
    if (validateFile(file)) onFileSelected(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-[#3B82F6] bg-[#EFF6FF]'
            : 'border-[#E5E7EB] hover:border-[#3B82F6] hover:bg-[#F8FAFF] bg-white'
          }
        `}
      >
        <div className="w-12 h-12 bg-[#F5F6FA] rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⬆</span>
        </div>
        <p className="font-semibold text-[#0F1117] mb-1">
          Drop your screenshot here
        </p>
        <p className="text-sm text-[#9CA3AF]">
          or click to browse — PNG, JPG, WEBP supported
        </p>
        <p className="text-xs text-[#D1D5DB] mt-2">
          Max 20MB · Processed entirely in your browser
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f) }}
          className="hidden"
        />
      </div>
      {error && (
        <p className="text-[#DC2626] text-sm mt-3">✕ {error}</p>
      )}
    </div>
  )
}