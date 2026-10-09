import socket
import ssl
import pg8000.native

host = "db.djtofqzmafwpkhzxabhn.supabase.co"
print("IPv6 lookup:")
try:
    infos = socket.getaddrinfo(host, 5432, socket.AF_INET6)
    print(infos[0][4])
    ip = infos[0][4][0]
except Exception as e:
    print("lookup fail", e)
    raise SystemExit(1)

# raw TCP
try:
    s = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    s.settimeout(10)
    s.connect((ip, 5432, 0, 0))
    print("TCP IPv6 OK")
    s.close()
except Exception as e:
    print("TCP IPv6 FAIL", e)

import os
# pg8000 with host
try:
    conn = pg8000.native.Connection(
        user="postgres",
        password=os.environ.get("POSTGRES_PASSWORD", ""),
        host=host,
        port=5432,
        database="postgres",
        timeout=15,
        ssl_context=True,
    )
    print("PG OK", conn.run("select current_database()"))
    conn.close()
except Exception as e:
    print("PG FAIL", type(e).__name__, e)
