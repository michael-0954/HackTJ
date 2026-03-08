const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY

export async function classifyWithClaude(findings, fullText) {
  if (!CLAUDE_API_KEY || findings.length === 0) return findings

  try {
    const prompt = `You are a security expert analyzing extracted text for exposed credentials and sensitive data.

Here is the extracted text:
<text>
${fullText.slice(0, 3000)}
</text>

Here are the findings detected by pattern matching:
${findings.map((f, i) => `${i + 1}. ${f.name}: "${f.matchedText.slice(0, 100)}"`).join('\n')}

For each finding, respond with a JSON array where each object has:
- index: the finding number (1-based)
- confidence: a number 0-100 representing how confident you are this is a real credential/secret (not a false positive)
- severity: one of "critical", "high", "medium", "low" 
- note: one sentence explaining why this is or isn't a real threat

Respond ONLY with the JSON array, no other text.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) return findings

    const data = await response.json()
    const text = data.content[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const results = JSON.parse(clean)

    return findings.map((f, i) => {
      const result = results.find(r => r.index === i + 1)
      if (!result) return f
      return {
        ...f,
        confidence: result.confidence,
        severity: result.severity || f.severity,
        claudeNote: result.note,
      }
    })

  } catch (err) {
    console.error('Claude classification failed:', err)
    return findings
  }
}