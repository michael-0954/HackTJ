import { useState } from "react"

export default function GitInputZone({ onTextReady }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)

  function parseGitHubUrl(url) {
    const match = url.match(/github\.com\/([^/]+)\/([^/\s]+)/)
    if (!match) return null
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
    }
  }

  async function fetchRepoContent(owner, repo) {
    const allText = []

    // Fetch recent commits
    setStatus('Fetching recent commits...')
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`
    )
    if (!commitsRes.ok) throw new Error('Repository not found or is private.')
    const commits = await commitsRes.json()

    // Fetch default branch file tree
    setStatus('Scanning file tree...')
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    const repoData = await repoRes.json()
    const branch = repoData.default_branch || 'main'

    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    )
    const treeData = await treeRes.json()

    // Find sensitive files
    const sensitiveFiles = (treeData.tree || []).filter(f => {
      const name = f.path.toLowerCase()
      return (
        name.endsWith('.env') ||
        name.includes('.env.') ||
        name.endsWith('.pem') ||
        name.endsWith('.key') ||
        name.includes('secret') ||
        name.includes('credential') ||
        name.includes('config') ||
        name === 'docker-compose.yml' ||
        name === '.travis.yml' ||
        name.includes('github/workflows')
      ) && f.type === 'blob'
    }).slice(0, 15)

    // Fetch content of sensitive files
    setStatus(`Scanning ${sensitiveFiles.length} sensitive files...`)
    for (const file of sensitiveFiles) {
      try {
        const contentRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`
        )
        const contentData = await contentRes.json()
        if (contentData.content) {
          const decoded = atob(contentData.content.replace(/\n/g, ''))
          allText.push(`\n# File: ${file.path}\n${decoded}`)
        }
      } catch (e) {
        // Skip files that can't be read
      }
    }

    // Add commit messages and author info
    setStatus('Analyzing commit history...')
    const commitText = commits.map(c =>
      `Commit: ${c.sha.slice(0, 7)} by ${c.commit.author.name}\n${c.commit.message}`
    ).join('\n\n')
    allText.push(`\n# Recent Commits\n${commitText}`)

    return {
      text: allText.join('\n\n'),
      label: `github.com/${owner}/${repo}`,
      fileCount: sensitiveFiles.length,
    }
  }

  async function handleScan() {
    setError(null)
    setStatus(null)

    const parsed = parseGitHubUrl(repoUrl)
    if (!parsed) {
      setError('Please enter a valid GitHub repository URL.')
      return
    }

    setLoading(true)
    try {
      const { text, label, fileCount } = await fetchRepoContent(parsed.owner, parsed.repo)
      if (!text.trim()) {
        setError('No scannable content found in this repository.')
        return
      }
      setStatus(`Scanned ${fileCount} sensitive files. Running detection...`)
      await new Promise(r => setTimeout(r, 500))
      onTextReady(text, label)
    } catch (err) {
      setError(err.message || 'Failed to fetch repository.')
    } finally {
      setLoading(false)
      setStatus(null)
    }
  }

  return (
    <div>
      <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-8 text-center mb-4">
        <div className="w-10 h-10 bg-[#F5F6FA] rounded-xl flex items-center justify-center mx-auto mb-3 text-xl">
          ⌥
        </div>
        <p className="font-semibold text-[#0F1117] mb-1 text-sm">
          Scan a GitHub repository
        </p>
        <p className="text-xs text-[#9CA3AF]">
          Scans config files, CI/CD workflows, and commit history for exposed credentials
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleScan() }}
          placeholder="https://github.com/owner/repository"
          className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#0F1117] placeholder-[#D1D5DB] focus:outline-none focus:border-[#3B82F6] transition-all"
        />
        <button
          onClick={handleScan}
          disabled={loading || !repoUrl.trim()}
          className="px-4 py-2.5 bg-[#0F1117] text-white text-sm font-medium rounded-xl hover:bg-[#374151] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : null
          }
          {loading ? status || 'Scanning...' : 'Scan Repo'}
        </button>
      </div>

      {error && <p className="text-[#DC2626] text-xs mt-2">✕ {error}</p>}

      <p className="text-xs text-[#9CA3AF] mt-3 text-center">
        Only public repositories — no authentication required
      </p>
    </div>
  )
}