import { useEffect, useRef, useState } from "react"
import { drawBoundingBoxes } from "../utils/canvas"

export default function AnnotatedImage({ imageFile, findings, selectedFindingId }) {
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const canvasRef = useRef(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [imageDimensions, setImageDimensions] = useState(null)

  useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    if (!imageUrl) return
    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.src = imageUrl
  }, [imageUrl])

 function redraw() {
    if (!canvasRef.current || !imageRef.current || !imageDimensions) return
    if (!imageRef.current.complete) return
    if (imageRef.current.offsetWidth === 0) return

    const imgEl = imageRef.current
    const canvas = canvasRef.current

    // Position canvas exactly over image
    canvas.style.position = 'absolute'
    canvas.style.top = imgEl.offsetTop + 'px'
    canvas.style.left = imgEl.offsetLeft + 'px'
    canvas.style.width = imgEl.offsetWidth + 'px'
    canvas.style.height = imgEl.offsetHeight + 'px'

    // uniqueId already assigned at source in App.jsx
    const mappedFindings = findings

    drawBoundingBoxes(
      canvas,
      imgEl,
      mappedFindings,
      selectedFindingId,
      imageDimensions
    )
  }

  // Redraw when findings, selection, or dimensions change
  useEffect(() => {
    redraw()
  }, [findings, selectedFindingId, imageDimensions])

  // Redraw on window resize
  useEffect(() => {
    window.addEventListener('resize', redraw)
    return () => window.removeEventListener('resize', redraw)
  }, [findings, selectedFindingId, imageDimensions])

  if (!imageUrl) return null

  return (
    <div className="bg-[#0D1117] border border-[#1E2A1E] rounded-lg overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E7EB] bg-white">
        <div className={`w-2 h-2 rounded-full ${findings.length > 0 ? 'bg-[#DC2626]' : 'bg-[#16A34A]'}`} />
        <span className="text-xs font-medium text-[#6B7280]">
          {findings.length > 0
            ? `${findings.length} finding${findings.length !== 1 ? 's' : ''} marked — click a threat to highlight it`
            : 'No threats detected in this screenshot'
          }
        </span>
      </div>

      {/* Image + Canvas overlay */}
      <div ref={containerRef} className="relative w-full">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Uploaded screenshot"
          onLoad={redraw}
          className="w-full h-auto block"
          style={{ maxHeight: '600px', objectFit: 'contain' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {findings.length > 0 && (
        <div className="px-4 py-2 border-t border-[#E5E7EB] bg-white">
          <p className="text-xs text-[#9CA3AF]">
            Click any finding in the threat report to highlight its location
          </p>
        </div>
      )}
    </div>
  )
}