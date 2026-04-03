'use strict'

const {
  calcWaterGoal,
  formatTime,
  calcSuggestedWaterInterval,
  clampInterval,
  parseStats,
  parseHistory,
  appendToHistory,
} = require('../src/utils')

// ── calcWaterGoal ────────────────────────────────────────────────────────────

describe('calcWaterGoal', () => {
  it('calculates correct dailyGoal, sessions and mlPerSession for average person (70kg)', () => {
    const result = calcWaterGoal(70)
    expect(result.dailyGoal).toBe(2450)
    expect(result.sessions).toBe(10)
    expect(result.mlPerSession).toBe(245)
  })

  it('stores weight in result', () => {
    const result = calcWaterGoal(55)
    expect(result.weight).toBe(55)
  })

  it('rounds daily goal to nearest 50ml', () => {
    // 60 * 35 = 2100, 2100/50=42, round=42, *50=2100
    const result = calcWaterGoal(60)
    expect(result.dailyGoal % 50).toBe(0)
  })

  it('ensures sessions is at least 1 for very low weight', () => {
    // 5 * 35 = 175, 175/50=3.5, round=4, *50=200 → sessions=max(1, round(200/250))=max(1,1)=1
    const result = calcWaterGoal(5)
    expect(result.sessions).toBeGreaterThanOrEqual(1)
  })

  it('calculates correctly for minimum valid weight (30kg)', () => {
    // 30*35=1050, 1050/50=21, round=21, *50=1050
    const result = calcWaterGoal(30)
    expect(result.dailyGoal).toBe(1050)
    expect(result.sessions).toBe(Math.max(1, Math.round(1050 / 250)))
  })

  it('calculates correctly for maximum valid weight (200kg)', () => {
    // 200*35=7000, 7000/50=140, *50=7000
    const result = calcWaterGoal(200)
    expect(result.dailyGoal).toBe(7000)
    expect(result.sessions).toBe(28)
    expect(result.mlPerSession).toBe(250)
  })

  it('mlPerSession is always a rounded integer', () => {
    const result = calcWaterGoal(73)
    expect(Number.isInteger(result.mlPerSession)).toBe(true)
  })
})

// ── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats 60 seconds as 01:00', () => {
    expect(formatTime(60)).toBe('01:00')
  })

  it('formats 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30')
  })

  it('formats 1800 seconds (30 min) as 30:00', () => {
    expect(formatTime(1800)).toBe('30:00')
  })

  it('formats 3600 seconds (60 min) as 60:00', () => {
    expect(formatTime(3600)).toBe('60:00')
  })

  it('pads single-digit seconds with leading zero', () => {
    expect(formatTime(9)).toBe('00:09')
  })

  it('pads single-digit minutes with leading zero', () => {
    expect(formatTime(60 + 5)).toBe('01:05')
  })

  it('handles large values correctly', () => {
    // 5400 = 90 min
    expect(formatTime(5400)).toBe('90:00')
  })
})

// ── calcSuggestedWaterInterval ────────────────────────────────────────────────

describe('calcSuggestedWaterInterval', () => {
  const limits = { min: 20, max: 60 }

  it('returns clamped max when sessions is 1 (too long interval)', () => {
    // 16*60/1 = 960 min → clamped to 60
    expect(calcSuggestedWaterInterval(1, limits)).toBe(60)
  })

  it('returns clamped min when sessions is very high (too short interval)', () => {
    // 16*60/100 = 9.6 min → clamped to 20
    expect(calcSuggestedWaterInterval(100, limits)).toBe(20)
  })

  it('returns in-range value for normal sessions count', () => {
    // 16*60/32 = 30 min → within 20–60
    expect(calcSuggestedWaterInterval(32, limits)).toBe(30)
  })

  it('returns exactly min when suggested equals min', () => {
    // 16*60/48 = 20 min → exactly 20
    expect(calcSuggestedWaterInterval(48, limits)).toBe(20)
  })

  it('returns exactly max when suggested equals max', () => {
    // 16*60/16 = 60 min → exactly 60
    expect(calcSuggestedWaterInterval(16, limits)).toBe(60)
  })

  it('respects different limits', () => {
    const strictLimits = { min: 25, max: 45 }
    // 16*60/1 = 960 → clamped to 45
    expect(calcSuggestedWaterInterval(1, strictLimits)).toBe(45)
    // 16*60/100 = 9.6 → clamped to 25
    expect(calcSuggestedWaterInterval(100, strictLimits)).toBe(25)
  })
})

// ── clampInterval ─────────────────────────────────────────────────────────────

describe('clampInterval', () => {
  const waterLimits = { min: 20, max: 60 }

  it('returns value unchanged when within range', () => {
    expect(clampInterval(30, waterLimits)).toBe(30)
  })

  it('clamps to min when value is below min', () => {
    expect(clampInterval(5, waterLimits)).toBe(20)
  })

  it('clamps to max when value is above max', () => {
    expect(clampInterval(90, waterLimits)).toBe(60)
  })

  it('rounds float to nearest integer before clamping', () => {
    expect(clampInterval(19.7, waterLimits)).toBe(20)
    expect(clampInterval(20.4, waterLimits)).toBe(20)
  })

  it('works correctly for move limits (45–90)', () => {
    const moveLimits = { min: 45, max: 90 }
    expect(clampInterval(30, moveLimits)).toBe(45)
    expect(clampInterval(100, moveLimits)).toBe(90)
    expect(clampInterval(60, moveLimits)).toBe(60)
  })

  it('works correctly for eyes limits (15–30)', () => {
    const eyesLimits = { min: 15, max: 30 }
    expect(clampInterval(10, eyesLimits)).toBe(15)
    expect(clampInterval(40, eyesLimits)).toBe(30)
    expect(clampInterval(20, eyesLimits)).toBe(20)
  })
})

