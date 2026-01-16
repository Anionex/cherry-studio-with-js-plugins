# concat_js_to_clipboard.py
# 作用：拼接当前目录(可选递归)所有 .js 文件内容，并自动复制到 Windows 剪贴板
import os
import sys
import subprocess

SKIP_DIRS = {"node_modules", ".git", "__pycache__"}

def collect_js_files(root: str, recursive: bool):
    js_files = []
    if recursive:
        for dirpath, dirnames, filenames in os.walk(root):
            # 跳过一些常见目录
            dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
            for fn in filenames:
                if fn.lower().endswith(".js"):
                    js_files.append(os.path.join(dirpath, fn))
    else:
        for fn in os.listdir(root):
            p = os.path.join(root, fn)
            if os.path.isfile(p) and fn.lower().endswith(".js"):
                js_files.append(p)
    return sorted(js_files, key=lambda p: os.path.relpath(p, root).lower())

def copy_to_windows_clipboard(text: str):
    # Windows 自带命令：clip
    # 用 UTF-16LE 写入 stdin，避免中文乱码
    p = subprocess.Popen("clip", stdin=subprocess.PIPE, shell=True)
    p.stdin.write(text.encode("utf-16le"))
    p.stdin.close()
    p.wait()

def main():
    root = os.getcwd()
    recursive = ("-r" in sys.argv) or ("--recursive" in sys.argv)

    js_files = collect_js_files(root, recursive)
    if not js_files:
        print("未找到 .js 文件")
        return

    parts = []
    for f in js_files:
        rel = os.path.relpath(f, root)
        with open(f, "r", encoding="utf-8", errors="replace") as fp:
            parts.append(f"\n/* ===== {rel} ===== */\n" + fp.read() + "\n")

    merged = "".join(parts)

    # 可选：也写到文件（默认不写；如需写文件可取消注释）
    # with open("all.js", "w", encoding="utf-8") as out:
    #     out.write(merged)

    copy_to_windows_clipboard(merged)
    print(f"已拼接 {len(js_files)} 个文件，并复制到 Windows 剪贴板")

if __name__ == "__main__":
    main()
