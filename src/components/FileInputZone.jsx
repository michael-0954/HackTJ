import { useRef, useState } from "react"

const ACCEPTED_EXTENSIONS = [
  '.env', '.config', '.cfg', '.ini', '.yaml', '.yml',
  '.json', '.toml', '.properties', '.txt', '.sh', '.bash',
  '.zsh', '.conf', '.pem', '.key'
]

export default function FileInputZone({ onTextReady }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  function handleFile(file) {
    setError(null)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      if (!text || text.trim().length === 0) {
        setError('File appears to be empty.')
        return
      }
      onTextReady(text, file.name)
    }
    reader.onerror = () => setError('Failed to read file.')
    reader.readAsText(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-[#3B82F6] bg-[#EFF6FF]'
            : 'border-[#E5E7EB] hover:border-[#3B82F6] hover:bg-[#F8FAFF]'
          }
        `}
      >
        <div className="w-10 h-10 bg-[#F5F6FA] rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
          📄
        </div>
        <p className="font-semibold text-[#0F1117] mb-1 text-sm">
          Drop a config file here
        </p>
        <p className="text-xs text-[#9CA3AF] mb-2">
          or click to browse
        </p>
        <p className="text-xs text-[#D1D5DB]">
          .env · .yaml · .json · .config · .pem · .sh and more
        </p>
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f) }}
          className="hidden"
        />
      </div>

      {/* Or paste text */}
      <div className="mt-3 relative">
        <textarea
          placeholder="...or paste config text, environment variables, or any text containing credentials directly here"
          className="w-full border border-[#E5E7EB] rounded-xl p-3 text-xs font-mono text-[#374151] placeholder-[#D1D5DB] resize-none focus:outline-none focus:border-[#3B82F6] transition-all"
          rows={4}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              const text = e.target.value.trim()
              if (text) onTextReady(text, 'Pasted text')
            }
          }}
        />
        <button
          onClick={(e) => {
            const textarea = e.target.closest('div').querySelector('textarea')
            const text = textarea.value.trim()
            if (text) onTextReady(text, 'Pasted text')
            else setError('Please enter some text first.')
          }}
          className="absolute bottom-3 right-3 text-xs font-medium px-3 py-1.5 bg-[#0F1117] text-white rounded-lg hover:bg-[#374151] transition-all"
        >
          Scan
        </button>
      </div>

      {error && <p className="text-[#DC2626] text-xs mt-2">✕ {error}</p>}
    </div>
  )
}