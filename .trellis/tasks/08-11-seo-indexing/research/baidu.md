# 百度收录:准备性支持评估与外部步骤

## 评估结论(2026-08-11)

- **不实现独立的 `baidusitemap.xml`**。理由:
  - 百度站长平台接受标准 sitemap 协议,现有 `sitemap.xml` 已可直接在平台提交;
  - 单独生成一份内容相同的 baidusitemap 无增量价值,徒增维护面;
  - 百度收录的主风险是托管在 Vercel 导致的国内可达性/抓取不稳定,不是文件格式问题。
- **已落地**:`hugo.yaml` 增加 `params.analytics.baidu.SiteVerificationTag` 占位,`layouts/partials/extend_head.html` 条件渲染
  `<meta name="baidu-site-verification">`。填入 token 后即可完成百度站长平台验证(前提:百度爬虫可访问站点)。

## 用户侧外部步骤(部署后执行)

### Google Search Console

1. 访问 <https://search.google.com/search-console>,添加资源 `https://www.19y.cc/`。
2. 验证方式:推荐 DNS TXT 记录(或把 `google-site-verification` token 填入 `hugo.yaml` 的
   `params.analytics.google.SiteVerificationTag` 后重新构建部署)。
3. 验证通过后,在「站点地图」提交 `sitemap.xml`。

### Bing Webmaster Tools

1. 访问 <https://www.bing.com/webmasters>,可通过「从 Google Search Console 导入」直接迁移,或独立添加站点。
2. 验证:填入 `params.analytics.bing.SiteVerificationTag`(msvalidate.01)后重新构建部署,或使用 DNS 验证。
3. 提交 `sitemap.xml`。

### 百度站长平台(可选,效果不保证)

1. 访问 <https://ziyuan.baidu.com>,添加站点并验证(填 `baidu-site-verification` token 后重新构建部署)。
2. 提交 sitemap 或使用手动收录;若 Vercel 在国内不可达,抓取可能失败,收录不保证。
3. 可选的主动推送(普通收录/快速收录 API)需在部署流程中集成,超出本次范围。

## 验证检查

- 填入测试 token 后生产构建,页面 `<head>` 出现对应验证 meta;留空时不输出任何验证 meta。
