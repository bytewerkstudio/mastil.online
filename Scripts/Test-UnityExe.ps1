$ErrorActionPreference = 'Stop'

$target = 'C:\Users\preda\OneDrive\Desktop\MASTIL-Unity-Testversion'
$exe = Join-Path $target 'MASTIL.exe'

if (-not (Test-Path -LiteralPath $exe)) {
  throw "MASTIL.exe wurde nicht gefunden: $exe"
}

Write-Host 'Starte MASTIL.exe fuer einen kurzen Test...'
$process = Start-Process -FilePath $exe -WorkingDirectory $target -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 8

$log = Join-Path $env:USERPROFILE 'AppData\LocalLow\Bytewerk Studio\MASTIL\Player.log'

if ($process.HasExited) {
  if (Test-Path -LiteralPath $log) {
    Write-Host 'Player.log:'
    Get-Content -LiteralPath $log -Tail 60
  }
  throw "MASTIL.exe wurde zu frueh beendet."
}

Stop-Process -Id $process.Id -Force

if (Test-Path -LiteralPath $log) {
  $errors = Select-String -Path $log -Pattern 'Exception|NullReference|MissingMethod|ArgumentException|Scripts have compiler errors' -CaseSensitive:$false
  if ($errors) {
    Write-Host 'Player.log Fehler:'
    $errors | Select-Object -First 20 LineNumber,Line | Format-Table -AutoSize
    throw 'MASTIL.exe startet, aber das Player.log enthaelt Fehler.'
  }
}

Write-Host 'EXE-Test erfolgreich: MASTIL.exe startet und bleibt aktiv.'
