import { useState } from "react"

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
]

export default function UrlInputZone({ onTextReady }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)

  async function fetchUrl(targetUrl) {
    const proxyUrl = CORS_PROXIES[0](targetUrl)
    const res = await fetch(proxyUrl)
    if (!res.ok) throw new Error('Failed to fetch URL.')
    const data = await res.json()
    return data.contents || ''
  }

  async function handleScan() {
    setError(null)
    setStatus(null)

    let targetUrl = url.trim()
    if (!targetUrl) {
      setError('Please enter a URL.')
      return
    }

    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl
    }

    setLoading(true)

    try {
      setStatus('Fetching page source...')
      const content = await fetchUrl(targetUrl)

      if (!content || content.trim().length === 0) {
        setError('No content found at this URL.')
        return
      }

      setStatus('Running detection...')
      await new Promise(r => setTimeout(r, 300))
      onTextReady(content, targetUrl)

    } catch (err) {
      setError(err.message || 'Failed to fetch URL. Make sure it is publicly accessible.')
    } finally {
      setLoading(false)
      setStatus(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center">
        <div className="w-10 h-10 bg-[#F5F6FA] rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
          🌐
        </div>
        <p className="font-semibold text-[#0F1117] mb-1 text-sm">
          Scan any public URL
        </p>
        <p className="text-xs text-[#9CA3AF]">
          Fetches the page source and scans for exposed credentials — great for checking public repos, Pastebin links, or misconfigured servers
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleScan() }}
          placeholder="https://example.com/config or any public URL"
          className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#0F1117] placeholder-[#D1D5DB] focus:outline-none focus:border-[#3B82F6] transition-all"
        />
        <button
          onClick={handleScan}
          disabled={loading || !url.trim()}
          className="px-4 py-2.5 bg-[#0F1117] text-white text-sm font-medium rounded-xl hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? status || 'Scanning...' : 'Scan URL'}
        </button>
      </div>

      {error && <p className="text-[#DC2626] text-xs">✕ {error}</p>}

      <p className="text-xs text-[#9CA3AF] text-center">
        Only scans publicly accessible URLs — no authentication supported
      </p>

      {/* Example URLs for demo */}
      <div className="border border-[#E5E7EB] rounded-xl p-3">
        <p className="text-xs font-medium text-[#6B7280] mb-2">
          Example — click to try:
        </p>
        <div className="space-y-1">
          {[
            'https://raw.githubusercontent.com/michael-0954/HackTJ/refs/heads/main/public/demo-config.txt',
          ].map(example => (
            <button
              key={example}
              onClick={() => setUrl(example)}
              className="block w-full text-left text-xs text-[#3B82F6] hover:text-[#2563EB] font-mono truncate"
            >
              {example}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#9CA3AF] mt-2">
          Use raw text URLs for best results (e.g. raw.githubusercontent.com) — fetching rendered HTML may yield lower confidence scores
        </p>
      </div>
    </div>
  )
}