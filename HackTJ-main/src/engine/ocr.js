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

async function enhanceImage(imageFile) {
  const factor = 1.5
  const canvas = document.createElement('canvas') //makes our canvas
  const ctx = canvas.getContext('2d') //pen
  const img = new Image() //our actual image
  const scale = 2 //scale factor to improve size of our image

  img.onload = () => {
  canvas.width = img.width * scale //enlarges the picture
  canvas.height = img.height * scale //enlarges the picture
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height) //actually draws the image
  }
  img.src = URL.createObjectURL(imageFile) //puts our file into the img

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height) //gets the image data
  const data = imageData.data //puts into the array

  //turns the image to different shades of gray
  for(let x = 0; x<data.length; x+=4)
  {
    const gray = data[x] * 0.3 + data[x+1] * 0.59 + data[x+2] * 0.11 //this calculates the average, those specfici numbers are based on how human vision works
    data[x] = gray
    data[x+1] = gray
    data[x+2] = gray

    const newVal = (gray - 128) * factor + 128
    data[x] = Math.min(255, Math.max(0, newVal))
    data[x+1] = Math.min(255, Math.max(0, newVal))
    data[x+2] = Math.min(255, Math.max(0, newVal))
  }
  return new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let x = 0; x < data.length; x += 4) {
        const gray = data[x] * 0.3 + data[x+1] * 0.59 + data[x+2] * 0.11
        const newVal = (gray - 128) * factor + 128
        data[x] = Math.min(255, Math.max(0, newVal))
        data[x+1] = Math.min(255, Math.max(0, newVal))
        data[x+2] = Math.min(255, Math.max(0, newVal))
      }

      ctx.putImageData(imageData, 0, 0)
      canvas.toBlob((blob) => {
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