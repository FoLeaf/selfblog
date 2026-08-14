# Design: 主题切换动画（View Transition 圆形扩散）

## Problem

PaperMod 主题在 `footer.html`（约 94-108 行）用 `addEventListener("click", ...)` 监听 `#theme-toggle`，直接切 `html.dataset.theme` 并写 `localStorage`。我们要在其之上叠加「从按钮点击位置圆形扩散」的 View Transition 动画，且**不修改主题文件**、**不与主题原生 handler 叠加**（否则一次点击会切换两次、来回跳）。

## Key constraint: 双 handler 冲突与时序

注入点 `layouts/partials/extend_footer.html` 被主题 footer 第 42 行调用，**早于**主题 theme-toggle script（约 94-108 行）执行。因此：

- 若我在 extend_footer 里也直接 `addEventListener`（冒泡阶段），会与主题 handler 叠加 → 一次点击切换两次。
- 必须**接管**按钮点击，阻止主题原生 handler。

**方案**：在 `extend_footer.html` 脚本中用 **capture 阶段**绑定 handler，并调用 `stopImmediatePropagation()`：

```js
var btn = document.getElementById("theme-toggle");
if (btn && document.startViewTransition) {
    btn.addEventListener("click", handler, true); // capture 阶段
}
```

- capture 阶段先于冒泡阶段执行，`stopImmediatePropagation()` 会阻止同一目标（按钮）上剩余的监听器（包括主题在冒泡阶段绑定的 handler）→ 由我们完全接管，切换只发生一次。
- **时序**：extend_footer 脚本在主题 handler 绑定**之前**执行。为保险，用 `setTimeout(..., 0)` 或 `DOMContentLoaded` 让我们的 capture handler 在所有内联脚本（含主题 handler）之后才绑定——此时 `stopImmediatePropagation` 才能命中主题的冒泡 handler。用 capture 阶段即可保证先于冒泡，无需精确依赖绑定顺序，但延迟绑定更稳。

> 备选（更重）：整体覆盖主题 `footer.html`。不采用——违背「不改主题」约束，且会连带主题其他 footer 脚本。

## View Transition 实现

### JS（`layouts/partials/extend_footer.html`）

```js
function applyTheme(next) {
    var html = document.documentElement;
    html.dataset.theme = next;
    localStorage.setItem("pref-theme", next);
}

function toggleTheme(e) {
    var html = document.documentElement;
    var next = html.dataset.theme === "dark" ? "light" : "dark";
    // 从按钮点击坐标圆形扩散：把起点传给 CSS 变量
    var x = e.clientX, y = e.clientY;
    var root = document.documentElement;
    var r = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );
    if (document.startViewTransition) {
        var t = document.startViewTransition(function () { applyTheme(next); });
        t.ready.then(function () {
            root.style.setProperty("--vt-x", x + "px");
            root.style.setProperty("--vt-y", y + "px");
            root.style.setProperty("--vt-r", r + "px");
        });
    } else {
        applyTheme(next);
    }
}

// 延迟到所有内联脚本（含主题 handler）之后，再接管按钮
window.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    if (document.startViewTransition) {
        btn.addEventListener("click", toggleTheme, true); // capture, 阻止主题 handler
    }
    // 若浏览器不支持 View Transition，保持主题原生 handler 不动（降级）
});
```

要点：
- **降级**：仅当 `document.startViewTransition` 存在才接管按钮；否则不绑定，主题原生 handler 照常工作（完全无动画、零侵入）。不支持的浏览器不报错。
- **capture + stopImmediatePropagation**：在 `toggleTheme` 里（或绑定处）对事件调用 `e.stopImmediatePropagation()`，确保主题冒泡 handler 不执行。放 `toggleTheme` 内最稳。
- `prefers-reduced-motion` 处理见下。

### CSS（`assets/css/extended/custom.css`）

```css
/* 主题切换的圆形扩散视图过渡 */
::view-transition-new(root) {
  animation: theme-circle-in 0.5s ease;
  clip-path: circle(var(--vt-r, 100vh) at var(--vt-x, 50%) var(--vt-y, 50%));
}
::view-transition-old(root) {
  animation: theme-circle-out 0.5s ease;
}

@keyframes theme-circle-in {
  from { clip-path: circle(0 at var(--vt-x, 50%) var(--vt-y, 50%)); }
  to   { clip-path: circle(var(--vt-r, 100vh) at var(--vt-x, 50%) var(--vt-y, 50%)); }
}
@keyframes theme-circle-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
```

- `clip-path: circle()` 从 `--vt-x/--vt-y`（按钮点击坐标）扩散到半径 `--vt-r`（覆盖整屏）。
- 旧视图淡出、新视图圆形扩散进入。

### prefers-reduced-motion 降级

在 `toggleTheme` 中，若 `matchMedia('(prefers-reduced-motion: reduce)').matches`，跳过动画直接 `applyTheme(next)`（不走 startViewTransition，或走但禁用 CSS 动画）。更简单：检测到 reduce 时直接调用 `applyTheme`，不接管按钮的特殊动画。

```js
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (document.startViewTransition && !reduceMotion) {
    // 接管 + 动画
} else {
    // 不动，走主题原生 handler（无动画）
}
```

## Compatibility

- View Transition API：现代 Chromium/Edge/Safari 17.2+ 支持；Firefox 暂不支持 → 自动降级为无动画直接切换。
- `prefers-reduced-motion`：遵循，不播放动画。
- 不触碰 `themes/PaperMod/`，升级主题无冲突。
- localStorage / `html.dataset.theme` 行为与主题一致。

## Rollback

- 改动仅 `layouts/partials/extend_footer.html`（新增）+ `assets/css/extended/custom.css`（追加）。删除这两处新增即可回滚。
- 若 capture 接管有问题，最坏情况是主题原生 handler 仍工作（切换功能不坏），只是可能叠加——已在 `toggleTheme` 内 `stopImmediatePropagation` 杜绝。

## Trade-offs

- 仅当浏览器支持时接管按钮：换来「零侵入降级」，代价是不支持浏览器没有动画（可接受，功能不受影响）。
- capture 接管依赖事件阶段语义：已在设计上用 `stopImmediatePropagation` + 延迟绑定双保险。
