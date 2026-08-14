# Implement: 主题切换动画（View Transition 圆形扩散）

> 内联（inline）工作流，无子代理分发，跳过 implement.jsonl / check.jsonl。

## 前置说明

主题 handler 在 `themes/PaperMod/layouts/_partials/footer.html`（约 94-108 行）用冒泡阶段 `addEventListener` 监听 `#theme-toggle`。注入点 `layouts/partials/extend_footer.html` 在主题 handler **之前**执行。为避免双 handler 叠加，用 **capture 阶段 + `stopImmediatePropagation`** 接管按钮，并延迟到 `DOMContentLoaded` 后绑定以确保主题 handler 已注册。

## 变更清单（有序）

1. **新增 `layouts/partials/extend_footer.html`**（当前不存在）：
   - `toggleTheme(e)`：计算 `next`、点击坐标 `x/y`、覆盖半径 `r = Math.hypot(max(x, vw-x), max(y, vh-y))`；`applyTheme(next)` 切 `html.dataset.theme` + 写 `localStorage`。
   - 仅当 `document.startViewTransition` 且非 `prefers-reduced-motion` 时：`startViewTransition(() => applyTheme(next))`，在 `.ready` 后设置 `--vt-x/--vt-y/--vt-r` CSS 变量；事件内 `e.stopImmediatePropagation()`。
   - 否则：不接管（走主题原生 handler，无动画、零侵入降级）。
   - `DOMContentLoaded` 后绑定 capture handler。
2. **追加 `assets/css/extended/custom.css`**：
   - `::view-transition-new(root)` / `::view-transition-old(root)` 及 `@keyframes theme-circle-in/out`，用 `--vt-x/--vt-y/--vt-r` 做圆形 clip-path 扩散。

## 验证命令

- 构建预览：`hugo server`（或手动将改动同步到 `public/` 后用浏览器测试）。
- 浏览器（桌面 ≥1080px）验证：
  - 点击 `#theme-toggle`：深↔浅切换，出现从点击点向外圆形扩散动画。
  - `localStorage["pref-theme"]` 更新正确；刷新后主题保持。
  - 只切换一次（无来回跳）→ 确认 capture 接管生效、主题 handler 未叠加。
  - 控制台无报错。
- 降级路径：在禁用 View Transition 的浏览器（或勾选 prefers-reduced-motion）下，点击仍能切换、无动画、无报错。

## 风险 / 回滚点

- 仅两个文件：新增 `layouts/partials/extend_footer.html` + 追加 `custom.css`。删除即回滚。
- 关注点：capture 接管若失效，最坏是切换叠加；已在 `toggleTheme` 内 `stopImmediatePropagation` 杜绝。
- `public/` 目前被 `hugo server` 污染为 dev 模式；只同步 `public/js` 类改动时勿把无关 HTML 提交进去。

## 提交前检查

- [ ] `themes/PaperMod/` 零改动。
- [ ] AC1–AC6 逐条通过（动画、持久化、降级、reduce-motion、无回归、不改主题）。
