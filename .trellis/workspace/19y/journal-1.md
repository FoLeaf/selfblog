# Journal - 19y (Part 1)

> AI development session journal
> Started: 2026-08-11

---



## Session 1: SEO Indexing Optimization

**Date**: 2026-08-11
**Task**: SEO Indexing Optimization
**Branch**: `master`

### Summary

优化搜索引擎收录率:提交自定义 sitemap 与 robotsNoIndex 标记、站点验证标签占位、图片 alt、IndexNow 密钥;生产构建重建 public/;沉淀 SEO 约定到 spec。

### Git Commits

| Hash | Message |
|------|---------|
| `3ab16a1` | (see git log) |
| `0fe2052` | (see git log) |
| `0824686` | (see git log) |
| `376e96d` | (see git log) |
| `b88f8b0` | (see git log) |

### Status

[OK] **Completed**


## Session 2: PC端目录可读性修复

**Date**: 2026-08-14
**Task**: PC端目录可读性修复
**Branch**: `master`

### Summary

重写 fitSidebar：把 --toc-scale 下限从 0.5 提到 0.85，列表超长时改用 max-height + overflow-y:auto 滚动（对齐移动端做法）。浏览器实测：长目录缩到 0.850 后滚动、短目录保持 1 不缩放、resize 双向切换正常、移动端折叠卡不回归。

### Git Commits

| Hash | Message |
|------|---------|
| `4dbed7b` | (see git log) |

### Status

[OK] **Completed**


## Session 3: 修复目录刻度与滚动条回归

**Date**: 2026-08-14
**Task**: 修复目录刻度与滚动条回归
**Branch**: `master`

### Summary

上轮给内层 .line-sidebar__list 加 overflow-y:auto 导致左侧 marker/刻度被裁切、滚动条可见。改为由外层 .toc-mobile wrapper 用 CSS 隐藏滚动条兜底滚动，内层 list 不再成为滚动容器。浏览器验证：刻度恢复、无滚动条、0.85 可读下限保留、resize 双向正常、移动端不回归。

### Git Commits

| Hash | Message |
|------|---------|
| `63e10e0` | (see git log) |

### Status

[OK] **Completed**


## Session 4: 主题切换圆形扩散动画

**Date**: 2026-08-14
**Task**: 主题切换圆形扩散动画
**Branch**: `master`

### Summary

新增 View Transition 主题切换动画：layouts/partials/extend_footer.html 用 capture 阶段 + stopImmediatePropagation 接管 #theme-toggle，startViewTransition 包裹切换并从按钮坐标圆形 clip-path 扩散；custom.css 追加 ::view-transition-new/old(root) 动画。不支持 API 或 prefers-reduced-motion 时零侵入降级到主题原生 handler。浏览器验证：主路径动画+单次切换+坐标变量正确，降级路径原生 handler 单次切换无报错，未改 themes/PaperMod/。

### Git Commits

| Hash | Message |
|------|---------|
| `848ad4f` | (see git log) |

### Status

[OK] **Completed**


## Session 5: 顶栏冻结固定在页面顶部

**Date**: 2026-08-14
**Task**: 顶栏冻结固定在页面顶部
**Branch**: `master`

### Summary

在 custom.css 追加 .header sticky 规则：position:sticky;top:0;z-index:100;background:var(--theme);border-bottom。浏览器确定性验证：滚动到底部(scrollY=1459) 后 headerTop=0、pos=sticky，背景随 var(--theme)。TOC scroll-spy 从 DOM 读 header.offsetHeight(60px) 冻结后不变，无需改 JS。未改 themes/PaperMod/。

### Git Commits

| Hash | Message |
|------|---------|
| `242ff76` | (see git log) |

### Status

[OK] **Completed**
