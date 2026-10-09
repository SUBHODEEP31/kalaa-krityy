import os, json, ssl, urllib.request
from pathlib import Path

for line in Path(".env").read_text(encoding="utf-8").splitlines():
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.split("=", 1)
        os.environ[k] = v.strip().strip('"')

url = os.environ["SUPABASE_URL"].rstrip("/")
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ctx = ssl.create_default_context()

def req(method, path, body=None):
    data = None if body is None else json.dumps(body).encode()
    r = urllib.request.Request(
        url + path,
        data=data,
        method=method,
        headers={
            "apikey": key,
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(r, context=ctx, timeout=30) as res:
            return res.status, res.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

# list buckets
print("buckets", req("GET", "/storage/v1/bucket"))

# create target bucket if missing
status, body = req(
    "POST",
    "/storage/v1/bucket",
    {
        "id": "kalarity-products",
        "name": "kalarity-products",
        "public": True,
        "file_size_limit": 15728640,
        "allowed_mime_types": [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
        ],
    },
)
print("create kalarity-products", status, body[:300])

# also ensure existing krity-creations stays usable as fallback
print("done")
