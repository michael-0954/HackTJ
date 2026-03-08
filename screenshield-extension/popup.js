// ============================================================
// REGEX PATTERNS (copied from main app)
// ============================================================

const ENHANCE_SCALE = 2

const SECRET_PATTERNS = [
  { id: 'aws_access_key', name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'critical', remediation: 'Revoke immediately at console.aws.amazon.com → IAM → Security Credentials.' },
  { id: 'aws_secret_key', name: 'AWS Secret Key', regex: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*=\s*[^\n\r]+/gi, severity: 'critical', remediation: 'Revoke immediately at AWS IAM console. Rotate all associated credentials.' },
  { id: 'stripe_secret', name: 'Stripe Secret Key', regex: /(?:STRIPE_SECRET_KEY\s*=\s*\S+|sk_live_[0-9a-zA-Z]{10,})/gi, severity: 'critical', remediation: 'Revoke at dashboard.stripe.com → Developers → API Keys.' },
  { id: 'stripe_webhook', name: 'Stripe Webhook Secret', regex: /whsec_[a-zA-Z0-9]{10,}/g, severity: 'critical', remediation: 'Revoke at dashboard.stripe.com → Developers → Webhooks.' },
  { id: 'openai_key', name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9\-]{20,}/g, severity: 'critical', remediation: 'Revoke at platform.openai.com → API Keys.' },
  { id: 'github_token', name: 'GitHub Token', regex: /ghp_[a-zA-Z0-9]{20,}/g, severity: 'critical', remediation: 'Revoke at github.com → Settings → Developer Settings → Personal Access Tokens.' },
  { id: 'github_oauth', name: 'GitHub OAuth Token', regex: /gho_[a-zA-Z0-9]{36}/g, severity: 'critical', remediation: 'Revoke at github.com → Settings → Applications → Authorized OAuth Apps.' },
  { id: 'google_api', name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/g, severity: 'high', remediation: 'Revoke at console.cloud.google.com → APIs & Services → Credentials.' },
  { id: 'jwt_token', name: 'JWT Token', regex: /eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/g, severity: 'high', remediation: 'Invalidate by rotating the signing secret immediately.' },
  { id: 'jwt_secret', name: 'JWT Secret', regex: /(?:[IJ]WT_SECRET|jwt_secret)\s*=\s*[^\n\r]+/gi, severity: 'critical', remediation: 'Rotate this JWT signing secret immediately.' },
  { id: 'private_key', name: 'Private Key', regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g, severity: 'critical', remediation: 'Revoke and regenerate this key pair immediately.' },
  { id: 'db_connection', name: 'Database Connection String', regex: /(?:mongodb|postgresql|mysql|redis):\/\/[^\n\r"']+/gi, severity: 'critical', remediation: 'Rotate database credentials immediately.' },
  { id: 'internal_ip', name: 'Internal IP Address', regex: /\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g, severity: 'medium', remediation: 'Avoid sharing screenshots containing internal infrastructure addresses.' },
  { id: 'internal_url', name: 'Internal Service URL', regex: /https?:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|localhost|127\.0\.0\.1)(?::\d+)?(?:\/\S*)?/gi, severity: 'medium', remediation: 'Internal service URLs reveal network infrastructure.' },
  { id: 'email', name: 'Email Address', regex: /[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,6}/g, severity: 'low', remediation: 'Avoid sharing internal email addresses publicly.' },
  { id: 'slack_token', name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z\-]{10,}/g, severity: 'critical', remediation: 'Revoke at api.slack.com → Your Apps → OAuth & Permissions.' },
  { id: 'anthropic_key', name: 'Anthropic API Key', regex: /sk-ant-[a-zA-Z0-9\-_]{32,}/g, severity: 'critical', remediation: 'Revoke at console.anthropic.com → API Keys.' },
  { id: 'password_field', name: 'Plaintext Password', regex: /(?:password|passwd|pwd|secret)\s*[:=]+\s*['"]?([^\s'"`,]{6,})['"]?/gi, severity: 'critical', remediation: 'Change this password immediately on all systems.' },
]

function cleanOCRText(text) {
  return text
    .replace(/(\w)\.\s+(\w)/g, '$1.$2')
    .replace(/:\s+(\d)/g, ':$1')
    .replace(/\/\s+/g, '/')
    .replace(/:\/(\w)/g, '://$1')
    .replace(/http:\/(\d)/g, 'http://$1')
    .replace(/\s+@\s*/g, '@')
    .replace(/@\s+/g, '@')
}

