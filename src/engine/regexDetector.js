export const SECRET_PATTERNS = [
  {
    id: 'aws_access_key',
    name: 'AWS Access Key',
    regex: /AKIA[0-9A-Z]{16}/g,
    severity: 'critical',
    remediation: 'Immediately revoke this key at console.aws.amazon.com → IAM → Users → Security Credentials. Then audit CloudTrail for unauthorized usage.',
  },
  {
    id: 'aws_secret_key',
    name: 'AWS Secret Access Key',
    regex: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*=\s*[^\n\r]+/gi,
    severity: 'critical',
    remediation: 'Revoke immediately at AWS IAM console. Rotate all credentials associated with this access key.',
  },
  {
    id: 'stripe_secret',
    name: 'Stripe Secret Key',
    regex: /(?:STRIPE_SECRET_KEY\s*=\s*\S+|sk_live_[0-9a-zA-Z]{10,})/gi,
    severity: 'critical',
    remediation: 'Revoke immediately at dashboard.stripe.com → Developers → API Keys. Check payment logs for unauthorized charges.',
  },
  {
    id: 'stripe_webhook',
    name: 'Stripe Webhook Secret',
    regex: /whsec_[a-zA-Z0-9]{10,}/g,
    severity: 'critical',
    remediation: 'Revoke immediately at dashboard.stripe.com → Developers → Webhooks. Rotate the webhook signing secret.',
  },
  {
    id: 'stripe_publishable',
    name: 'Stripe Publishable Key',
    regex: /pk_live_[0-9a-zA-Z]{24,}/g,
    severity: 'medium',
    remediation: 'While publishable keys have limited scope, rotate at dashboard.stripe.com → Developers → API Keys.',
  },
  {
    id: 'openai_key',
    name: 'OpenAI API Key',
    regex: /sk-[a-zA-Z0-9\-]{20}/g,
    severity: 'critical',
    remediation: 'Revoke immediately at platform.openai.com → API Keys. Check usage dashboard for unauthorized calls.',
  },
  {
    id: 'github_token',
    name: 'GitHub Personal Access Token',
    regex: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    remediation: 'Revoke at github.com → Settings → Developer Settings → Personal Access Tokens.',
  },
  {
    id: 'github_oauth',
    name: 'GitHub OAuth Token',
    regex: /gho_[a-zA-Z0-9]{36}/g,
    severity: 'critical',
    remediation: 'Revoke at github.com → Settings → Applications → Authorized OAuth Apps.',
  },
  {
    id: 'github_token_bare',
    name: 'GitHub Token',
    regex: /ghp_[a-zA-Z0-9]{20,}/g,
    severity: 'critical',
    remediation: 'Revoke at github.com → Settings → Developer Settings → Personal Access Tokens.',
  },
  {
    id: 'google_api',
    name: 'Google API Key',
    regex: /AIza[0-9A-Za-z\-_]{35}/g,
    severity: 'high',
    remediation: 'Revoke at console.cloud.google.com → APIs & Services → Credentials. Enable API key restrictions.',
  },
  {
    id: 'jwt_token',
    name: 'JWT Token',
    regex: /eyJ[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/g,
    severity: 'high',
    remediation: 'Invalidate this token immediately by rotating the signing secret. Audit session logs for unauthorized access.',
  },
  {
    id: 'jwt_secret',
    name: 'JWT Secret',
    regex: /(?:[IJ]WT_SECRET|jwt_secret)\s*=\s*[^\n\r]+/gi,
    severity: 'critical',
    remediation: 'Rotate this JWT signing secret immediately. All existing tokens signed with this secret are compromised.',
  },
  {
    id: 'private_key',
    name: 'Private Key Block',
    regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'critical',
    remediation: 'Revoke and regenerate this key pair immediately. Any system using this key should be considered compromised.',
  },
  {
    id: 'db_connection',
    name: 'Database Connection String',
    regex: /(?:mongodb|postgresql|mysql|redis):\/\/[^\n\r"']+/gi,
    severity: 'critical',
    remediation: 'Rotate database credentials immediately. Check database access logs for unauthorized queries.',
  },
  {
    id: 'internal_ip',
    name: 'Internal IP Address',
    regex: /\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g,
    severity: 'medium',
    remediation: 'Internal IPs reveal network topology. Avoid sharing screenshots containing internal infrastructure addresses.',
  },
  {
    id: 'internal_url',
    name: 'Internal Service URL',
    regex: /https?:\/\/(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|localhost|127\.0\.0\.1)(?::\d+)?(?:\/\S*)?/gi,
    severity: 'medium',
    remediation: 'Internal service URLs reveal network infrastructure. Avoid sharing screenshots containing internal endpoints or dashboard links.',
  },
  {
    id: 'internal_url_bare',
    name: 'Internal Service URL',
    regex: /(?:http:\/\/|https:\/\/)(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)*/gi,
    severity: 'medium',
    remediation: 'Internal service URLs reveal network infrastructure. Avoid sharing screenshots containing internal endpoints.',
  },
  {
    id: 'email',
    name: 'Email Address',
    regex: /[a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,6}/g,
    severity: 'low',
    remediation: 'Avoid sharing internal email addresses publicly. Consider blurring personal contact information.',
  },
  {
    id: 'twilio_key',
    name: 'Twilio API Key',
    regex: /SK[0-9a-fA-F]{32}/g,
    severity: 'critical',
    remediation: 'Revoke at console.twilio.com → Account → API Keys. Check SMS/call logs for unauthorized usage.',
  },
  {
    id: 'slack_token',
    name: 'Slack Token',
    regex: /xox[baprs]-[0-9a-zA-Z\-]{10,}/g,
    severity: 'critical',
    remediation: 'Revoke at api.slack.com → Your Apps → OAuth & Permissions. Audit Slack audit logs for unauthorized access.',
  },
  {
    id: 'anthropic_key',
    name: 'Anthropic API Key',
    regex: /sk-ant-[a-zA-Z0-9\-_]{32}/g,
    severity: 'critical',
    remediation: 'Revoke immediately at console.anthropic.com → API Keys. Check usage for unauthorized Claude API calls.',
  },
  {
    id: 'password_field',
    name: 'Plaintext Password',
    regex: /(?:password|passwd|pwd|secret|secretKey|webhookSecret)\s*[:=:'"]+\s*['"]?([^\s'"`,]{6,})['"]?/gi,
    severity: 'critical',
    remediation: 'Change this password immediately on all systems where it is used. Enable MFA on all associated accounts.',
  },
  {
    id: 'ssn',
    name: 'Social Security Number',
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    severity: 'critical',
    remediation: 'This is protected PII. Report potential exposure to your compliance team and affected individuals immediately.',
  },
  {
    id: 'credit_card',
    name: 'Credit Card Number',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11})\b/g,
    severity: 'critical',
    remediation: 'Report immediately to your payment processor and compliance team. This may trigger PCI-DSS breach notification requirements.',
  },
]
//claude 
function luhnCheck(cardNumber) {
  // Remove all spaces and dashes
  const digits = cardNumber.replace(/[\s-]/g, '')
  
  // Must be all numbers
  if (!/^\d+$/.test(digits)) return false
  
  // Must be between 13-19 digits
  if (digits.length < 13 || digits.length > 19) return false
  
  // The actual Luhn algorithm
  let sum = 0
  let isEven = false
  
  // Walk through digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i])
    
    if (isEven) {
      digit *= 2          // double every second digit
      if (digit > 9) {
        digit -= 9        // if doubling gives 10+, subtract 9
      }
    }
    
    sum += digit
    isEven = !isEven      // flip between even and odd position
  }
  
  // Valid card numbers always have a sum divisible by 10
  return sum % 10 === 0
}

function cleanOCRText(text) {
  return text
    .replace(/(\w)\.\s+(\w)/g, '$1.$2')       // "db. internal" → "db.internal"
    .replace(/:\s+(\d)/g, ':$1')               // ": 5432" → ":5432"
    .replace(/\/\s+/g, '/')                    // "/ K7" → "/K7"
    .replace(/:\/(\w)/g, '://$1')             // ":/admin" → "://admin"
    .replace(/http:\/(\d)/g, 'http://$1')     // "http:/10" → "http://10"
    .replace(/\s+@\s*/g, '@')                  // "P @ssw0rd" → "P@ssw0rd"
    .replace(/@\s+/g, '@')                     // "admin@ db" → "admin@db"
    .replace(/\bAv\b/g, '')                    // remove OCR avatar artifacts
}

export function runRegexDetection(rawText) {
  const text = cleanOCRText(rawText)
  const findings = []

  for (const pattern of SECRET_PATTERNS) {
    const matches = [...text.matchAll(pattern.regex)]
    for (const match of matches) {
      // Use full match always for redaction accuracy
      const matchedText = match[0]
      if (matchedText.trim().length < 3) continue
      
      if (pattern.id === 'credit_card' && !luhnCheck(matchedText)) {
        continue
      }

      findings.push({
        id: pattern.id,
        name: pattern.name,
        severity: pattern.severity,
        remediation: pattern.remediation,
        matchedText: matchedText,
        index: match.index,
      })
    }
  }

  // Deduplicate — remove findings whose matched text is a substring of another
  const deduped = findings.filter((f, i) =>
    !findings.some((other, j) =>
      i !== j &&
      other.matchedText.includes(f.matchedText) &&
      other.matchedText.length > f.matchedText.length
    )
  )

  return deduped
}