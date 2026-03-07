import { createWorker } from 'tesseract.js'

export async function extractTextWithCoordinates(imageFile, onProgress) {
  const imageUrl = URL.createObjectURL(imageFile)

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        // Tesseract progress goes 0-1, we map it to 0.1-0.75 in our overall flow
        onProgress(0.1 + m.progress * 0.65)
      }
    },
  })

  const { data } = await worker.recognize(imageUrl, {}, {
    hocr: true,
    text: true,
  })

  await worker.terminate()
  URL.revokeObjectURL(imageUrl)

  const fullText = data.text || ''
  const words = parseHOCR(data.hocr)

  return { fullText, words, lines: [] }
}

function parseHOCR(hocr) {
  if (!hocr) return []

  const words = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(hocr, 'text/html')
  const wordElements = doc.querySelectorAll('.ocrx_word')

  wordElements.forEach(el => {
    const title = el.getAttribute('title') || ''
    const bboxMatch = title.match(/bbox\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/)
    const text = el.textContent.trim()

    if (bboxMatch && text) {
      words.push({
        text,
        confidence: 90,
        bbox: {
          x0: parseInt(bboxMatch[1]),
          y0: parseInt(bboxMatch[2]),
          x1: parseInt(bboxMatch[3]),
          y1: parseInt(bboxMatch[4]),
        },
      })
    }
  })

  return words
}