// Konstanten & Konfiguration
        const TOWER_RADIUS = 25;
        const UNIT_RADIUS = 5;
        const UNIT_SPEED = 60; // Erhöht für flüssigeres Gameplay
        const BASE_GOLD_RATE = 0.36; // Ruhigeres Einkommen: Gold soll strategisch statt automatisch entstehen
        const BASE_UNIT_RATE = 0.3; // Leicht erhöht: ca. 1 Einheit alle 3.3 Sekunden
        const INITIAL_TOWER_CAPACITY = 15; // Erhöht für besseren Start
        const TOWER_UPGRADE_FACTOR = 1.58;
        const CONVERSION_TIME = 2.5; // Etwas schnellere Konversion
        const MIN_DISTANCE_BETWEEN_TOWERS = TOWER_RADIUS * 4; // Verhindert zu eng platzierte Türme
        
        // Game State
        let canvas, ctx;
        let gameWidth, gameHeight;
        let towers = [];
        let units = [];
        let gold = 120; // Solider Start, aber kein zu schneller Ausbau
        let lastTime = 0;
        let gameLoopHandle = null;
        let gameActive = true;
        let wave = 1;
        let screenScale = 1;
        let frameCount = 0;
        let fps = 0;
        let lastFpsUpdate = 0;
        let cameraOffset = { x: 0, y: 0 };
        let gameScale = 1;
        let isPanning = false;
        let lastPanPosition = { x: 0, y: 0 };
        let savedGameState = null;
        let isMusicPlaying = false; // Status der Musikwiedergabe
        
        // Touch Interaction State
        let selectedTower = null;
        let targetTower = null;
        let sliderValue = 50; // Fester Wert (50%)
        
        // Globale Zeitvariable für Animationen
        let gameStartTime = 0;
        
        // UI Elements
        const goldDisplay = document.getElementById('gold-display');
        const waveDisplay = document.getElementById('wave-display');
        const towerMenu = document.getElementById('tower-menu');
        const gameOverScreen = document.getElementById('game-over');
        const restartButton = document.getElementById('restart-button');
        const tutorialScreen = document.getElementById('tutorial');
        const tutorialCloseButton = document.getElementById('tutorial-close');
        const tutorialXCloseButton = document.getElementById('tutorial-x-close');
        const backgroundMusic = document.getElementById('background-music');
        const musicBtnInGame = document.getElementById('music-btn');
        const musicBtnStartScreen = document.getElementById('start-music-btn');
        
        // Tower-Typen
        const TOWER_TYPES = {
            NORMAL: 'normal',
            GOLD: 'gold',
            TROOP: 'troop',
            WATCH: 'watch'
        };
        
        // Fraktions-Typen
        const FACTIONS = {
            PLAYER: 'player',
            ENEMY_1: 'enemy1',
            ENEMY_2: 'enemy2',
            ENEMY_3: 'enemy3',
            NEUTRAL: 'neutral'
        };
        
        // Farbzuordnungen
        const FACTION_COLORS = {
            [FACTIONS.PLAYER]: '#4a6fa5',      // Spieler: harmonisches Blau
            [FACTIONS.ENEMY_1]: '#b85c5c',    // Gegner 1: warmes Rot
            [FACTIONS.ENEMY_2]: '#c97d3d',    // Gegner 2: dunkles Orange
            [FACTIONS.ENEMY_3]: '#7d5fa5',    // Gegner 3: gedecktes Lila
            [FACTIONS.NEUTRAL]: '#bfb6a3'     // Neutral: sandiges Grau
        };
        
        // Stelle sicher, dass die Farbzuordnungen für alle Fraktionen korrekt funktionieren
        function getFactionColor(faction) {
            if (!faction || !FACTION_COLORS[faction]) {
                console.warn('Unknown faction:', faction);
                return '#888888'; // Fallback-Farbe
            }
            return FACTION_COLORS[faction];
        }
        
        // Game Initialization
        function initGame() {
            console.log('Initialisiere Spiel...');
            
            // Lade gespeicherte Qualitätseinstellung
            const savedQuality = localStorage.getItem('graphicsQuality') || 'MEDIUM';
            currentQuality = savedQuality;
            
            // Stelle sicher, dass die Qualität gültig ist und auf MEDIUM als Standard gesetzt wird
            if (!QUALITY_SETTINGS[currentQuality]) {
                console.warn(`Ungültige Qualitätseinstellung: ${currentQuality}, setze auf MEDIUM zurück`);
                currentQuality = 'MEDIUM';
                localStorage.setItem('graphicsQuality', currentQuality);
            }
            
            console.log(`Grafikqualität geladen: ${currentQuality}`);
            
            // Setze Startzeit für Animationseffekte
            gameStartTime = performance.now();
            
            canvas = document.getElementById('game-canvas');
            if (!canvas) {
                console.error('Canvas-Element nicht gefunden!');
                return;
            }
            
            ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Canvas-Kontext konnte nicht erstellt werden!');
                return;
            }
            
            // Resize canvas to window
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            
            // Reset game state
            towers = [];
            units = [];
            gold = 120;
            wave = 1;
            gameActive = true;
            selectedTower = null;
            targetTower = null;
            cameraOffset = { x: 0, y: 0 };
            gameScale = 1;
            window.mastilAiGraceUntil = performance.now() + 9000;

            if (gameOverScreen) {
                gameOverScreen.style.display = 'none';
            }
            const pauseOverlay = document.getElementById('pause-overlay');
            if (pauseOverlay) {
                pauseOverlay.classList.remove('active');
            }
            const transitionScreen = document.getElementById('wave-transition-screen');
            if (transitionScreen) {
                transitionScreen.style.display = 'none';
            }
            
            // Initialisiere Status-Flags für den Wellenübergang
            window.isCheckingWaveTransition = false;
            window.isWaveTransitioning = false;
            window.waveTransitionTimeout = null;
            window.currentWaveToTransition = null;
            
            // Lade Kartenressourcen
            preloadMapAssets();
            
            // Initialize the game map
            initMap();
            
            // Set up event listeners
            setupEventListeners();
            
            // Start game loop
            if (gameLoopHandle) {
                cancelAnimationFrame(gameLoopHandle);
                gameLoopHandle = null;
            }
            lastTime = performance.now();
            gameLoopHandle = requestAnimationFrame(gameLoop);
            
            // Update UI
            updateUI();
        }
        
        function resizeCanvas() {
            const devicePixelRatio = window.devicePixelRatio || 1;
            gameWidth = window.innerWidth;
            gameHeight = window.innerHeight;
            
            canvas.width = gameWidth * devicePixelRatio;
            canvas.height = gameHeight * devicePixelRatio;
            canvas.style.width = gameWidth + 'px';
            canvas.style.height = gameHeight + 'px';
            
            ctx.scale(devicePixelRatio, devicePixelRatio);
            screenScale = Math.min(gameWidth / 800, gameHeight / 600);
        }
        
        // Performance-optimierte Map-Initialisierung
        function initMap() {
            console.log('Initializing map...');
            // Erstelle den Spielerturm
            const playerTower = createTower(
                gameWidth * 0.2,
                gameHeight * 0.5,
                FACTIONS.PLAYER,
                TOWER_TYPES.NORMAL,
                1
            );
            
            // Ensure the player tower exists before pushing
            console.log('Created player tower:', playerTower);
            towers.push(playerTower);
            
            // Erstelle neutrale Türme mit Mindestabstand
            const neutralPositions = [
                {x: gameWidth * 0.5, y: gameHeight * 0.3, type: TOWER_TYPES.WATCH},
                {x: gameWidth * 0.5, y: gameHeight * 0.7, type: TOWER_TYPES.TROOP},
                {x: gameWidth * 0.8, y: gameHeight * 0.5, type: TOWER_TYPES.GOLD},
                {x: gameWidth * 0.35, y: gameHeight * 0.25, type: TOWER_TYPES.NORMAL},
                {x: gameWidth * 0.35, y: gameHeight * 0.75, type: TOWER_TYPES.GOLD}
            ];
            
            neutralPositions.forEach(pos => {
                // Prüfe, ob genügend Abstand zu vorhandenen Türmen besteht
                if (checkTowerPlacementValid(pos.x, pos.y)) {
                    const neutralTower = createTower(
                        pos.x,
                        pos.y,
                        FACTIONS.NEUTRAL,
                        pos.type,
                        1
                    );
                    towers.push(neutralTower);
                }
            });
            
            // Erstelle feindliche Türme
            const enemyPositions = [
                {x: gameWidth * 0.8, y: gameHeight * 0.2, faction: FACTIONS.ENEMY_1, type: TOWER_TYPES.TROOP},
                {x: gameWidth * 0.8, y: gameHeight * 0.8, faction: FACTIONS.ENEMY_2, type: TOWER_TYPES.GOLD}
            ];
            
            enemyPositions.forEach(pos => {
                if (checkTowerPlacementValid(pos.x, pos.y)) {
                    const enemyTower = createTower(
                        pos.x,
                        pos.y,
                        pos.faction,
                        pos.type,
                        1
                    );
                    towers.push(enemyTower);
                }
            });
            
            // Starte direkt mit einigen Einheiten für die feindlichen Türme
            towers.forEach(tower => {
                if (tower.faction.startsWith('enemy')) {
                    tower.units = Math.floor(tower.maxUnits * 0.4);
                }
            });
            
            // Log the initial game state
            console.log('Initial towers created:', towers.length, 'towers');
            
            // Speichere den initialen Zustand für Neustart
            saveGameState();
        }
        
        // Prüfen, ob eine Turmposition gültig ist (genug Abstand zu anderen Türmen)
        function checkTowerPlacementValid(x, y) {
            for (const tower of towers) {
                const dx = tower.x - x;
                const dy = tower.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < MIN_DISTANCE_BETWEEN_TOWERS) {
                    return false;
                }
            }
            return true;
        }
        
        // Speichern des Spielzustands
        function saveGameState() {
            // Deep copy des aktuellen Spielstatus
            savedGameState = {
                towers: JSON.parse(JSON.stringify(towers)),
                gold: gold,
                wave: wave
            };
        }
        
        // Wiederherstellen des gespeicherten Spielzustands
        function restoreGameState() {
            if (savedGameState) {
                towers = JSON.parse(JSON.stringify(savedGameState.towers));
                gold = savedGameState.gold;
                wave = savedGameState.wave;
                units = []; // Einheiten werden zurückgesetzt
            }
        }
        
        function getTowerMaxUnits(faction, type, level) {
            const roleBase = type === TOWER_TYPES.TROOP
                ? 14
                : type === TOWER_TYPES.WATCH
                    ? 12
                    : type === TOWER_TYPES.GOLD
                        ? 11
                        : 10;
            const base = faction === FACTIONS.PLAYER ? Math.max(INITIAL_TOWER_CAPACITY, roleBase) : roleBase;
            return base + (level - 1) * 5;
        }

        function getTowerStartingUnits(faction, type, maxUnits) {
            if (faction === FACTIONS.PLAYER) return Math.min(12, maxUnits);
            if (faction !== FACTIONS.NEUTRAL) return Math.min(4, maxUnits);
            if (type === TOWER_TYPES.WATCH) return Math.min(6, maxUnits);
            if (type === TOWER_TYPES.GOLD) return Math.min(5, maxUnits);
            if (type === TOWER_TYPES.TROOP) return Math.min(4, maxUnits);
            return Math.min(3, maxUnits);
        }

        function hasWatchSupport(tower) {
            if (!tower || tower.type === TOWER_TYPES.WATCH || tower.faction === FACTIONS.NEUTRAL) {
                return false;
            }

            return towers.some(other => {
                if (!other || other === tower || other.faction !== tower.faction || other.type !== TOWER_TYPES.WATCH) {
                    return false;
                }

                const distance = Math.hypot(other.x - tower.x, other.y - tower.y);
                return distance < 285;
            });
        }

        function isTowerFortified(tower) {
            return Boolean(tower && tower.fortifiedUntil && tower.fortifiedUntil > performance.now());
        }

        function createTower(x, y, faction, type, level) {
            const maxUnits = getTowerMaxUnits(faction, type, level);
            const startingUnits = getTowerStartingUnits(faction, type, maxUnits);

            return {
                x,
                y,
                radius: TOWER_RADIUS,
                faction,
                type,
                level,
                units: startingUnits,
                maxUnits,
                unitTimer: 0,
                goldTimer: 0,
                underAttack: false,
                conversionProgress: 0,
                attackingFaction: null,
                fortifiedUntil: 0
            };
        }
        
        function setupEventListeners() {
            // Touch/mouse events for game canvas
            canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchend', handleTouchEnd);
            
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            
            // Event-Listener für Tower-Menü-Buttons werden direkt in showTowerMenu gesetzt
            // Stattdessen nur die UI-Buttons, die immer existieren
            if (restartButton) {
                restartButton.addEventListener('click', function() {
                    window.location.reload();
                });
            }
            
            if (tutorialCloseButton) {
                tutorialCloseButton.addEventListener('click', closeTutorial);
            }
            
            // X-Button für das Tutorial-Fenster
            if (tutorialXCloseButton) {
                tutorialXCloseButton.addEventListener('click', closeTutorial);
            }
            
                    // Unit slider events removed in v2.6.24
        }
        
        // Performance-optimierter Game Loop
        function gameLoop(currentTime) {
            // Zeit-Delta berechnen (mit Begrenzung für stabile Simulation)
            const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
            lastTime = currentTime;
            
            if (gameActive) {
                try {
                    // Spiel-Update mit fester Zeitschrittgröße für stabile Simulation
                    update(deltaTime);
                    
                    // Alle Render-Operationen
                    render();
                    
                    // Debug-Ausgabe für das erste Rendering
                    if (frameCount === 1) {
                        console.log('First render complete, towers:', towers.length);
                    }
                } catch (error) {
                    console.error('Error in game loop:', error);
                }
                
                // Nächsten Frame nur anfordern, wenn die Partie noch aktiv ist.
                gameLoopHandle = gameActive ? requestAnimationFrame(gameLoop) : null;
            }
        }
        
        // Optimierte Update-Funktion 
        function update(deltaTime) {
            // Verarbeite Turmlogik
            updateTowers(deltaTime);
            
            // Verarbeite Einheiten mit optimierter Bewegung
            updateUnits(deltaTime);
            
            // Prüfe Spielzustand
            if (gameActive) {
                checkGameState();
            }
            
            // KI-Updates mit reduzierter Frequenz
            updateAI(deltaTime);
            
            // UI aktualisieren
            updateUI();
        }
        
        // Towerlogik aus Update extrahiert für bessere Performance
        function updateTowers(deltaTime) {
            towers.forEach(tower => {
                // Einheiten generieren
                if (tower.faction !== FACTIONS.NEUTRAL && tower.units < tower.maxUnits) {
                    tower.unitTimer += deltaTime;
                    let unitRate = tower.type === TOWER_TYPES.TROOP ? BASE_UNIT_RATE * 1.55 : BASE_UNIT_RATE;
                    if (hasWatchSupport(tower)) unitRate *= 1.18;
                    const unitGenerationInterval = 1 / unitRate;
                    
                    if (tower.unitTimer >= unitGenerationInterval) {
                        // Mehrere Einheiten auf einmal generieren, wenn Timer überschritten
                        const unitsToAdd = Math.floor(tower.unitTimer / unitGenerationInterval);
                        tower.units = Math.min(tower.maxUnits, tower.units + unitsToAdd);
                        tower.unitTimer %= unitGenerationInterval;
                    }
                }
                
                // Gold für Spielertürme generieren
                if (tower.faction === FACTIONS.PLAYER) {
                    let goldRate = tower.type === TOWER_TYPES.GOLD ? BASE_GOLD_RATE * 1.75 : BASE_GOLD_RATE;
                    goldRate *= 1 + ((tower.level - 1) * 0.28);
                    if (hasWatchSupport(tower)) goldRate *= 1.1;
                    
                    tower.goldTimer += deltaTime * goldRate;
                    if (tower.goldTimer >= 1) {
                        const goldToAdd = Math.floor(tower.goldTimer);
                        gold += goldToAdd;
                        tower.goldTimer -= goldToAdd;
                    }
                }
                
                // Turmkonvertierung
                if (tower.underAttack) {
                    tower.conversionProgress += deltaTime;
                    if (tower.conversionProgress >= CONVERSION_TIME) {
                        tower.faction = tower.attackingFaction;
                        tower.underAttack = false;
                        tower.conversionProgress = 0;
                        tower.attackingFaction = null;
                        // Level zurücksetzen
                        tower.level = 1;
                        tower.maxUnits = getTowerMaxUnits(tower.faction, tower.type, tower.level);
                        tower.fortifiedUntil = 0;
                        // Bonus-Einheiten nach Eroberung
                        tower.units = Math.min(5, Math.floor(tower.maxUnits * 0.2));
                    }
                }
            });
        }
        
        // Einheitenlogik aus Update extrahiert für bessere Performance
        function updateUnits(deltaTime) {
            // Array für zu entfernende Einheiten (besser als Splice in der Schleife)
            const unitsToRemove = [];
            
            for (let i = 0; i < units.length; i++) {
                const unit = units[i];
                
                // Einheitenbewegung mit optimierter Kollisionserkennung
                const dx = unit.targetX - unit.x;
                const dy = unit.targetY - unit.y;
                const distanceSquared = dx * dx + dy * dy;
                
                // Quadratvergleich ist schneller als Wurzelberechnung für Distanzprüfung
                if (distanceSquared < Math.pow(UNIT_RADIUS + TOWER_RADIUS, 2)) {
                    // Einheit hat Zielturm erreicht
                    const targetTower = getTowerAtExactPosition(unit.targetX, unit.targetY);
                    
                    if (targetTower) {
                        processUnitArrival(unit, targetTower);
                    }
                    
                    // Einheit zur Entfernung markieren
                    unitsToRemove.push(i);
                } else {
                    // Bewegungsoptimierung mit vorberechnetem Winkel
                    const distance = Math.sqrt(distanceSquared);
                    const speed = UNIT_SPEED * deltaTime;
                    const moveDistance = Math.min(distance, speed);
                    const normalizedDx = dx / distance;
                    const normalizedDy = dy / distance;
                    
                    unit.x += normalizedDx * moveDistance;
                    unit.y += normalizedDy * moveDistance;
                }
            }
            
            // Einheiten von hinten nach vorne entfernen (um Index-Verschiebung zu vermeiden)
            for (let i = unitsToRemove.length - 1; i >= 0; i--) {
                units.splice(unitsToRemove[i], 1);
            }
        }
        
        // Optimierte Turmsuche an exakter Position
        function getTowerAtExactPosition(x, y) {
            for (let i = 0; i < towers.length; i++) {
                const tower = towers[i];
                if (Math.abs(tower.x - x) < 1 && Math.abs(tower.y - y) < 1) {
                    return tower;
                }
            }
            return null;
        }
        
        // Verarbeite Einheitenankünfte an Zieltürmen
        function processUnitArrival(unit, targetTower) {
            if (targetTower.faction === unit.faction) {
                // Turm verstärken
                targetTower.units = Math.min(targetTower.maxUnits, targetTower.units + 1);
            } else {
                if (isTowerFortified(targetTower) && Math.random() < 0.42) {
                    return;
                }

                // Turm angreifen
                if (targetTower.units > 0) {
                    targetTower.units -= 1;
                } else {
                    // Turm erobern wenn keine Einheiten mehr da sind
                    targetTower.underAttack = true;
                    targetTower.attackingFaction = unit.faction;
                }
            }
        }
        
        // Prüft den Spielzustand auf Siegbedingungen und Welle
        function checkGameState() {
            // Prüfe auf verlorenes Spiel
            const playerTowers = towers.filter(t => t.faction === FACTIONS.PLAYER);
            if (playerTowers.length === 0 && gameActive) {
                gameOver();
                return;
            }
            
            // Verhindere mehrfache Wellenstarts währen einer aktiven Prüfung
            if (window.isCheckingWaveTransition) {
                return;
            }
            
            // Zuverlässige Prüfung aller Gegnertypen
            const enemyTowers = towers.filter(t => 
                t.faction === FACTIONS.ENEMY_1 || 
                t.faction === FACTIONS.ENEMY_2 || 
                t.faction === FACTIONS.ENEMY_3
            );
            
            // Prüfe auch, ob Einheiten unterwegs sind (könnte sonst zu frühzeitigem Wellenstart führen)
            const enemyUnitsInTransit = units.some(u => 
                u.sourceFaction === FACTIONS.ENEMY_1 || 
                u.sourceFaction === FACTIONS.ENEMY_2 || 
                u.sourceFaction === FACTIONS.ENEMY_3
            );
            
            if (enemyTowers.length === 0 && !enemyUnitsInTransit) {
                // FIX: Race-Condition bei Wellenübergang vermeiden, die zum Überspringen von Wellen führt
                // Wenn bereits eine Überprüfung läuft, nicht nochmal starten
                if (window.isCheckingWaveTransition) {
                    console.log("Wellenübergang bereits aktiv - weiterer Aufruf ignoriert");
                    return;
                }
                
                // Vermeide doppelte Wellenübergänge durch Sperre
                window.isCheckingWaveTransition = true;
                
                // Debug-Log zur Bestätigung, dass die Welle erkannt wird
                console.log("Alle Gegner besiegt! Starte Welle " + (wave + 1) + " (aktuelle Welle: " + wave + ")");
                
                // Alle laufenden Timeouts abbrechen
                if (window.waveTransitionTimeout) {
                    clearTimeout(window.waveTransitionTimeout);
                }
                if (window.fallbackWaveTimeout) {
                    clearTimeout(window.fallbackWaveTimeout);
                }
                
                // Eindeutige Welle für diesen Übergang speichern
                window.currentWaveToTransition = wave;
                
                // Zeige Ladeanzeige zwischen den Wellen an
                showWaveTransitionScreen(wave + 1);
                
                // Starte die nächste Welle nach der Ladeanzeige (4 Sekunden)
                window.waveTransitionTimeout = setTimeout(() => {
                    // Sicherheitsabfrage - nur weitermachen, wenn die Welle noch die gleiche ist
                    if (window.currentWaveToTransition === wave) {
                        // Blende die Ladeanzeige aus
                        hideWaveTransitionScreen();
                        
                        // Starte die nächste Welle
                        startNextWave();
                        
                        // Entferne die Sperre mit Verzögerung, nachdem die neue Welle gestartet wurde
                        setTimeout(() => {
                            window.isCheckingWaveTransition = false;
                            window.currentWaveToTransition = null;
                        }, 1500);
                    } else {
                        console.warn(`Welleninkonsistenz: Erwartet ${window.currentWaveToTransition}, aktuell ${wave}`);
                        window.isCheckingWaveTransition = false;
                        window.currentWaveToTransition = null;
                        hideWaveTransitionScreen();
                    }
                }, 4000); // 4 Sekunden Ladezeit zwischen den Wellen

                // Universeller Fallback: Falls nach 5 Sekunden keine neue Welle startet, Button anzeigen
                window.fallbackWaveTimeout = setTimeout(function() {
                    // Doppelte Prüfung, ob wirklich keine Gegner da sind und keine neue Welle gestartet wurde
                    const stillNoEnemies = towers.filter(t => 
                        t.faction === FACTIONS.ENEMY_1 || 
                        t.faction === FACTIONS.ENEMY_2 || 
                        t.faction === FACTIONS.ENEMY_3
                    ).length === 0;
                    
                    // Prüfe ob die neue Welle bereits gestartet wurde und konsistent ist
                    if (stillNoEnemies && window.isCheckingWaveTransition && window.currentWaveToTransition === wave) {
                        window.isCheckingWaveTransition = false; // Entsperre den Zustand
                        window.currentWaveToTransition = null;
                        
                        if (!document.getElementById('fallback-wave-btn')) {
                            const btn = document.createElement('button');
                            btn.id = 'fallback-wave-btn';
                            btn.textContent = 'Nächste Welle starten';
                            btn.style.position = 'absolute';
                            btn.style.top = '50%';
                            btn.style.left = '50%';
                            btn.style.transform = 'translate(-50%, -50%)';
                            btn.style.zIndex = 9999;
                            btn.style.padding = '1.2em 2.5em';
                            btn.style.fontSize = '1.3em';
                            btn.style.background = 'linear-gradient(to bottom, #d4af37, #aa8c2c)';
                            btn.style.color = '#3a2a1d';
                            btn.style.border = '2px solid #3a2a1d';
                            btn.style.borderRadius = '12px';
                            btn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)';
                            btn.onclick = function() {
                                btn.remove();
                                window.isCheckingWaveTransition = false;
                                window.currentWaveToTransition = null;
                                hideWaveTransitionScreen();
                                startNextWave();
                            };
                            document.body.appendChild(btn);
                            console.warn('Fallback-Button für nächste Welle angezeigt (Universeller Fallback)');
                        }
                    }
                }, 5000);
            }
        }
        
        // Startet die nächste Spielwelle mit stärkeren Gegnern
        function startNextWave() {
            // FIX: Weitere Absicherung gegen doppelte Aufrufe und übersprungene Wellen
            const currentWave = wave; // Snapshot der aktuellen Welle
            
            // Debug-Log mit Kennzeichnung für die Wellenstart-Funktion
            console.log(`[WAVE] startNextWave() aufgerufen für Übergang von Welle ${currentWave} -> ${currentWave + 1}`);
            
            // Verhindern mehrfacher Aufrufe während bestehender Transition
            if (window.isWaveTransitioning) {
                console.warn(`[WAVE] Versuch, startNextWave während einer bereits laufenden Transition aufzurufen - verhindert (Welle: ${currentWave})`);
                return;
            }
            
            // Sperre setzen
            window.isWaveTransitioning = true;
            
            // Alle verbleibenden feindlichen Einheiten entfernen
            units = units.filter(u => 
                u.sourceFaction !== FACTIONS.ENEMY_1 && 
                u.sourceFaction !== FACTIONS.ENEMY_2 && 
                u.sourceFaction !== FACTIONS.ENEMY_3
            );
            
            // FIX: Welle nur erhöhen, wenn sie mit unserer Erwartung übereinstimmt
            if (window.currentWaveToTransition !== undefined && 
                window.currentWaveToTransition !== null && 
                window.currentWaveToTransition !== currentWave) {
                console.error(`[WAVE] Welleninkonsistenz verhindert: Erwartet ${window.currentWaveToTransition}, aktuell ${currentWave}`);
                window.isWaveTransitioning = false;
                window.isCheckingWaveTransition = false;
                window.currentWaveToTransition = null;
                return;
            }
            
            wave = currentWave + 1; // Explizit inkrementieren statt ++ um Race-Conditions zu vermeiden
            
            // Welle-Start eindeutig protokollieren
            console.log(`[WAVE] Welle ${wave} wird gestartet (vorherige Welle war ${currentWave})`);
            
            // Sofort die Anzeige aktualisieren
            if (waveDisplay) {
                waveDisplay.textContent = `Welle: ${wave}`;
            }
            
            // Belohnung für Wellenfortschritt
            const waveBonusGold = 35 + (wave * 12);
            gold += waveBonusGold;
            
            // Zeige kurze Nachricht an
            showNotification(`Welle ${wave} beginnt! +${waveBonusGold} Gold`);
            
            // Kurze Verzögerung einbauen, um Rendering-Probleme zu vermeiden
            setTimeout(() => {
                try {
                    // Setze das Spielfeld zurück und erstelle neue Türme
                    resetGameBoard();
                    
                    // Speichere den Spielzustand
                    saveGameState();
                    
                    // Debug-Log für erfolgreichen Start
                    console.log(`[WAVE] Welle ${wave} erfolgreich gestartet und Spielfeld zurückgesetzt`);
                } catch (error) {
                    console.error(`[WAVE] Fehler beim Starten der Welle ${wave}:`, error);
                    // Stelle sicher, dass der Spiel-Loop nicht unterbrochen wird
                }
                
                // Sperre nach erfolgreichem Start aufheben
                setTimeout(() => {
                    window.isWaveTransitioning = false;
                    console.log(`[WAVE] Transition für Welle ${wave} abgeschlossen, Sperre aufgehoben`);
                }, 800); // Längere Sperrzeit für bessere Stabilität
            }, 100); // Etwas längere Verzögerung
        }
        
        // Zeigt eine temporäre Benachrichtigung an
        function showNotification(message, duration = 3000) {
            const notification = document.createElement('div');
            notification.className = 'game-notification';
            notification.textContent = message;
            
            document.getElementById('ui-layer').appendChild(notification);
            
            // Entferne Nachricht nach Dauer
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 500);
            }, duration);
        }
        
        // Zeigt einen kompakten visuellen Indikator für Schnellangriffe an
        function showQuickAttackIndicator(sourceTower, targetTower, unitCount) {
            // Erstelle einen visuellen Indikator direkt am Zielturm
            const indicator = document.createElement('div');
            indicator.className = 'quick-attack-indicator';
            
            // Positioniere den Indikator über dem Zielturm
            const uiLayer = document.getElementById('ui-layer');
            indicator.style.left = `${targetTower.x}px`;
            indicator.style.top = `${targetTower.y - targetTower.radius - 30}px`;
            
            // Füge Pfeilsymbol und Einheitenzahl hinzu
            indicator.innerHTML = `<span class="attack-arrow mastil-attack-icon" aria-hidden="true"></span> <span class="attack-count">${unitCount}</span>`;
            
            // Füge Fraktionsfarbe des Angreifers hinzu
            indicator.style.color = '#b85c5c';
            
            // Füge zum UI hinzu
            uiLayer.appendChild(indicator);
            
            // Entferne nach 1.5 Sekunden mit Fade-Out-Animation
            setTimeout(() => {
                indicator.classList.add('fade-out');
                setTimeout(() => {
                    indicator.remove();
                }, 300);
            }, 1200);
        }
        
        // Zeigt eine stilvolle mittelalterliche Willkommensnachricht an
        function showRoyalWelcome(playerName, factionId) {
            // Entferne bereits vorhandene Willkommensnachrichten
            const existingWelcome = document.querySelector('.royal-welcome');
            if (existingWelcome) {
                existingWelcome.remove();
            }
            
            // Fraktionsspezifische Informationen vorbereiten
            let factionTitle = "";
            let factionIcon = "";
            let factionDesc = "";
            
            switch(factionId) {
                case 'england':
                    factionTitle = "Ritter von Albion";
                    factionIcon = '<span class="mastil-inline-icon mastil-faction-icon mastil-icon-england" aria-hidden="true"></span>';
                    factionDesc = "Die Traditionen und die Tapferkeit Eurer Ritter werden Euch zum Sieg führen!";
                    break;
                case 'spain':
                    factionTitle = "Solterraner von Esperia";
                    factionIcon = '<span class="mastil-inline-icon mastil-faction-icon mastil-icon-spain" aria-hidden="true"></span>';
                    factionDesc = "Die Sonne scheint auf Euer Reich und Eure Entdeckergeist kennt keine Grenzen!";
                    break;
                case 'maya':
                    factionTitle = "Sternenleser von Yaxtun";
                    factionIcon = '<span class="mastil-inline-icon mastil-faction-icon mastil-icon-maya" aria-hidden="true"></span>';
                    factionDesc = "Das Wissen der Sterne leitet Eure Eroberungen und Rituale!";
                    break;
                case 'abbasid':
                    factionTitle = "Kalifat von Al-Kimiya";
                    factionIcon = '<span class="mastil-inline-icon mastil-faction-icon mastil-icon-abbasid" aria-hidden="true"></span>';
                    factionDesc = "Die Weisheit der alten Schriften und das Feuer der Wüste begleiten Euch!";
                    break;
                case 'hre':
                    factionTitle = "Aethelgardisches Reich";
                    factionIcon = '<span class="mastil-inline-icon mastil-faction-icon mastil-icon-hre" aria-hidden="true"></span>';
                    factionDesc = "Die Macht des Kaisers und die Einigkeit der Fürsten stehen hinter Euch!";
                    break;
                default:
                    factionTitle = "Edles Reich";
                    factionIcon = '<span class="mastil-inline-icon mastil-faction-icon mastil-icon-england" aria-hidden="true"></span>';
                    factionDesc = "Eure Herrschaft wird die Welt verändern!";
            }
            
            // Erstelle das Pergament-Element
            const welcome = document.createElement('div');
            welcome.className = 'royal-welcome';
            
            // Personalisierte Anrede basierend auf dem Namen und der Fraktion
            let title = `${factionIcon} ${factionTitle}`;
            let message = `Sei willkommen, ${playerName ? 'Majestät ' + playerName : 'Eure Majestät'}!<br>${factionDesc}<br>Erobert Türme, erweitert Euer Königreich und beweist Eure strategische Überlegenheit.`;
            let signature = 'Auf Euren Erfolg!';
            
            // Füge Inhalte hinzu
            welcome.innerHTML = `
                <div class="royal-welcome-title">${title}</div>
                <div class="royal-welcome-message">${message}</div>
                <div class="royal-welcome-signature">${signature}</div>
                <div class="royal-seal"></div>
            `;
            
            // Füge zum UI hinzu
            document.body.appendChild(welcome);
            
            // Entferne nach 6 Sekunden (Animation dauert 5s, 1s Puffer)
            setTimeout(() => {
                if (welcome.parentNode) {
                    welcome.remove();
                }
            }, 6000);
        }
        
        // Verbesserte KI-Logik für aggressiveres Verhalten
        function updateAI(deltaTime) {
            if (window.mastilAiGraceUntil && performance.now() < window.mastilAiGraceUntil) {
                return;
            }

            const enemyFactions = [FACTIONS.ENEMY_1, FACTIONS.ENEMY_2, FACTIONS.ENEMY_3];
            
            for (const faction of enemyFactions) {
                const enemyTowers = towers.filter(t => t.faction === faction);
                
                if (enemyTowers.length === 0) continue;
                
                // Taktische Analyse der Spielsituation
                const playerTowers = towers.filter(t => t.faction === FACTIONS.PLAYER);
                const neutralTowers = towers.filter(t => t.faction === FACTIONS.NEUTRAL);
                
                // Berechne die Gesamtstärke der Fraktionen
                const playerStrength = playerTowers.reduce((sum, t) => sum + t.units, 0);
                const neutralStrength = neutralTowers.reduce((sum, t) => sum + t.units, 0);
                const factionStrength = enemyTowers.reduce((sum, t) => sum + t.units, 0);
                
                // Taktische Entscheidung: Fokus auf schwächere Ziele oder Spieler
                const shouldFocusPlayer = playerStrength < (factionStrength * 1.5) || neutralStrength < (factionStrength * 0.5);
                
                for (const tower of enemyTowers) {
                    // Exponentiell wachsende Aggression mit der Welle
                    const baseAggression = 0.2;
                    const waveGrowth = Math.pow(1.2, wave - 1);
                    const aggressionFactor = Math.min(0.95, baseAggression + (waveGrowth * 0.1));
                    
                    // Weniger Einheiten zum Angriff nötig in höheren Wellen
                    const minUnitPercentToAttack = Math.max(0.1, 0.3 - (wave * 0.02));
                    
                    if (tower.units > tower.maxUnits * minUnitPercentToAttack) {
                        let targetTower = null;
                        // Exponentiell wachsende Angriffswahrscheinlichkeit
                        const baseAttackChance = 0.02;
                        const attackGrowth = Math.pow(1.15, wave - 1);
                        const chanceToAttack = Math.min(0.05, baseAttackChance * attackGrowth) * deltaTime * (1 + aggressionFactor);
                        
                        if (Math.random() < chanceToAttack) {
                            // Taktische Zielauswahl
                            let potentialTargets = [];
                            
                            if (shouldFocusPlayer) {
                                // Fokus auf Spielertürme
                                potentialTargets = playerTowers;
                                if (potentialTargets.length === 0) {
                                    potentialTargets = neutralTowers;
                                }
                            } else {
                                // Fokus auf neutrale Türme
                                potentialTargets = neutralTowers;
                                if (potentialTargets.length === 0) {
                                    potentialTargets = playerTowers;
                                }
                            }
                            
                            if (potentialTargets.length > 0) {
                                let bestTarget = null;
                                let bestScore = -Infinity;
                                
                                for (const target of potentialTargets) {
                                    const dx = target.x - tower.x;
                                    const dy = target.y - tower.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    
                                    // Taktische Bewertung der Ziele
                                    const distanceScore = 1500 / (distance + 1);
                                    const unitDeficitScore = 300 / (target.units + 1);
                                    const strategicScore = target.faction === FACTIONS.PLAYER ? 200 : 100;
                                    
                                    // Bonus für isolierte Ziele
                                    const nearbyAllies = towers.filter(t => 
                                        t.faction === target.faction && 
                                        Math.sqrt(Math.pow(t.x - target.x, 2) + Math.pow(t.y - target.y, 2)) < 200
                                    ).length;
                                    const isolationBonus = (3 - nearbyAllies) * 100;
                                    
                                    const totalScore = distanceScore + unitDeficitScore + strategicScore + isolationBonus;
                                    
                                    if (totalScore > bestScore) {
                                        bestScore = totalScore;
                                        bestTarget = target;
                                    }
                                }
                                
                                targetTower = bestTarget;
                            }
                        }
                        
                        if (targetTower) {
                            // Taktische Einheitenverteilung
                            let unitPercentage = 0.6 + (aggressionFactor * 0.4);
                            
                            // Mehr Einheiten gegen Spielertürme
                            if (targetTower.faction === FACTIONS.PLAYER) {
                                unitPercentage += 0.25;
                            }
                            
                            // Berücksichtigung der Entfernung
                            const dx = targetTower.x - tower.x;
                            const dy = targetTower.y - tower.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            const distanceFactor = Math.max(0.3, 1 - (distance / (gameWidth + gameHeight)));
                            
                            // Berücksichtigung der eigenen Stärke
                            const strengthFactor = Math.min(1.2, 0.8 + (tower.units / tower.maxUnits));
                            
                            unitPercentage *= distanceFactor * strengthFactor;
                            
                            // Sende Einheiten
                            const unitsToSend = Math.max(1, Math.floor(tower.units * unitPercentage));
                            sendUnitsFromTower(tower, targetTower, unitsToSend);
                        }
                    }
                }
            }
        }
        
        // Verbessertes Rendering mit dynamischer Qualitätsanpassung
        function render() {
            // Speichere den aktuellen Kontext-Zustand für konsistentes Rendering
            ctx.save();
            
            // Lösche Canvas mit effizienterer Methode für mobile Geräte
            ctx.clearRect(0, 0, gameWidth, gameHeight);
            
            // Zeichne Hintergrund - je nach Qualitätseinstellung unterschiedlich detailliert
            const gridDetail = getQualitySetting('gridDetail');
            if (gridDetail !== 'low') {
                renderGrid();
            } else {
                // Bei niedrigster Qualität nur einfarbigern Hintergrund
                ctx.fillStyle = '#f9f5eb';
                ctx.fillRect(0, 0, gameWidth, gameHeight);
            }
            
            // Zeichne Verbindungen zwischen Türmen - abhängig von Qualitätseinstellung
            renderConnections();
            
            // Zeichne Türme
            renderTowers();
            
            // Zeichne Einheiten mit Batchverarbeitung - limitiert je nach Qualitätseinstellung
            renderUnits();
            
            // Zeichne UI-Elemente - immer in voller Qualität für beste Benutzbarkeit
            renderUI();
            
            // Debug nur anzeigen, wenn er bewusst per Taste aktiviert wurde.
            if (showDebugInfo) {
                renderDebugInfo();
            }
            
            // Stelle den ursprünglichen Kontext-Zustand wieder her
            ctx.restore();
            
            // Zusätzlich alle Attribute explizit zurücksetzen für absolute Sicherheit
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.globalCompositeOperation = 'source-over';
        }
        
        // Zeichne Hintergrundgitter
        // Mittelalterliche Karten-Assets als Base64-Bilder
        const MAP_ASSETS = {
            // Pergament-Hintergrund für die Karte
            background: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InJnYmEoMjQ1LCAyMzAsIDIwMCwgMC45MikiLz48cGF0aCBkPSJNNSAwIDAgbDEwMCA1MGBsMTAwIC01MGBaIiBzdHJva2U9InJnYmEoMTgwLCAxNTAsIDEwMCwgMC4yKSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNSAxMDAgbDUwIC0yNSBsNTAgMjUgbDUwIC0yNSBsNTAgMjUiIHN0cm9rZT0icmdiYSgxODAsIDE1MCwgMTAwLCAwLjE1KSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNSAyMDAgbDUwIC0yNSBsNTAgMjUgbDUwIC0yNSBsNTAgMjUiIHN0cm9rZT0icmdiYSgxODAsIDE1MCwgMTAwLCAwLjIpIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik01MCAwIGwwIDIwMCIgc3Ryb2tlPSJyZ2JhKDE4MCwgMTUwLCAxMDAsIDAuMSkiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE1MCAwIGwwIDIwMCIgc3Ryb2tlPSJyZ2JhKDE4MCwgMTUwLCAxMDAsIDAuMSkiIHN0cm9rZS13aWR0aD0iMC41IiBmaWxsPSJub25lIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PHJlY3QgeD0iMC41JSIgeT0iMC41JSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0icmdiKDI0NSwgMjMwLCAyMDApIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=',
            
            // Kompassrose für die Karte (oben rechts)
            compass: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOEI0NTEzIiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuOCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4QjQ1MTMiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyIiBmaWxsPSIjOEI0NTEzIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNNSA1MCAwIEw1MyA0OCBMMjAgNTAgTDI3IDEwMCIgZmlsbD0iIzhCNDUxMyIgb3BhY2l0eT0iMC45Ii8+PHBhdGggZD0iTTUgNTAgTDQ4IDQ3IEw1MCA1MCBMNDggNTMgWiIgZmlsbD0iIzhCNDUxMyIgb3BhY2l0eT0iMC42Ii8+PHBhdGggZD0iTTk1IDUwIEw1MiA1MyBMNTAgNTAgTDUyIDQ3IFoiIGZpbGw9IiM4QjQ1MTMiIG9wYWNpdHk9IjAuOSIvPjx0ZXh0IHg9IjUwIiB5PSIxNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzVEMzYxQSIgZm9udC1mYW1pbHk9IkNpbnplbCwgc2VyaWYiIGZvbnQtd2VpZ2h0PSIyLjUiPk48L3RleHQ+PHRleHQgeD0iNTAiIHk9IjkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNUQzNjFBIiBmb250LWZhbWlseT0iQ2luemVsLCBzZXJpZiIgZm9udC1zaXplPSIyLjUiIGZvbnQtd2VpZ2h0PSIyLjUiPkM8L3RleHQ+PHRleHQgeD0iNSIgeT0iNTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1RDM2MUEiIGZvbnQtZmFtaWx5PSJDaW56ZWwsIHNlcmlmIiBmb250LXNpemU9IjIuNSIgZm9udC13ZWlnaHQ9IjIuNSI+VzwvdGV4dD48dGV4dCB4PSI4NSIgeT0iNTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1RDM2MUEiIGZvbnQtZmFtaWx5PSJDaW56ZWwsIHNlcmlmIiBmb250LXNpemU9IjIuNSIgZm9udC13ZWlnaHQ9IjIuNSI+RTwvdGV4dD48L3N2Zz4=',
            
            // Kartenrand mit abgenutztem Aussehen
            border: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxmaWx0ZXIgaWQ9ImRpc3RyZXNzIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC4wNSIgbnVtT2N0YXZlcz0iMiIgc3RpdGNoVGlsZXM9InN0aXRjaCIgcmVzdWx0PSJub2lzZSIvPjxmZURpc3BsYWNlbWVudE1hcCBpbj0ibm9pc2UiIHNjYWxlPSIyIiB4Q2hhbm5lbFNlbGVjdG9yPSJSIiB5Q2hhbm5lbFNlbGVjdG9yPSJHIiByZXN1bHQ9ImRpc3BsYWNlbWVudCIgLz48L2ZpbHRlcj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGI0NTEzIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtZGFzaGFycmF5PSI1LCA1IiBmaWx0ZXI9InVybCgjZGlzdHJlc3MpIiBvcGFjaXR5PSIwLjMiLz48cmVjdCB3aWR0aD0iOTklIiBoZWlnaHQ9Ijk5JSIgeD0iMC41JSIgeT0iMC41JSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOGI0NTEzIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjI1LCAyLCAzLCAyLCAzLCAyIiBmaWx0ZXI9InVybCgjZGlzdHJlc3MpIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=',
            
            // Mittelalterliche Dekorationselemente
            decoration: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZyBvcGFjaXR5PSIwLjMiIGZpbGw9IiM4YjQ1MTMiPjxwYXRoIGQ9Ik0xMCAxMCBMMjAgNSBMMzAgMTAgTDI1IDIwIFoiLz48cGF0aCBkPSJNOTAgMTAgTDgwIDUgTDcwIDEwIEw3NSAyMCBaIi8+PHBhdGggZD0iTTEwIDkwIEwyMCA5NSBMMzAgOTAgTDI1IDgwIFoiLz48cGF0aCBkPSJNOTAgOTAgTDgwIDk1IEw3MCA5MCBMNzUgODAgWiIvPjwvZz48L3N2Zz4='
        };
        
        // Lade Kartenbilder vorab
        const mapImages = {};
        function preloadMapAssets() {
            for (const [key, src] of Object.entries(MAP_ASSETS)) {
                mapImages[key] = new Image();
                mapImages[key].src = src;
            }
        }
        
        // Verbesserte Kartenrenderung mit mittelalterlichen Elementen
        function renderGrid() {
            // Speichere den Kontext-Zustand
            ctx.save();
            
            // Hintergrund immer weiß mit leichtem Pergament-Farbton
            ctx.fillStyle = '#f9f5eb';
            ctx.fillRect(0, 0, gameWidth, gameHeight);
            
            // Zeichne mittelalterliches Gitternetz mit Karomuster
            ctx.strokeStyle = 'rgba(139, 69, 19, 0.08)';
            ctx.lineWidth = 1;
            
            const gridSize = 60;
            
            // Horizontale Linien mit leichter Variation
            for (let y = 0; y < gameHeight; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                // Leicht wellige Linien für authentisches Aussehen
                for (let x = 0; x < gameWidth; x += 20) {
                    const wobble = Math.sin(x / 100) * 2;
                    ctx.lineTo(x, y + wobble);
                }
                ctx.stroke();
            }
            
            // Vertikale Linien mit leichter Variation
            for (let x = 0; x < gameWidth; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                // Leicht wellige Linien für authentisches Aussehen
                for (let y = 0; y < gameHeight; y += 20) {
                    const wobble = Math.sin(y / 100) * 2;
                    ctx.lineTo(x + wobble, y);
                }
                ctx.stroke();
            }
            
            // Stelle den Kontext-Zustand wieder her
            ctx.restore();
        }
        
        // Optimiertes Rendern der Verbindungen mit dynamischer Qualitätsanpassung
        function renderConnections() {
            // Fade-In-Animation beim Spielstart hinzufügen
            const animProgress = Math.min(1, (performance.now() - gameStartTime) / 2000);
            ctx.globalAlpha = animProgress;
            
            // Basis-Verbindungsstil
            ctx.strokeStyle = 'rgba(140, 112, 84, 0.25)';
            ctx.lineWidth = 2;
            
            // Verbindungslimit basierend auf Qualitätseinstellung
            const connectionLimit = getQualitySetting('connectionLimit');
            const connectionDetail = getQualitySetting('connectionDetail');
            
            // Qualitätsabhängiger Schwellenwert für Verbindungen
            // Bei niedrigerer Qualität weniger Verbindungen zeichnen
            let connectionThreshold = (gameWidth + gameHeight) / 6;
            if (connectionDetail === 'low') {
                connectionThreshold = (gameWidth + gameHeight) / 8;
            } else if (connectionDetail === 'medium') {
                connectionThreshold = (gameWidth + gameHeight) / 7;
            }
            
            // Zähler für gezeichnete Verbindungen
            let connectionCount = 0;
            
            // Verwende for-Schleife statt forEach für bessere Performance
            for (let i = 0; i < towers.length && connectionCount < connectionLimit; i++) {
                const t1 = towers[i];
                
                for (let j = i + 1; j < towers.length && connectionCount < connectionLimit; j++) {
                    const t2 = towers[j];
                    
                    // Schnellere Distanzberechnung mit Quadraten statt Wurzelfunktion
                    const dx = t2.x - t1.x;
                    const dy = t2.y - t1.y;
                    const distanceSquared = dx * dx + dy * dy;
                    
                    if (distanceSquared < connectionThreshold * connectionThreshold) {
                        connectionCount++;
                        
                        // Fraktionsbasierte Linienstile, vereinfacht bei niedriger Qualität
                        if (t1.faction === t2.faction) {
                            ctx.strokeStyle = `${FACTION_COLORS[t1.faction]}${connectionDetail === 'low' ? '60' : '80'}`;
                            ctx.lineWidth = connectionDetail === 'low' ? 1 : 2;
                        } else {
                            ctx.strokeStyle = `rgba(140, 112, 84, ${connectionDetail === 'low' ? '0.15' : '0.2'})`;
                            ctx.lineWidth = 1;
                        }
                        
                        ctx.beginPath();
                        ctx.moveTo(t1.x, t1.y);
                        ctx.lineTo(t2.x, t2.y);
                        ctx.stroke();
                    }
                }
            }
            
            // globalAlpha zurücksetzen
            ctx.globalAlpha = 1;
        }

        // Optimiertes Rendering aller Türme
        function renderTowers() {
            // Fade-In-Animation beim Spielstart hinzufügen
            const animProgress = Math.min(1, (performance.now() - gameStartTime) / 2000);
            ctx.globalAlpha = animProgress;
            
            // Erst neutrale, dann feindliche, dann Spielertürme rendern (Ebenen-Sortierung)
            const orderedTowers = [...towers].sort((a, b) => {
                if (a.faction === FACTIONS.PLAYER) return 1;
                if (b.faction === FACTIONS.PLAYER) return -1;
                if (a.faction === FACTIONS.NEUTRAL) return -1;
                if (b.faction === FACTIONS.NEUTRAL) return 1;
                return 0;
            });
            
            for (const tower of orderedTowers) {
                renderTower(tower);
            }
            
            // globalAlpha zurücksetzen
            ctx.globalAlpha = 1;
            
            // Schatten-Einstellungen zurücksetzen
            ctx.shadowColor = 'rgba(0, 0, 0, 0)';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // Superverbessertes Turm-Rendering mit detaillierten 2.5D-Schlössern (Version 2.4.0)
        function renderTower(tower) {
            // Fehlersichere Prüfung, ob der Turm gültige Werte hat
            if (!tower || typeof tower.x !== 'number' || typeof tower.y !== 'number' || !tower.faction) {
                console.error('Invalid tower data:', tower);
                return;
            }
            
            const level = tower.level || 1;
            const x = tower.x;
            const y = tower.y;
            const baseColor = getFactionColor(tower.faction);
            
            // Speichere den Kontext-Zustand
            ctx.save();
            
            // Erweiterte Schatten für noch besseren 3D-Effekt - abhängig von Qualitätseinstellung
            const shadowQuality = getQualitySetting('shadowQuality');
            if (shadowQuality > 0) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = shadowQuality;
                ctx.shadowOffsetX = shadowQuality > 6 ? 5 : 3;
                ctx.shadowOffsetY = shadowQuality > 6 ? 5 : 3;
            }
            
            // Dynamische Schloss-Größe basierend auf Level
            const baseWidth = 25 + (level * 8);
            const baseHeight = 18 + (level * 6);
            const depth = 8 + (level * 2);
            
            // Steinmuster für realistischere Optik - abhängig von Qualitätseinstellung
            function drawStonePattern(x, y, width, height, color) {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, width, height);
                
                // Steinlinien nur zeichnen, wenn Qualität ausreichend hoch ist
                if (getQualitySetting('detailedStonePattern')) {
                    ctx.strokeStyle = darkenColor(color, 40);
                    ctx.lineWidth = 1;
                    // Angepasste Größe der Steine je nach Qualitätseinstellung
                    const stoneWidth = currentQuality === 'MEDIUM' ? 20 : 15;
                    const stoneHeight = currentQuality === 'MEDIUM' ? 15 : 10;
                    
                    for (let i = 0; i < width; i += stoneWidth) {
                        for (let j = 0; j < height; j += stoneHeight) {
                            ctx.beginPath();
                            ctx.rect(x + i, y + j, stoneWidth, stoneHeight);
                            ctx.stroke();
                        }
                    }
                }
            }
            
            // Hauptburg mit Steinmuster
            drawStonePattern(x - baseWidth/2, y - baseHeight/2, baseWidth, baseHeight, baseColor);
            
            // Verbesserte obere Fläche mit Verlauf
            const gradient = ctx.createLinearGradient(x - baseWidth/2, y - baseHeight/2, x + baseWidth/2, y + baseHeight/2);
            gradient.addColorStop(0, lightenColor(baseColor, 30));
            gradient.addColorStop(1, lightenColor(baseColor, 10));
            ctx.fillStyle = gradient;
            
            const points = [
                [x - baseWidth/2, y - baseHeight/2],
                [x + baseWidth/2, y - baseHeight/2], 
                [x + baseWidth/2 + depth, y - baseHeight/2 - depth],
                [x - baseWidth/2 + depth, y - baseHeight/2 - depth]
            ];
            
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            points.forEach(point => ctx.lineTo(point[0], point[1]));
            ctx.closePath();
            ctx.fill();
            
            // Rechte Seite mit Verlauf
            const rightGradient = ctx.createLinearGradient(x + baseWidth/2, y - baseHeight/2, x + baseWidth/2 + depth, y + baseHeight/2);
            rightGradient.addColorStop(0, darkenColor(baseColor, 20));
            rightGradient.addColorStop(1, darkenColor(baseColor, 40));
            ctx.fillStyle = rightGradient;
            
            ctx.beginPath();
            ctx.moveTo(x + baseWidth/2, y - baseHeight/2);
            ctx.lineTo(x + baseWidth/2, y + baseHeight/2);
            ctx.lineTo(x + baseWidth/2 + depth, y + baseHeight/2 - depth);
            ctx.lineTo(x + baseWidth/2 + depth, y - baseHeight/2 - depth);
            ctx.closePath();
            ctx.fill();
            
            // Zinnen an der Oberseite
            ctx.fillStyle = lightenColor(baseColor, 20);
            for (let i = 0; i < 5; i++) {
                const crenelX = x - baseWidth/2 + (i * baseWidth/4);
                const crenelWidth = baseWidth/6;
                const crenelHeight = 6;
                
                if (i % 2 === 0) {
                    ctx.fillRect(crenelX, y - baseHeight/2 - crenelHeight, crenelWidth, crenelHeight);
                }
            }
            
            // Haupttor/Eingang (ab Level 2)
            if (level >= 2) {
                const gateWidth = baseWidth * 0.3;
                const gateHeight = baseHeight * 0.6;
                const gateX = x - gateWidth/2;
                const gateY = y + baseHeight/2 - gateHeight;
                
                // Tor-Hintergrund (dunkel)
                ctx.fillStyle = darkenColor(baseColor, 60);
                ctx.fillRect(gateX, gateY, gateWidth, gateHeight);
                
                // Torbogen
                ctx.beginPath();
                ctx.arc(x, gateY, gateWidth/2, 0, Math.PI);
                ctx.fill();
                
                // Tor-Details
                ctx.strokeStyle = darkenColor(baseColor, 40);
                ctx.lineWidth = 3;
                ctx.strokeRect(gateX, gateY, gateWidth, gateHeight);
            }
            
            // Erweiterte Turm-Logik mit fraktionsspezifischen Stilen
            const towerCount = Math.min(2 + Math.floor(level/2), 12);
            const towerPositions = [];
            for (let i = 0; i < towerCount; i++) {
                const angle = (i / towerCount) * Math.PI * 2;
                const radius = baseWidth * 0.55;
                towerPositions.push({
                    x: x + Math.cos(angle) * radius,
                    y: y + Math.sin(angle) * radius * 0.7
                });
            }
            
            // Zeichne Türme mit fraktionsspezifischen Details
            towerPositions.forEach((pos, index) => {
                const towerWidth = 10 + (level * 1.5);
                const towerHeight = 12 + (level * 3) + (index === 0 ? 8 : 0);
                
                // Turmbasis mit Steinmuster
                drawStonePattern(pos.x - towerWidth/2, pos.y - towerHeight, towerWidth, towerHeight, baseColor);
                
                // Turm-Oberfläche mit 3D-Effekt
                ctx.fillStyle = lightenColor(baseColor, 15);
                ctx.beginPath();
                ctx.moveTo(pos.x - towerWidth/2, pos.y - towerHeight);
                ctx.lineTo(pos.x + towerWidth/2, pos.y - towerHeight);
                ctx.lineTo(pos.x + towerWidth/2 + 3, pos.y - towerHeight - 3);
                ctx.lineTo(pos.x - towerWidth/2 + 3, pos.y - towerHeight - 3);
                ctx.closePath();
                ctx.fill();
                
                // Turm-Rechtefläche mit Verlauf
                const towerGradient = ctx.createLinearGradient(pos.x + towerWidth/2, pos.y - towerHeight, pos.x + towerWidth/2 + 3, pos.y);
                towerGradient.addColorStop(0, darkenColor(baseColor, 15));
                towerGradient.addColorStop(1, darkenColor(baseColor, 35));
                ctx.fillStyle = towerGradient;
                
                ctx.beginPath();
                ctx.moveTo(pos.x + towerWidth/2, pos.y - towerHeight);
                ctx.lineTo(pos.x + towerWidth/2, pos.y);
                ctx.lineTo(pos.x + towerWidth/2 + 3, pos.y - 3);
                ctx.lineTo(pos.x + towerWidth/2 + 3, pos.y - towerHeight - 3);
                ctx.closePath();
                ctx.fill();
                
                // Fraktionsspezifische Dächer
                if (level >= 2) {
                    let roofColor = '#8B4513';
                    switch(tower.faction) {
                        case FACTIONS.PLAYER:
                            roofColor = '#2E8B57'; // Grün
                            break;
                        case FACTIONS.ENEMY_1:
                            roofColor = '#8B0000'; // Dunkelrot
                            break;
                        case FACTIONS.ENEMY_2:
                            roofColor = '#4B0082'; // Indigo
                            break;
                        case FACTIONS.ENEMY_3:
                            roofColor = '#FF8C00'; // Orange
                            break;
                    }
                    
                    // Kegelförmiges Dach mit Schindeln
                    ctx.fillStyle = roofColor;
                    ctx.beginPath();
                    ctx.moveTo(pos.x - towerWidth/2, pos.y - towerHeight);
                    ctx.lineTo(pos.x + towerWidth/2, pos.y - towerHeight);
                    ctx.lineTo(pos.x, pos.y - towerHeight - 12);
                    ctx.closePath();
                    ctx.fill();
                    
                    // Dach-Schindeln
                    ctx.strokeStyle = darkenColor(roofColor, 30);
                    ctx.lineWidth = 1;
                    for (let s = 0; s < 3; s++) {
                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y - towerHeight - 2 - (s * 3), towerWidth/2 - (s * 2), 0, Math.PI);
                        ctx.stroke();
                    }
                }
                
                // Erweiterte Fenster mit Rahmen
                if (level >= 3) {
                    // Hauptfenster
                    ctx.fillStyle = '#FFF8DC';
                    ctx.fillRect(pos.x - 4, pos.y - towerHeight + 6, 8, 12);
                    ctx.strokeStyle = darkenColor(baseColor, 50);
                    ctx.lineWidth = 2;
                    ctx.strokeRect(pos.x - 4, pos.y - towerHeight + 6, 8, 12);
                    
                    // Fensterkreuz
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y - towerHeight + 6);
                    ctx.lineTo(pos.x, pos.y - towerHeight + 18);
                    ctx.moveTo(pos.x - 4, pos.y - towerHeight + 12);
                    ctx.lineTo(pos.x + 4, pos.y - towerHeight + 12);
                    ctx.stroke();
                }
                
                // Turmgeländer/Zinnen
                if (level >= 4) {
                    ctx.fillStyle = lightenColor(baseColor, 10);
                    for (let c = 0; c < 3; c++) {
                        ctx.fillRect(pos.x - towerWidth/2 + (c * towerWidth/3), pos.y - towerHeight - 2, towerWidth/6, 4);
                    }
                }
            });
            
            // Verbindungsmauern mit Zinnen
            if (level >= 3 && towerPositions.length > 1) {
                for (let i = 0; i < towerPositions.length; i++) {
                    const nextIndex = (i + 1) % towerPositions.length;
                    const start = towerPositions[i];
                    const end = towerPositions[nextIndex];
                    
                    // Mauer
                    ctx.strokeStyle = baseColor;
                    ctx.lineWidth = 10;
                    ctx.beginPath();
                    ctx.moveTo(start.x, start.y - 8);
                    ctx.lineTo(end.x, end.y - 8);
                    ctx.stroke();
                    
                    // Mauer-Zinnen
                    const wallLength = Math.sqrt((end.x - start.x)**2 + (end.y - start.y)**2);
                    const segments = Math.floor(wallLength / 15);
                    
                    for (let s = 0; s < segments; s++) {
                        const t = s / segments;
                        const wallX = start.x + (end.x - start.x) * t;
                        const wallY = start.y + (end.y - start.y) * t - 8;
                        
                        if (s % 2 === 0) {
                            ctx.fillStyle = lightenColor(baseColor, 15);
                            ctx.fillRect(wallX - 3, wallY - 4, 6, 4);
                        }
                    }
                }
            }
            
            // Bewegte Fahnen mit Wind-Effekt
            if (level >= 4) {
                const flagX = x;
                const flagY = y - baseHeight - 35;
                
                // Fahnenstange mit Verzierungen
                ctx.strokeStyle = '#8B4513';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(flagX, y - baseHeight/2);
                ctx.lineTo(flagX, flagY);
                ctx.stroke();
                
                // Fahnen-Halterung
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(flagX - 2, flagY - 3, 4, 6);
                
                // Bewegte Fahne (mit Wind-Simulation)
                const windEffect = Math.sin(Date.now() / 1000 + x) * 5;
                ctx.fillStyle = baseColor;
                ctx.beginPath();
                ctx.moveTo(flagX, flagY);
                ctx.quadraticCurveTo(flagX + 15 + windEffect, flagY + 3, flagX + 25 + windEffect, flagY);
                ctx.quadraticCurveTo(flagX + 15 + windEffect, flagY + 9, flagX, flagY + 12);
                ctx.closePath();
                ctx.fill();
                
                // Fahnen-Emblem (fraktionsspezifisch)
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                switch(tower.faction) {
                    case FACTIONS.PLAYER:
                        ctx.fillText('A', flagX + 12, flagY + 8);
                        break;
                    case FACTIONS.ENEMY_1:
                        ctx.fillText('X', flagX + 12, flagY + 8);
                        break;
                    case FACTIONS.ENEMY_2:
                        ctx.fillText('S', flagX + 12, flagY + 8);
                        break;
                    default:
                        ctx.fillText('F', flagX + 12, flagY + 8);
                }
            }
            
            // Reset Schatten
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Verstärkter Schlossrahmen
            ctx.strokeStyle = 'var(--gold-secondary)';
            ctx.lineWidth = 3;
            ctx.strokeRect(x - baseWidth/2, y - baseHeight/2, baseWidth, baseHeight);
            
            // Erweiterte Level-Anzeige mit Hintergrund-Emblem
            ctx.font = `bold ${16 * screenScale}px Arial`;
            const levelText = `${tower.level}`;
            const levelTextWidth = ctx.measureText(levelText).width;
            const lvlBarWidth = levelTextWidth + 20;
            const lvlBarHeight = 16;
            const lvlBarX = tower.x - lvlBarWidth/2;
            const lvlBarY = tower.y + baseHeight/2 + 8;
            ctx.save();
            ctx.shadowColor = 'rgba(255,255,200,0.5)';
            ctx.shadowBlur = 8;
            ctx.fillStyle = 'rgba(255, 224, 130, 0.3)';
            ctx.beginPath();
            ctx.moveTo(lvlBarX + 6, lvlBarY);
            ctx.lineTo(lvlBarX + lvlBarWidth - 6, lvlBarY);
            ctx.quadraticCurveTo(lvlBarX + lvlBarWidth, lvlBarY, lvlBarX + lvlBarWidth, lvlBarY + 6);
            ctx.lineTo(lvlBarX + lvlBarWidth, lvlBarY + lvlBarHeight - 6);
            ctx.quadraticCurveTo(lvlBarX + lvlBarWidth, lvlBarY + lvlBarHeight, lvlBarX + lvlBarWidth - 6, lvlBarY + lvlBarHeight);
            ctx.lineTo(lvlBarX + 6, lvlBarY + lvlBarHeight);
            ctx.quadraticCurveTo(lvlBarX, lvlBarY + lvlBarHeight, lvlBarX, lvlBarY + lvlBarHeight - 6);
            ctx.lineTo(lvlBarX, lvlBarY + 6);
            ctx.quadraticCurveTo(lvlBarX, lvlBarY, lvlBarX + 6, lvlBarY);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#d4af37';
            ctx.stroke();
            ctx.font = `bold ${16 * screenScale}px Arial`;
            ctx.fillStyle = '#222';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(levelText, tower.x, lvlBarY + lvlBarHeight/2 + 1);
            ctx.restore();
            
            // Einheitenanzeige: Schmaler Balken über dem Schloss
            if (tower.faction !== FACTIONS.NEUTRAL) {
                const unitsText = `${Math.floor(tower.units)}/${tower.maxUnits}`;
                ctx.font = `${14 * screenScale}px Arial`;
                const textWidth = ctx.measureText(unitsText).width;
                const barWidth = textWidth + 24;
                const barHeight = 18;
                const barX = tower.x - barWidth/2;
                const barY = tower.y - baseHeight/2 - Math.max(48, 24 + tower.level * 8); // 28 statt 18 für mehr Abstand
                ctx.save();
                ctx.shadowColor = 'rgba(255,255,200,0.5)';
                ctx.shadowBlur = 8;
                ctx.fillStyle = 'rgba(255, 224, 130, 0.3)';
                ctx.beginPath();
                ctx.moveTo(barX + 7, barY);
                ctx.lineTo(barX + barWidth - 7, barY);
                ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + 7);
                ctx.lineTo(barX + barWidth, barY + barHeight - 7);
                ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - 7, barY + barHeight);
                ctx.lineTo(barX + 7, barY + barHeight);
                ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - 7);
                ctx.lineTo(barX, barY + 7);
                ctx.quadraticCurveTo(barX, barY, barX + 7, barY);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#d4af37';
                ctx.stroke();
                ctx.font = `${14 * screenScale}px Arial`;
                ctx.fillStyle = '#222';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(unitsText, tower.x, barY + barHeight/2 + 1);
                ctx.restore();
            }
            
            // Erweiterte Eroberungsanzeige mit Effekten
            if (tower.underAttack) {
                const progress = tower.conversionProgress / CONVERSION_TIME;
                const barWidth = 50;
                const barHeight = 10;
                const barX = tower.x - barWidth/2;
                const barY = tower.y + baseHeight/2 + 35;
                
                // Pulsierender Rahmen
                const pulseSize = 1 + Math.sin(Date.now() / 200) * 0.1;
                ctx.beginPath();
                ctx.roundRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, 6);
                ctx.fillStyle = `#b85c5c50`;
                ctx.fill();
                
                // Eroberungsbalken
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth, barHeight, 5);
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fill();
                
                // Fortschritt mit Glanz-Effekt
                const progressGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
                progressGradient.addColorStop(0, lightenColor('#b85c5c', 30));
                progressGradient.addColorStop(1, '#b85c5c');
                
                ctx.beginPath();
                ctx.roundRect(barX, barY, barWidth * progress, barHeight, 5);
                ctx.fillStyle = progressGradient;
                ctx.fill();
                
                // Eroberungs-Partikel-Effekte
                for (let p = 0; p < 3; p++) {
                    const particleX = barX + (barWidth * progress) + (Math.random() - 0.5) * 20;
                    const particleY = barY + (Math.random() - 0.5) * 20;
                    const particleSize = 2 + Math.random() * 3;
                    
                    ctx.beginPath();
                    ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
                    ctx.fillStyle = `#b85c5c80`;
                    ctx.fill();
                }
            }
            
            // Stelle den Kontext-Zustand wieder her
            ctx.restore();
        }
        
        // Optimiertes Rendering für Einheiten mit Pulsieren und Glow - qualitätsabhängig
        function renderUnits() {
            // Speichere den aktuellen Kontext-Zustand
            ctx.save();
            
            // Qualitätseinstellungen abrufen
            const maxUnits = getQualitySetting('maxUnits');
            const animationDetail = getQualitySetting('animationDetail');
            const useParticleEffects = getQualitySetting('particleEffects');
            
            // Gruppiere Einheiten nach Fraktion für Batchverarbeitung
            const unitsByFaction = {};
            
            for (const faction of Object.values(FACTIONS)) {
                unitsByFaction[faction] = [];
            }
            
            // Bei Bedarf Einheiten nach Wichtigkeit sortieren und limitieren
            let totalUnitsToRender = units.length;
            let unitsToProcess = units;
            
            // Wenn Einheitenlimit aktiv ist und überschritten wird, beschränke Anzahl
            if (maxUnits < units.length) {
                totalUnitsToRender = maxUnits;
                
                // Einheiten nach Entfernung zum Bildschirmmittelpunkt sortieren
                const centerX = gameWidth / 2;
                const centerY = gameHeight / 2;
                
                unitsToProcess = [...units].sort((a, b) => {
                    const distA = Math.pow(a.x - centerX, 2) + Math.pow(a.y - centerY, 2);
                    const distB = Math.pow(b.x - centerX, 2) + Math.pow(b.y - centerY, 2);
                    return distA - distB; // Nähere Einheiten priorisieren
                }).slice(0, maxUnits);
            }
            
            // Einheiten nach Fraktion gruppieren
            for (const unit of unitsToProcess) {
                unitsByFaction[unit.faction].push(unit);
            }
            
            // Zeit für Pulsation - variiert je nach Qualitätseinstellung
            const time = Date.now();
            let pulseFactor = 1.0;
            
            if (animationDetail !== 'low') {
                const pulseIntensity = animationDetail === 'high' ? 0.15 : 0.08;
                const pulseSpeed = animationDetail === 'high' ? 600 : 800;
                pulseFactor = 1 + Math.sin(time / pulseSpeed) * pulseIntensity;
            }
            
            // Rendere jede Fraktionsgruppe separat
            for (const [faction, factionUnits] of Object.entries(unitsByFaction)) {
                if (factionUnits.length === 0) continue;
                
                const baseColor = getFactionColor(faction);
                
                // Glow-Effekt je nach Qualität
                if (useParticleEffects && animationDetail !== 'low') {
                    ctx.shadowColor = baseColor;
                    ctx.shadowBlur = animationDetail === 'high' ? 8 : 4;
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.fillStyle = baseColor;
                
                // Batchverarbeitung für den Hauptkörper
                ctx.beginPath();
                
                for (const unit of factionUnits) {
                    const adjustedRadius = UNIT_RADIUS * pulseFactor;
                    ctx.moveTo(unit.x + adjustedRadius, unit.y);
                    ctx.arc(unit.x, unit.y, adjustedRadius, 0, Math.PI * 2);
                }
                
                ctx.fill();
                
                // Highlight-Kreis nur bei mittlerer oder hoher Qualität
                if (animationDetail !== 'low') {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = lightenColor(baseColor, 40);
                    ctx.globalAlpha = 0.4;
                    
                    ctx.beginPath();
                    for (const unit of factionUnits) {
                        const highlightRadius = UNIT_RADIUS * pulseFactor * 0.4;
                        ctx.moveTo(unit.x + highlightRadius, unit.y - highlightRadius/2);
                        ctx.arc(unit.x - highlightRadius/2, unit.y - highlightRadius/2, highlightRadius, 0, Math.PI * 2);
                    }
                    
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }
            }
            
            // Debugging: Zeige Anzahl der gerenderten vs. totalen Einheiten
            if (showDebugInfo && totalUnitsToRender < units.length) {
                ctx.fillStyle = '#000';
                ctx.font = '12px Arial';
                ctx.fillText(`Einheiten: ${totalUnitsToRender}/${units.length} (begrenzt)`, 20, 150);
            }
            
            // Stelle den Kontext-Zustand wieder her
            ctx.restore();
        }
        
        // UI-Elemente rendern
        function renderUI() {
            // Auswahlindikator
            if (selectedTower) {
                renderSelectionIndicator(selectedTower);
            }
        }
        
        // Verbesserte Selektionsanzeige
        function renderSelectionIndicator(tower) {
            const baseRadius = tower.radius + 18;

            // Größerer, transparenter Goldring mit Glow
            ctx.save();
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, baseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)'; // transparenter
            ctx.lineWidth = 3.5;
            ctx.shadowColor = 'rgba(212, 175, 55, 0.32)'; // transparenter Glow
            ctx.shadowBlur = 22;
            ctx.setLineDash([]);
            ctx.stroke();
            ctx.shadowBlur = 0;
            // Sehr dünner, noch transparenter weißer Außenring
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, baseRadius + 7, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.10)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
        }
        
        // Debug-Informationen anzeigen
        let showDebugInfo = false;
        function renderDebugInfo() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 60, 200, 120);
            
            ctx.font = '12px monospace';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            
            ctx.fillText(`FPS: ${fps}`, 20, 70);
            ctx.fillText(`Einheiten: ${units.length}`, 20, 90);
            ctx.fillText(`Türme: ${towers.length}`, 20, 110);
            ctx.fillText(`Welle: ${wave}`, 20, 130);
            
            // Qualitätseinstellung anzeigen mit Symbol
            let qualityColor, qualityIcon;
            switch(currentQuality) {
                case 'LOW': 
                    qualityColor = 'red'; 
                    qualityIcon = '⚠️';
                    break;
                case 'MEDIUM': 
                    qualityColor = 'yellow'; 
                    qualityIcon = 'LOW';
                    break;
                case 'HIGH': 
                    qualityColor = 'lime'; 
                    qualityIcon = 'HIGH';
                    break;
            }
            ctx.fillStyle = qualityColor;
            ctx.fillText(`${qualityIcon} ${currentQuality}`, 20, 150);
        }
        
        // FPS-Anzeige - bereits neu implementiert weiter unten
        // Event-Listener entfernt, um Duplikate zu vermeiden
        
        // UI Updates
        let lastGoldValue = 100;
        function updateUI() {
            if (goldDisplay) goldDisplay.textContent = Math.floor(gold);
            if (waveDisplay) waveDisplay.textContent = `${wave}`; // Nur die Wellennummer ohne "Welle:"
            // Entfernte Gold-Animation
            lastGoldValue = gold;
            
            // Update des Upgrade-Costs wird jetzt direkt in showTowerMenu behandelt
            // und muss nicht mehr hier aktualisiert werden
        }
        
        function getUpgradeCost(tower) {
            const roleCost = tower.type === TOWER_TYPES.GOLD
                ? 82
                : tower.type === TOWER_TYPES.TROOP
                    ? 72
                    : tower.type === TOWER_TYPES.WATCH
                        ? 62
                        : 65;
            return Math.floor(roleCost * Math.pow(TOWER_UPGRADE_FACTOR, tower.level - 1));
        }
        
        function showTowerMenu(tower, x, y) {
            if (tower.faction !== FACTIONS.PLAYER) return;
            selectedTower = tower;
            
            // Position des Menüs, zentriert über dem Turm
            const menuX = tower.x;
            const menuY = tower.y;
            
            // Positioniere das Menü direkt über dem Turm
            towerMenu.style.left = `${menuX - 90}px`;
            towerMenu.style.top = `${menuY - 90}px`;
            towerMenu.style.display = 'block';
            towerMenu.style.zIndex = '1000'; // Sicherstellen, dass das Menü über dem Canvas liegt
            
            // Kostenupdate für Upgrade-Aktion
            const upgradeCost = getUpgradeCost(tower);
            document.getElementById('upgrade-cost').textContent = `${upgradeCost} Gold`;
            
            // Aktionsschaltflächen
            const upgradeAction = document.getElementById('upgrade-action');
            
            // Sofortige Status-Aktualisierung ohne Animation/Verzögerung
            // Visuelle Rückmeldung, wenn nicht genug Gold für Upgrade
            if (gold < upgradeCost) {
                upgradeAction.style.opacity = '0.5';
                upgradeAction.style.cursor = 'not-allowed';
            } else {
                upgradeAction.style.opacity = '1';
                upgradeAction.style.cursor = 'pointer';
            }
            
            // Event-Listener hinzufügen
            upgradeAction.onclick = handleUpgrade;
            document.getElementById('cancel-action').onclick = handleCancel;
        }
        
        function hideTowerMenu() {
            towerMenu.style.display = 'none';
        }
        
        function closeTutorial() {
            document.getElementById('tutorial').style.display = 'none';
        }
        
        // Game Actions
        function handleUpgrade() {
            if (!selectedTower || selectedTower.faction !== FACTIONS.PLAYER) return;
            
            const upgradeCost = getUpgradeCost(selectedTower);
            
            if (gold >= upgradeCost) {
                gold -= upgradeCost;
                selectedTower.level += 1;
                selectedTower.maxUnits = getTowerMaxUnits(selectedTower.faction, selectedTower.type, selectedTower.level);
                
                hideTowerMenu();
                selectedTower = null;
            }
        }
        
        function handleCancel() {
            hideTowerMenu();
            selectedTower = null;
        }
        
        function sendUnitsFromTower(sourceTower, targetTower, unitCount) {
            if (unitCount <= 0 || sourceTower === targetTower) return;
            
            // Cap at available units
            unitCount = Math.min(unitCount, Math.floor(sourceTower.units));
            
            // Remove units from source tower
            sourceTower.units -= unitCount;
            
            // Create unit entities
            for (let i = 0; i < unitCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const offsetX = Math.cos(angle) * sourceTower.radius * 0.8;
                const offsetY = Math.sin(angle) * sourceTower.radius * 0.8;
                
                units.push({
                    x: sourceTower.x + offsetX,
                    y: sourceTower.y + offsetY,
                    targetX: targetTower.x,
                    targetY: targetTower.y,
                    faction: sourceTower.faction,
                    sourceFaction: sourceTower.faction
                });
            }
            
            // Visuelles Feedback für erfolgreichen Einheiten-Transfer
            createUnitSendFeedback(sourceTower);
        }
        
        // Feedback-Animation wenn Einheiten gesendet werden
        function createUnitSendFeedback(tower) {
            const feedback = document.createElement('div');
            feedback.className = 'unit-send-feedback';
            feedback.style.left = `${tower.x}px`;
            feedback.style.top = `${tower.y}px`;
            feedback.style.backgroundColor = tower.faction === FACTIONS.PLAYER ? 'rgba(52, 152, 219, 0.7)' : 'rgba(231, 76, 60, 0.7)';
            
            feedback.innerHTML = '<span class="mastil-check-icon" aria-hidden="true"></span>';
            
            document.getElementById('ui-layer').appendChild(feedback);
            
            // Animation
            setTimeout(() => {
                feedback.classList.add('active');
                setTimeout(() => {
                    feedback.remove();
                }, 800);
            }, 10);
        }
        
        // Zeigt die Ladeanzeige zwischen den Wellen an
        function showWaveTransitionScreen(nextWaveNumber) {
            const transitionScreen = document.getElementById('wave-transition-screen');
            const nextWaveElem = document.getElementById('next-wave-number');
            
            // Aktualisiere die Nummer der nächsten Welle
            if (nextWaveElem) {
                nextWaveElem.textContent = nextWaveNumber;
            }
            
            // Setze die Fortschrittsleiste zurück, damit die Animation neu beginnt
            const progressBar = document.querySelector('.loader-progress');
            if (progressBar) {
                progressBar.style.animation = 'none';
                // Force reflow
                void progressBar.offsetWidth;
                progressBar.style.animation = 'progressAnimation 4s linear forwards, shimmer 1.5s infinite linear';
            }
            
            // Zeige den Übergangsbildschirm an
            if (transitionScreen) {
                transitionScreen.style.display = 'flex';
                console.log(`[WAVE] Ladeanzeige für Welle ${nextWaveNumber} wird angezeigt`);
            }
        }
        
        // Blendet die Ladeanzeige zwischen den Wellen aus
        function hideWaveTransitionScreen() {
            const transitionScreen = document.getElementById('wave-transition-screen');
            
            if (transitionScreen) {
                // Füge die Ausblende-Animation hinzu
                transitionScreen.style.animation = 'fadeOut 0.4s ease-out';
                
                // Nach der Animation ausblenden
                setTimeout(() => {
                    transitionScreen.style.display = 'none';
                    transitionScreen.style.animation = 'fadeIn 0.4s ease-out';
                    console.log('[WAVE] Ladeanzeige ausgeblendet');
                }, 400);
            }
        }

        function gameOver() {
            gameActive = false;
            
            // Alle Wellenübergang-Sperren zurücksetzen
            window.isCheckingWaveTransition = false;
            window.isWaveTransitioning = false;
            window.currentWaveToTransition = null;
            
            // Alle Timeouts für Wellenübergang löschen
            if (window.fallbackWaveTimeout) {
                clearTimeout(window.fallbackWaveTimeout);
                window.fallbackWaveTimeout = null;
            }
            if (window.waveTransitionTimeout) {
                clearTimeout(window.waveTransitionTimeout);
                window.waveTransitionTimeout = null;
            }
            
            // Blende die Ladeanzeige aus, falls sie aktiv ist
            hideWaveTransitionScreen();
            
            // Log für Debug-Zwecke
            console.log("[WAVE] Game Over: Alle Wellenübergang-Sperren und Timeouts zurückgesetzt");
            
            // Fallback-Button entfernen, falls vorhanden
            const fallbackBtn = document.getElementById('fallback-wave-btn');
            if (fallbackBtn) {
                fallbackBtn.remove();
            }
            
            // Game-Over-Screen anzeigen
            gameOverScreen.style.display = 'flex';
            var waveElem = document.getElementById('gameover-wave');
            if (waveElem) {
                waveElem.textContent = `Erreichte Welle: ${wave}`;
            }
        }
        
        // Event Handlers
        function handleTouchStart(event) {
            event.preventDefault();
            
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const touchX = touch.clientX;
                const touchY = touch.clientY;
                
                handlePointerDown(touchX, touchY);
            }
        }
        
        function handleTouchMove(event) {
            event.preventDefault();
            
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const touchX = touch.clientX;
                const touchY = touch.clientY;
                
                handlePointerMove(touchX, touchY);
            }
        }
        
        function handleTouchEnd(event) {
            handlePointerUp();
        }
        
        function handleMouseDown(event) {
            handlePointerDown(event.clientX, event.clientY);
        }
        
        function handleMouseMove(event) {
            handlePointerMove(event.clientX, event.clientY);
        }
        
        function handleMouseUp(event) {
            handlePointerUp();
        }
        
        function handlePointerDown(x, y) {
            // Check if a tower was clicked
            const clickedTower = getTowerAtPosition(x, y);
            
            if (clickedTower) {
                // Version 2.0.3.16: Info-Panel ausblenden, sobald ein Turm angeklickt wird
                const infoPanel = document.getElementById('info-panel');
                if (infoPanel) infoPanel.style.display = 'none';
                
                // Doppeltipp-Erkennung
                const currentTime = Date.now();
                const timeDiff = currentTime - lastTapTime;
                
                if (lastTappedTower === clickedTower && timeDiff < DOUBLE_TAP_DELAY) {
                    // Doppeltipp erkannt - Schnellangriff ausführen
                    handleQuickAttack(clickedTower);
                    lastTapTime = 0; // Reset um Dreifachklick zu verhindern
                    lastTappedTower = null;
                    return;
                }
                
                lastTapTime = currentTime;
                lastTappedTower = clickedTower;
                
                // If player tower, show menu
                if (clickedTower.faction === FACTIONS.PLAYER) {
                    hideTowerMenu();
                    showTowerMenu(clickedTower, x, y);
                }
            } else {
                // Clicked outside, hide UI
                hideTowerMenu();
                selectedTower = null;
                lastTappedTower = null;
            }
        }
        
        function handlePointerMove(x, y) {
            // Drag functionality removed in v2.6.24
        }
        
        function handlePointerUp() {
            // Drag functionality removed in v2.6.24
        }
        
        function getTowerAtPosition(x, y) {
            // Überprüfe zunächst die Gültigkeit der Koordinaten
            if (isNaN(x) || isNaN(y)) {
                console.error('Ungültige Koordinaten für getTowerAtPosition:', x, y);
                return null;
            }
            
            // Stelle sicher, dass towers nicht null oder undefined ist
            if (!towers || !Array.isArray(towers)) {
                console.error('Towers ist nicht definiert oder kein Array');
                return null;
            }
            
            return towers.find(tower => {
                if (!tower || typeof tower.x !== 'number' || typeof tower.y !== 'number') {
                    console.warn('Ungültiger Turm in der Liste:', tower);
                    return false;
                }
                
                const dx = tower.x - x;
                const dy = tower.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance <= tower.radius;
            });
        }
        
        // Das Spiel wird erst nach Anmeldung gestartet, damit die Partie nicht im Hintergrund läuft.

        window.addEventListener('DOMContentLoaded', function() {
            // ... bestehende Listener ...
            document.getElementById('options-close-btn').addEventListener('click', closeOptions);
            // ... bestehende Initialisierungen ...
        });

        function closeOptions() {
            var modal = document.getElementById('options-modal');
            modal.classList.remove('active');
        }

        function closeHighscores() {
            var modal = document.getElementById('highscore-modal');
            modal.classList.remove('active');
            
            // Scrolling im Body wieder erlauben
            document.body.style.overflow = '';
            
            // Custom hide Event auslösen
            modal.dispatchEvent(new Event('hide'));
        }

        // Füge am Ende des Skripts ein:
        window.addEventListener('DOMContentLoaded', function() {
            function enableModalScroll(modal) {
                if (!modal) return;
                modal.addEventListener('touchmove', function(e) {
                    e.stopPropagation();
                }, { passive: false });
            }
            var creditsModal = document.getElementById('credits-modal');
            var highscoreModal = document.getElementById('highscore-modal');
            enableModalScroll(creditsModal);
            enableModalScroll(highscoreModal);

            // Body touch-action Handling
            function setBodyTouchAction(val) {
                document.body.style.touchAction = val;
            }
            // Credits Modal
            if (creditsModal) {
                creditsModal.addEventListener('show', function() { setBodyTouchAction('auto'); });
                creditsModal.addEventListener('hide', function() { setBodyTouchAction('none'); });
            }
            // Highscore Modal
            if (highscoreModal) {
                highscoreModal.addEventListener('show', function() { setBodyTouchAction('auto'); });
                highscoreModal.addEventListener('hide', function() { setBodyTouchAction('none'); });
            }
            // Fallback: Wenn Modal per display-block sichtbar wird
            function observeModal(modal) {
                if (!modal) return;
                const observer = new MutationObserver(() => {
                    if (getComputedStyle(modal).display !== 'none') {
                        setBodyTouchAction('auto');
                    } else {
                        setBodyTouchAction('none');
                    }
                });
                observer.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
            }
            observeModal(creditsModal);
            observeModal(highscoreModal);
        });

        // Entferne Herzschlag-Effekt, wenn das Spiel startet
        function removeTitleGlow() {
            var title = document.querySelector('.game-title');
            if (title) {
                title.classList.remove('glow');
            }
        }
        // Passe startGame an, um den Glow zu entfernen
        const originalStartGame = startGame;
        startGame = function() {
            removeTitleGlow();
            originalStartGame();
        }

        // Hilfsfunktionen für Farbänderungen
        function lightenColor(color, amount) {
            const num = parseInt(color.replace("#", ""), 16);
            const r = Math.min(255, (num >> 16) + amount);
            const g = Math.min(255, (num >> 8 & 0x00FF) + amount);  
            const b = Math.min(255, (num & 0x0000FF) + amount);
            return `rgb(${r},${g},${b})`;
        }

        function darkenColor(color, amount) {
            const num = parseInt(color.replace("#", ""), 16);
            const r = Math.max(0, (num >> 16) - amount);
            const g = Math.max(0, (num >> 8 & 0x00FF) - amount);
            const b = Math.max(0, (num & 0x0000FF) - amount);
            return `rgb(${r},${g},${b})`;
        }
        
                        // Variable, um zu speichern, ob Debug-Info vom Benutzer ein/ausgeschaltet wurde
        window.userToggledDebug = false;
        
        // Stellen Sie sicher, dass currentQuality auf 'MEDIUM' initialisiert ist, wenn sie nicht existiert
        if (!currentQuality || !QUALITY_SETTINGS[currentQuality]) {
            currentQuality = 'MEDIUM';
            localStorage.setItem('graphicsQuality', 'MEDIUM');
            console.log('Grafikqualität wurde auf den Standard "MEDIUM" zurückgesetzt');
        }
        
        // FPS-Anzeige
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F' || e.key === 'f') {
                showDebugInfo = !showDebugInfo;
                window.userToggledDebug = true; // Benutzer hat Debug-Info manuell umgeschaltet
            }
        });
        
        // Hilfsfunktion zum Abrufen der aktuellen Qualitätseinstellung mit Fehlerbehandlung
        function getQualitySetting(option) {
            try {
                // Wenn currentQuality nicht existiert oder ungültig ist, MEDIUM als Standard verwenden
                const quality = QUALITY_SETTINGS[currentQuality] ? currentQuality : 'MEDIUM';
                
                // Wenn die Option existiert, gib sie zurück, ansonsten Standard-Wert
                if (QUALITY_SETTINGS[quality] && QUALITY_SETTINGS[quality][option] !== undefined) {
                    return QUALITY_SETTINGS[quality][option];
                } else {
                    console.warn(`Option ${option} nicht gefunden in Qualitätseinstellungen, verwende MEDIUM-Default`);
                    return QUALITY_SETTINGS.MEDIUM[option] || QUALITY_SETTINGS.HIGH[option] || null;
                }
            } catch (error) {
                console.error(`Fehler beim Abrufen der Qualitätseinstellung ${option}:`, error);
                // Sichere Fallback-Werte für kritische Einstellungen
                switch(option) {
                    case 'shadowQuality': return 0;
                    case 'maxUnits': return 50;
                    case 'towerDetail': return 'low';
                    case 'particleEffects': return false;
                    case 'connectionLimit': return 100;
                    case 'connectionDetail': return 'low';
                    case 'animationDetail': return 'low';
                    case 'gridDetail': return 'low';
                    case 'detailedStonePattern': return false;
                    default: return null;
                }
            }
        }
