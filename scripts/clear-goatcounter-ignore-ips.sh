#!/usr/bin/env bash
# One-shot: clear Ignore IPs on musavvir-info so Visit counter hits land.
# Diagnose signal: curl -sSI shows  x-goatcounter: ignored because "…" is in the IP ignore list
set -euo pipefail

echo
echo "  Clear Ignore IPs on musavvir-info"
echo "  (hits were returning 202 but discarded — dashboard stays empty)"
echo
echo "  ↗ opening https://musavvir-info.goatcounter.com/settings/main#section-tracking"
if command -v open >/dev/null 2>&1; then open "https://musavvir-info.goatcounter.com/settings/main#section-tracking"
elif command -v xdg-open >/dev/null 2>&1; then xdg-open "https://musavvir-info.goatcounter.com/settings/main#section-tracking"
fi
echo
echo "  • Settings → Tracking → Ignore IPs"
echo "  • Delete every IP in the list"
echo "  • Save"
echo
read -r -p "  Ignore IPs cleared and saved? " _

echo
echo "  Verifying count is no longer ignored…"
hdr=$(curl -sS -D - -o /dev/null -X POST \
  'https://musavvir-info.goatcounter.com/count?p=%2Fverify-after-clear&t=verify&s=1280&b=200&rnd=v1' \
  -H 'Origin: https://musavvir.info' \
  -H 'Referer: https://musavvir.info/' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36')

if printf '%s' "$hdr" | grep -qi 'x-goatcounter:.*ignored'; then
  echo "  ✗ Still ignored:"
  printf '%s\n' "$hdr" | grep -i 'x-goatcounter' || true
  echo "  Clear Ignore IPs again, Save, then re-run: $0"
  exit 1
fi

echo "  ✓ Count accepted (no x-goatcounter ignore header)."
echo "  Refresh https://musavvir-info.goatcounter.com — you should see /verify-after-clear"
echo "  Prefer https://musavvir.info#toggle-goatcounter for self-exclusion going forward."
echo
