import electron_inject
import os
import yaml
import time
import psutil
import platform
import sys
from pathlib import Path

def get_cherry_studio_path():
    """根据当前平台获取Cherry Studio路径"""
    with open("config.yaml", "r", encoding="utf-8") as f:
        config = yaml.load(f, Loader=yaml.FullLoader)
    
    system = platform.system().lower()
    
    if system == "windows":
        # Windows路径，支持环境变量展开
        app_path = config["app_paths"]["windows"]
        # 展开环境变量
        app_path = os.path.expandvars(app_path)
    elif system == "darwin":
        # macOS路径
        app_path = config["app_paths"]["macos"]
    elif system == "linux":
        # Linux路径
        app_path = config["app_paths"]["linux"]
    else:
        raise Exception(f"不支持的操作系统: {system}")
    
    # 检查路径是否存在
    if not os.path.exists(app_path):
        print(f"警告: 默认路径不存在: {app_path}")
        
        # 尝试自动查找
        found_path = auto_detect_cherry_studio(system)
        if found_path:
            print(f"自动找到路径: {found_path}")
            return found_path
        else:
            raise Exception(f"无法找到Cherry Studio，请检查配置文件中的路径设置")
    
    return app_path

def auto_detect_cherry_studio(system):
    """自动检测Cherry Studio安装路径"""
    if system == "windows":
        # Windows常见安装路径
        possible_paths = [
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "Cherry Studio", "Cherry Studio.exe"),
            os.path.join(os.environ.get("PROGRAMFILES", ""), "Cherry Studio", "Cherry Studio.exe"),
            os.path.join(os.environ.get("PROGRAMFILES(X86)", ""), "Cherry Studio", "Cherry Studio.exe"),
        ]
    elif system == "darwin":
        # macOS路径
        possible_paths = [
            "/Applications/Cherry Studio.app/Contents/MacOS/Cherry Studio",
            os.path.expanduser("~/Applications/Cherry Studio.app/Contents/MacOS/Cherry Studio"),
        ]
    else:
        # Linux路径
        possible_paths = [
            "/usr/bin/cherry-studio",
            "/usr/local/bin/cherry-studio",
            "/opt/cherry-studio/cherry-studio",
        ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def test_path_detection():
    """测试路径检测功能"""
    print("=== 路径检测测试 ===")
    system = platform.system().lower()
    print(f"当前系统: {platform.system()}")
    
    try:
        app_path = get_cherry_studio_path()
        print(f"✅ 成功找到路径: {app_path}")
        return True
    except Exception as e:
        print(f"❌ 路径检测失败: {e}")
        return False

def main():
    # 检查是否是测试模式
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_path_detection()
        return
    
    try:
        # 获取配置
        with open("config.yaml", "r", encoding="utf-8") as f:
            config = yaml.load(f, Loader=yaml.FullLoader)
        
        scripts_folder = config["scripts_folder"]
        
        # 获取Cherry Studio路径
        app_path = get_cherry_studio_path()
        print(f"检测到系统: {platform.system()}")
        print(f"使用路径: {app_path}")
        
        # 获取JS脚本列表
        if not os.path.exists(scripts_folder):
            raise Exception(f"脚本目录不存在: {scripts_folder}")
        
        js_list = [os.path.join(scripts_folder, file) for file in os.listdir(scripts_folder) if file.endswith(".js")]
        print(f"找到 {len(js_list)} 个脚本文件")
        
        # 启动应用
        electron_process = None
        try:
            electron_process = electron_inject.inject(
                app_path,
                devtools=False,
                browser=False,
                timeout=10,
                scripts=js_list,
            )
            print(f"Electron 应用已启动，PID: {electron_process.pid}")
            print("按 Ctrl+C 停止程序")
            
            # 保持主程序运行，直到用户关闭 Electron 应用
            electron_process.wait()
        except Exception as e:
            print(f"发生错误: {e}")
            raise
        finally:
            # 确保无论如何都尝试终止子进程
            if electron_process and psutil.pid_exists(electron_process.pid):
                print(f"正在终止 Electron 应用 (PID: {electron_process.pid})...")
                electron_process.kill()
            
            print("脚本执行完毕，程序退出。")
            
    except KeyboardInterrupt:
        print("\n程序被用户中断")
    except Exception as e:
        print(f"程序执行失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()