import socket
import os
from urllib.parse import quote

regions = [
  "ap-south-1",
  "ap-southeast-1",
  "ap-northeast-1",
  "ap-southeast-2",
  "us-east-1",
  "us-west-1",
  "eu-west-1",
  "eu-central-1",
]

print("=== DNS ===")
for r in regions:
    for host in [f"aws-0-{r}.pooler.supabase.com", f"aws-1-{r}.pooler.supabase.com"]:
        try:
            infos = socket.getaddrinfo(host, 6543, socket.AF_INET)
            print("OK", host, infos[0][4][0])
        except Exception:
            pass

print("=== PG CONNECT ===")
import pg8000.native

pwd = os.environ.get("POSTGRES_PASSWORD", "")
ref = "djtofqzmafwpkhzxabhn"
hosts_try = []
for r in regions:
    hosts_try.append((f"aws-0-{r}.pooler.supabase.com", 6543, f"postgres.{ref}"))
    hosts_try.append((f"aws-0-{r}.pooler.supabase.com", 5432, f"postgres.{ref}"))

# also direct with force ipv4 if any
for host, port, user in hosts_try:
    try:
        socket.getaddrinfo(host, port, socket.AF_INET)
    except Exception:
        continue
    try:
        conn = pg8000.native.Connection(
            user=user,
            password=pwd,
            host=host,
            port=port,
            database="postgres",
            timeout=8,
            ssl_context=True,
        )
        row = conn.run("select 1")
        print("CONNECTED", host, port, user, row)
        conn.close()
        break
    except Exception as e:
        print("FAIL", host, port, str(e)[:120])
