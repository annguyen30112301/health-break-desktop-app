'use strict'

// Calculate daily water goal from weight and height.
// dailyGoal = nearest 50ml of (weightKg * 35ml/kg)
// sessions  = max(1, round(dailyGoal / 250))
// mlPerSession = round(dailyGoal / sessions)
function calcWaterGoal(heightCm, weightKg) {
  const dailyGoal    = Math.round(weightKg * 35 / 50) * 50
  const sessions     = Math.max(1, Math.round(dailyGoal / 250))
  const mlPerSession = Math.round(dailyGoal / sessions)
  return { height: heightCm, weight: weightKg, dailyGoal, sessions, mlPerSession }
}

// Format seconds to "MM:SS"
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Suggest a water interval in minutes: spread sessions over 16 active hours, clamped to limits
function calcSuggestedWaterInterval(sessions, limits) {
  const suggested = Math.round(16 * 60 / sessions)
  return Math.min(Math.max(suggested, limits.min), limits.max)
}

// Clamp and round a minute value to [limits.min, limits.max]
function clampInterval(minutes, limits) {
  return Math.min(Math.max(Math.round(minutes), limits.min), limits.max)
}

// Parse raw stats JSON string. Returns default empty stats if missing, corrupt, or stale date.
function parseStats(raw, today) {
  const empty = { date: today, water: 0, move: 0, eyes: 0 }
  try {
    if (!raw) return empty
    const s = JSON.parse(raw)
    if (s.date !== today) return empty
    return s
  } catch { return empty }
}

// Parse raw history JSON string. Returns array of up to 30 daily entries.
// Each entry: { date, water:{confirms,skips,intervalMin}, move:{...}, eyes:{...} }
function parseHistory(raw) {
  try {
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
  } catch { return [] }
}

// Append today's stats entry to history array, drop entries older than 30 days.
// todayEntry: { date, water:{confirms,skips,intervalMin}, move:{...}, eyes:{...} }
function appendToHistory(history, todayEntry) {
  const filtered = history.filter(e => e.date !== todayEntry.date)
  const updated  = [...filtered, todayEntry]
  return updated.slice(-30)
}

module.exports = { calcWaterGoal, formatTime, calcSuggestedWaterInterval, clampInterval, parseStats, parseHistory, appendToHistory }
