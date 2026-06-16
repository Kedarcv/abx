#!/usr/bin/env bash
# Securely sets RESEND_API_KEY in .env and Vercel (production, preview, dev).
# Run: bash scripts/set-resend-key.sh
# It will prompt for the value (input hidden) so nothing ever ends up in shell history.
set -euo pipefail

echo "Paste your Resend API key (starts with re_…) and press Enter."
echo "(input is hidden; nothing prints to the screen)"
read -rs RESEND_API_KEY
echo
if [[ -z "$RESEND_API_KEY" ]]; then
  echo "No value provided. Aborting."; exit 1
fi
if [[ "$RESEND_API_KEY" != re_* ]]; then
  echo "Warning: doesn't look like a Resend key (expected re_… prefix). Continuing anyway."
fi

# 1) Local .env — replace any existing RESEND_API_KEY line, or append.
if grep -q '^RESEND_API_KEY=' .env 2>/dev/null; then
  # Use a delimiter unlikely to appear in keys
  tmp="$(mktemp)"
  awk -v k="$RESEND_API_KEY" 'BEGIN { OFS="=" }
    /^RESEND_API_KEY=/ { print "RESEND_API_KEY=" k; next }
    { print }' .env > "$tmp"
  mv "$tmp" .env
else
  echo "RESEND_API_KEY=$RESEND_API_KEY" >> .env
fi
echo "✓ Wrote to .env"

# 2) Vercel — rm + add in each environment.
for ENV in production preview development; do
  vercel env rm  RESEND_API_KEY "$ENV" --yes >/dev/null 2>&1 || true
  printf '%s' "$RESEND_API_KEY" | vercel env add RESEND_API_KEY "$ENV" >/dev/null 2>&1 || true
  echo "✓ Vercel $ENV updated"
done

unset RESEND_API_KEY
echo "Done. Run \`vercel deploy --prod --yes\` to pick up the new value."
