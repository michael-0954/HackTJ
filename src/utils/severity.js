export function getSeverityRank(severity) {
  const ranks = { critical: 4, high: 3, medium: 2, low: 1 }
  return ranks[severity] || 0
}

export function sortFindingsBySeverity(findings) {
  return [...findings].sort((a, b) =>
    getSeverityRank(b.severity) - getSeverityRank(a.severity)
  )
}

export function getSeverityLabel(severity) {
  const labels = {
    critical: '⚠ CRITICAL',
    high: '▲ HIGH',
    medium: '● MEDIUM',
    low: '○ LOW',
  }
  return labels[severity] || severity.toUpperCase()
}

export function getSeverityBadgeStyle(severity) {
  const styles = {
    critical: 'border-[#FF2D2D] text-[#FF2D2D] bg-[#FF2D2D15]',
    high: 'border-[#FF6B2D] text-[#FF6B2D] bg-[#FF6B2D15]',
    medium: 'border-[#FFD12D] text-[#FFD12D] bg-[#FFD12D15]',
    low: 'border-[#4FC3F7] text-[#4FC3F7] bg-[#4FC3F715]',
  }
  return styles[severity] || styles.low
}

export function getOverallRisk(findings) {
  if (findings.some(f => f.severity === 'critical')) return 'critical'
  if (findings.some(f => f.severity === 'high')) return 'high'
  if (findings.some(f => f.severity === 'medium')) return 'medium'
  if (findings.length > 0) return 'low'
  return 'clean'
}

export function getRiskSummary(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const f of findings) {
    if (counts[f.severity] !== undefined) counts[f.severity]++
  }
  return counts
}