function runRegexDetection(rawText) {
  const text = cleanOCRText(rawText)
  const findings = []

  for (const pattern of SECRET_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
    const matches = [...text.matchAll(regex)]
    for (const match of matches) {
      const matchedText = match[0]
      if (matchedText.trim().length < 3) continue
      findings.push({
        id: pattern.id,
        name: pattern.name,
        severity: pattern.severity,
        remediation: pattern.remediation,
        matchedText,
      })
    }
  }

  return findings.filter((f, i) =>
    !findings.some((other, j) =>
      i !== j &&
      other.matchedText.includes(f.matchedText) &&
      other.matchedText.length > f.matchedText.length
    )
  )
}

// ============================================================
// IMAGE ENHANCEMENT
// ============================================================

function enhanceImage(imageFile) {
  const factor = 1.5
  const scale = ENHANCE_SCALE

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let x = 0; x < data.length; x += 4) {
        const gray = data[x] * 0.3 + data[x + 1] * 0.59 + data[x + 2] * 0.11
        const newVal = Math.min(255, Math.max(0, (gray - 128) * factor + 128))
        data[x] = newVal
        data[x + 1] = newVal
        data[x + 2] = newVal
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

// ============================================================
// OCR via Tesseract (loaded from CDN in popup.html)
// ============================================================

async function runOCR(imageFile, onProgress) {
  const enhanced = await enhanceImage(imageFile)
  const imageUrl = URL.createObjectURL(enhanced)

  const worker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(0.1 + m.progress * 0.65)
      }
    },
  })

  const { data } = await worker.recognize(imageUrl, {}, { hocr: true, text: true })
  await worker.terminate()
  URL.revokeObjectURL(imageUrl)

  return data.text || ''
}

// ============================================================
// STATE MACHINE
// ============================================================

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

function setState(state) {
  document.getElementById('state-idle').style.display = state === 'idle' ? 'block' : 'none'
  document.getElementById('state-scanning').style.display = state === 'scanning' ? 'block' : 'none'
  document.getElementById('state-results').style.display = state === 'results' ? 'block' : 'none'
  document.getElementById('state-error').style.display = state === 'error' ? 'block' : 'none'
}

function setProgress(pct, label) {
  document.getElementById('progress-fill').style.width = `${Math.round(pct * 100)}%`
  document.getElementById('progress-label').textContent = label || ''
}

function getOverallSeverity(findings) {
  if (!findings.length) return 'none'
  return findings.reduce((worst, f) =>
    SEVERITY_ORDER[f.severity] < SEVERITY_ORDER[worst] ? f.severity : worst,
    'low'
  )
}

function renderResults(findings) {
  const list = document.getElementById('findings-list')
  const badge = document.getElementById('overall-badge')

  const severity = getOverallSeverity(findings)
  badge.textContent = findings.length
    ? `${severity.toUpperCase()} RISK`
    : 'NO THREATS'
  badge.className = `badge badge-${severity}`

  if (!findings.length) {
    list.innerHTML = `
      <div class="no-findings">
        <div class="check">✅</div>
        <h3>No credentials detected</h3>
        <p>No exposed secrets found in this screenshot.</p>
      </div>`
    return
  }

  const sorted = [...findings].sort((a, b) =>
    SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  )

  list.innerHTML = sorted.map(f => `
    <div class="finding-card ${f.severity}">
      <div class="finding-top">
        <span class="finding-name">${f.name}</span>
        <span class="badge badge-${f.severity}">${f.severity.toUpperCase()}</span>
      </div>
      <div class="finding-match">${f.matchedText.length > 60 ? f.matchedText.slice(0, 60) + '…' : f.matchedText}</div>
      <div class="finding-remediation">${f.remediation}</div>
    </div>
  `).join('')
}

async function analyzeImage(file) {
  setState('scanning')
  setProgress(0.05, 'Enhancing image...')

  try {
    const text = await runOCR(file, (p) => {
      setProgress(p, 'Extracting text...')
    })

    setProgress(0.8, 'Running detection...')
    const findings = runRegexDetection(text)

    setProgress(0.95, 'Finalizing...')
    await new Promise(r => setTimeout(r, 300))

    renderResults(findings)
    setState('results')

  } catch (err) {
    document.getElementById('error-message').textContent =
      'Analysis failed: ' + (err.message || 'Unknown error')
    setState('error')
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const uploadZone = document.getElementById('upload-zone')
  const fileInput = document.getElementById('file-input')

  uploadZone.addEventListener('click', () => fileInput.click())

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file) analyzeImage(file)
  })

  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    uploadZone.classList.add('dragging')
  })

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragging')
  })

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault()
    uploadZone.classList.remove('dragging')
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) analyzeImage(file)
  })

  document.getElementById('new-scan-btn').addEventListener('click', () => setState('idle'))
  document.getElementById('error-reset-btn').addEventListener('click', () => setState('idle'))
})