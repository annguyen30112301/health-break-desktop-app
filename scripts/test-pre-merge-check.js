'use strict';
// Test runner cho isMergeCommand — chạy độc lập, không qua hook

// Copy nguyên hàm từ pre-merge-check.js
function isMergeCommand(fullCmd) {
  const subCmds = fullCmd.split(/\s*(?:&&|\|\||;)\s*/)
  return subCmds.some(sub => {
    const trimmed = sub.trim()
    return (
      /^git\s+merge\s+[a-zA-Z0-9][a-zA-Z0-9/_.-]*(?:\s+--?\S+)*\s*$/.test(trimmed) ||
      /^gh\s+pr\s+merge\s+\d+/.test(trimmed) ||
      /^git\s+push(?:\s+[a-zA-Z0-9_.-]+)?\s+(?:main|master)\b/.test(trimmed)
    )
  })
}

const cases = [
  // ── Phải BLOCK ──────────────────────────────────────────────────────────────
  ['git merge feat/sprint2-firebase',                                      true],
  ['git merge feature --no-ff',                                            true],
  ['git merge feature --squash --no-commit',                               true],
  ['gh pr merge 30 --squash',                                              true],
  ['gh pr merge 30',                                                       true],
  ['git push origin main',                                                 true],
  ['git push main',                                                        true],
  ['cd repo && git merge feature',                                         true],
  ['git tag v1.0.3 && git push origin main && git push origin v1.0.3',   true],

  // ── Phải ALLOW ──────────────────────────────────────────────────────────────
  ['git push',                                                             false],
  ['git push origin feat/sprint2-firebase',                               false],
  ['git push origin v1.0.3',                                              false],
  // commit message chứa "git push main" bên trong -m "..."
  ['git add . && git commit -m "fix: note git push main" && git push',   false],
  // node -e với && bên trong string — "git merge" sau && nhưng theo sau là data literal chars
  ["git merge feature', true]",                                           false],
  ['git status',                                                           false],
  ['git log main..HEAD --oneline',                                        false],
  ['git checkout main',                                                    false],
  ['git pull origin main',                                                 false],
  ['git add . && git commit -m "msg" && git push origin feat/branch',    false],
]

let pass = 0, fail = 0
cases.forEach(([cmd, expected]) => {
  const got = isMergeCommand(cmd)
  const ok  = got === expected
  const label = expected ? 'BLOCK' : 'ALLOW'
  console.log((ok ? '✅' : '❌') + ' ' + label + ' | ' + cmd.slice(0, 70))
  ok ? pass++ : fail++
})
console.log(`\nKết quả: ${pass}/${cases.length} passed${fail > 0 ? ` — ${fail} FAILED` : ''}`)
process.exit(fail > 0 ? 1 : 0)
