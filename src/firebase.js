'use strict';

// ── Firebase IPC proxy ────────────────────────────────────────────────────────
// Firebase SDK cannot load in Electron renderer — the renderer's module resolver
// picks ESM builds via the browser field, which cannot be CJS-required.
//
// Solution: Firebase runs in the main process (Node.js, no browser-field issue).
// All Firebase calls here are proxied over IPC to main.
// ──────────────────────────────────────────────────────────────────────────────

const { ipcRenderer } = require('electron')

// Read config synchronously — plain module with no Firebase SDK deps.
let _cfg = null
try { _cfg = require('./firebase-config.js') } catch {}

const IS_CONFIGURED    = !!_cfg?.firebase?.apiKey
const GOOGLE_CLIENT_ID = _cfg?.googleClientId || ''

// Opaque handles passed around in index.html as `auth` / `db`.
// All operations go through the IPC wrappers below — never inspected directly.
const auth = Object.freeze({ _proxy: 'auth' })
const db   = Object.freeze({ _proxy: 'db' })

// ── GoogleAuthProvider shim ───────────────────────────────────────────────────
const GoogleAuthProvider = {
  credential(idToken, accessToken) {
    return { _googleCredential: true, idToken, accessToken }
  },
}

// ── Auth operations ───────────────────────────────────────────────────────────

// Returns { uid, email } — use this instead of auth.currentUser after sign-in.
async function signInWithCredential(_auth, credential) {
  return ipcRenderer.invoke('firebase-sign-in', {
    idToken:     credential.idToken,
    accessToken: credential.accessToken,
  })
}

async function signOut(_auth) {
  return ipcRenderer.invoke('firebase-sign-out')
}

// Mirrors Firebase's onAuthStateChanged: callback receives user ({ uid, email }) or null.
// Main process pushes auth state via 'firebase-auth-state' IPC event.
function onAuthStateChanged(_auth, callback) {
  ipcRenderer.on('firebase-auth-state', (_event, user) => callback(user))
  return () => ipcRenderer.removeAllListeners('firebase-auth-state')
}

// ── Firestore operations ──────────────────────────────────────────────────────

function doc(_db, ...segments) {
  return { _proxy: 'doc-ref', path: segments.join('/') }
}

async function getDoc(ref) {
  const data = await ipcRenderer.invoke('firebase-get-doc', { path: ref.path })
  return {
    exists: () => data !== null && data !== undefined,
    data:   () => data,
  }
}

async function setDoc(ref, data, options) {
  return ipcRenderer.invoke('firebase-set-doc', {
    path:  ref.path,
    data,
    merge: !!(options && options.merge),
  })
}

// Returns a sentinel replaced by FieldValue.serverTimestamp() in main process.
function serverTimestamp() {
  return { __serverTimestamp: true }
}

module.exports = {
  auth, db, IS_CONFIGURED, GOOGLE_CLIENT_ID,
  GoogleAuthProvider, signInWithCredential, signOut, onAuthStateChanged,
  doc, getDoc, setDoc, serverTimestamp,
}
