[CmdletBinding()]
param(
    [string]$Key = 'e5e4aefd854e93b7edb691b93a3e72dd',
    [string]$HostName = 'www.19y.cc',
    [string]$SitemapUrl = 'https://www.19y.cc/sitemap.xml'
)

$ErrorActionPreference = 'Stop'

# Pull every URL from the live sitemap and submit it through IndexNow so the
# participating search engines (Bing, Yandex, Naver, Seznam, ...) crawl it
# right away. The key file is hosted at https://<HostName>/<Key>.txt.
$sitemap = (Invoke-WebRequest -UseBasicParsing $SitemapUrl -TimeoutSec 30).Content
$urls = [regex]::Matches($sitemap, '<loc>([^<]+)</loc>') | ForEach-Object { $_.Groups[1].Value }
if (-not $urls) {
    Write-Error "No URLs found in sitemap: $SitemapUrl"
}

$body = @{
    host        = $HostName
    key         = $Key
    keyLocation = "https://$HostName/$Key.txt"
    urlList     = @($urls)
} | ConvertTo-Json -Depth 4

$response = Invoke-WebRequest -UseBasicParsing -Method Post `
    -Uri 'https://api.indexnow.org/indexnow' `
    -ContentType 'application/json; charset=utf-8' `
    -Body $body `
    -TimeoutSec 60

Write-Host "Submitted $($urls.Count) URLs to IndexNow: HTTP $($response.StatusCode)"
