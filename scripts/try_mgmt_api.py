import os, ssl, urllib.request, json
from pathlib import Path

for line in Path(".env").read_text(encoding="utf-8").splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k,v=line.split("=",1); os.environ[k]=v.strip().strip('"')

key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ref = "djtofqzmafwpkhzxabhn"
sql = Path("prisma/supabase-init.sql").read_text(encoding="utf-8")
ctx = ssl.create_default_context()

urls = [
    f"https://api.supabase.com/v1/projects/{ref}/database/query",
    f"https://api.supabase.com/v1/projects/{ref}/db/query",
]
for u in urls:
    body = json.dumps({"query": "select 1"}).encode()
    req = urllib.request.Request(
        u,
        data=body,
        method="POST",
        headers={
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
            "apikey": key,
        },
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
            print(u, r.status, r.read()[:200])
    except Exception as e:
        msg = ""
        try: msg = e.read().decode()[:200]
        except Exception: msg = str(e)[:200]
        print(u, "FAIL", getattr(e,"code",None), msg)
