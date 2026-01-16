#!/usr/bin/env python
# -*- coding: utf-8 -*-
# from: github.com/tintinweb
# edited by: github.com/Anionex

import requests
import time
import websocket
import json
import socket
import subprocess
import os
import sys
import logging
import psutil
import signal
from pathlib import Path
import shlex

logger = logging.getLogger(__name__)

SCRIPT_HOTKEYS_F12_DEVTOOLS_F5_REFRESH = """document.addEventListener("keydown", function (e) {
    if (e.which === 123) {
        //F12
        require("electron").remote.BrowserWindow.getFocusedWindow().webContents.toggleDevTools();
    } else if (e.which === 116) {
        //F5
        location.reload();
    }
});"""


class LazyWebsocket(object):
    def __init__(self, url):
        self.url = url
        self.ws = None

    def _connect(self):
        if not self.ws:
            self.ws = websocket.create_connection(self.url)
        return self.ws

    def send(self, *args, **kwargs):
        return self._connect().send(*args, **kwargs)

    def recv(self, *args, **kwargs):
        return self.ws.recv(*args, **kwargs)

    def sendrcv(self, msg):
        self.send(msg)
        return self.recv()

    def close(self):
        if self.ws:
            self.ws.close()


class ElectronRemoteDebugger(object):
    def __init__(self, host, port):
        self.params = {'host': host, 'port': port}

    def windows(self):
        params = self.params.copy()
        params.update({'ts': int(time.time())})

        ret = []
        try:
            response = self.requests_get("http://%(host)s:%(port)s/json/list?t=%(ts)d" % params)
            for w in response.json():
                url = w.get("webSocketDebuggerUrl")
                if not url:
                    continue
                w['ws'] = LazyWebsocket(url)
                ret.append(w)
        except Exception as e:
            logger.warning(f"获取窗口列表失败: {e}")
        return ret

    def requests_get(self, url, tries=5, delay=1):
        last_exception = Exception("failed to request after %d tries."%tries)
        # 禁用代理，因为我们连接的是本地调试端口
        proxies = {"http": None, "https": None}
        for _ in range(tries):
            try:
                return requests.get(url, timeout=5, proxies=proxies)
            except requests.exceptions.ConnectionError as ce:
                last_exception = ce
            except Exception as e:
                last_exception = e
            time.sleep(delay)
        raise last_exception

    def sendrcv(self, w, msg):
        return w['ws'].sendrcv(msg)

    def eval(self, w, expression):
        data = {'id': 1,
                'method': "Runtime.evaluate",
                'params': {'contextId': 1,
                           'doNotPauseOnExceptionsAndMuteConsole': False,
                           'expression': expression,
                           'generatePreview': False,
                           'includeCommandLineAPI': True,
                           'objectGroup': 'console',
                           'returnByValue': False,
                           'userGesture': True}}

        ret = json.loads(w['ws'].sendrcv(json.dumps(data)))
        if "result" not in ret:
            return ret
        if ret['result'].get('wasThrown'):
            raise Exception(ret['result']['result'])
        return ret['result']

    @staticmethod
    def find_running_processes(app_path):
        """查找正在运行的应用进程"""
        # 清理路径，移除多余的引号
        clean_path = app_path.strip('"\'')
        app_name = Path(clean_path).name
        running_processes = []
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'exe', 'cmdline']):
                try:
                    proc_info = proc.info
                    # 检查进程名或可执行文件路径
                    if proc_info['name'] and proc_info['name'].lower() == app_name.lower():
                        running_processes.append(proc)
                    elif proc_info['exe'] and os.path.normpath(proc_info['exe']) == os.path.normpath(clean_path):
                        running_processes.append(proc)
                    elif (proc_info['cmdline'] and 
                          any(os.path.normpath(clean_path) in os.path.normpath(cmd) for cmd in proc_info['cmdline'] if cmd)):
                        running_processes.append(proc)
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess, TypeError):
                    continue
        except Exception as e:
            logger.warning(f"查找进程时出错: {e}")
        
        return running_processes

    @staticmethod
    def kill_processes(processes, force=False):
        """终止进程列表"""
        killed_count = 0
        for proc in processes:
            try:
                logger.info(f"正在终止进程 PID: {proc.pid}, 名称: {proc.name()}")
                if "python" in proc.name():
                    continue
                if force or sys.platform == 'win32':
                    proc.kill()  # 强制终止
                else:
                    proc.terminate()  # 优雅终止
                
                # 等待进程终止
                try:
                    proc.wait(timeout=5)
                    killed_count += 1
                    logger.info(f"进程 {proc.pid} 已终止")
                except psutil.TimeoutExpired:
                    logger.warning(f"进程 {proc.pid} 在5秒内未终止，强制kill")
                    proc.kill()
                    proc.wait()
                    killed_count += 1
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                logger.warning(f"无法终止进程 {proc.pid}: {e}")
            except Exception as e:
                logger.error(f"终止进程时出错: {e}")
        
        return killed_count

    @staticmethod
    def normalize_path(path):
        """标准化路径，处理引号和空格"""
        # 移除外层引号
        clean_path = path.strip('"\'')
        # 确保路径存在
        if not os.path.exists(clean_path):
            raise Exception(f"应用路径不存在: {clean_path}")
        return clean_path

    @classmethod
    def execute(cls, path, port=None, kill_existing=True):
        """启动应用，如果已运行则根据参数决定是否终止现有进程"""
        
        # 标准化路径
        clean_path = cls.normalize_path(path)
        logger.info(f"应用路径: {clean_path}")
        
        # 检查是否有相同应用正在运行
        running_processes = cls.find_running_processes(clean_path)
        
        if running_processes:
            logger.info(f"检测到 {len(running_processes)} 个正在运行的相关进程")
            
            if kill_existing:
                logger.info("正在终止现有进程...")
                killed_count = cls.kill_processes(running_processes)
                logger.info(f"已终止 {killed_count} 个进程")
                
                # 等待一段时间确保进程完全终止
                time.sleep(2)
            else:
                logger.info("检测到应用已运行，但未设置终止现有进程")
                raise Exception(f"应用已运行，发现 {len(running_processes)} 个相关进程")

        # 分配端口
        if port is None:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('', 0))
            port = sock.getsockname()[1]
            sock.close()

        # 构建命令 - 针对不同平台使用不同的方法
        debug_args = [
            f"--remote-debugging-port={port}",
            f"--remote-allow-origins=http://localhost:{port}"
        ]
        
        if sys.platform == 'win32':
            # Windows: 使用列表形式避免引号问题
            cmd_list = [clean_path] + debug_args
            logger.info(f"执行命令: {' '.join(shlex.quote(arg) for arg in cmd_list)}")
            try:
                p = subprocess.Popen(cmd_list, shell=False)
            except FileNotFoundError:
                # 如果直接执行失败，尝试使用shell模式
                cmd_str = f'"{clean_path}" {" ".join(debug_args)}'
                logger.info(f"尝试shell模式: {cmd_str}")
                p = subprocess.Popen(cmd_str, shell=True)
        else:
            # Unix-like系统
            cmd_list = [clean_path] + debug_args
            logger.info(f"执行命令: {' '.join(shlex.quote(arg) for arg in cmd_list)}")
            p = subprocess.Popen(cmd_list)
        
        
        # 检查进程是否仍在运行
        if p.poll() is not None:
            returncode = p.returncode
            logger.error(f"进程启动失败，退出码: {returncode}")
            raise Exception(f"进程启动失败，退出码: {returncode}")

        # 等待调试端口可用
        logger.info(f"等待调试端口 {port} 可用...")
        connected = False
        
        for i in range(10):  # 等待最多60秒
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                
                if result == 0:
                    # 端口开放，但还需要检查是否可以获取调试信息
                    try:
                        # 系统有 Clash 代理会拦截本地连接
                        response = requests.get(f"http://localhost:{port}/json/version", timeout=2, proxies={"http": None, "https": None})
                        if response.status_code == 200:
                            connected = True
                            logger.info(f"调试端口 {port} 已可用")
                            break
                    except:
                        pass  # 继续等待
                        
            except Exception as e:
                logger.debug(f"检查端口时出错: {e}")
            
            time.sleep(1)
            if i % 10 == 0 and i > 0:
                logger.info(f"等待调试端口... ({i+1}/60)")
        
        if not connected:
            # 尝试终止我们启动的进程
            try:
                p.terminate()
                p.wait(timeout=5)
            except:
                try:
                    p.kill()
                except:
                    pass
            raise Exception(f"调试端口 {port} 在60秒内未变为可用")

        return cls("localhost", port=port), p

    @staticmethod
    def kill_all_by_name(app_name):
        """通过应用名称终止所有相关进程（辅助方法）"""
        killed_count = 0
        try:
            for proc in psutil.process_iter(['pid', 'name']):
                if proc.info['name'] and proc.info['name'].lower().find(app_name.lower()) != -1:
                    try:
                        logger.info(f"终止进程: {proc.info['name']} (PID: {proc.info['pid']})")
                        proc.kill()
                        killed_count += 1
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
        except Exception as e:
            logger.error(f"按名称终止进程时出错: {e}")
        return killed_count


