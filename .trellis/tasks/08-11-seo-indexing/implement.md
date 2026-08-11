# 执行计划:优化搜索引擎收录率

## 顺序与检查点

### 1. 源改动入库(前置,最重要)

- [ ] 确认并提交 SEO 关键源文件(与其他未提交工作区改动一起规划,见 Phase 3.4 提交规范):
  - `layouts/sitemap.xml`(未跟踪,自定义 sitemap,排除 `robotsNoIndex`)
  - `content/post/_index.md`、`content/page/_index.md`(未跟踪,section noindex)
  - `content/page/search/index.md`(搜索页 noindex)
  - `content/post/alltest.md`、`alltest1.md`、`test.md`(测试文章 robotsNoIndex)
  - `hugo.yaml`(如已含相关改动)
- [ ] 校验点:`python ./.trellis/scripts/task.py validate 08-11-seo-indexing` 之外,用 `git status` 确认无遗漏的 SEO 文件未入库。

### 2. 站点验证配置

- [ ] `hugo.yaml` 增加:
  - `params.analytics.google.SiteVerificationTag: ""`(占位)
  - `params.analytics.bing.SiteVerificationTag: ""`(占位)
  - `params.analytics.baidu.SiteVerificationTag: ""`(占位,配合 extend_head)
- [ ] 新增 `layouts/partials/extend_head.html`:当 `site.Params.analytics.baidu.SiteVerificationTag` 非空时输出 `<meta name="baidu-site-verification" content="...">`。
- [ ] 校验点:填入测试值后生产构建,首页 HTML 含对应验证 meta;留空时不输出。

### 3. 百度准备性支持(可选但按决策执行)

- [ ] 评估并(轻量)实现 `baidusitemap.xml`:新增 Hugo output format(参考 `layouts/sitemap.xml` 逻辑),仅含可收录 URL,`robots.txt` 不引用(百度不强制)。
- [ ] 若评估认为维护成本 > 收益,在 `research/` 记录结论并跳过,PRD 不变。

### 4. 图片 alt

- [ ] `content/post/bluebrigecup/post.md`:约 113 张截图补 alt(截图系列可用「题目/界面截图 N」+ 内容要点;描述性优先)。
- [ ] `content/post/A_small_bug_in_CubeMX_regarding_the_brake_input/index.md`:2 张图补描述性 alt。
- [ ] 校验点:`rg -o '!\[[^\]]*\]\([^)]*\)' content/post -g '*.md'` 结果中无空 alt。

### 5. 重建 public/ 与部署验证

- [ ] 运行 `.\scripts\build.ps1`(生产环境)重建 `public/`。
- [ ] 校验点:
  - `rg "localhost:1313" public` 无命中;
  - `public/robots.txt` 的 Sitemap 为 `https://www.19y.cc/sitemap.xml`;
  - `public/sitemap.xml` 不含 `/p/test/`、`/search/` 等 noindex URL;
  - `public/search/index.html`、`public/p/test/index.html` 输出 `noindex, nofollow`。
- [ ] 提交 `public/` 与源改动(与用户确认提交计划后执行,见 Phase 3.4)。
- [ ] 部署后线上复测(与 PRD 验收一致):robots.txt、sitemap.xml、`/search/` noindex、测试文章 noindex、canonical www。

### 6. 用户侧外部步骤(文档化,不阻塞代码)

- [ ] 在 `research/` 或 PRD Notes 记录:
  - Google Search Console:验证 `https://www.19y.cc/`(推荐 DNS 验证)→ 提交 `sitemap.xml`。
  - Bing Webmaster:导入 GSC 或独立验证 → 提交 `sitemap.xml`。
  - 百度站长平台(可选):验证站点 → 提交 sitemap/手动收录;若 Vercel 不可达,效果不保证。

## 风险点与回滚

- 未入库的 `layouts/sitemap.xml` 是 CI 构建回退默认 sitemap 的根因,入库前不得以 CI 模式部署。
- `public/` 以 dev 构建提交会污染线上:提交前必须过第 5 步校验。
- 百度相关改动均为增量、可逆;extend_head 空值时零输出,不影响现有页面。
