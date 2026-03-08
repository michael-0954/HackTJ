import { createWorker } from 'tesseract.js'
const ENHANCE_SCALE = 2
export async function extractTextWithCoordinates(imageFile, onProgress) {
  // Enhance image before OCR for better accuracy
  const enhancedFile = await enhanceImage(imageFile)
  const imageUrl = URL.createObjectURL(enhancedFile)

  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
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

function enhanceImage(imageFile) {
  const factor = 1.5
  const scale = ENHANCE_SCALE

  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Scale up for better OCR resolution
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Convert to grayscale and boost contrast
      for (let x = 0; x < data.length; x += 4) {
        // Weighted grayscale based on human vision perception
        const gray = data[x] * 0.3 + data[x + 1] * 0.59 + data[x + 2] * 0.11
        // Contrast enhancement
        const newVal = Math.min(255, Math.max(0, (gray - 128) * factor + 128))
        data[x] = newVal
        data[x + 1] = newVal
        data[x + 2] = newVal
        // Alpha channel unchanged
      }

      ctx.putImageData(imageData, 0, 0)

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(img.src)
        resolve(new File([blob], imageFile.name, { type: 'image/png' }))
      })
    }

    img.src = URL.createObjectURL(imageFile)
  })
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
          x0: parseInt(bboxMatch[1]) / ENHANCE_SCALE,
          y0: parseInt(bboxMatch[2]) / ENHANCE_SCALE,
          x1: parseInt(bboxMatch[3]) / ENHANCE_SCALE,
          y1: parseInt(bboxMatch[4]) / ENHANCE_SCALE,
        },
      })
    }
  })

  return words
}