// ── parseStats ───────────────────────────────────────────────────────────────

describe('parseStats', () => {
  // Use a fixed date string independent of when tests run
  const today = '2100-01-01'

  it('returns zeroed stats when raw is null', () => {
    const result = parseStats(null, today)
    expect(result).toEqual({ date: today, water: 0, move: 0, eyes: 0 })
  })

  it('returns zeroed stats when raw is empty string', () => {
    const result = parseStats('', today)
    expect(result).toEqual({ date: today, water: 0, move: 0, eyes: 0 })
  })

  it('returns zeroed stats when JSON is corrupt', () => {
    const result = parseStats('not-valid-json{{{', today)
    expect(result).toEqual({ date: today, water: 0, move: 0, eyes: 0 })
  })

  it('returns zeroed stats when stored date is different from today (stale)', () => {
    const stale = JSON.stringify({ date: '2099-12-31', water: 3, move: 2, eyes: 5 })
    const result = parseStats(stale, today)
    expect(result).toEqual({ date: today, water: 0, move: 0, eyes: 0 })
  })

  it('returns stored stats when date matches today', () => {
    const stored = JSON.stringify({ date: today, water: 3, move: 1, eyes: 2 })
    const result = parseStats(stored, today)
    expect(result).toEqual({ date: today, water: 3, move: 1, eyes: 2 })
  })

  it('returns zeroed stats with correct date when raw is undefined', () => {
    const result = parseStats(undefined, today)
    expect(result.date).toBe(today)
    expect(result.water).toBe(0)
  })
})

// ── parseHistory ──────────────────────────────────────────────────────────────

describe('parseHistory', () => {
  it('returns empty array when raw is null', () => {
    expect(parseHistory(null)).toEqual([])
  })

  it('returns empty array when raw is empty string', () => {
    expect(parseHistory('')).toEqual([])
  })

  it('returns empty array when JSON is corrupt', () => {
    expect(parseHistory('not-json{{{')).toEqual([])
  })

  it('returns empty array when parsed value is not an array', () => {
    expect(parseHistory('{"date":"2100-01-01"}')).toEqual([])
  })

  it('returns parsed array for valid history JSON', () => {
    const entry = { date: '2100-01-01', water: { confirms: 3, skips: 1, intervalMin: 30 }, move: { confirms: 1, skips: 0, intervalMin: 60 }, eyes: { confirms: 5, skips: 2, intervalMin: 20 } }
    expect(parseHistory(JSON.stringify([entry]))).toEqual([entry])
  })
})

// ── appendToHistory ───────────────────────────────────────────────────────────

describe('appendToHistory', () => {
  const makeEntry = (date) => ({
    date,
    water: { confirms: 1, skips: 0, intervalMin: 30 },
    move:  { confirms: 1, skips: 0, intervalMin: 60 },
    eyes:  { confirms: 1, skips: 0, intervalMin: 20 },
  })

  it('appends a new entry to empty history', () => {
    const result = appendToHistory([], makeEntry('2100-01-01'))
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2100-01-01')
  })

  it('replaces existing entry for same date', () => {
    const old = makeEntry('2100-01-01')
    old.water.confirms = 1
    const updated = { ...makeEntry('2100-01-01'), water: { confirms: 5, skips: 1, intervalMin: 30 } }
    const result = appendToHistory([old], updated)
    expect(result).toHaveLength(1)
    expect(result[0].water.confirms).toBe(5)
  })

  it('keeps entries from different dates', () => {
    const history = [makeEntry('2099-12-30'), makeEntry('2099-12-31')]
    const result = appendToHistory(history, makeEntry('2100-01-01'))
    expect(result).toHaveLength(3)
  })

  it('drops oldest entries when history exceeds 30 days', () => {
    const history = Array.from({ length: 30 }, (_, i) => {
      const d = new Date('2099-12-01')
      d.setDate(d.getDate() + i)
      return makeEntry(d.toISOString().slice(0, 10))
    })
    const result = appendToHistory(history, makeEntry('2100-01-01'))
    expect(result).toHaveLength(30)
    expect(result[result.length - 1].date).toBe('2100-01-01')
    expect(result[0].date).not.toBe('2099-12-01')
  })

  it('keeps up to 30 entries maximum', () => {
    const history = Array.from({ length: 35 }, (_, i) => {
      const d = new Date('2099-11-01')
      d.setDate(d.getDate() + i)
      return makeEntry(d.toISOString().slice(0, 10))
    })
    const result = appendToHistory(history, makeEntry('2100-01-01'))
    expect(result.length).toBeLessThanOrEqual(30)
  })
})
