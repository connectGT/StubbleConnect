import os, re
def fix():
    for r, d, f in os.walk("frontend/src"):
        for file in f:
            if file.endswith(".jsx"):
                p = os.path.join(r, file)
                with open(p, "r", encoding="utf-8") as fh: c = fh.read()
                c = re.sub(r"'http://localhost:8000(.*?)'", r"`http://${window.location.hostname}:8000\1`", c)
                c = re.sub(r"\"http://localhost:8000(.*?)\"", r"`http://${window.location.hostname}:8000\1`", c)
                c = re.sub(r"'ws://localhost:8000(.*?)'", r"`ws://${window.location.hostname}:8000\1`", c)
                c = re.sub(r"\"ws://localhost:8000(.*?)\"", r"`ws://${window.location.hostname}:8000\1`", c)
                c = c.replace("http://localhost:8000", "http://${window.location.hostname}:8000")
                with open(p, "w", encoding="utf-8") as fh: fh.write(c)
fix()

