export function generateDemoImage(scenario) {
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 500
  const ctx = canvas.getContext('2d')

  switch (scenario) {
    case 'terminal':
      drawTerminal(ctx, canvas.width, canvas.height)
      break
    case 'code':
      drawCodeEditor(ctx, canvas.width, canvas.height)
      break
    case 'slack':
      drawSlack(ctx, canvas.width, canvas.height)
      break
  }

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png')
  })
}

function drawTerminal(ctx, w, h) {
  // Background
  ctx.fillStyle = '#1E1E1E'
  ctx.fillRect(0, 0, w, h)

  // Title bar
  ctx.fillStyle = '#323232'
  ctx.fillRect(0, 0, w, 36)

  // Traffic lights
  ctx.fillStyle = '#FF5F57'
  ctx.beginPath(); ctx.arc(18, 18, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FEBC2E'
  ctx.beginPath(); ctx.arc(38, 18, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#28C840'
  ctx.beginPath(); ctx.arc(58, 18, 6, 0, Math.PI * 2); ctx.fill()

  // Title
  ctx.fillStyle = '#CCCCCC'
  ctx.font = '13px monospace'
  ctx.fillText('bash — 80×24', w / 2 - 50, 23)

  // Terminal content
  ctx.font = '14px monospace'
  const lines = [
    { text: '$ cat ~/.aws/credentials', color: '#A8FF3E' },
    { text: '[default]', color: '#CCCCCC' },
    { text: 'aws_access_key_id = AKIA1234567890ABCDEF', color: '#CCCCCC' },
    { text: 'aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', color: '#CCCCCC' },
    { text: '', color: '#CCCCCC' },
    { text: '$ echo $DATABASE_URL', color: '#A8FF3E' },
    { text: 'postgresql://admin:mypassword123@db.internal.company.com:5432/prod', color: '#CCCCCC' },
    { text: '', color: '#CCCCCC' },
    { text: '$ cat .env', color: '#A8FF3E' },
    { text: 'STRIPE_SECRET_KEY=sk_live_abcdefghijklmnopqrstuvwxyz012345', color: '#CCCCCC' },
    { text: 'JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secretpart', color: '#CCCCCC' },
    { text: 'INTERNAL_API=http://192.168.1.100:8080/api', color: '#CCCCCC' },
    { text: '', color: '#CCCCCC' },
    { text: '$ █', color: '#A8FF3E' },
  ]

  lines.forEach((line, i) => {
    ctx.fillStyle = line.color
    ctx.fillText(line.text, 20, 70 + i * 26)
  })
}

function drawCodeEditor(ctx, w, h) {
  // Background
  ctx.fillStyle = '#1E1E2E'
  ctx.fillRect(0, 0, w, h)

  // Title bar
  ctx.fillStyle = '#181825'
  ctx.fillRect(0, 0, w, 36)

  // Traffic lights
  ctx.fillStyle = '#FF5F57'
  ctx.beginPath(); ctx.arc(18, 18, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#FEBC2E'
  ctx.beginPath(); ctx.arc(38, 18, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#28C840'
  ctx.beginPath(); ctx.arc(58, 18, 6, 0, Math.PI * 2); ctx.fill()

  // Tab
  ctx.fillStyle = '#1E1E2E'
  ctx.fillRect(80, 8, 120, 28)
  ctx.fillStyle = '#CDD6F4'
  ctx.font = '12px monospace'
  ctx.fillText('config.js', 90, 26)

  // Sidebar
  ctx.fillStyle = '#181825'
  ctx.fillRect(0, 36, 50, h - 36)

  // Line numbers
  ctx.fillStyle = '#585B70'
  ctx.font = '13px monospace'
  for (let i = 1; i <= 16; i++) {
    ctx.fillText(String(i), 16, 36 + i * 26)
  }

  // Code content
  const lines = [
    { text: "const config = {", color: '#CDD6F4' },
    { text: "  env: process.env.NODE_ENV,", color: '#CDD6F4' },
    { text: "  stripe: {", color: '#CDD6F4' },
    { text: "    secretKey: 'sk_live_51NxampleKEYabcdefghijklmno',", color: '#A6E3A1' },
    { text: "    webhookSecret: 'whsec_examplewebhooksecretkey123',", color: '#A6E3A1' },
    { text: "  },", color: '#CDD6F4' },
    { text: "  openai: {", color: '#CDD6F4' },
    { text: "    apiKey: 'sk-proj-abcdefghijklmnopqrstuvwxyz123456',", color: '#A6E3A1' },
    { text: "  },", color: '#CDD6F4' },
    { text: "  github: {", color: '#CDD6F4' },
    { text: "    token: 'ghp_16C7e42F292c6912E169C2ba539F33f1234567',", color: '#A6E3A1' },
    { text: "  },", color: '#CDD6F4' },
    { text: "  db: {", color: '#CDD6F4' },
    { text: "    password: 'SuperSecret123!',", color: '#A6E3A1' },
    { text: "  }", color: '#CDD6F4' },
    { text: "}", color: '#CDD6F4' },
  ]

  lines.forEach((line, i) => {
    ctx.fillStyle = line.color
    ctx.font = '13px monospace'
    ctx.fillText(line.text, 60, 62 + i * 26)
  })
}

function drawSlack(ctx, w, h) {
  // Background
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, w, h)

  // Sidebar
  ctx.fillStyle = '#3F0E40'
  ctx.fillRect(0, 0, 220, h)

  // Workspace name
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 15px sans-serif'
  ctx.fillText('acme-corp', 20, 36)

  // Channels
  ctx.fillStyle = '#C9A8CA'
  ctx.font = '13px sans-serif'
  const channels = ['# general', '# engineering', '# deployments', '# alerts', '# random']
  channels.forEach((ch, i) => {
    ctx.fillText(ch, 20, 80 + i * 30)
  })

  // Active channel highlight
  ctx.fillStyle = '#1164A3'
  ctx.fillRect(8, 65, 204, 24)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText('# engineering', 20, 82)

  // Main content area header
  ctx.fillStyle = '#1D1C1D'
  ctx.font = 'bold 16px sans-serif'
  ctx.fillText('# engineering', 240, 36)
  ctx.fillStyle = '#616061'
  ctx.font = '12px sans-serif'
  ctx.fillText('Engineering team channel', 240, 54)

  // Divider
  ctx.strokeStyle = '#E8E8E8'
  ctx.beginPath(); ctx.moveTo(230, 64); ctx.lineTo(w, 64); ctx.stroke()

  // Messages
  const messages = [
    {
      user: 'alex.chen',
      time: '10:23 AM',
      lines: [
        'Hey team, just pushed the new deployment config.',
        'GitHub token for CI: ghp_16C7e42F292c6912E169C2ba539F33f1234',
      ]
    },
    {
      user: 'sarah.kim',
      time: '10:31 AM',
      lines: [
        'Thanks! Also here are the staging creds:',
        'DB: postgresql://admin:P@ssw0rd123@192.168.1.45:5432/staging',
        'API key: AKIA4EXAMPLE1234567890ABCDEF',
      ]
    },
    {
      user: 'mike.torres',
      time: '10:45 AM',
      lines: [
        'Got it. Reminder: internal dashboard is at http://10.0.0.15:3000',
        'Use your SSO to log in.',
      ]
    },
  ]

  let y = 90
  messages.forEach(msg => {
    // Avatar
    ctx.fillStyle = '#E8E8E8'
    ctx.beginPath(); ctx.arc(252, y + 10, 16, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#616061'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText(msg.user.slice(0, 2).toUpperCase(), 244, y + 15)

    // Username and time
    ctx.fillStyle = '#1D1C1D'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(msg.user, 278, y + 8)
    ctx.fillStyle = '#616061'
    ctx.font = '11px sans-serif'
    ctx.fillText(msg.time, 278 + ctx.measureText(msg.user).width + 10, y + 8)

    // Message lines
    ctx.fillStyle = '#1D1C1D'
    ctx.font = '13px sans-serif'
    msg.lines.forEach((line, i) => {
      ctx.fillText(line, 278, y + 24 + i * 20)
    })

    y += 30 + msg.lines.length * 20 + 20
  })
}