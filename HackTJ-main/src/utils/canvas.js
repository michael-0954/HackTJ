const SEVERITY_COLORS = {
  critical: '#FF2D2D',
  high: '#FF6B2D',
  medium: '#FFD12D',
  low: '#4FC3F7',
}

export function drawBoundingBoxes(canvas, image, findings, selectedFindingId, imageNaturalDimensions) {
  const ctx = canvas.getContext('2d')

  const displayWidth = image.offsetWidth
  const displayHeight = image.offsetHeight

  canvas.width = displayWidth
  canvas.height = displayHeight
  canvas.style.width = displayWidth + 'px'
  canvas.style.height = displayHeight + 'px'

  const scaleX = displayWidth / imageNaturalDimensions.width
  const scaleY = displayHeight / imageNaturalDimensions.height

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw unselected findings first (behind selected)
  for (const finding of findings) {
    if (!finding.bbox) continue
    if (finding.uniqueId === selectedFindingId) continue

    const x = Math.round(finding.bbox.x0 * scaleX)
    const y = Math.round(finding.bbox.y0 * scaleY)
    const width = Math.round((finding.bbox.x1 - finding.bbox.x0) * scaleX)
    const height = Math.round((finding.bbox.y1 - finding.bbox.y0) * scaleY)

    if (width <= 0 || height <= 0) continue

    const color = SEVERITY_COLORS[finding.severity] || '#FF2D2D'

    // Subtle fill — transparent enough to read text beneath
    ctx.fillStyle = color + '08'
    ctx.fillRect(x, y, width, height)

    // Thin border
    ctx.strokeStyle = color + '60'
    ctx.lineWidth = 1.5
    ctx.strokeRect(x, y, width, height)

    // Small L-shaped corners
    const m = 5
    ctx.fillStyle = color + '90'
    ctx.fillRect(x, y, m, 1.5)
    ctx.fillRect(x, y, 1.5, m)
    ctx.fillRect(x + width - m, y, m, 1.5)
    ctx.fillRect(x + width - 1.5, y, 1.5, m)
    ctx.fillRect(x, y + height - 1.5, m, 1.5)
    ctx.fillRect(x, y + height - m, 1.5, m)
    ctx.fillRect(x + width - m, y + height - 1.5, m, 1.5)
    ctx.fillRect(x + width - 1.5, y + height - m, 1.5, m)
  }

  // Draw selected finding on top with full treatment
  if (selectedFindingId) {
    const selected = findings.find(f => f.uniqueId === selectedFindingId)
    if (selected && selected.bbox) {
      const x = Math.round(selected.bbox.x0 * scaleX)
      const y = Math.round(selected.bbox.y0 * scaleY)
      const width = Math.round((selected.bbox.x1 - selected.bbox.x0) * scaleX)
      const height = Math.round((selected.bbox.y1 - selected.bbox.y0) * scaleY)

      if (width > 0 && height > 0) {
        const color = SEVERITY_COLORS[selected.severity] || '#FF2D2D'

        // Glow
        ctx.shadowColor = color
        ctx.shadowBlur = 20

        // Fill — very light so text stays readable
        ctx.fillStyle = color + '12'
        ctx.fillRect(x, y, width, height)

        // Border
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.strokeRect(x, y, width, height)

        ctx.shadowBlur = 0

        // Corner markers — L-shaped, not filled squares
        const m = 8
        ctx.fillStyle = color
        // Top left
        ctx.fillRect(x, y, m, 2)
        ctx.fillRect(x, y, 2, m)
        // Top right
        ctx.fillRect(x + width - m, y, m, 2)
        ctx.fillRect(x + width - 2, y, 2, m)
        // Bottom left
        ctx.fillRect(x, y + height - 2, m, 2)
        ctx.fillRect(x, y + height - m, 2, m)
        // Bottom right
        ctx.fillRect(x + width - m, y + height - 2, m, 2)
        ctx.fillRect(x + width - 2, y + height - m, 2, m)

        // Label above box — clean modern style
        ctx.font = '500 11px Inter, sans-serif'
        const label = selected.name
        const labelWidth = ctx.measureText(label).width + 16
        const labelHeight = 22
        const labelY = y - labelHeight - 4 < 0 ? y + height + 4 : y - labelHeight - 4

        // White pill background with colored border
        ctx.fillStyle = 'white'
        ctx.shadowColor = 'rgba(0,0,0,0.12)'
        ctx.shadowBlur = 8
        roundRect(ctx, x, labelY, labelWidth, labelHeight, 6)
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        roundRect(ctx, x, labelY, labelWidth, labelHeight, 6)
        ctx.stroke()

        ctx.fillStyle = color
        ctx.fillText(label, x + 8, labelY + 15)
      }
    }
  }
}

export function getSeverityColor(severity) {
  return SEVERITY_COLORS[severity] || '#4FC3F7'
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}