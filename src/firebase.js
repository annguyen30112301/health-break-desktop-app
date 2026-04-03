'use strict';

// ── Firebase initialization ───────────────────────────────────────────────────
// This module is required from the renderer process (index.html).
// It initializes Firebase once and exports auth + Firestore instances.
//
// SETUP: copy src/firebase-config.example.js → src/firebase-config.js
//        and fill in your Firebase project credentials.
// ──────────────────────────────────────────────────────────────────────────────

const { initializeApp, getApps, getApp } = require('firebase/app')
const { getAuth, GoogleAuthProvider, signInWithCredential, signOut, onAuthStateChanged } = require('firebase/auth')
const { getFirestore, doc, getDoc, setDoc, serverTimestamp } = require('firebase/firestore')

let _config
try {
  _config = require('./firebase-config.js')
} catch {
  // firebase-config.js not set up yet — use placeholder config
  // The app runs in offline mode until credentials are configured.
  _config = {
    firebase: {
      apiKey: '', authDomain: '', projectId: '',
      storageBucket: '', messagingSenderId: '', appId: '',
    },
    googleClientId: '',
  }
}

const FIREBASE_CONFIG    = _config.firebase
const GOOGLE_CLIENT_ID   = _config.googleClientId
const IS_CONFIGURED      = !!FIREBASE_CONFIG.apiKey

// Initialize Firebase (guard against double-init across hot reloads)
let firebaseApp
try {
  firebaseApp = getApp()
} catch {
  if (IS_CONFIGURED) {
    firebaseApp = initializeApp(FIREBASE_CONFIG)
  }
}

const auth = IS_CONFIGURED ? getAuth(firebaseApp) : null
const db   = IS_CONFIGURED ? getFirestore(firebaseApp) : null

module.exports = {
  auth,
  db,
  IS_CONFIGURED,
  GOOGLE_CLIENT_ID,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
}
