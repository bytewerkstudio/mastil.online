$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host 'Starting MASTIL local server...'
Start-Process powershell -WindowStyle Hidden -ArgumentList @('-NoExit', '-Command', "Set-Location '$root'; npm run dev:server")

Start-Sleep -Seconds 2
Write-Host 'Starting MASTIL game...'
npm run dev
