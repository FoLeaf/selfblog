# 顶栏冻结固定在页面顶部

## Goal

顶栏（`.header`，含 logo/导航/主题切换按钮）在滚动页面时始终固定在页面顶部，不随内容滚走。目标用户价值：导航与主题切换始终可达，无需滚回顶部。

## Confirmed Facts (from repo evidence)

- `.header` 是 `<body>` 直接子元素，位于 `<main class="main">` 之前（`themes/PaperMod/layouts/baseof.html`）。
- 主题 CSS `themes/PaperMod/assets/css/common/header.css` 中 `.header` **无定位规则**（默认 static），**无背景**（透明）；body 背景为 `var(--theme)`。
- `--header-height: 60px`（`themes/PaperMod/assets/css/core/theme-vars.css`）。
- 现有 sticky TOC 侧栏已用 `top: calc(var(--header-height) + 16px)` 作为偏移；`static/js/toc-sidebar.js` 中 scroll-spy 与 fit 从 DOM 读 `header.offsetHeight`（60px）。header 冻结后高度不变，这些偏移仍正确，无需改动 JS。
- 项目 CSS 扩展在 `assets/css/extended/custom.css`。

## Requirements

- R1: `.header` 滚动时固定在视口顶部（`position: sticky; top: 0`）。
- R2: header 冻结后必须有背景遮挡滚动内容（透明会透出正文），并保证层级高于正文（z-index）。
- R3: 顶部距顶栏 60px 区域的布局不被破坏；现有 sticky TOC 侧栏、scroll-spy、主题切换、移动端均不回归。

## Acceptance Criteria

- [ ] AC1: 页面上下滚动时，顶栏始终固定在视口顶部，内容从其下方滚过。
- [ ] AC2: 滚动内容不会从顶栏背后透出（有背景遮挡）。
- [ ] AC3: 顶栏不遮挡/不与正文元素异常重叠（z-index 正确）。
- [ ] AC4: sticky TOC 侧栏偏移、scroll-spy 高亮、主题切换按钮功能不回归。
- [ ] AC5: 移动端（<1080px）顶栏同样冻结，行为一致。
- [ ] AC6: 不修改 `themes/PaperMod/` 下任何文件。

## Out of Scope

- 不改 header 内容/结构、不改 `--header-height`。
- 不做滚动后收缩/透明度变化的复杂效果（仅简单冻结）。
- 不改 TOC JS 的偏移逻辑（冻结后 header 高度不变，无需改）。

## Open Questions

（无 — 决策已收敛：sticky + 背景 + z-index，纯 CSS 改动。）

## Notes

- 轻量任务，PRD-only 即可；技术细节（背景色、z-index、border 阴影）记录于 `implement.md`。
