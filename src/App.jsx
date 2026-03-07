import { useState } from "react"
import UploadZone from "./components/UploadZone"
import DemoModal from "./components/DemoModal"
import ClipboardInputZone from "./components/FileInputZone"
import UrlInputZone from "./components/GitInputZone"
import ScanAnimation from "./components/ScanAnimation"
import AnnotatedImage from "./components/AnnotatedImage"
import FindingsPanel from "./components/FindingsPanel"
import { extractTextWithCoordinates } from "./engine/ocr"
import { runRegexDetection } from "./engine/regexDetector"
import { mapFindingsToCoordinates } from "./engine/coordinator"

const STATES = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  RESULTS: 'results',
  ERROR: 'error',
}

export default function App() {
  const [appState, setAppState] = useState(STATES.IDLE)
  const [imageFile, setImageFile] = useState(null)
  const [findings, setFindings] = useState([])
  const [selectedFindingId, setSelectedFindingId] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [imageDimensions, setImageDimensions] = useState(null)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [inputMode, setInputMode] = useState('screenshot')
  const [sourceLabel, setSourceLabel] = useState(null)

  async function analyzeImage(file) {
    setImageFile(file)
    setSourceLabel(file.name)
    // Get natural dimensions
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.src = url
    setAppState(STATES.SCANNING)
    setProgress(0)
    setFindings([])
    setSelectedFindingId(null)

    try {
      setProgress(0.05)

      const { fullText, words } = await extractTextWithCoordinates(file, (p) => {
        setProgress(0.08 + p * 0.7)
      })

      setProgress(0.82)
      const regexFindings = runRegexDetection(fullText)
      console.log('=== FULL OCR TEXT ===')
      console.log(fullText)
      console.log('=== RAW REGEX FINDINGS ===')
      regexFindings.forEach(f => console.log(f.name, '|', JSON.stringify(f.matchedText)))

      setProgress(0.90)
      const allFindings = [...regexFindings]
      const mappedFindings = mapFindingsToCoordinates(allFindings, words, fullText)

      setProgress(0.96)
      const { calculateConfidence } = await import('./utils/confidence')
      const findingsWithIds = mappedFindings.map((f, index) => ({
        ...f,
        uniqueId: `${f.id}-${index}`,
        confidence: calculateConfidence(f),
      }))

      setProgress(1)

      // Small delay so user sees 100% before results appear
      await new Promise(resolve => setTimeout(resolve, 400))

      setFindings(findingsWithIds)
      setAppState(STATES.RESULTS)

    } catch (err) {
      console.error(err)
      setError(err.message || 'Analysis failed. Please try again.')
      setAppState(STATES.ERROR)
    }
  }
  async function analyzeText(text, sourceLabel) {
    setAppState(STATES.SCANNING)
    setProgress(0)
    setFindings([])
    setSelectedFindingId(null)
    setImageFile(null)
    setImageDimensions(null)

    try {
      setProgress(0.3)
      const regexFindings = runRegexDetection(text)
      setProgress(0.7)

      const allFindings = [...regexFindings]
      // No coordinate mapping for text — no image to annotate
      const findingsWithIds = allFindings.map((f, index) => ({
        ...f,
        uniqueId: `${f.id}-${index}`,
        bbox: null,
        confidence: 0,
      }))

      const { calculateConfidence } = await import('./utils/confidence')
      const withConfidence = findingsWithIds.map(f => ({
        ...f,
        confidence: calculateConfidence(f),
      }))

      setProgress(0.95)
      setSourceLabel(sourceLabel)
      setProgress(1)

      await new Promise(resolve => setTimeout(resolve, 400))
      setFindings(withConfidence)
      setAppState(STATES.RESULTS)

    } catch (err) {
      console.error(err)
      setError(err.message || 'Analysis failed. Please try again.')
      setAppState(STATES.ERROR)
    }
  }

  function handleReset() {
    setAppState(STATES.IDLE)
    setImageFile(null)
    setFindings([])
    setSelectedFindingId(null)
    setProgress(0)
    setError(null)
    setImageDimensions(null)
    setSourceLabel(null)
    setInputMode('screenshot')
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0F1117] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">SS</span>
          </div>
          <span className="font-semibold text-[#0F1117] text-lg tracking-tight">
            ScreenShield
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#6B7280] hidden md:block">
            Credential exposure detector
          </span>
          {appState !== STATES.IDLE && (
            <button
              onClick={handleReset}
              className="text-sm text-[#6B7280] hover:text-[#0F1117] bg-[#F5F6FA] hover:bg-[#E5E7EB] px-4 py-2 rounded-lg transition-all font-medium"
            >
              ← New Scan
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* IDLE */}
        {appState === STATES.IDLE && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center bg-[#F0F9FF] text-[#0284C7] text-xs font-medium px-3 py-1.5 rounded-full mb-5">
                OCR · Pattern Detection · AI Classification
              </div>
              <h1 className="text-4xl font-bold text-[#0F1117] mb-4 leading-tight tracking-tight">
                Credential Exposure<br />Detection
              </h1>
              <p className="text-[#6B7280] text-base leading-relaxed max-w-lg mx-auto">
                Detect exposed API keys, credentials, and sensitive data across screenshots, config files, and git history.
              </p>
            </div>

            {/* Input mode tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden mb-4">
              <div className="flex border-b border-[#E5E7EB]">
                {[
                  { id: 'screenshot', label: 'Screenshot', icon: '🖼' },
                  { id: 'clipboard', label: 'Clipboard', icon: '📋' },
                  { id: 'url', label: 'URL', icon: '🌐' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInputMode(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all ${
                      inputMode === tab.id
                        ? 'text-[#0F1117] border-b-2 border-[#0F1117] bg-white'
                        : 'text-[#9CA3AF] hover:text-[#6B7280]'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {inputMode === 'screenshot' && (
                  <div>
                    <UploadZone onFileSelected={analyzeImage} />
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => setShowDemoModal(true)}
                        className="flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#0F1117] transition-all group"
                      >
                        <span className="w-6 h-6 rounded-full border border-[#E5E7EB] group-hover:border-[#0F1117] flex items-center justify-center text-xs transition-all">▶</span>
                        Try a Demo
                      </button>
                    </div>
                  </div>
                )}
                {inputMode === 'clipboard' && (
                  <ClipboardInputZone onTextReady={analyzeText} />
                )}
                {inputMode === 'url' && (
                  <UrlInputZone onTextReady={analyzeText} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'API Keys', desc: 'AWS, Stripe, OpenAI, GitHub', color: '#DC2626', bg: '#FEF2F2' },
                { label: 'Auth Tokens', desc: 'JWT, OAuth, Sessions', color: '#D97706', bg: '#FFFBEB' },
                { label: 'Credentials', desc: 'Passwords, DB strings', color: '#7C3AED', bg: '#F5F3FF' },
                { label: 'PII', desc: 'SSNs, cards, IPs', color: '#0284C7', bg: '#F0F9FF' },
              ].map(({ label, desc, color, bg }) => (
                <div key={label} className="bg-white rounded-xl p-3 shadow-sm border border-[#E5E7EB]">
                  <div className="text-xs font-semibold mb-1" style={{ color }}>{label}</div>
                  <div className="text-xs text-[#9CA3AF]">{desc}</div>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-[#9CA3AF] mt-5">
              🔒 Processed entirely in your browser — your data never leaves your device
            </p>
          </div>
        )}

        {/* SCANNING */}
        {appState === STATES.SCANNING && (
          <div className="max-w-xl mx-auto">
            <ScanAnimation progress={progress} />
          </div>
        )}

        {/* RESULTS */}
        {appState === STATES.RESULTS && (
          <div className={imageFile ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'max-w-2xl mx-auto'}>
            {imageFile && (
              <div>
                <h2 className="text-sm font-semibold text-[#6B7280] mb-3 uppercase tracking-wider">
                  Annotated Screenshot
                </h2>
                <AnnotatedImage
                  imageFile={imageFile}
                  findings={findings}
                  selectedFindingId={selectedFindingId}
                />
              </div>
            )}
            <div>
              {sourceLabel && (
                <p className="text-xs text-[#9CA3AF] mb-3 font-mono truncate">
                  Source: {sourceLabel}
                </p>
              )}
              <h2 className="text-sm font-semibold text-[#6B7280] mb-3 uppercase tracking-wider">
                Threat Report
              </h2>
              <FindingsPanel
                findings={findings}
                selectedFindingId={selectedFindingId}
                onSelectFinding={setSelectedFindingId}
                imageFile={imageFile}
                imageDimensions={imageDimensions}
              />
            </div>
          </div>
        )}

        {/* ERROR */}
        {appState === STATES.ERROR && (
          <div className="max-w-xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-[#FCA5A5] p-10">
              <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#DC2626] text-xl">✕</span>
              </div>
              <p className="text-[#0F1117] font-semibold mb-2">Analysis Failed</p>
              <p className="text-[#6B7280] text-sm mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="bg-[#0F1117] hover:bg-[#374151] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
      {showDemoModal && (
          <DemoModal
            onClose={() => setShowDemoModal(false)}
            onRunDemo={(file) => {
              setShowDemoModal(false)
              analyzeImage(file)
            }}
          />
        )}
    </div>
  )
}