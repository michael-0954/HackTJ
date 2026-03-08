export function mapFindingsToCoordinates(findings, words, fullText) {
  if (!words || words.length === 0) {
    return findings.map(f => ({ ...f, bbox: null }))
  }
  return findings.map(finding => {
    const bbox = findBboxForMatch(finding.matchedText, words)
    return { ...finding, bbox }
  })
}

function findBboxForMatch(matchedText, words) {
  const clean = matchedText.trim()
  if (!clean || words.length === 0) return null

  // Get first meaningful token (skip symbols)
  const firstToken = clean.split(/[\s=:'"`,;]+/).find(t => t.length > 3) || clean.slice(0, 8)
  const lastToken = clean.split(/[\s=:'"`,;]+/).filter(t => t.length > 3).pop() || ''

  // Find the word index that best matches our first token
  let bestStartIdx = -1
  let bestScore = 0

  for (let i = 0; i < words.length; i++) {
    const w = words[i].text.replace(/['"`,;]/g, '').toLowerCase()
    const t = firstToken.replace(/['"`,;]/g, '').toLowerCase()
    const score = overlapScore(w, t)
    if (score > bestScore) {
      bestScore = score
      bestStartIdx = i
    }
  }

  if (bestStartIdx === -1 || bestScore < 0.3) return null

  // Now span forward from start to cover the full matched text
  // Use character count as the guide
  const totalChars = clean.replace(/\s+/g, '').length
  const startWord = words[bestStartIdx]

  let x0 = startWord.bbox.x0
  let y0 = startWord.bbox.y0
  let x1 = startWord.bbox.x1
  let y1 = startWord.bbox.y1
  let coveredChars = startWord.text.length
  let j = bestStartIdx + 1

  while (j < words.length && coveredChars < totalChars * 0.8) {
    const w = words[j]
    if (!w || !w.text) { j++; continue }

    // Stop if we've moved to a new line
    if (w.bbox.y0 > startWord.bbox.y0 + 40) break

    coveredChars += w.text.length
    x1 = Math.max(x1, w.bbox.x1)
    y0 = Math.min(y0, w.bbox.y0)
    y1 = Math.max(y1, w.bbox.y1)
    j++

    // For URLs and connection strings, keep going until end of line
    if (clean.includes('://')) {
      while (j < words.length) {
        const next = words[j]
        if (!next || !next.text) { j++; continue }
        // Strict single line only
        if (next.bbox.y0 > startWord.bbox.y0 + 15) break
        x1 = Math.max(x1, next.bbox.x1)
        y1 = Math.max(y1, next.bbox.y1)
        j++
      }
      break
    }
  }

  // Add a little padding
  return {
    x0: Math.max(0, x0 - 2),
    y0: Math.max(0, y0 - 2),
    x1: x1 + 4,
    y1: y1 + 4,
  }
}

function overlapScore(a, b) {
  if (!a || !b) return 0
  if (a === b) return 1
  const shorter = a.length < b.length ? a : b
  const longer = a.length < b.length ? b : a
  if (longer.includes(shorter) && shorter.length > 3) return 0.9
  // Count matching chars from start
  let matches = 0
  for (let i = 0; i < Math.min(a.length, b.length, 8); i++) {
    if (a[i] === b[i]) matches++
    else break
  }
  return matches / Math.max(a.length, b.length, 1)
}