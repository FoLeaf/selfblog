# PC端目录标签过多时字体过度缩小导致可读性差

## Goal

PC端（≥1080px）左侧 LineSidebar 目录在标签过多时，`fitSidebar` 会把 `--toc-scale` 一路缩到最低 0.5 倍（约 50% 字体，~8.8px），导致目录文字过小、可读性严重下降。目标：限制最小可读缩放；当列表在最小缩放下仍超出可用高度时，改用滚动/其他方案让所有标签仍然可达，而不是无限缩小字体。

## Confirmed Facts (from repo evidence)

- `static/js/toc-sidebar.js` 中的 `fitSidebar()` 是自动缩放实现：
  - 先按自然尺寸测量 `list.offsetHeight`；
  - 若 `height > available`，`scale = max(available/height, 0.5)` —— **0.5 即可读性杀手**；
  - 再做一次校正 pass，同样被 `0.5` 下限钳制。
- `assets/css/extended/custom.css` 中 `--toc-scale` 同时缩放 `font-size`（`.line-sidebar__link`、`.line-sidebar__label`）和 `--item-gap`（行距），因此缩到 0.5 时文字与间距都减半。
- **移动端（<1080px）已经是正确方案**：`.toc-mobile > .toc .line-sidebar__list` 设置 `max-height: 58vh; overflow-y: auto;`，字体固定为 `0.95rem`，超长时用**滚动**而非缩小字体。
- 桌面 sticky 侧栏列表（`.line-sidebar__list`）目前**没有** `max-height` / `overflow` 限制，仅依赖字体缩放。
- 任务描述已预设方向：限制最小可读缩放 + 列表超长时改用滚动。

## Requirements

- R1: `fitSidebar` 不再把 `--toc-scale` 缩到低于一个可读下限（**用户已确认下限为 0.85**，替代当前的 0.5）。
- R2: 在最小可读缩放（0.85）下列表仍超出可用高度时，改用滚动让全部标签可达（对齐移动端既有做法）。
- R3: 保持现有交互不变：sticky 侧栏、滚动高亮、`--effect` 光标动效、marker/tick 结构、移动端 `<details>` 折叠卡。

## Acceptance Criteria

- [ ] AC1: 标签数量在可用高度内时，`--toc-scale` 保持 1（不缩放），行为与现状一致。
- [ ] AC2: 标签较多时字体最多缩到 0.85 倍可读下限，不再出现 0.5 倍这类过小字号。
- [ ] AC3: 当列表在最小缩放下仍超出 sticky 可用高度时，列表可滚动，所有标签可达（对齐移动端 `overflow-y: auto` 行为）。
- [ ] AC4: 现有交互（sticky 定位、滚动高亮、光标动效、`--effect`、marker/tick、移动端折叠卡、sticky-release before related posts）不回归。
- [ ] AC5: resize 与页面加载时 `fitSidebar` 仍正确触发（含 `<details>` 异步布局的 fitWhenReady 重试）。

## Out of Scope

- 不改移动端 `<details>` 折叠卡行为（已是滚动方案）。
- 不改 LineSidebar 的视觉效果结构（marker、tick、`--effect` 动效体系）。
- 不改 `.line-sidebar` 其他配置参数（`--font-size`、`--item-gap` 默认值等）。

## Open Questions

（无 — 决策已收敛）

## Notes

- 保持 `prd.md` 聚焦需求与验收；技术方案（如何改 `fitSidebar` / 加 CSS 滚动）放 `design.md`。
