# Regenerate jam/day.js from the chito-systems/jam pull requests.
# usage: gh pr list -R chito-systems/jam --state all --limit 200 --json number,title,state,mergedAt,author,additions,deletions,body > prs.json
#        python3 jam-day.py prs.json > jam/day.js
import json, sys, datetime as dt
prs = json.load(open(sys.argv[1]))
MT = dt.timezone(dt.timedelta(hours=-7))
def agent(body):
    b = (body or '').lower()
    if 'opus' in b and ('subagent' in b or 'sub-agent' in b): return 'opus'
    return 'fable'
rows = []
for p in prs:
    if p['state'] == 'CLOSED': continue
    t = dt.datetime.fromisoformat(p['mergedAt'].replace('Z', '+00:00')).astimezone(MT).strftime('%H:%M') if p['mergedAt'] else None
    rows.append({'n': p['number'], 't': t, 'who': 'jake' if p['author']['login'] == 'quakeob' else 'cam',
                 'agent': agent(p['body']), 'add': p['additions'], 'del': p['deletions'],
                 'title': p['title'], 'open': p['state'] == 'OPEN'})
rows.sort(key=lambda r: (r['t'] is None, r['t'] or '', r['n']))
print('// Generated from github.com/chito-systems/jam pull requests. Times are Mountain (UTC-7).')
print('window.JAM_DAY = ' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';')
