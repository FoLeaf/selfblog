# 主题切换动画（View Transition 圆形扩散）

## Goal

点击明/暗主题切换按钮时，用 View Transition API 从按钮点击位置以圆形（clip-path circle）扩散方式过渡切换主题，提升切换体验。目标用户价值：切换过程更自然、有反馈，同时保持降级可用（不支持 API 的浏览器仍能正常切换）。

## Confirmed Facts (from repo evidence)

- 主题切换 handler 位于主题模板 `themes/PaperMod/layouts/_partials/footer.html`（约 94-108 行）：
  - `document.getElementById("theme-toggle")` 上 `addEventListener("click", ...)`；
  - 直接改 `html.dataset.theme`（dark↔light）并写 `localStorage.setItem("pref-theme", ...)`。
- 主题按钮 HTML 在 `themes/PaperMod/layouts/_partials/header.html`（`#theme-toggle`，含 moon/sun 两个 SVG）。
- 主题初始值在 `themes/PaperMod/layouts/_partials/head.html` 由 `localStorage`/`prefers-color-scheme` 决定；`hugo.yaml` 中 `defaultTheme: auto`。
- 项目有干净的自定义注入点，无需改主题文件：
  - 主题 footer 第 42 行已调用 `{{- partial "extend_footer.html" . }}` → 项目可在 `layouts/partials/extend_footer.html` 注入脚本。
  - 项目 CSS 扩展在 `assets/css/extended/custom.css`（Hugo `assets` 管线自动打包）。
- 构建配置 `assets.disableFingerprinting: true`（避免 Vercel 行尾差异导致 SRI 校验失败）。

## Requirements

- R1: 点击主题切换按钮时，优先用 `document.startViewTransition()` 包裹主题切换（改 `html.dataset.theme` + localStorage），实现从按钮点击坐标以圆形 clip-path 扩散的过渡动画。
- R2: 不支持 View Transition API（或用户 `prefers-reduced-motion: reduce`）时优雅降级：直接切换主题，无动画、不报错、功能不受影响。
- R3: 主题切换的核心行为不变：`html.dataset.theme` 在 dark↔light 间切换，`pref-theme` 正确写入 localStorage，页面其余交互（菜单、滚动、TOC 等）不回归。
- R4: 动画实现与主题解耦，注入在项目自定义层（`extend_footer.html` + `custom.css`），不修改 PaperMod 主题文件（避免升级冲突）。

## Acceptance Criteria

- [ ] AC1: 点击主题按钮，深↔浅切换生效，且出现从点击位置向外圆形扩散的过渡动画。
- [ ] AC2: `pref-theme` 在 localStorage 中正确更新；刷新后主题保持（auto 初始逻辑不受影响）。
- [ ] AC3: 在不支持 View Transition API 的浏览器（或无动画偏好/降级路径）下，点击仍能正常切换主题，无控制台报错。
- [ ] AC4: 遵循 `prefers-reduced-motion: reduce`：该偏好开启时不播放动画，直接切换。
- [ ] AC5: 除主题切换外的既有页面交互（菜单、滚动、TOC、代码复制等）无回归。
- [ ] AC6: 不修改 `themes/PaperMod/` 下任何文件。

## Out of Scope

- 不改主题按钮的 HTML 结构（moon/sun SVG）与 aria-label。
- 不改主题切换的持久化/初始化逻辑（仍由 PaperMod head 模板处理）。
- 不做多个独立元素的精细动画（如每张卡片错峰），仅整页圆形扩散。

## Open Questions

（无 — 决策已收敛：动画风格=圆形扩散从按钮；创建任务并规划。）

## Notes

- 技术方案（坐标捕获、`startViewTransition` 时序、CSS `::view-transition-new(root)`、降级判断）放 `design.md`。
- 执行清单（改动文件、验证命令）放 `implement.md`。
