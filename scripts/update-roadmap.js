#!/usr/bin/env node
'use strict'

/**
 * update-roadmap.js
 * Runs as a Claude Code Stop hook (command type).
 * Reads recent git commits, maps them to ROADMAP.md tasks by keyword,
 * marks matched tasks [x], updates progress counts and Completed table.
 */

const { execSync } = require('child_process')
const fs           = require('fs')
const path         = require('path')

const ROOT    = path.join(__dirname, '..')
const ROADMAP = path.join(ROOT, 'ROADMAP.md')

// ── Keyword map: task-id → phrases to search in commit messages ──────────────
const TASK_MAP = {
  // Sprint 1 — Dashboard
  'stats-schema':       ['stats schema', 'skips per key', 'healthbreak-history', '30-day history', 'history schema', 'extend.*stats', 'stats.*extend'],
  'stats-migration':    ['stats migration', 'migration logic', 'backward compat', 'localStorage.*migrat'],
  'ipc-dashboard':      ['open-dashboard', 'shell.openexternal', 'ipc.*dashboard', 'dashboard.*ipc'],
  'ui-stats-btn':       ['stats button', 'stats btn', 'thống kê btn', 'statistics.*btn', 'open.*dashboard.*btn'],
  'dashboard-template': ['dashboard template', 'self-contained html', 'embedded.*json.*data', 'html.*template.*dashboard'],
  'chart-water':        ['chart.*water', 'water.*chart', 'water intake.*chart', 'water.*bar.*chart'],
  'chart-eyes':         ['chart.*eyes', 'eye.*chart', 'eye rest.*chart', 'eyes.*bar.*chart'],
  'chart-move':         ['chart.*move', 'move.*chart', 'exercise chart', 'move.*bar.*chart'],
  'chart-skiprate':     ['skip rate', 'skiprate', 'skip.*rate.*section', 'chart.*skip'],
  'chart-toggle':       ['day toggle', 'time range toggle', '7.*day.*30.*day', 'range toggle', 'chart.*toggle'],
  'dashboard-i18n':     ['dashboard.*i18n', 'dashboard.*locale', 'dashboard.*locali', 'dashboard.*lang'],

  // Sprint 2 — Firebase & SSO
  'firebase-setup':     ['firebase setup', 'firebase project', 'firestore rules', 'firebase.*init', 'setup.*firebase'],
  'oauth-flow':         ['oauth', 'google.*auth', 'setasdefaultprotocolclient', 'open-url.*event', 'custom.*uri.*scheme', 'healthbreak://'],
  'auth-ui':            ['auth ui', 'login ui', 'sign in.*ui', 'offline.*badge', 'online.*badge', 'login.*button'],
  'token-storage':      ['safestorage', 'token storage', 'encrypt.*token', 'userdata.*token', 'secure.*token'],
  'mode-switch':        ['mode switch', 'online.*offline.*switch', 'switch.*mode', 'online mode.*logic'],
  'settings-sync':      ['settings.*sync', 'sync.*settings', 'firestore.*settings', 'write.*firestore.*settings'],
  'settings-restore':   ['restore.*settings', 'settings.*restore', 'load.*firestore', 'firestore.*load.*settings'],
  'migration-dialog':   ['migration dialog', 'local data.*dialog', 'sync.*dialog', 'first.*login.*dialog', 'merge.*local.*data'],

  // Sprint 3 — Community & Admin
  'stats-sync':         ['stats.*sync', 'sync.*stats', 'history.*firestore', 'upload.*history', 'firestore.*history'],
  'analytics-agg':      ['analytics.*aggregate', 'daily aggregate', 'fieldvalue.*increment', 'dau.*increment', 'analytics.*daily'],
  'feedback-ui':        ['feedback.*ui', 'feedback.*form', 'feedback.*input', 'feedback.*modal', 'in-app.*feedback'],
  'feedback-firestore': ['feedback.*firestore', 'feedback.*collection', 'submit.*feedback', 'send.*feedback', 'write.*feedback'],
  'account-ui':         ['account.*ui', 'account.*settings', 'account.*page', 'user.*profile.*ui', 'profile.*page'],
  'account-delete':     ['account.*delete', 'delete.*account', 'remove.*account', 'firebase.*delete.*user', 'delete.*firestore.*user'],
  'privacy-notice':     ['privacy.*notice', 'privacy.*policy', 'privacy.*onboarding', 'data.*notice'],
  'online-polish':      ['online.*polish', 'online.*ux', 'avatar.*header', 'mode.*indicator', 'sync.*status.*toast'],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getRecentCommits() {
  try {
    const out = execSync('git log --oneline -15', { cwd: ROOT, encoding: 'utf8' })
    return out.trim().split('\n').filter(Boolean).map(line => {
      const spaceIdx = line.indexOf(' ')
      return {
        hash:    line.slice(0, spaceIdx),
        message: line.slice(spaceIdx + 1).toLowerCase(),
      }
    })
  } catch {
    return []
  }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function matchesAny(message, phrases) {
  return phrases.some(phrase => {
    // Support simple regex-like patterns with .*
    const regex = new RegExp(phrase.replace(/\.\*/g, '.*'), 'i')
    return regex.test(message)
  })
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const commits = getRecentCommits()
  if (!commits.length) {
    process.exit(0)
  }

  if (!fs.existsSync(ROADMAP)) {
    process.exit(0)
  }

  let content = fs.readFileSync(ROADMAP, 'utf8')
  let changed  = false
  const completed = []  // { taskId, desc, hash }

  // Find all unchecked tasks still in the file
  const uncheckedRegex = /- \[ \] `([^`]+)` — (.+)/g
  let match
  while ((match = uncheckedRegex.exec(content)) !== null) {
    const taskId  = match[1]
    const taskDesc = match[2]
    const keywords = TASK_MAP[taskId]
    if (!keywords) continue

    const matchedCommit = commits.find(c => matchesAny(c.message, keywords))
    if (!matchedCommit) continue

    // Mark [x]
    content = content.replace(
      `- [ ] \`${taskId}\` — ${taskDesc}`,
      `- [x] \`${taskId}\` — ${taskDesc}`
    )
    completed.push({ taskId, desc: taskDesc, hash: matchedCommit.hash })
    changed = true
  }

  if (!changed) {
    process.exit(0)
  }

  // ── Update Completed table ────────────────────────────────────────────────
  for (const { taskId, desc, hash } of completed) {
    const newRow = `| \`${taskId}\` | ${desc} | \`${hash}\` | ${today()} |`
    if (content.includes('| — | — | — | — |')) {
      // Replace placeholder with first real row
      content = content.replace('| — | — | — | — |', newRow)
    } else {
      // Append before the end of the file
      content = content.trimEnd() + '\n' + newRow + '\n'
    }
  }

  // ── Recalculate overall progress ─────────────────────────────────────────
  const totalChecked = (content.match(/- \[x\]/g) || []).length
  const totalTasks   = (content.match(/- \[[x ~]\]/g) || []).length

  const pct = totalTasks ? Math.round(totalChecked / totalTasks * 100) : 0

  content = content.replace(
    /\*\*Overall progress:\*\* \d+ \/ \d+ tasks \(\d+%\)/,
    `**Overall progress:** ${totalChecked} / ${totalTasks} tasks (${pct}%)`
  )

  // ── Recalculate per-sprint progress ──────────────────────────────────────
  const sprints = [
    { label: 'Sprint 1',  totalExpected: 11 },
    { label: 'Sprint 2',  totalExpected: 8  },
    { label: 'Sprint 3',  totalExpected: 8  },
  ]
  for (const sprint of sprints) {
    const sprintStart = content.indexOf(`## ${sprint.label}`)
    if (sprintStart === -1) continue
    const nextSprint = content.indexOf('\n## ', sprintStart + 1)
    const sprintContent = nextSprint === -1
      ? content.slice(sprintStart)
      : content.slice(sprintStart, nextSprint)

    const doneInSprint = (sprintContent.match(/- \[x\]/g) || []).length

    content = content.replace(
      new RegExp(`(## ${sprint.label}[\\s\\S]*?\\n\\*\\*Progress:\\*\\* )\\d+ \\/ \\d+ tasks`),
      `$1${doneInSprint} / ${sprint.totalExpected} tasks`
    )
  }

  // ── Update Last updated ───────────────────────────────────────────────────
  content = content.replace(
    /\*\*Last updated:\*\* .+/,
    `**Last updated:** ${today()}`
  )

  fs.writeFileSync(ROADMAP, content, 'utf8')
  console.log(`[update-roadmap] ${totalChecked}/${totalTasks} tasks (${pct}%) — marked ${completed.length} new: ${completed.map(c => c.taskId).join(', ')}`)
}

main()
