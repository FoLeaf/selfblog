# Implement: 桌面目录可读性修复（轻微缩小 + 超长滚动）

> 内联（inline）工作流，无子代理分发，跳过 implement.jsonl / check.jsonl。

## 变更清单（有序）

1. **`static/js/toc-sidebar.js`** — 在文件顶部常量区新增
   ```js
   var MIN_TOC_SCALE = 0.85;
   ```
2. **重写 `fitSidebar()`**（替换现有两段 0.5 钳制逻辑）：
   - 非 sticky → `--toc-scale: 1` + 清除列表滚动状态，return。
   - 计算 `available`；先还原 `--toc-scale: 1` **并清除滚动状态**再测自然高度 `height`。
   - `height <= available || available <= 0` → return（不缩放不滚动）。
   - `scale = Math.max(available / height, MIN_TOC_SCALE)`，设 `--toc-scale`。
   - 缩放后重测 `fitted`；若 `fitted > available` → `list.style.maxHeight = available + 'px'; list.style.overflowY = 'auto';`。
3. **`assets/css/extended/custom.css`** — 预期**无需改动**（内联样式足够）。若需要，可选加桌面 `overscroll-behavior: contain`。

## 验证命令

- 构建/预览站点并打开一篇长目录文章（`hugo server`），在桌面宽度（≥1080px）检查：
  - 短目录：无滚动、无缩放。
  - 长目录（构造/已有长文）：字体不 < 0.85，列表可滚动、所有标签可达。
  - 改变窗口高度 → `fitSidebar` 正确刷新缩放/滚动。
  - 页面加载时（`<details>` 异步布局）`fitWhenReady` 重试后仍正确 fit。
- 回归：sticky 定位、滚动高亮、光标动效、marker/tick、移动端折叠卡、sticky-release before related posts 均正常。

## 风险文件 / 回滚点

- 唯一改动文件 `static/js/toc-sidebar.js`（+ 可选 CSS）。回滚 = `git checkout` 该文件。
- 注意：仓库该改动文件为 LF 行尾；不要引入 CRLF 噪音（`extend_post_content.html` 已有一处无关的 CRLF-only diff，勿混入本任务）。

## 提交前检查（trellis-check）

- [ ] `MIN_TOC_SCALE` 常量使用一致，无残留 0.5 下限。
- [ ] 滚动状态在每次 `fitSidebar` 前正确清除（避免 max-height 钳制测量）。
- [ ] AC1–AC5 逐条通过。
