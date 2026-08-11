# 优化搜索引擎收录率

## Goal

让 19y 技术博客(`https://www.19y.cc/`)的各页面更容易被搜索引擎抓取和收录:把已完成的 sitemap/robots 修复落地到发布流程,补齐站点验证、图片 SEO 和百度准备性支持,并建立可验证的部署检查。

## 背景(证据来源:仓库代码 + 生产构建产物 + 线上站点 2026-08-11 实测)

已就绪(实测确认,无需重复建设):

- Hugo 0.164 + PaperMod,`baseURL: https://www.19y.cc/`,`params.env: production`;裸域 308 → `www`。
- 当前源码生产构建(`scripts/check.ps1` 实测)输出正确:robots.txt 指向 www sitemap;sitemap 仅 12 个可收录 URL(测试文章、`/search/`、`/post/`、`/page/` 均排除);测试文章页与搜索页均输出 `noindex, nofollow`;文章 canonical 为 www 地址。
- head 元数据齐全:robots、title、description、keywords、author、canonical、OG、Twitter Card、JSON-LD(BreadcrumbList + BlogPosting/Organization)。
- 测试文章 `robotsNoIndex = true`、搜索页 `robotsNoIndex: true`、`content/post/_index.md` 与 `content/page/_index.md` 均已设 noindex;404 页、RSS、`index.json` 存在。

待处理缺口:

1. **关键源改动未入库**:`layouts/sitemap.xml`、`content/post/_index.md`、`content/page/_index.md` 是未跟踪文件;`content/page/search/index.md`、测试文章、`hugo.yaml` 等有未提交改动。若部署由 CI 从 git 构建,未入库的自定义 sitemap 会丢失,Hugo 默认 sitemap 会把 noindex 页面全部放回(实测线上曾出现含测试文章和 `/search/` 的 20-URL 版本,与该现象一致)。
2. **无站点验证配置**:`hugo.yaml` 未配置 `params.analytics.google.SiteVerificationTag` / `bing.SiteVerificationTag`(PaperMod 原生支持,直接配置即可),无法在 Search Console / Bing Webmaster 验证并提交 sitemap。
3. **百度准备性支持为零**:PaperMod 无百度验证标签,需新增 `layouts/partials/extend_head.html` 条件渲染;无 baidusitemap 输出。
4. **图片 alt 缺失**:内容目录 116 张图片(约 10 MB),`bluebrigecup/post.md` 约 113 张截图 alt 全为空,CubeMX 文章 2 张图为无意义文件名。
5. **`public/` 卫生**:工作区 `public/` 当前是 `hugo server` 生成的 dev 产物(robots/sitemap/canonical 为 `http://localhost:1313/`),直接提交会污染线上;部署物必须用 `scripts/build.ps1` 生产重建。
6. **搜索页 JSON-LD 空日期**:`datePublished: 0001-01-01`(搜索页 noindex 后影响很小,可选清理)。

## Requirements

1. 将 SEO 关键源改动纳入版本控制并随发布流程生效:自定义 `layouts/sitemap.xml`、`robotsNoIndex` 内容标记、搜索页与 section index noindex。
2. 在 `hugo.yaml` 配置 Google / Bing 站点验证标签(占位,用户填入 token 后渲染);百度验证通过 `layouts/partials/extend_head.html` 条件渲染。
3. 为全部内容图片补充非空、描述性 alt(重点:bluebrigecup 截图与 CubeMX 图片)。
4. 重建 `public/` 为生产构建产物,无 localhost 地址;提交前用命令校验。
5. 输出部署后线上验证清单(robots / sitemap / noindex / canonical)。
6. 文档化用户侧外部步骤:Search Console、Bing Webmaster 验证与 sitemap 提交;百度站长平台(可选,效果不保证)。

## Acceptance Criteria

- [ ] `layouts/sitemap.xml` 与全部 SEO 相关源改动已提交,CI/干净构建可复现同样 sitemap。
- [ ] 生产构建的 `sitemap.xml` 仅含可收录 URL(无测试文章、无 `/search/`、无 noindex 页),全部为 `https://www.19y.cc/` 地址。
- [ ] `/search/`、`/p/test/`、`/p/全格式测试/`、`/p/slugtest/` 输出 `meta robots: noindex`。
- [ ] `hugo.yaml` 含 Google/Bing 验证配置项与百度验证占位,填入 token 后对应 meta 正常渲染。
- [ ] 内容图片 alt 覆盖率 100%(非空、有描述)。
- [ ] 提交的 `public/` 由 `scripts/build.ps1` 生成,`rg localhost:1313 public` 无命中。
- [ ] 部署后线上 robots.txt / sitemap.xml / noindex 页面复测通过。

## Key Decisions(已确认)

- 目标范围:**Google + Bing 完整落地;百度仅准备性支持**(验证标签占位 + 可选 baidusitemap),不承诺收录效果。
- 部署约束:当前流程为「本地生产构建 → 提交 `public/` → 部署」;修复必须同时入库源文件与重建后的 `public/`。若未来改 CI 构建,源文件入库是前提。

## Out of Scope

- 关键词排名、每篇文章独立 description 摘要等内容创作层面 SEO(可拆子任务)。
- 多语言 / hreflang(单语言站点)。
- 移除旧主题 `hugo-theme-stack` 残留、历史 URL 迁移(与收录无直接关系)。
- 图片压缩/WebP 处理流水线(alt 覆盖后若需性能优化可拆子任务)。

## Risks / Deferred

- **百度收录效果不保证**:站点托管于 Vercel,国内可达性与百度爬虫抓取存在不确定性;本任务只做准备性支持。
- **部署机制未 100% 确证**:线上与 git HEAD 的 `public/` 逐字节一致,但存在 CI 构建的可能;两种模式下"源文件 + public/ 双提交"均为安全做法,验收时以线上复测为准。
- **搜索页 JSON-LD 空日期**:影响小,列为可选清理项。
