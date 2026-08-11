[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $HugoArgs
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$hugo = & (Join-Path $PSScriptRoot 'get-hugo.ps1')
$cacheDir = Join-Path $projectRoot '.hugo-cache'

& $hugo server `
    --source $projectRoot `
    --cacheDir $cacheDir `
    --noBuildLock `
    --bind 127.0.0.1 `
    --port 1313 `
    --navigateToChanged `
    --buildDrafts `
    --buildFuture `
    --disableFastRender `
    @HugoArgs

exit $LASTEXITCODE
