# Design: 桌面目录可读性修复（轻微缩小 + 超长滚动）

## Problem

`static/js/toc-sidebar.js` 的 `fitSidebar()` 把 `--toc-scale` 一路缩到最低 0.5，导致桌面 sticky 目录文字过小。移动端已用「固定可读字号 + 列表滚动」正确解决（`assets/css/extended/custom.css` 移动 media query：`max-height: 58vh; overflow-y: auto`）。桌面侧栏复用同一思路即可。

## Approach

在桌面侧栏沿用移动端既有的「滚动」方案，只做**轻微**的字体缩小（下限 ~0.85）作为轻度溢出的缓冲；一旦在最小缩放下仍放不下，就让列表本身滚动。

### `static/js/toc-sidebar.js` — 重写 `fitSidebar()`

新增可读下限常量：

```js
// Never shrink the TOC text below this fraction of its natural size;
// below this we scroll the list instead (mirrors the mobile behavior).
var MIN_TOC_SCALE = 0.85;
```

`fitSidebar()` 逻辑改为（替换现有 0.5 钳制逻辑）：

1. `position !== 'sticky'` → 还原 `--toc-scale: 1`，清除列表滚动状态，return（现状不变）。
2. 计算 `available = window.innerHeight - headerOffset`。
3. 先还原 `--toc-scale: 1` **并清除上一轮滚动状态**（`list.style.maxHeight/overflowY` 置空），再测量自然高度 `height = list.offsetHeight`。
4. `height <= available || available <= 0` → 完全适配，return（不缩放、不滚动）。
5. 计算 `scale = Math.max(available / height, MIN_TOC_SCALE)`，设 `--toc-scale = scale.toFixed(3)`。
6. 缩放后重测 `fitted = list.offsetHeight`；若 `fitted > available` → 启用列表滚动：
   ```js
   list.style.maxHeight = available + 'px';
   list.style.overflowY = 'auto';
   ```

要点：
- 步骤 3 必须先清滚动状态再测高，否则 `max-height` 会钳制 `offsetHeight` 导致误判。
- 滚动用内联样式而非 CSS class，因为 `available` 随视口动态变化，与 `fitSidebar` 现有「JS 驱动布局」风格一致。

### `assets/css/extended/custom.css` — 无需改动

内联 `max-height`/`overflow-y` 已足够（对齐移动端 `overflow-y: auto`）。桌面列表 `overscroll-behavior: contain` 可留作可选优化，但非必需，保持最小改动。

## Compatibility & Regression

- sticky 定位、滚动高亮（scroll-spy `updateActive`）、`--effect` 光标动效、marker/tick 结构均不涉及，不受影响。
- `updateStickyRelease()` 在恢复 sticky 时回调 `fitSidebar()`，会同步刷新缩放/滚动状态，逻辑自洽。
- 仅当列表超长时新增滚动；正常文章目录（不超长）行为与现状完全一致。

## Rollback

改动集中在 `fitSidebar()` 一个函数 + 一个常量。回滚 = 还原该函数为 0.5 钳制版本（git checkout 该文件）。

## Trade-offs

- 下限 0.85 是 UX 取舍：更高可读性但更早出现滚动条；0.85（≈15px）已被用户确认。
- 滚动仅在需要时启用，轻微溢出（未到 0.85）仍靠缩小适配，避免无谓滚动。
