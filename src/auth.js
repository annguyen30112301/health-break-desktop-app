'use strict';

// ── PKCE OAuth utilities ──────────────────────────────────────────────────────
// Implements the Authorization Code + PKCE flow for Google OAuth in Electron.
// No client secret is required — this uses a Desktop-type OAuth client.
//
// Flow:
//  1. generatePKCE()             → { codeVerifier, codeChallenge }
//  2. buildGoogleAuthUrl(...)    → URL to open in system browser
//  3. User logs in; Google redirects to healthbreak://oauth/callback?code=xxx
//  4. exchangeCodeForTokens(...) → { access_token, id_token, ... }
//  5. Caller uses id_token to sign into Firebase
// ──────────────────────────────────────────────────────────────────────────────

const crypto = require('crypto')

const SCOPES = 'openid email profile'

// ── PKCE helpers ─────────────────────────────────────────────────────────────

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url')
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}

function generateState() {
  return crypto.randomBytes(16).toString('base64url')
}

/**
 * Returns { codeVerifier, codeChallenge, state } for one OAuth attempt.
 */
function generatePKCE() {
  const codeVerifier  = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state         = generateState()
  return { codeVerifier, codeChallenge, state }
}

// ── URL builder ───────────────────────────────────────────────────────────────

/**
 * Builds the Google OAuth2 authorization URL.
 * @param {string} clientId      - OAuth Desktop client ID from GCP
 * @param {string} codeChallenge - PKCE challenge (S256)
 * @param {string} state         - CSRF state token
 * @returns {string} URL to open in system browser
 */
function buildGoogleAuthUrl(clientId, codeChallenge, state, redirectUri) {
  const params = new URLSearchParams({
    client_id:             clientId,
    redirect_uri:          redirectUri,
    response_type:         'code',
    scope:                 SCOPES,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
    state,
    access_type:           'offline',
    prompt:                'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

// ── Token exchange ────────────────────────────────────────────────────────────

/**
 * Exchanges the authorization code for access + ID tokens.
 * Uses PKCE so no client_secret is required.
 * @returns {Promise<{ access_token, id_token, refresh_token, ... }>}
 */
async function exchangeCodeForTokens(code, codeVerifier, clientId, redirectUri, clientSecret) {
  const params = {
    code,
    client_id:     clientId,
    redirect_uri:  redirectUri,
    grant_type:    'authorization_code',
    code_verifier: codeVerifier,
  }
  if (clientSecret) params.client_secret = clientSecret
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error_description || data.error || `Token exchange failed (${response.status})`)
  }
  return data
}

// ── Callback URL parser ───────────────────────────────────────────────────────

/**
 * Parses a healthbreak://oauth/callback?code=xxx&state=yyy URL.
 * @returns {{ code: string, state: string } | { error: string } | null}
 */
function parseCallbackUrl(urlString) {
  try {
    const url    = new URL(urlString)
    const code   = url.searchParams.get('code')
    const state  = url.searchParams.get('state')
    const error  = url.searchParams.get('error')
    if (error) return { error }
    if (!code || !state) return null
    return { code, state }
  } catch {
    return null
  }
}

// ── Refresh token exchange ────────────────────────────────────────────────────

/**
 * Uses a refresh token to obtain a new id_token + access_token from Google.
 * Called on app launch to silently restore the session without re-prompting the user.
 * @returns {Promise<{ access_token: string, id_token: string }>}
 */
async function refreshAccessToken(refreshToken, clientId) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     clientId,
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error_description || data.error || `Token refresh failed (${response.status})`)
  }
  return data
}

module.exports = {
  generatePKCE,
  buildGoogleAuthUrl,
  exchangeCodeForTokens,
  parseCallbackUrl,
  refreshAccessToken,
}
