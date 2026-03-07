import FindingCard from "./FindingCard"
import { sortFindingsBySeverity, getRiskSummary, getOverallRisk } from "../utils/severity"
import { useState } from "react"
import PreviewModal from "./PreviewModal"

const SEVERITY_STYLES = {
  critical: { color: '#DC2626', bg: '#FEF2F2', label: 'Critical Risk' },
  high: { color: '#D97706', bg: '#FFFBEB', label: 'High Risk' },
  medium: { color: '#D97706', bg: '#FFFBEB', label: 'Medium Risk' },
  low: { color: '#0284C7', bg: '#F0F9FF', label: 'Low Risk' },
  clean: { color: '#16A34A', bg: '#F0FDF4', label: 'No Threats' },
}

export default function FindingsPanel({ findings, selectedFindingId, onSelectFinding, imageFile, imageDimensions }) {
  const sorted = sortFindingsBySeverity(findings)
  const summary = getRiskSummary(findings)
  const overallRisk = getOverallRisk(findings)
  const style = SEVERITY_STYLES[overallRisk] || SEVERITY_STYLES.clean
  const [modalMode, setModalMode] = useState(null)
  const [severityFilter, setSeverityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const [redactSet, setRedactSet] = useState(() =>
    new Set(findings.map(f => f.uniqueId))
  )

  const TYPE_GROUPS = {
    'API Keys': ['aws_access_key', 'aws_secret_key', 'stripe_secret', 'stripe_webhook', 'openai_key', 'github_token', 'github_token_bare', 'github_oauth', 'google_api', 'twilio_account', 'twilio_auth', 'slack_token', 'anthropic_key'],
    'Auth Tokens': ['jwt_token', 'jwt_secret', 'ssh_private'],
    'Credentials': ['db_connection', 'password_field'],
    'PII': ['internal_ip', 'internal_url', 'internal_url_bare', 'email', 'ssn', 'credit_card'],
  }

  function getTypeGroup(findingId) {
    for (const [group, ids] of Object.entries(TYPE_GROUPS)) {
      if (ids.includes(findingId)) return group
    }
    return 'Other'
  }

  const filtered = sorted.filter(f => {
    const severityMatch = severityFilter === 'all' || f.severity === severityFilter
    const typeMatch = typeFilter === 'all' || getTypeGroup(f.id) === typeFilter
    return severityMatch && typeMatch
  })
  

  function handleToggleRedact(uniqueId) {
    setRedactSet(prev => {
      const next = new Set(prev)
      if (next.has(uniqueId)) next.delete(uniqueId)
      else next.add(uniqueId)
      return next
    })
  }

  if (findings.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-10 text-center">
        <div className="w-12 h-12 bg-[#F0FDF4] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-[#16A34A] text-xl">✓</span>
        </div>
        <p className="font-semibold text-[#0F1117] mb-1">No threats detected</p>
        <p className="text-sm text-[#9CA3AF]">
          No secrets, credentials, or sensitive data found in this screenshot.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Risk Summary */}
      <div
        className="rounded-2xl p-5 border"
        style={{ backgroundColor: style.bg, borderColor: style.color + '40' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-[#0F1117]">
              {findings.length} threat{findings.length !== 1 ? 's' : ''} detected
            </p>
            <p className="text-xs mt-0.5" style={{ color: style.color }}>
              {style.label}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModalMode('pdf')}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F5F6FA] text-[#6B7280] hover:text-[#0F1117] transition-all"
            >
              Export PDF
            </button>
            {imageFile && (
              <button
                onClick={() => setModalMode('redact')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F5F6FA] text-[#6B7280] hover:text-[#0F1117] transition-all"
              >
                Download Redacted
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { key: 'critical', label: 'Critical', color: '#DC2626' },
            { key: 'high', label: 'High', color: '#D97706' },
            { key: 'medium', label: 'Medium', color: '#D97706' },
            { key: 'low', label: 'Low', color: '#0284C7' },
          ].map(({ key, label, color }) => (
            <div key={key} className="bg-white rounded-lg p-2 text-center shadow-sm">
              <div className="text-lg font-bold" style={{ color }}>
                {summary[key]}
              </div>
              <div className="text-xs text-[#9CA3AF]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-[#6B7280] bg-white focus:outline-none focus:border-[#3B82F6] transition-all"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs border border-[#E5E7EB] rounded-lg px-2 py-1.5 text-[#6B7280] bg-white focus:outline-none focus:border-[#3B82F6] transition-all"
        >
          <option value="all">All Types</option>
          <option value="API Keys">API Keys</option>
          <option value="Auth Tokens">Auth Tokens</option>
          <option value="Credentials">Credentials</option>
          <option value="PII">PII</option>
        </select>

        {(severityFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => { setSeverityFilter('all'); setTypeFilter('all') }}
            className="text-xs text-[#9CA3AF] hover:text-[#0F1117] transition-all"
          >
            Clear filters
          </button>
        )}

        {(severityFilter !== 'all' || typeFilter !== 'all') && (
          <span className="text-xs text-[#9CA3AF] ml-auto self-center">
            {filtered.length} of {findings.length} shown
          </span>
        )}
      </div>

      {/* Findings List */}
      <div className="space-y-2 max-h-[550px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#9CA3AF]">
            No findings match the current filters
          </div>
        ) : filtered.map((finding) => (
          <FindingCard
            key={finding.uniqueId}
            finding={finding}
            isSelected={selectedFindingId === finding.uniqueId}
            onClick={() => onSelectFinding(
              selectedFindingId === finding.uniqueId ? null : finding.uniqueId
            )}
            redactEnabled={imageFile ? redactSet.has(finding.uniqueId) : undefined}
            onToggleRedact={imageFile ? handleToggleRedact : undefined}
          />
        ))}
      </div>
      {modalMode && (
        <PreviewModal
          mode={modalMode}
          findings={findings}
          redactFindings={findings.filter(f => redactSet.has(f.uniqueId))}
          summary={summary}
          overallRisk={overallRisk}
          imageFile={imageFile}
          imageDimensions={imageDimensions}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  )
}