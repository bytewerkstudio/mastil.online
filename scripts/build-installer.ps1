$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$iscc = Join-Path $env:LOCALAPPDATA 'Programs\Inno Setup 6\ISCC.exe'
$script = Join-Path $root 'installer\mastil.iss'

if (!(Test-Path -LiteralPath $iscc)) {
  throw "Inno Setup compiler not found at $iscc"
}

if (!(Test-Path -LiteralPath (Join-Path $root 'dist\win-unpacked\MASTIL.exe'))) {
  throw "Electron output not found. Run npm run pack:win first."
}

& $iscc $script
