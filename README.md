# Cherry Studio with js plugins
> 如果该项目对你有用，欢迎fork & star🌟！

本项目为Cherry Studio缺乏插件系统的问题提供了一个Workaround

允许您在启动cherry studio时加载指定脚本目录中的所有JavaScript脚本, 以实现自定义快捷键等功能增强或进行高度定制化。

## 功能特点

- 向 Cherry Studio 注入自定义 JavaScript 脚本
- 独立于CherryStudio本体，本体可随意进行升级/降级等操作
- 设置快捷方式为当前项目构建的exe启动器后，可实现无痛迁移，默认启动注入脚本后的应用。
> 向页面加入消息导航按钮的示例：
<img width="1380" height="896" alt="image" src="https://github.com/user-attachments/assets/adf44d5e-cc3c-40a7-8e8d-0b07872c50f6" />
  
## 快速使用

### 可执行文件方式运行（推荐）
1. 下载 `CherryStudio_scripted.exe`。
2. 创建 `config.yaml` 文件，确保 `config.yaml` 文件与可执行文件位于同一目录
3. 修改 `config.yaml`内容：
```yaml
app_path: path/to/cherrystudio.exe （改成系统原有的cherry的exe路径）
scripts_folder: /path/to/your/scripts（改成你的js插件脚本存放文件夹）
```   
4. 双击运行 `CherryStudio_scripted.exe`即可
5. 可创建快捷方式， 并将其作为默认的CherryStudio应用入口。即可默认使用带有插件的Cherry Studio。

### Python 方式运行

1. 安装依赖：
```bash
pip install -r requirements.txt
# 或者
pip install websocket-client requests psutil pyyaml
```
2. 修改 `config.yaml` 文件，设置 Cherry Studio 的安装路径
```yaml
app_path: path/to/cherrystudio.exe
scripts_folder: /path/to/your/scripts
```
3. 运行：
   ```bash
   python start_CherryStudio_with_scripts.py
   ```

## 配置文件说明

项目使用 `config.yaml` 进行配置，主要包含 Cherry Studio 的安装路径：

```yaml
app_path: C:\Users\10051\AppData\Local\Programs\Cherry Studio\Cherry Studio.exe
scripts_folder: ./scripts
```

请确保将路径更改为您计算机上 Cherry Studio 的实际安装位置。scripts_folder请更改为脚本文件存放位置。

## 示例脚本说明

项目在 `scripts` 目录下包含多个 JavaScript 示例脚本，用于增强 Cherry Studio 的功能：

- `focus-textinputarea-shortcut.js`: 注册一个快捷键ctrl + I, 用于聚焦输入框，方便输入文字和模型交流。
- `switch-model-shortcut` : 注册一个快捷键ctrl + shft + M, 用于点击模型切换栏，方便切换模型。
- `delete-message-shortcut.js`: 注册快捷键ctrl + shft + D, 用于删除聊天中最后一个模型/用户消息
- `message-navigation-buttons.js`: 在页面右上角显示4个导航按钮，允许用户在当前聊天中快速翻到最前/最后/上个/下个交互
- `toolbar-shortcuts.js`: 为输入工具栏注册多个快捷键，ctrl + alt + 【X】 实现打开 输入工具栏的mcp、搜索等功能(例如知识库是ctrl+alt+k【】knowledge】）
- `stop-message-shortcut.js`: 当用户在模型输出状态下再次于输入栏按下回车，自动终止模型继续输出。

通过注入这两个脚本，配合cherry原生的快捷键，大多数聊天场景都可使用纯键盘进行操作、切换，大大提高效率。

您可以根据需要修改这些脚本或添加新的脚本。

### 简单演示
![20250817_194134](https://github.com/user-attachments/assets/b9fe2398-d0dc-46af-b558-3e5308df34da)


## 生成可执行文件

如需生成可执行文件，请按以下步骤操作：

1. 安装 PyInstaller：
   ```bash
   pip install pyinstaller
   ```

2. 运行以下命令生成可执行文件：
   ```bash
   pyinstaller start_CherryStudio_with_scripts.spec --distpath ./  
   ```
## 注意事项

- 确保配置文件 `config.yaml` 中的路径正确

## 许可证

本项目基于 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。

## 致谢

本项目基于 [tintinweb/electron-inject](https://github.com/tintinweb/electron-inject)。
