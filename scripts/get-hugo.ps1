[CmdletBinding()]
param()

$projectRoot = Split-Path -Parent $PSScriptRoot
$bundledHugo = Join-Path $projectRoot 'hugo.exe'

if (Test-Path -LiteralPath $bundledHugo -PathType Leaf) {
    Write-Output $bundledHugo
    exit 0
}

$installedHugo = Get-Command hugo -ErrorAction SilentlyContinue
if ($null -ne $installedHugo) {
    Write-Output $installedHugo.Source
    exit 0
}

throw @"
Hugo Extended was not found.

Install Hugo Extended 0.146.x or newer and either:
  1. place hugo.exe at: $bundledHugo
  2. or add hugo to PATH

The project uses Hugo Extended because PaperMod uses Hugo's asset pipeline.
"@

