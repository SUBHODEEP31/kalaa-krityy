from pathlib import Path
p = Path("src/app/login/page.tsx")
t = p.read_text(encoding="utf-8")
old = '''if (email === "admin@kalaakrityy.com" && password === "admin123") {
            localStorage.setItem("kk-auth", JSON.stringify({ role: "ADMIN", email }));
            toast.success("Admin signed in");
            router.push("/admin");
            return;
          }
'''
t = t.replace(old, "")
t = t.replace(
    "Admin demo: admin@kalaakrityy.com / admin123",
    "Owner console: /admin/login (separate secure login)",
)
p.write_text(t, encoding="utf-8")
print("login_ok")
