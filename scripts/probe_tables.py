import os, ssl, urllib.request, json
from pathlib import Path
for line in Path(".env").read_text(encoding="utf-8").splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k,v=line.split("=",1); os.environ[k]=v.strip().strip('"')
url=os.environ["SUPABASE_URL"].rstrip("/")
key=os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ctx=ssl.create_default_context()
for table in ["Product","Coupon","Order","OrderItem","SiteSettings","User"]:
    req=urllib.request.Request(
        url+f"/rest/v1/{table}?select=id&limit=1",
        headers={"apikey":key,"Authorization":"Bearer "+key,"Prefer":"count=exact"},
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
            print(table, "OK", r.status, r.headers.get("content-range"))
    except Exception as e:
        body=""
        if hasattr(e,'read'):
            try: body=e.read().decode()[:120]
            except: pass
        print(table, "FAIL", getattr(e,'code',None), body)
