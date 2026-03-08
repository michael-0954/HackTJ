const SEVERITY_STYLES = {
  critical: { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', badge: '#DC2626', badgeBg: '#FEF2F2' },
  high: { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', badge: '#D97706', badgeBg: '#FFFBEB' },
  medium: { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', badge: '#D97706', badgeBg: '#FFFBEB' },
  low: { color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', badge: '#0284C7', badgeBg: '#F0F9FF' },
}

const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export default function FindingCard({ finding, isSelected, onClick, redactEnabled, onToggleRedact }) {
  const style = SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.low

  function handleToggle(e) {
    e.stopPropagation()
    onToggleRedact(finding.uniqueId)
  }

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-4 cursor-pointer transition-all duration-150 border"
      style={{
        backgroundColor: isSelected ? style.bg : 'white',
        borderColor: isSelected ? style.border : '#E5E7EB',
        boxShadow: isSelected ? `0 0 0 2px ${style.border}` : '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: style.color }}>
          {finding.name}
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ color: style.badge, backgroundColor: style.badgeBg }}
        >
          {SEVERITY_LABELS[finding.severity]}
        </span>
      </div>

      {/* Matched text */}
      <div className="bg-[#F5F6FA] rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-[#374151] font-mono break-all">
          {finding.matchedText.length > 60
            ? finding.matchedText.slice(0, 30) + '...' + finding.matchedText.slice(-20)
            : finding.matchedText}
        </p>
      </div>

      {/* Confidence + Remediation */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-[#F5F6FA] rounded-full h-1">
          <div
            className="h-1 rounded-full transition-all"
            style={{
              width: `${finding.confidence || 0}%`,
              backgroundColor: finding.confidence >= 90 ? '#DC2626'
                : finding.confidence >= 75 ? '#D97706'
                : '#9CA3AF'
            }}
          />
        </div>
        <span className="text-xs text-[#9CA3AF] shrink-0 font-mono">
          {finding.confidence || 0}% confidence
        </span>
      </div>
      {finding.claudeNote && (
              <div className="mb-2 bg-[#F0F9FF] rounded-lg px-2 py-1.5">
                <p className="text-xs text-[#0284C7] leading-relaxed">{finding.claudeNote}</p>
              </div>
            )}
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            {finding.remediation}
          </p>

      {/* Redaction toggle — only show when image is present */}
      {onToggleRedact && redactEnabled !== undefined && (
        <div
          className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]"
          onClick={handleToggle}
        >
          <span className="text-xs text-[#9CA3AF]">Include in redaction</span>
          <div
            className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
              redactEnabled ? 'bg-[#0F1117]' : 'bg-[#D1D5DB]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
                redactEnabled ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </div>
        </div>
      )}

      {isSelected && (
        <p className="text-xs font-medium mt-2 pt-2 border-t border-[#E5E7EB]"
          style={{ color: style.color }}>
          ↑ Highlighted on image
        </p>
      )}
    </div>
  )
}