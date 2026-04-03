'use strict';

// ── Firebase configuration template ──────────────────────────────────────────
// Copy this file to src/firebase-config.js and fill in your values.
// Get these from: Firebase Console → Project Settings → Your Apps → SDK setup
//
// src/firebase-config.js is gitignored — never commit real API keys.
// ──────────────────────────────────────────────────────────────────────────────

module.exports = {
  firebase: {
    apiKey:            'YOUR_API_KEY',
    authDomain:        'YOUR_PROJECT_ID.firebaseapp.com',
    projectId:         'YOUR_PROJECT_ID',
    storageBucket:     'YOUR_PROJECT_ID.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId:             'YOUR_APP_ID',
  },

  // Google OAuth client ID (Desktop app type — no secret needed with PKCE)
  // Get from: Google Cloud Console → APIs & Services → Credentials → Create OAuth Client → Desktop app
  googleClientId: 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com',
};
