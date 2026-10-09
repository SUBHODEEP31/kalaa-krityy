import os, ssl, urllib.request, json
from pathlib import Path

for line in Path(".env").read_text(encoding="utf-8").splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        os.environ[k] = v.strip().strip('"')

url = os.environ["SUPABASE_URL"].rstrip("/")
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ctx = ssl.create_default_context()

paths = [
    "/pg-meta/default/query",
    "/pg-meta/default/tables",
    "/pg/meta/query",
]
for path in paths:
    try:
        body = json.dumps({"query": "select 1 as x"}).encode()
        r = urllib.request.Request(
            url + path,
            data=body,
            method="POST",
            headers={
                "apikey": key,
                "Authorization": "Bearer " + key,
                "Content-Type": "application/json",
            },
        )
        with urllib.request.urlopen(r, context=ctx, timeout=15) as res:
            print(path, "POST", res.status, res.read()[:200])
    except Exception as e:
        code = getattr(e, "code", None)
        msg = ""
        try:
            msg = e.read()[:150].decode()
        except Exception:
            msg = str(e)[:150]
        print(path, "POST FAIL", code, msg)

    try:
        r = urllib.request.Request(
            url + path,
            method="GET",
            headers={"apikey": key, "Authorization": "Bearer " + key},
        )
        with urllib.request.urlopen(r, context=ctx, timeout=15) as res:
            print(path, "GET", res.status, res.read()[:200])
    except Exception as e:
        print(path, "GET FAIL", getattr(e, "code", None))
