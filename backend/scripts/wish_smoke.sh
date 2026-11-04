#!/usr/bin/env bash
# Smoke test for the birthday-wish feature against the Go backend.
B=${1:-http://localhost:8081/api/v1}
j() { python3 -c "import sys,json; d=json.load(sys.stdin); print(d$1)"; }

echo "== 1. plain wish + open"
R=$(curl -s -X POST $B/wishes -H 'Content-Type: application/json' -d '{"recipientName":"A","senderName":"B","message":"hello world msg","theme":"royal","music":"romantic","fontStyle":"handwritten"}')
ID=$(echo "$R" | j "['id']"); KEY=$(echo "$R" | j "['manageKey']")
curl -s $B/wishes/$ID; echo
curl -s -X POST $B/wishes/$ID/open; echo

echo "== 2. passcode wish"
R=$(curl -s -X POST $B/wishes -H 'Content-Type: application/json' -d '{"recipientName":"A","senderName":"B","message":"secret msg here","passcode":"1234"}')
PID=$(echo "$R" | j "['id']")
echo -n "wrong: "; curl -s -X POST $B/wishes/$PID/open -d '{"passcode":"0000"}'; echo
echo -n "right: "; curl -s -X POST $B/wishes/$PID/open -d '{"passcode":"1234"}'; echo

echo "== 3. scheduled wish (future)"
FUT=$(python3 -c "import datetime;print((datetime.datetime.utcnow()+datetime.timedelta(hours=2)).strftime('%Y-%m-%dT%H:%M:%SZ'))")
R=$(curl -s -X POST $B/wishes -H 'Content-Type: application/json' -d "{\"recipientName\":\"A\",\"senderName\":\"B\",\"message\":\"later msg here\",\"unlockAt\":\"$FUT\"}")
SID=$(echo "$R" | j "['id']")
curl -s $B/wishes/$SID; echo
echo -n "open early: "; curl -s -w ' [%{http_code}]' -X POST $B/wishes/$SID/open; echo

echo "== 4. self-destruct"
R=$(curl -s -X POST $B/wishes -H 'Content-Type: application/json' -d '{"recipientName":"A","senderName":"B","message":"once only msg","selfDestruct":true}')
DID=$(echo "$R" | j "['id']")
echo -n "first: "; curl -s -X POST $B/wishes/$DID/open; echo
echo -n "second: "; curl -s -w ' [%{http_code}]' -X POST $B/wishes/$DID/open; echo

echo "== 5. replies"
curl -s -X POST $B/wishes/$ID/replies -d '{"emoji":"😍","text":"thank you so much"}'; echo
echo -n "no key: "; curl -s -w ' [%{http_code}]' "$B/wishes/$ID/replies"; echo
curl -s "$B/wishes/$ID/replies?key=$KEY"; echo

echo "== 6. bad media rejected"
curl -s -X POST $B/wishes -d '{"recipientName":"A","message":"hello world","photoUrl":"data:image/svg+xml;base64,AAAA"}'; echo

