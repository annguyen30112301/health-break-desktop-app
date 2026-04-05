#!/bin/bash
# HealthBreak — macOS Gatekeeper helper
# Double-click this script if macOS says "app is damaged" or prevents opening.
# It removes the quarantine flag that macOS adds to files downloaded from the internet.

APP="/Applications/HealthBreak.app"

if [ ! -d "$APP" ]; then
  echo "HealthBreak.app not found in /Applications."
  echo "Please drag HealthBreak.app to /Applications first, then run this script."
  read -p "Press Enter to close..."
  exit 1
fi

echo "Removing macOS quarantine flag from HealthBreak..."
xattr -rd com.apple.quarantine "$APP"

if [ $? -eq 0 ]; then
  echo "Done! Launching HealthBreak..."
  open "$APP"
else
  echo ""
  echo "If you see a permission error, run this command in Terminal:"
  echo "  sudo xattr -rd com.apple.quarantine \"$APP\""
fi

read -p "Press Enter to close..."
