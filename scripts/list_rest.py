import os, ssl, urllib.request, json
from pathlib import Path

for line in Path(".env").read_text(encoding="utf-8").splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        os.environ[k] = v.strip().strip('"')

url = os.environ["SUPABASE_URL"].rstrip("/")
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ctx = ssl.create_default_context()
req = urllib.request.Request(url + "/rest/v1/", headers={"apikey": key, "Authorization": "Bearer " + key})
with urllib.request.urlopen(req, context=ctx, timeout=20) as r:
    d = json.loads(r.read().decode())
print("paths", list((d.get("paths") or {}).keys())[:50])
