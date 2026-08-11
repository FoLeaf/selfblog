[CmdletBinding()]
param(
    [string] $Destination = 'public',
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $HugoArgs
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$hugo = & (Join-Path $PSScriptRoot 'get-hugo.ps1')
$cacheDir = Join-Path $projectRoot '.hugo-cache'
$destinationPath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $Destination))

& $hugo `
    --source $projectRoot `
    --cacheDir $cacheDir `
    --noBuildLock `
    --minify `
    --environment production `
    --destination $destinationPath `
    --cleanDestinationDir `
    @HugoArgs

exit $LASTEXITCODE
