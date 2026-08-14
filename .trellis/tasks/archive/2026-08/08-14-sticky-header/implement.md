# Implement: 顶栏冻结固定在页面顶部

> 内联工作流，纯 CSS 改动，跳过 JSONL manifest。

## 变更清单（有序）

1. **追加 `assets/css/extended/custom.css`**（`.header` 冻结规则）：
   ```css
   .header {
     position: sticky;
     top: 0;
     z-index: 100;          /* 高于正文与 sticky TOC */
     background: var(--theme); /* 遮挡滚动内容，避免透明透出 */
     border-bottom: 1px solid var(--border); /* 冻结后与正文的视觉分界 */
   }
   ```
   - `position: sticky; top: 0`：header 为 body 直接子元素，粘在视口顶。
   - `z-index`：高于正文与 sticky TOC（TOC 用 `position: sticky` 无显式 z-index，默认 auto）。
   - `background: var(--theme)`：冻结后遮挡下方滚动内容。
   - `border-bottom`：明暗模式下均用 `var(--border)`，与主题一致。
2. **`static/js/toc-sidebar.js` / TOC 逻辑**：预期**无需改动**（scroll-spy 与 fit 从 DOM 读 `header.offsetHeight`=60px，冻结后高度不变）。

## 验证命令

- 浏览器（桌面 ≥1080px + 移动 <1080px）：
  - 上下滚动 → 顶栏始终固定顶部，内容从下方滚过。
  - 滚动时顶栏背后不透明（无正文透出）。
  - 顶栏不与正文/卡片重叠异常。
  - sticky TOC 侧栏仍固定在 `header + 16px` 之下，scroll-spy 高亮正常，主题切换按钮可用。
  - 深/浅色模式各检查一次（背景色跟随 `var(--theme)`）。

## 风险 / 回滚点

- 仅追加 CSS 到 `assets/css/extended/custom.css`。删除即回滚。
- 风险点：若 header 高度未来变化，`--header-height` 需同步；当前 60px 冻结后不变，无影响。
- `public/` 是构建产物（本环境无 hugo），本次纯源码 CSS 改动，本地构建时自动生效；不把无关 dev 模式 HTML 提交。

## 提交前检查

- [ ] `themes/PaperMod/` 零改动。
- [ ] AC1–AC6 逐条通过。
