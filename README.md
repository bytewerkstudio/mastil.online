# MASTIL Unity

MASTIL wird ab jetzt als Unity-Spiel entwickelt. Electron, HTML und der alte Web-Spielaufbau wurden aus dem aktiven Projekt entfernt.

## Aktueller Stand

- Unity Editor: `E:\Program Files\Unity\Hub\Editor\6000.4.10f1\Editor\Unity.exe`
- Ziel-Testversion: `C:\Users\preda\OneDrive\Desktop\MASTIL-Unity-Testversion\MASTIL.exe`
- Erste spielbare Version: Top-down-2D-Prototyp mit Hauptmenue, Weltkarte, Gefecht, Tuerme, Schloesser, Angriffen, Upgrades, einfacher KI und Sieg/Niederlage.

## Testversion bauen

```powershell
powershell -ExecutionPolicy Bypass -File Scripts\Build-UnityDesktop.ps1
```

Danach liegt die direkt startbare Testversion auf dem Desktop.

## EXE kurz pruefen

```powershell
powershell -ExecutionPolicy Bypass -File Scripts\Test-UnityExe.ps1
```

Das startet `MASTIL.exe`, prueft ob sie laeuft, und beendet sie danach wieder.
