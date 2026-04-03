'use strict';

/**
 * pre-merge-check.js
 *
 * PreToolUse hook — chặn lệnh merge/push nếu REVIEW_REPORT.md còn issue chưa giải quyết.
 *
 * Stdin: JSON { tool_name, tool_input: { command } }
 * Stdout: JSON { decision, reason } nếu block — hoặc không output gì nếu allow
 */

const fs   = require('fs')
const path = require('path')

// ── Đọc stdin ────────────────────────────────────────────────────────────────
let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => { raw += chunk })
process.stdin.on('end', () => {
  try {
    const input   = JSON.parse(raw || '{}')
    const command = (input.tool_input?.command || '').trim()

    // Chỉ xử lý lệnh liên quan đến merge / push lên remote
    if (!isMergeCommand(command)) {
      process.exit(0)  // allow
    }

    const result = checkReviewReport()
    if (result.block) {
      process.stdout.write(JSON.stringify({
        decision: 'block',
        reason:   result.message,
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: result.message,
        }
      }))
    }
    // Nếu không block → không output gì → allow
  } catch (e) {
    // Lỗi parse → không chặn (fail open)
  }
  process.exit(0)
})

// ── Phát hiện lệnh merge ─────────────────────────────────────────────────────
// Tách theo && / || / ; (KHÔNG tách theo \n để tránh split nội dung
// multi-line bên trong node -e "..." hay heredoc).
//
// Dùng pattern có anchor $ và charset hẹp cho branch name:
//   [a-zA-Z0-9][a-zA-Z0-9/_.-]*
// → loại bỏ false-positive khi "git merge feature', true]" xuất hiện
//   trong data literal sau khi split && bên trong string argument.
function isMergeCommand(fullCmd) {
  const subCmds = fullCmd.split(/\s*(?:&&|\|\||;)\s*/)

  return subCmds.some(sub => {
    const trimmed = sub.trim()
    return (
      // git merge <branch> [--flags]
      // Anchor $ bắt buộc: không match khi sau branch-name còn ', " , ] (data literal)
      /^git\s+merge\s+[a-zA-Z0-9][a-zA-Z0-9/_.-]*(?:\s+--?\S+)*\s*$/.test(trimmed) ||
      // gh pr merge <number> [flags]
      /^gh\s+pr\s+merge\s+\d+/.test(trimmed) ||
      // git push [remote] main|master — remote/branch chỉ có ký tự hợp lệ
      /^git\s+push(?:\s+[a-zA-Z0-9_.-]+)?\s+(?:main|master)\b/.test(trimmed)
    )
  })
}

// ── Kiểm tra REVIEW_REPORT.md ────────────────────────────────────────────────
function checkReviewReport() {
  const reportPath = path.join(process.cwd(), 'REVIEW_REPORT.md')

  // Không có report → chặn
  if (!fs.existsSync(reportPath)) {
    return {
      block: true,
      message: [
        '⛔ Merge bị chặn — chưa có code review.',
        '',
        'Chạy /review-code để tạo REVIEW_REPORT.md trước khi merge.',
      ].join('\n'),
    }
  }

  const content = fs.readFileSync(reportPath, 'utf8')

  // Tìm conflict markers còn sót trong report (báo có trong code)
  const hasConflictMarker = /<<<<<<< |>>>>>>> |^=======$/m.test(content)
  if (hasConflictMarker) {
    return {
      block: true,
      message: '⛔ Merge bị chặn — có conflict marker chưa được giải quyết.',
    }
  }

  // Đếm issue CRITICAL / HIGH chưa giải quyết (checkbox [ ])
  const criticalOpen = countOpenIssues(content, 'CRITICAL')
  const highOpen     = countOpenIssues(content, 'HIGH')

  if (criticalOpen > 0 || highOpen > 0) {
    const parts = []
    if (criticalOpen > 0) parts.push(`${criticalOpen} CRITICAL`)
    if (highOpen > 0)     parts.push(`${highOpen} HIGH`)

    return {
      block: true,
      message: [
        `⛔ Merge bị chặn — còn ${parts.join(' + ')} issue chưa giải quyết.`,
        '',
        'Xem REVIEW_REPORT.md, fix các issue, đánh [x] và chạy /review-code lại.',
      ].join('\n'),
    }
  }

  // Kiểm tra verdict line
  if (/BLOCKED/i.test(content) && !/APPROVED/i.test(content)) {
    return {
      block: true,
      message: '⛔ Merge bị chặn — REVIEW_REPORT.md có verdict BLOCKED. Fix issue và chạy /review-code lại.',
    }
  }

  // Tất cả OK
  return { block: false }
}

// ── Đếm issue chưa đóng theo section ─────────────────────────────────────────
function countOpenIssues(content, severity) {
  // Tìm section tương ứng (CRITICAL hoặc HIGH)
  const sectionRegex = new RegExp(
    `###\\s+[^\\n]*${severity}[^\\n]*\\n([\\s\\S]*?)(?=###|---\\s*$|$)`,
    'i'
  )
  const match = content.match(sectionRegex)
  if (!match) return 0

  const sectionText = match[1]
  // Đếm các checkbox chưa tick: "- [ ]"
  return (sectionText.match(/^- \[ \]/gm) || []).length
}
