import { useState } from "react"

export default function ClipboardInputZone({ onTextReady }) {
  const [status, setStatus] = useState(null)
  const [error, setError, ] = useState(null)
  const [preview, setPreview] = useState(null)

  async function handleClipboardScan() {
    setError(null)
    setStatus(null)
    setPreview(null)

    try {
      const text = await navigator.clipboard.readText()

      if (!text || text.trim().length === 0) {
        setError('Clipboard is empty or contains no text.')
        return
      }

      setPreview(text)
      setStatus('ready')
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Clipboard access denied. Please allow clipboard access when prompted.')
      } else {
        setError('Could not read clipboard. Try pasting manually below.')
      }
    }
  }

  function handleScanPreview() {
    if (preview) onTextReady(preview, 'Clipboard')
  }

  function handleManualScan(text) {
    if (text.trim()) onTextReady(text.trim(), 'Pasted text')
  }

  return (
    <div className="space-y-4">
      {/* One-click clipboard scan */}
      <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center">
        <div className="w-10 h-10 bg-[#F5F6FA] rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
          📋
        </div>
        <p className="font-semibold text-[#0F1117] mb-1 text-sm">
          Scan your clipboard
        </p>
        <p className="text-xs text-[#9CA3AF] mb-4">
          Instantly scan whatever you last copied — code, config files, env variables
        </p>
        <button
          onClick={handleClipboardScan}
          className="bg-[#0F1117] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#374151] transition-all"
        >
          Read Clipboard
        </button>
      </div>

      {/* Preview before scanning */}
      {status === 'ready' && preview && (
        <div className="border border-[#E5E7EB] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-[#6B7280]">
              Clipboard contents ({preview.length} characters)
            </p>
            <button
              onClick={handleScanPreview}
              className="text-xs font-medium px-3 py-1.5 bg-[#0F1117] text-white rounded-lg hover:bg-[#374151] transition-all"
            >
              Scan This
            </button>
          </div>
          <div className="bg-[#F5F6FA] rounded-lg p-3 max-h-32 overflow-y-auto">
            <pre className="text-xs text-[#374151] font-mono whitespace-pre-wrap break-all">
              {preview.length > 500 ? preview.slice(0, 500) + '...' : preview}
            </pre>
          </div>
        </div>
      )}

      {error && <p className="text-[#DC2626] text-xs">✕ {error}</p>}

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E5E7EB]" />
        <span className="text-xs text-[#9CA3AF]">or paste manually</span>
        <div className="flex-1 h-px bg-[#E5E7EB]" />
      </div>

      {/* Manual paste fallback */}
      <div className="relative">
        <textarea
          placeholder="Paste any text here — .env contents, code snippets, config files, terminal output..."
          className="w-full border border-[#E5E7EB] rounded-xl p-3 text-xs font-mono text-[#374151] placeholder-[#D1D5DB] resize-none focus:outline-none focus:border-[#3B82F6] transition-all"
          rows={5}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleManualScan(e.target.value)
            }
          }}
        />
        <button
          onClick={(e) => {
            const textarea = e.target.closest('div').querySelector('textarea')
            handleManualScan(textarea.value)
          }}
          className="absolute bottom-3 right-3 text-xs font-medium px-3 py-1.5 bg-[#0F1117] text-white rounded-lg hover:bg-[#374151] transition-all"
        >
          Scan ⌘↵
        </button>
      </div>
    </div>
  )
}