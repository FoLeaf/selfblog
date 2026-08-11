# SEO / 搜索引擎收录约定

## robotsNoIndex 约定

- 不希望被搜索引擎收录的页面(测试文章、搜索页、section 索引页)在 front matter 设置
  `robotsNoIndex = true`(YAML 用 `robotsNoIndex: true`)。
- 效果(实测 2026-08-11):
  - `themes/PaperMod/layouts/_partials/head.html` 输出 `<meta name="robots" content="noindex, nofollow">`;
  - 自定义 `layouts/sitemap.xml` 用 `where .Pages "Params.robotsNoIndex" "!=" true` 把该页排除出 sitemap。

## 自定义 sitemap 是必需项(不是可选项)

- `layouts/sitemap.xml` 是 SEO 契约的一部分,**必须入库**。
- 若该模板丢失,构建回退到 Hugo 默认 sitemap,会把 `robotsNoIndex` 页面(测试文章、`/search/`)
  重新放进 sitemap。线上曾出现 20-URL 的默认 sitemap,与仓库 13/29-URL 版本不一致。
- 验证方式:`scripts/check.ps1` 构建后检查 `sitemap.xml` 的 `<loc>` 列表,不应出现
  `/p/test/`、`/search/`、`/post/`、`/page/` 等 noindex URL。

## public/ 必须由生产构建生成

- 发布目录 `public/` 只能由 `scripts/build.ps1`(含 `--environment production`)生成。
- `hugo server`(dev)会往 `public/` 写入 `http://localhost:1313/` 地址,提交后会污染线上
  robots.txt / sitemap / canonical。
- 提交前检查:`rg "localhost:1313" public` 必须无命中。

## 站点验证标签配置

- Google / Bing:在 `hugo.yaml` 配置 `params.analytics.google.SiteVerificationTag` /
  `params.analytics.bing.SiteVerificationTag`,PaperMod head 模板渲染
  `google-site-verification` / `msvalidate.01`。
- 百度:配置 `params.analytics.baidu.SiteVerificationTag`,`layouts/partials/extend_head.html`
  条件渲染 `baidu-site-verification`;留空时零输出。
- 验证标签留空值即可提交;token 由用户从站长平台获取后填入。

## IndexNow(Bing 快速收录)

- 验证密钥文件:仓库 `static/e5e4aefd854e93b7edb691b93a3e72dd.txt`(同步到 `public/`)。
- 密钥文件名与文件内容均为同一 UUID,部署后应可访问
  `https://www.19y.cc/e5e4aefd854e93b7edb691b93a3e72dd.txt`。
