$ErrorActionPreference = 'Stop'

$unityExe = 'E:\Program Files\Unity\Hub\Editor\6000.4.10f1\Editor\Unity.exe'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$logDir = Join-Path $projectRoot 'Logs'
$logFile = Join-Path $logDir 'UnityBuild.log'
$buildDir = Join-Path $projectRoot 'Build\Windows'
$desktopTarget = 'C:\Users\preda\OneDrive\Desktop\MASTIL-Unity-Testversion'

if (-not (Test-Path -LiteralPath $unityExe)) {
  throw "Unity wurde nicht gefunden: $unityExe"
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
if (Test-Path -LiteralPath $logFile) {
  Remove-Item -LiteralPath $logFile -Force
}

Write-Host 'Unity baut jetzt die Windows-Testversion...'
$argumentLine = @(
  '-batchmode',
  '-quit',
  '-projectPath', "`"$projectRoot`"",
  '-executeMethod', 'Mastil.Editor.MastilBuild.BuildWindowsDesktop',
  '-logFile', "`"$logFile`""
) -join ' '

$unityProcess = Start-Process -FilePath $unityExe -ArgumentList $argumentLine -Wait -PassThru -NoNewWindow

if ($unityProcess.ExitCode -ne 0) {
  Write-Host 'Unity-Build ist fehlgeschlagen. Letzte Log-Zeilen:'
  if (Test-Path -LiteralPath $logFile) {
    Get-Content -LiteralPath $logFile -Tail 80
  }
  exit $unityProcess.ExitCode
}

$exePath = Join-Path $buildDir 'MASTIL.exe'
if (-not (Test-Path -LiteralPath $exePath)) {
  throw "Build wurde nicht gefunden: $exePath"
}

$desktopRoot = [System.IO.Path]::GetFullPath('C:\Users\preda\OneDrive\Desktop')
$targetFull = [System.IO.Path]::GetFullPath($desktopTarget)
if (-not $targetFull.StartsWith($desktopRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Zielordner liegt nicht auf dem Desktop: $targetFull"
}

if (Test-Path -LiteralPath $targetFull) {
  Remove-Item -LiteralPath $targetFull -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $targetFull | Out-Null
Copy-Item -Path (Join-Path $buildDir '*') -Destination $targetFull -Recurse -Force

@'
MASTIL Unity Testversion

Start:
1. MASTIL.exe doppelklicken
2. Im Hauptmenue Kampagne starten oder Gefecht gegen KI waehlen
3. Eigene Tuerme anklicken, Ziele auf verbundenen Wegen angreifen und Tuerme upgraden

Diese Version ist eine direkt startbare Testversion ohne Installation.
'@ | Set-Content -LiteralPath (Join-Path $targetFull 'START-HIER.txt') -Encoding UTF8

Write-Host "Fertig: $targetFull"
