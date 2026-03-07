import { useState } from "react"
import { generateDemoImage } from "../utils/demoGenerator"

const SCENARIOS = [
  {
    id: 'terminal',
    title: 'Developer Terminal',
    description: 'AWS credentials and database connection strings exposed in a terminal session',
    icon: '⌨️',
    tags: ['AWS Keys', 'DB Password', 'API Keys'],
  },
  {
    id: 'code',
    title: 'Code Editor',
    description: 'API keys and tokens hardcoded in a JavaScript config file',
    icon: '📝',
    tags: ['Stripe Key', 'GitHub Token', 'OpenAI Key'],
  },
  {
    id: 'slack',
    title: 'Slack Message',
    description: 'Credentials accidentally shared in a team chat message',
    icon: '💬',
    tags: ['GitHub Token', 'DB String', 'Internal IP'],
  },
]

export default function DemoModal({ onClose, onRunDemo }) {
  const [loading, setLoading] = useState(null)

  async function handleSelect(scenarioId) {
    setLoading(scenarioId)
    const blob = await generateDemoImage(scenarioId)
    const file = new File([blob], `demo-${scenarioId}.png`, { type: 'image/png' })
    onClose()
    onRunDemo(file)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#0F1117] text-lg">Try a Demo</h2>
              <p className="text-sm text-[#9CA3AF] mt-0.5">
                Select a scenario to run a live analysis
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F6FA] text-[#9CA3AF] hover:text-[#0F1117] transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scenarios */}
        <div className="p-4 space-y-3">
          {SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario.id)}
              disabled={loading !== null}
              className="w-full text-left border border-[#E5E7EB] hover:border-[#3B82F6] hover:bg-[#F8FAFF] rounded-xl p-4 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#F5F6FA] group-hover:bg-[#EFF6FF] rounded-xl flex items-center justify-center text-xl transition-all shrink-0">
                  {loading === scenario.id
                    ? <div className="w-5 h-5 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                    : scenario.icon
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-[#0F1117]">{scenario.title}</p>
                    <span className="text-[#9CA3AF] group-hover:text-[#3B82F6] text-sm transition-all">→</span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-2">{scenario.description}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {scenario.tags.map(tag => (
                      <span key={tag} className="text-xs bg-[#F5F6FA] text-[#6B7280] px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-xs text-[#9CA3AF] text-center">
            All demo scenarios use synthetic data — no real credentials
          </p>
        </div>
      </div>
    </div>
  )
}