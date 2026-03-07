import { useEffect, useRef, useState } from "react"
import { generatePDF, generateRedactedImage } from "../utils/pdf"

export default function PreviewModal({ mode, findings, redactFindings, summary, overallRisk, imageFile, imageDimensions, onClose }) {
  const canvasRef = useRef(null)
  const [redactedUrl, setRedactedUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'redact') {
      buildRedactedPreview()
    } else {
      setLoading(false)
    }
  }, [mode])

  async function buildRedactedPreview() {
    setLoading(true)
    const url = await generateRedactedPreviewURL(imageFile, redactFindings, imageDimensions)
    setRedactedUrl(url)
    setLoading(false)
  }

  function handleDownloadPDF() {
    generatePDF(findings, summary, overallRisk)
    onClose()
  }

  async function handleDownloadRedacted() {
    const link = document.createElement('a')
    link.href = redactedUrl
    link.download = `redacted-screenshot-${Date.now()}.png`
    link.click()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="font-semibold text-[#0F1117]">
              {mode === 'redact' ? 'Redacted Image Preview' : 'Threat Report Preview'}
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {mode === 'redact'
                ? 'All detected secrets have been blacked out'
                : `${findings.length} threat${findings.length !== 1 ? 's' : ''} found`
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6FA] text-[#9CA3AF] hover:text-[#0F1117] transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-[#0F1117] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : mode === 'redact' ? (
            <img
              src={redactedUrl}
              alt="Redacted preview"
              className="w-full rounded-xl border border-[#E5E7EB]"
            />
          ) : (
            <PDFPreview findings={findings} summary={summary} overallRisk={overallRisk} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F5F6FA] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={mode === 'redact' ? handleDownloadRedacted : handleDownloadPDF}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-[#0F1117] text-white hover:bg-[#374151] transition-all"
          >
            {mode === 'redact' ? 'Download Redacted Image' : 'Download PDF Report'}
          </button>
        </div>
      </div>
    </div>
  )
}

// In-app PDF preview component
function PDFPreview({ findings, summary, overallRisk }) {
  const SEVERITY_STYLES = {
    critical: { color: '#DC2626', bg: '#FEF2F2', label: 'Critical' },
    high: { color: '#D97706', bg: '#FFFBEB', label: 'High' },
    medium: { color: '#D97706', bg: '#FFFBEB', label: 'Medium' },
    low: { color: '#0284C7', bg: '#F0F9FF', label: 'Low' },
  }

  const RISK_STYLES = {
    critical: { color: '#DC2626', label: 'Critical Risk' },
    high: { color: '#D97706', label: 'High Risk' },
    medium: { color: '#D97706', label: 'Medium Risk' },
    low: { color: '#0284C7', label: 'Low Risk' },
    clean: { color: '#16A34A', label: 'No Threats' },
  }

  const riskStyle = RISK_STYLES[overallRisk] || RISK_STYLES.clean

  const sorted = [...findings].sort((a, b) => {
    const rank = { critical: 4, high: 3, medium: 2, low: 1 }
    return (rank[b.severity] || 0) - (rank[a.severity] || 0)
  })

  return (
    <div className="space-y-4">
      {/* Report header */}
      <div className="bg-[#0F1117] rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-lg">ScreenShield</p>
            <p className="text-[#9CA3AF] text-xs mt-0.5">Security Analysis Report</p>
          </div>
          <p className="text-[#9CA3AF] text-xs">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="border border-[#E5E7EB] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-[#0F1117]">
              {findings.length} Threat{findings.length !== 1 ? 's' : ''} Detected
            </p>
            <p className="text-xs mt-0.5" style={{ color: riskStyle.color }}>
              {riskStyle.label}
            </p>
          </div>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: riskStyle.color }}
          >
            {riskStyle.label.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { key: 'critical', label: 'Critical', color: '#DC2626' },
            { key: 'high', label: 'High', color: '#D97706' },
            { key: 'medium', label: 'Medium', color: '#D97706' },
            { key: 'low', label: 'Low', color: '#0284C7' },
          ].map(({ key, label, color }) => (
            <div key={key} className="bg-[#F5F6FA] rounded-lg p-2 text-center">
              <div className="text-lg font-bold" style={{ color }}>{summary[key]}</div>
              <div className="text-xs text-[#9CA3AF]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Findings */}
      <div className="space-y-2">
        {sorted.map((finding, i) => {
          const s = SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.low
          return (
            <div key={i} className="border border-[#E5E7EB] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-[#0F1117]">{finding.name}</span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ color: s.color, backgroundColor: s.bg }}
                >
                  {s.label}
                </span>
              </div>
              <div className="bg-[#F5F6FA] rounded-lg px-3 py-2 mb-2">
                <p className="text-xs font-mono text-[#374151] break-all">
                  {finding.matchedText.length > 60
                    ? finding.matchedText.slice(0, 30) + '...' + finding.matchedText.slice(-20)
                    : finding.matchedText}
                </p>
              </div>
              <p className="text-xs text-[#6B7280]">{finding.remediation}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Generate redacted image and return a blob URL for preview
async function generateRedactedPreviewURL(imageFile, findings, imageDimensions) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(imageFile)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = imageDimensions.width
      canvas.height = imageDimensions.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      for (const finding of findings) {
        if (!finding.bbox) continue
        const { x0, y0, x1, y1 } = finding.bbox
        const width = x1 - x0
        const height = y1 - y0
        if (width <= 0 || height <= 0) continue
        const padding = 3
        ctx.fillStyle = '#000000'
        ctx.fillRect(x0 - padding, y0 - padding, width + padding * 2, height + padding * 2)
      }

      // Watermark
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.fillRect(0, imageDimensions.height - 28, imageDimensions.width, 28)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '11px sans-serif'
      ctx.fillText(
        `Redacted by ScreenShield — ${new Date().toLocaleDateString()}`,
        10,
        imageDimensions.height - 10
      )

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }

    img.src = url
  })
}