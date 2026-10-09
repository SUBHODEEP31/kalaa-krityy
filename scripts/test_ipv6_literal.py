import socket, ssl
import pg8000.dbapi

ip = "2406:da12:1f1:f802:b8ca:5992:90c0:6810"
print("connecting to", ip)
try:
    s = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    s.settimeout(20)
    s.connect((ip, 5432))
    print("raw tcp ok")
    s.close()
except Exception as e:
    print("raw tcp fail", e)

import os
try:
    # force host to IPv6 literal
    conn = pg8000.dbapi.connect(
        user="postgres",
        password=os.environ.get("POSTGRES_PASSWORD", ""),
        host=ip,
        port=5432,
        database="postgres",
        timeout=20,
        ssl_context=True,
    )
    cur = conn.cursor()
    cur.execute("select 1")
    print("pg ok", cur.fetchone())
    conn.close()
except Exception as e:
    print("pg fail", type(e).__name__, e)
