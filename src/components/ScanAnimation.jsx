import { useState, useEffect, useRef } from "react"

const SCAN_MESSAGES = [
  "Initializing OCR engine...",
  "Preprocessing image...",
  "Extracting text layer...",
  "Mapping word coordinates...",
  "Running pattern detection...",
  "Scanning for API keys...",
  "Scanning for credentials...",
  "Scanning for PII...",
  "Running AI classification...",
  "Generating threat report...",
]

export default function ScanAnimation({ progress }) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)
  const displayRef = useRef(0)
  const animRef = useRef(null)

  // Smoothly animate display progress toward real progress
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)

    function animate() {
      const current = displayRef.current
      const target = progress

      // If real progress hit 1, snap to 100 immediately
      if (target >= 1) {
        displayRef.current = 1
        setDisplayProgress(1)
        return
      }

      // Ease toward target but never exceed it
      const diff = target - current
      if (Math.abs(diff) < 0.001) return

      const step = diff * 0.06
      displayRef.current = current + step
      setDisplayProgress(current + step)
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [progress])

  // Cycle messages based on display progress
  useEffect(() => {
    const index = Math.floor(displayProgress * SCAN_MESSAGES.length)
    setMessageIndex(Math.min(index, SCAN_MESSAGES.length - 1))
  }, [displayProgress])

  const pct = Math.round(displayProgress * 100)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-10 text-center">
      <div className="w-16 h-16 bg-[#F5F6FA] rounded-2xl flex items-center justify-center mx-auto mb-6">
        <div className="w-8 h-8 border-2 border-[#0F1117] border-t-transparent rounded-full animate-spin" />
      </div>

      <h3 className="font-semibold text-[#0F1117] mb-2">Analyzing screenshot...</h3>
      <p className="text-sm text-[#9CA3AF] mb-8 h-5">
        {SCAN_MESSAGES[messageIndex]}
      </p>

      <div className="w-full bg-[#F5F6FA] rounded-full h-1.5 mb-2">
        <div
          className="h-1.5 rounded-full bg-[#0F1117] transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-[#9CA3AF]">{pct}%</p>
    </div>
  )
}