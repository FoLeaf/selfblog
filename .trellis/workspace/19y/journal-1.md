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
