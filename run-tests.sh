#!/usr/bin/env bash
# Rebuild a throwaway database, start the local stand-in for Supabase, and
# click through all three apps. Everything must say ALL CHECKS PASSED.
#
#   ./run-tests.sh
#
# This is what stops a change being shipped on the strength of having read it.
set -uo pipefail
DB=sijill_sb
SQLDIR=${SQLDIR:-../sijill-db}
PORT=8099

echo "########## rebuilding $DB from $SQLDIR ##########"
su postgres -c "dropdb --if-exists $DB; createdb $DB" >/dev/null 2>&1
su postgres -c "psql -q -d $DB -c 'create schema extensions; create extension pgcrypto with schema extensions; create extension btree_gist with schema extensions;'" >/dev/null 2>&1
su postgres -c "psql -q -d $DB -c \"alter database $DB set search_path = public\"" >/dev/null 2>&1
for f in 01 02 03 04 05 06 07 08 09 10 11 12; do
  out=$(su postgres -c "psql -q -v ON_ERROR_STOP=1 -d $DB -f $(cd "$SQLDIR" && pwd)/${f}_*.sql" 2>&1 | grep -v NOTICE)
  [ -n "$out" ] && { echo "  $f FAILED: $out"; exit 1; }
done
su postgres -c "psql -q -d $DB -c \"select set_school_passphrase('test-school-pass'); select set_coordinator_passphrase('test-coord-pass');\"" >/dev/null 2>&1
echo "  $(su postgres -c "psql -d $DB -tAc 'select count(*) from students'") students loaded"

# Stop any previous dev server by its recorded pid. Do NOT use
# `pkill -f devserver.py` — the pattern matches this very script's own
# command line and kills the test run instead.
[ -f /tmp/sijill-dev.pid ] && kill "$(cat /tmp/sijill-dev.pid)" 2>/dev/null
sleep 1
(setsid nohup python3 devserver.py $PORT $DB > /tmp/dev.log 2>&1 < /dev/null & echo $! > /tmp/sijill-dev.pid)
sleep 2
curl -sf -o /dev/null http://127.0.0.1:$PORT/index.html || { echo "dev server did not start"; exit 1; }

fails=0
echo; echo "########## 1/3  TEACHER ##########"
node test.js || fails=$((fails+1))

echo; echo "########## 2/3  COORDINATOR ##########"
node test-coord.js || fails=$((fails+1))

echo; echo "########## 3/3  PARENT ##########"
TOK=$(curl -s -X POST http://127.0.0.1:$PORT/rest/v1/rpc/api_sign_in -H 'apikey: local-anon-key-for-testing-only' -H 'Content-Type: application/json' -d '{"p_pass":"test-school-pass"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])')
TCH=$(su postgres -c "psql -d $DB -tAc \"select id from teachers where active order by full_name limit 1\"")
curl -s -X POST http://127.0.0.1:$PORT/rest/v1/rpc/api_set_teacher -H 'apikey: local-anon-key-for-testing-only' -H 'Content-Type: application/json' -d "{\"p_token\":\"$TOK\",\"p_teacher\":\"$TCH\"}" >/dev/null
curl -s -X POST http://127.0.0.1:$PORT/rest/v1/rpc/api_elevate -H 'apikey: local-anon-key-for-testing-only' -H 'Content-Type: application/json' -d "{\"p_token\":\"$TOK\",\"p_pass\":'test-coord-pass'}" >/dev/null 2>&1
curl -s -X POST http://127.0.0.1:$PORT/rest/v1/rpc/api_elevate -H 'apikey: local-anon-key-for-testing-only' -H 'Content-Type: application/json' -d "{\"p_token\":\"$TOK\",\"p_pass\":\"test-coord-pass\"}" >/dev/null
# one child who HAS been audited and one who has NOT, so the parent page is
# tested in both states — most of the school is unaudited in September
S1=$(su postgres -c "psql -d $DB -tAc \"select s.id from students s where s.active and exists (select 1 from hifdh_state h where h.student_id=s.id) order by s.full_name limit 1\"")
S2=$(su postgres -c "psql -d $DB -tAc \"select s.id from students s where s.active and not exists (select 1 from hifdh_state h where h.student_id=s.id) order by s.full_name limit 1\"")
curl -s -X POST http://127.0.0.1:$PORT/rest/v1/rpc/api_issue_link -H 'apikey: local-anon-key-for-testing-only' -H 'Content-Type: application/json' \
  -d "{\"p_token\":\"$TOK\",\"p_students\":[\"$S1\",\"$S2\"],\"p_label\":\"mother\",\"p_channel\":\"whatsapp\"}" \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["token"])' > /tmp/link
node test-family.js || fails=$((fails+1))

echo
if [ $fails -eq 0 ]; then echo "########## EVERYTHING PASSED ##########"
else echo "########## $fails SUITE(S) FAILED ##########"; fi
echo "screenshots: /var/tmp/shots"
exit $fails
