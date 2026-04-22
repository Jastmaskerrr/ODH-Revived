 	

    注意： 此为 "Online Dictionary Helper" 项目的衍生版本 (Fork)，由新维护者优化并增加了部分新功能。


在线词典助手 (Online Dictionary Helper) 可以在阅读网页时，通过鼠标划选或悬停查询单词与短语，显示包含上下文的释义，并一键发送至本地 Anki 进行复习。

此分支的新增功能与优化：
- Android Firefox 支持：适配并修复了安卓版 Firefox 浏览器的运行问题。
- 深色主题：支持“跟随系统 / 浅色 / 深色”模式，内置反转滤镜优化硬编码词典内容。
- 网站规则 (Site Rules)：支持按域名个性化配置词典、牌组及字数限制，支持导入导出与云同步。
- 自定义 AnkiConnect 地址：支持配置自定义 IP 和端口，允许连接局域网或远程 Anki 服务器。
- Anki 制卡反馈与重复提示：通过 Toast 系统实时反馈制卡结果，并自动提示同名卡片数量。
- 最近添加记录：在扩展弹窗中快速查看并管理最近添加的 5 条 Anki 记录，支持一键删除。
- 划词数量限制：新增划词上限设置，采用精确的 CJK 感知计词，防止长文本划选导致卡顿。
- 智能语言匹配：自动识别语种并匹配相应词典，支持非标准命名脚本，避免跨语言查询报错。
- 性能优化：引入高频事件节流机制与音频模块 LRU 缓存，提升扩展稳定性并防止内存泄漏。
- Bug 修复：修复了编辑器内热键冲突、划词边界标点越界以及弹窗滚动跳步等已知问题。

---

    Note: This is a fork of the original "Online Dictionary Helper" project, updated with new features and optimizations by a new maintainer.


Online Dictionary Helper translates words and phrases while you read webpages. Simply hover or select text to see definitions with context sentences, and send them to your local Anki for spaced repetition.

New Features in this Fork:
- Android Firefox Support: Fully adapted and fixed compatibility issues for Firefox on Android.
- Dark Theme: Supports "Follow System / Light / Dark" modes with an inversion filter to optimize hardcoded styles.
- Site Rules: Domain-specific overrides for dictionaries, Anki decks, and word limits with Cloud Sync support.
- Custom AnkiConnect URL: Allows custom IP/Port configuration to connect to LAN or remote Anki servers.
- Anki Feedback & Duplicate Hints: Real-time Toast notifications for card creation with automatic duplicate count alerts.
- Recent Cards List: View and manage the last 5 added Anki cards directly in the popup with one-click deletion.
- Selection Word Limit: Configurable limit for text selection with CJK-aware counting to prevent browser lag.
- Smart Language Matching: Automatically detects language and matches dictionaries, supporting non-standard scripts.
- Performance Optimization: Implements event throttling and LRU cache for audio to enhance stability and prevent leaks.
- Bug Fixes: Resolved hotkey conflicts in editors, text boundary detection errors, and popup scrolling jitter.