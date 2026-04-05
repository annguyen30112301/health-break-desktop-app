'use strict';

// Notarization hook for electron-builder (afterSign).
// Called automatically during `npm run build:mac` when env vars are set.
//
// Required environment variables:
//   APPLE_ID            — your Apple ID email (e.g. dev@example.com)
//   APPLE_APP_SPECIFIC_PASSWORD — App-Specific Password from appleid.apple.com
//   APPLE_TEAM_ID       — your 10-char Team ID from developer.apple.com
//
// If any of these are missing the step is silently skipped (useful for local
// unsigned builds that don't need notarization).

const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;

  const appleId       = process.env.APPLE_ID;
  const password      = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId        = process.env.APPLE_TEAM_ID;

  if (!appleId || !password || !teamId) {
    console.log('Notarization skipped — APPLE_ID / APPLE_APP_SPECIFIC_PASSWORD / APPLE_TEAM_ID not set');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appPath}…`);
  await notarize({
    appPath,
    appleId,
    appleIdPassword: password,
    teamId,
  });
  console.log('Notarization complete.');
};
