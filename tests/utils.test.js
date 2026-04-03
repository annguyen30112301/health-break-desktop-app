'use strict'

const {
  calcWaterGoal,
  formatTime,
  calcSuggestedWaterInterval,
  clampInterval,
  parseStats,
} = require('../src/utils')

// ── calcWaterGoal ────────────────────────────────────────────────────────────

describe('calcWaterGoal', () => {
  it('calculates correct dailyGoal, sessions and mlPerSession for average person (70kg)', () => {
    const result = calcWaterGoal(170, 70)
    expect(result.dailyGoal).toBe(2450)
    expect(result.sessions).toBe(10)
    expect(result.mlPerSession).toBe(245)
  })

  it('stores height and weight in result', () => {
    const result = calcWaterGoal(165, 55)
    expect(result.height).toBe(165)
    expect(result.weight).toBe(55)
  })

  it('rounds daily goal to nearest 50ml', () => {
    // 60 * 35 = 2100, 2100/50=42, round=42, *50=2100
    const result = calcWaterGoal(170, 60)
    expect(result.dailyGoal % 50).toBe(0)
  })

  it('ensures sessions is at least 1 for very low weight', () => {
    // 5 * 35 = 175, 175/50=3.5, round=4, *50=200 → sessions=max(1, round(200/250))=max(1,1)=1
    const result = calcWaterGoal(150, 5)
    expect(result.sessions).toBeGreaterThanOrEqual(1)
  })

  it('calculates correctly for minimum valid weight (30kg)', () => {
    // 30*35=1050, 1050/50=21, round=21, *50=1050
    const result = calcWaterGoal(150, 30)
    expect(result.dailyGoal).toBe(1050)
    expect(result.sessions).toBe(Math.max(1, Math.round(1050 / 250)))
  })

  it('calculates correctly for maximum valid weight (200kg)', () => {
    // 200*35=7000, 7000/50=140, *50=7000
    const result = calcWaterGoal(180, 200)
    expect(result.dailyGoal).toBe(7000)
    expect(result.sessions).toBe(28)
    expect(result.mlPerSession).toBe(250)
  })

  it('mlPerSession is always a rounded integer', () => {
    const result = calcWaterGoal(170, 73)
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
  const today = '2026-04-03'

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
    const stale = JSON.stringify({ date: '2026-04-01', water: 3, move: 2, eyes: 5 })
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
