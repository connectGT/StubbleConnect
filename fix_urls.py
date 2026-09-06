import os
import re

def fix_urls(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                content = re.sub(r""'http://localhost:8000(.*?)'"", r""`http://{window.location.hostname}:8000\1`"", content)
                content = re.sub(r'""http://localhost:8000(.*?)""', r""`http://{window.location.hostname}:8000\1`"", content)
                content = re.sub(r""'ws://localhost:8000(.*?)'"", r""`ws://{window.location.hostname}:8000\1`"", content)
                content = re.sub(r'""ws://localhost:8000(.*?)""', r""`ws://{window.location.hostname}:8000\1`"", content)
                content = re.sub(r""http://localhost:8000"", r""http://{window.location.hostname}:8000"", content)

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

if __name__ == '__main__':
    fix_urls('frontend/src')
    print('Done!')
