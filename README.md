# 19y 技术博客

这是一个基于 [Hugo](https://gohugo.io/) 和 [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题的静态博客。

## 开发环境

- **Hugo Extended 0.164.x**（当前仓库内的 `hugo.exe` 已验证为 0.164.0 extended）
- Windows PowerShell 5.1+ 或 PowerShell 7+
- Node.js、npm、数据库和 Go 工具链不是本站开发必需依赖

项目优先使用仓库根目录的 `hugo.exe`；如果该文件不存在，脚本会回退到系统 `PATH` 中的 `hugo` 命令。

## 常用命令

```powershell
# 启动开发服务器：http://127.0.0.1:1313/
.\scripts\dev.ps1

# 生成生产站点到 public/
.\scripts\build.ps1

# 生成到临时目录并检查构建结果，不覆盖 public/
.\scripts\check.ps1
```

也可以在 VS Code 的 **Terminal → Run Task** 中运行对应的 Hugo 任务。

## 迁移说明

- 文章目录、文章 URL（`/p/:slug/`）和中文默认语言保持不变。
- PaperMod 需要 Hugo Extended 0.146.0 或更高版本；本项目已使用 0.164.0。
- `content/page/search/` 和 `content/page/archives/` 已切换到 PaperMod 对应布局。
- `content/page/links/` 保留原有链接数据，并增加了 PaperMod 兼容的卡片布局。
- `themes/hugo-theme-stack/` 暂时保留，便于回滚；当前配置已切换到 `themes/PaperMod/`。

## 发布前检查

```powershell
.\scripts\check.ps1
```

`.hugo_build.lock`、Hugo 的资源缓存和检查构建输出均属于本地生成物，不应新增或提交。当前仓库历史中仍保留已有的 `public/` 静态输出；除非发布流程改为 CI 构建，否则不要擅自删除它。

## 内容结构

- `content/post/`：博客文章
- `content/page/`：独立页面
- `content/categories/`：分类页资源
- `assets/`：站点级资源
- `themes/PaperMod/`：PaperMod 主题源码
- `themes/hugo-theme-stack/`：旧 Stack 主题源码（暂保留用于回滚）
- `public/`：Hugo 生成的发布目录