def launch_url(url):
    if sys.platform == 'win32':
        os.startfile(url)
    elif sys.platform == 'darwin':
        subprocess.Popen(['open', url])
    else:
        try:
            subprocess.Popen(['xdg-open', url])
        except OSError:
            logger.info ('请在浏览器中打开: ' + url)


def inject(target, devtools=False, browser=False, timeout=None, scripts=None, port=None, kill_existing=True):
    """
    注入脚本到Electron应用
    """
    timeout_time = time.time() + int(timeout) if timeout else time.time() + 30  # 默认30秒超时
    scripts = dict.fromkeys(scripts or [])

    for name in scripts:
        try:
            with open(name, "r", encoding="utf-8") as file:
                scripts[name] = file.read()
                logger.info(f"已读取脚本文件: {name}")
        except Exception as e:
            logger.error(f"无法读取脚本文件 {name}: {e}")
            del scripts[name]

    erb, process = ElectronRemoteDebugger.execute(target, port, kill_existing=kill_existing)

    windows_visited = set()
    injection_success = False
    
    while time.time() < timeout_time:
        try:
            windows = erb.windows()
            if not windows:
                logger.debug("暂未发现窗口，继续等待...")
                time.sleep(1)
                continue
                
            for w in windows:
                window_id = w.get('id')
                if window_id not in windows_visited:
                    try:
                        logger.info(f"发现新窗口: {window_id} - {w.get('title', 'Unknown')}")
                        
                        if devtools:
                            logger.info(f"注入热键脚本到窗口 {window_id}")
                            result = erb.eval(w, SCRIPT_HOTKEYS_F12_DEVTOOLS_F5_REFRESH)
                            logger.debug(f"热键脚本注入结果: {result}")

                        for name, content in scripts.items():
                            logger.info(f"注入脚本 {name} 到窗口 {window_id}")
                            result = erb.eval(w, content)
                            logger.debug(f"脚本 {name} 注入结果: {result}")
                            injection_success = True

                    except Exception as e:
                        logger.error(f"注入到窗口 {window_id} 失败: {e}")
                    finally:
                        windows_visited.add(window_id)

            # 如果所有窗口都处理过了，退出循环
            if windows and all(w.get('id') in windows_visited for w in windows):
                break
                
        except Exception as e:
            logger.error(f"获取窗口信息失败: {e}")
            
        time.sleep(1)

    if injection_success:
        logger.info("脚本注入完成")
    else:
        logger.warning("未成功注入任何脚本")

    if browser:
        launch_url("http://%(host)s:%(port)s/" % erb.params)
        
    # 返回进程对象
    return process


if __name__ == "__main__":
    # 配置日志
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    # 示例用法
    if len(sys.argv) > 1:
        app_path = sys.argv[1]
        inject(app_path, devtools=False, kill_existing=True)
    else:
        # 测试连接已运行的应用
        try:
            erb = ElectronRemoteDebugger("localhost", 8888)
            for w in erb.windows():
                print(erb.eval(w, SCRIPT_HOTKEYS_F12_DEVTOOLS_F5_REFRESH))
        except Exception as e:
            logger.error(f"连接失败: {e}")
