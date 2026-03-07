// Base confidence scores per pattern based on specificity
const BASE_CONFIDENCE = {
  aws_access_key: 97,
  aws_secret_key: 95,
  stripe_secret: 96,
  stripe_webhook: 94,
  openai_key: 95,
  github_token: 96,
  github_token_bare: 95,
  github_oauth: 93,
  google_api: 88,
  jwt_token: 82,
  jwt_secret: 90,
  ssh_private: 97,
  db_connection: 91,
  internal_ip: 78,
  internal_url: 75,
  internal_url_bare: 73,
  email: 62,
  twilio_account: 88,
  twilio_auth: 90,
  slack_token: 92,
  anthropic_key: 96,
  password_field: 74,
  ssn: 85,
  credit_card: 83,
}

export function calculateConfidence(finding) {
  let confidence = BASE_CONFIDENCE[finding.id] || 70

  const text = finding.matchedText

  // Boost if key name is present alongside the value
  if (text.includes('=') || text.includes(':')) {
    confidence = Math.min(confidence + 4, 99)
  }

  // Boost for longer matched text — more specific = more confident
  if (text.length > 40) confidence = Math.min(confidence + 3, 99)
  if (text.length > 80) confidence = Math.min(confidence + 2, 99)

  // Reduce for very short matches — might be partial/false positive
  if (text.length < 12) confidence = Math.max(confidence - 10, 40)

  // Reduce for patterns prone to OCR errors
  if (text.includes(' ') && !['db_connection', 'aws_secret_key', 'jwt_secret', 'stripe_secret', 'password_field'].includes(finding.id)) {
    confidence = Math.max(confidence - 8, 40)
  }

  return confidence
}