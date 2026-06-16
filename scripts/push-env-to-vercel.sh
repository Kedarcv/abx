#!/usr/bin/env bash
# Push every non-empty env var from .env to all three Vercel environments.
# Idempotent — removes existing values first.
set -euo pipefail

ENV_FILE="${1:-.env}"

while IFS= read -r LINE || [ -n "$LINE" ]; do
  # Strip leading/trailing whitespace
  LINE="$(echo "$LINE" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  # Skip blank lines and comments
  [[ -z "$LINE" || "$LINE" == \#* ]] && continue
  # Must have an =
  [[ "$LINE" != *"="* ]] && continue

  KEY="${LINE%%=*}"
  VAL="${LINE#*=}"
  # Skip empty values
  [[ -z "$VAL" ]] && continue

  echo ">> $KEY"
  for ENV in production preview development; do
    vercel env rm  "$KEY" "$ENV" --yes >/dev/null 2>&1 || true
    printf '%s' "$VAL" | vercel env add "$KEY" "$ENV" >/dev/null 2>&1 || true
  done
done < "$ENV_FILE"

echo "Done."
