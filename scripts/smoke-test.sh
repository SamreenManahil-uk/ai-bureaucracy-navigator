#!/usr/bin/env bash

set -u

API="http://localhost:5000"
EMAIL="samreen@example.com"
PASSWORD="Password123"

PASS=0
FAIL=0

green() {
  printf "\033[32m%s\033[0m\n" "$1"
}

red() {
  printf "\033[31m%s\033[0m\n" "$1"
}

heading() {
  printf "\n\033[1m%s\033[0m\n" "$1"
}

check_status() {
  local name="$1"
  local expected="$2"
  local actual="$3"

  if [ "$actual" = "$expected" ]; then
    green "✓ $name"
    PASS=$((PASS + 1))
  else
    red "✗ $name — expected $expected, got $actual"
    FAIL=$((FAIL + 1))
  fi
}

heading "Navigator AI — Smoke Tests"

echo
echo "1. Checking backend health..."

HEALTH_CODE=$(curl -s \
  -o /tmp/navigator-health.json \
  -w "%{http_code}" \
  "$API/api/health")

check_status \
  "Backend health endpoint" \
  "200" \
  "$HEALTH_CODE"

if [ "$HEALTH_CODE" != "200" ]; then
  echo
  red "Backend is not available."
  echo "Start it with:"
  echo "cd ~/Desktop/Portfolio/ai-bureaucracy-navigator/backend && npm run dev"
  exit 1
fi

echo
echo "2. Testing login..."

LOGIN_RESPONSE=$(curl -s \
  -X POST \
  "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$EMAIL\",
    \"password\":\"$PASSWORD\"
  }")

TOKEN=$(printf "%s" "$LOGIN_RESPONSE" | node -e '
let data="";
process.stdin.on("data", d => data += d);
process.stdin.on("end", () => {
  try {
    const parsed = JSON.parse(data);
    process.stdout.write(parsed.token || "");
  } catch {
    process.stdout.write("");
  }
});
')

if [ -n "$TOKEN" ]; then
  green "✓ User login returned JWT"
  PASS=$((PASS + 1))
else
  red "✗ User login did not return JWT"
  printf "%s\n" "$LOGIN_RESPONSE"
  FAIL=$((FAIL + 1))
fi

if [ -z "$TOKEN" ]; then
  exit 1
fi

echo
echo "3. Testing authenticated profile..."

ME_CODE=$(curl -s \
  -o /tmp/navigator-me.json \
  -w "%{http_code}" \
  "$API/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

check_status \
  "GET /api/auth/me" \
  "200" \
  "$ME_CODE"

echo
echo "4. Testing documents..."

DOC_CODE=$(curl -s \
  -o /tmp/navigator-documents.json \
  -w "%{http_code}" \
  "$API/api/documents" \
  -H "Authorization: Bearer $TOKEN")

check_status \
  "GET /api/documents" \
  "200" \
  "$DOC_CODE"

echo
echo "5. Testing GraphQL workflows..."

GRAPHQL_CODE=$(curl -s \
  -o /tmp/navigator-graphql.json \
  -w "%{http_code}" \
  -X POST \
  "$API/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query":"query { myWorkflows { id title status steps { order title status } } }"
  }')

check_status \
  "GraphQL myWorkflows" \
  "200" \
  "$GRAPHQL_CODE"

echo
echo "6. Testing History API..."

HISTORY_CODE=$(curl -s \
  -o /tmp/navigator-history.json \
  -w "%{http_code}" \
  "$API/api/history" \
  -H "Authorization: Bearer $TOKEN")

check_status \
  "GET /api/history" \
  "200" \
  "$HISTORY_CODE"

echo
echo "7. Testing RBAC protection..."

ADMIN_CODE=$(curl -s \
  -o /tmp/navigator-admin.json \
  -w "%{http_code}" \
  "$API/api/admin/stats" \
  -H "Authorization: Bearer $TOKEN")

if [ "$ADMIN_CODE" = "403" ]; then
  green "✓ USER correctly blocked from Admin API"
  PASS=$((PASS + 1))
else
  red "✗ USER Admin protection — expected 403, got $ADMIN_CODE"
  FAIL=$((FAIL + 1))
fi

echo
echo "8. Testing unauthenticated protection..."

NOAUTH_CODE=$(curl -s \
  -o /tmp/navigator-noauth.json \
  -w "%{http_code}" \
  "$API/api/documents")

if [ "$NOAUTH_CODE" = "401" ]; then
  green "✓ Protected route rejects unauthenticated request"
  PASS=$((PASS + 1))
else
  red "✗ Authentication protection — expected 401, got $NOAUTH_CODE"
  FAIL=$((FAIL + 1))
fi

echo
heading "Results"

echo "Passed: $PASS"
echo "Failed: $FAIL"

if [ "$FAIL" -eq 0 ]; then
  echo
  green "✓ Core application smoke tests passed."
  exit 0
else
  echo
  red "✗ Some tests failed."
  exit 1
fi
