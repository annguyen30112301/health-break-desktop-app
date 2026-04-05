'use strict'

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

/**
 * afterPack hook — runs after electron-builder packages the app but before signing.
 *
 * macOS 15 (Sequoia) adds com.apple.provenance to downloaded files, which codesign
 * treats as "detritus" and refuses to sign. xattr -cr cannot remove it.
 * Fix: use `ditto --noextattr` to recreate each binary file without any xattrs.
 */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)

  console.log(`  • afterPack: stripping xattrs (incl. com.apple.provenance) from ${appPath}`)

  // Collect all regular files (not symlinks) inside the app bundle
  const files = execSync(`find "${appPath}" -type f`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)

  for (const file of files) {
    const tmp = `${file}.__xattrclean__`
    try {
      // ditto --noextattr copies file content + permissions but drops ALL extended attributes
      execSync(`ditto --noextattr --norsrc "${file}" "${tmp}"`, { stdio: 'pipe' })
      fs.renameSync(tmp, file)
    } catch {
      // If ditto fails (e.g. on a binary with special attributes), fall back silently
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
    }
  }

  console.log(`  • afterPack: done (${files.length} files processed)`)
}
