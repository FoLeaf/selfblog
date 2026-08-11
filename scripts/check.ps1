[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$hugo = & (Join-Path $PSScriptRoot 'get-hugo.ps1')
$cacheDir = Join-Path $projectRoot '.hugo-cache'
$destinationPath = Join-Path $projectRoot '.hugo-build-check'

& $hugo `
    --source $projectRoot `
    --cacheDir $cacheDir `
    --noBuildLock `
    --minify `
    --environment production `
    --destination $destinationPath `
    --printPathWarnings

$exitCode = $LASTEXITCODE
if ($exitCode -eq 0) {
    Write-Host "Hugo build check passed: $destinationPath"
}

exit $exitCode
