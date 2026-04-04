'use strict'

const crypto = require('crypto')
const {
  generatePKCE,
  buildGoogleAuthUrl,
  parseCallbackUrl,
} = require('../src/auth')

// ── generatePKCE ──────────────────────────────────────────────────────────────

describe('generatePKCE', () => {
  it('returns codeVerifier, codeChallenge, and state', () => {
    const pkce = generatePKCE()
    expect(pkce).toHaveProperty('codeVerifier')
    expect(pkce).toHaveProperty('codeChallenge')
    expect(pkce).toHaveProperty('state')
  })

  it('verifier is at least 43 characters long', () => {
    const { codeVerifier } = generatePKCE()
    // RFC 7636 requires verifier of 43–128 chars
    expect(codeVerifier.length).toBeGreaterThanOrEqual(43)
  })

  it('verifier contains only base64url characters', () => {
    const { codeVerifier } = generatePKCE()
    expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('codeChallenge is the SHA-256 hash of codeVerifier (base64url)', () => {
    const { codeVerifier, codeChallenge } = generatePKCE()
    const expected = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
    expect(codeChallenge).toBe(expected)
  })

  it('state contains only base64url characters', () => {
    const { state } = generatePKCE()
    expect(state).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('produces unique codeVerifiers on each call', () => {
    const verifiers = new Set(Array.from({ length: 10 }, () => generatePKCE().codeVerifier))
    expect(verifiers.size).toBe(10)
  })

  it('produces unique states on each call', () => {
    const states = new Set(Array.from({ length: 10 }, () => generatePKCE().state))
    expect(states.size).toBe(10)
  })

  it('codeVerifier and codeChallenge are different strings', () => {
    const { codeVerifier, codeChallenge } = generatePKCE()
    expect(codeVerifier).not.toBe(codeChallenge)
  })
})

// ── buildGoogleAuthUrl ────────────────────────────────────────────────────────

describe('buildGoogleAuthUrl', () => {
  const CLIENT_ID    = 'test-client-id.apps.googleusercontent.com'
  const CHALLENGE    = 'abc123challenge'
  const STATE        = 'random-state-token'
  const REDIRECT_URI = 'http://127.0.0.1:12345'

  let url
  let params

  beforeEach(() => {
    url    = buildGoogleAuthUrl(CLIENT_ID, CHALLENGE, STATE, REDIRECT_URI)
    params = new URL(url).searchParams
  })

  it('uses accounts.google.com as base URL', () => {
    expect(url).toMatch(/^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth/)
  })

  it('includes client_id', () => {
    expect(params.get('client_id')).toBe(CLIENT_ID)
  })

  it('includes redirect_uri matching the argument', () => {
    expect(params.get('redirect_uri')).toBe(REDIRECT_URI)
  })

  it('includes code_challenge matching the argument', () => {
    expect(params.get('code_challenge')).toBe(CHALLENGE)
  })

  it('sets code_challenge_method to S256', () => {
    expect(params.get('code_challenge_method')).toBe('S256')
  })

  it('includes state matching the argument', () => {
    expect(params.get('state')).toBe(STATE)
  })

  it('sets response_type to code', () => {
    expect(params.get('response_type')).toBe('code')
  })

  it('requests offline access', () => {
    expect(params.get('access_type')).toBe('offline')
  })

  it('includes openid in scope', () => {
    expect(params.get('scope')).toContain('openid')
  })

  it('includes email in scope', () => {
    expect(params.get('scope')).toContain('email')
  })

  it('returns a parseable URL', () => {
    expect(() => new URL(url)).not.toThrow()
  })
})

// ── parseCallbackUrl ──────────────────────────────────────────────────────────

describe('parseCallbackUrl', () => {
  it('returns { code, state } for a valid callback URL', () => {
    const url = 'healthbreak://oauth/callback?code=auth-code-123&state=csrf-state'
    expect(parseCallbackUrl(url)).toEqual({ code: 'auth-code-123', state: 'csrf-state' })
  })

  it('returns { error } when error param is present', () => {
    const url = 'healthbreak://oauth/callback?error=access_denied&state=csrf-state'
    expect(parseCallbackUrl(url)).toEqual({ error: 'access_denied' })
  })

  it('returns null when code param is missing', () => {
    const url = 'healthbreak://oauth/callback?state=csrf-state'
    expect(parseCallbackUrl(url)).toBeNull()
  })

  it('returns null when state param is missing', () => {
    const url = 'healthbreak://oauth/callback?code=auth-code-123'
    expect(parseCallbackUrl(url)).toBeNull()
  })

  it('returns null for a malformed URL', () => {
    expect(parseCallbackUrl('not a url at all')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(parseCallbackUrl('')).toBeNull()
  })

  it('returns null for null input', () => {
    expect(parseCallbackUrl(null)).toBeNull()
  })

  it('returns null when both code and state are empty strings', () => {
    const url = 'healthbreak://oauth/callback?code=&state='
    expect(parseCallbackUrl(url)).toBeNull()
  })

  it('error param takes precedence over code param', () => {
    const url = 'healthbreak://oauth/callback?code=some-code&error=access_denied&state=s'
    const result = parseCallbackUrl(url)
    expect(result).toEqual({ error: 'access_denied' })
  })

  it('works with http loopback redirect URLs (used by loopback server)', () => {
    const url = 'healthbreak://oauth/callback?code=loopback-code&state=loopback-state'
    const result = parseCallbackUrl(url)
    expect(result).toEqual({ code: 'loopback-code', state: 'loopback-state' })
  })
})
