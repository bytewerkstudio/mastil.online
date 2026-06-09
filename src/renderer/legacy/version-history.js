console.log('Script geladen');
        // Game version information - Update auf 2.6.50
        const GAME_VERSION = {
    major: 2,
    minor: 6,
    patch: 50,
    build: 0,
    toString: function() {
        return `${this.major}.${this.minor}.${this.patch}.${this.build}`;
    }
};

// Neue Qualitätseinstellungen für adaptive Performance
const QUALITY_SETTINGS = {
    HIGH: {
        detailedStonePattern: true,     // Detaillierte Steinmuster für Türme
        shadowQuality: 12,              // Hohe Schattenqualität
        maxUnits: Infinity,             // Unbegrenzte Anzahl sichtbarer Einheiten
        towerDetail: 'high',            // Hohe Turmdetails (alle Fenster, Zinnen, usw.)
        particleEffects: true,          // Partikeleffekte aktiviert
        connectionLimit: Infinity,      // Alle Verbindungen zwischen Türmen zeichnen
        connectionDetail: 'high',       // Detaillierte Verbindungen
        animationDetail: 'high',        // Flüssige Animationen
        gridDetail: 'high'              // Detailliertes Hintergrundgitter
    },
    MEDIUM: {
        detailedStonePattern: false,    // Keine detaillierten Steinmuster
        shadowQuality: 6,               // Mittlere Schattenqualität
        maxUnits: 100,                  // Maximal 100 sichtbare Einheiten
        towerDetail: 'medium',          // Mittlere Turmdetails
        particleEffects: true,          // Partikeleffekte aktiviert
        connectionLimit: 300,           // Begrenzte Anzahl Verbindungen
        connectionDetail: 'medium',     // Vereinfachte Verbindungen
        animationDetail: 'medium',      // Vereinfachte Animationen
        gridDetail: 'medium'            // Vereinfachtes Hintergrundgitter
    },
    LOW: {
        detailedStonePattern: false,    // Keine detaillierten Steinmuster
        shadowQuality: 0,               // Keine Schatten
        maxUnits: 50,                   // Maximal 50 sichtbare Einheiten
        towerDetail: 'low',             // Minimale Turmdetails
        particleEffects: false,         // Keine Partikeleffekte
        connectionLimit: 100,           // Stark begrenzte Verbindungen
        connectionDetail: 'low',        // Einfache Verbindungen
        animationDetail: 'low',         // Minimale Animationen
        gridDetail: 'low'               // Einfaches Hintergrundgitter
    }
};

// Aktuelle Qualitätseinstellung
let currentQuality = 'MEDIUM';
let lastQualityCheck = 0;

const VERSION_HISTORY = {
    "2.6.50": [
        "Bosskaempfe erweitert: aktive Bosse bereiten jetzt eigene Bossbefehle wie Grenzruf, Eisenwall, Nachtmal und Kaiserzug vor",
        "Neue Bossbefehl-Anzeige im Auftragspanel zeigt Timer, Wirkung und Gegenfenster waehrend Bosswellen",
        "Schlachtplan, Belagerung und Befestigung koennen vorbereitete Bosszuege nun mit einem Bosskonter verzoegern"
    ],
    "2.6.49": [
        "Feindplaene sind im Kampf sichtbarer: wachsame Kommandantentuerme zeigen jetzt ein klares Feindblick-Signal",
        "Neuer Gegenplan: Schlachtplan, Belagerung oder Befestigung koennen einen wachsamen KI-Kommandanten ausbremsen",
        "Konterfenster geben Rueckmeldung, Moral und eine eigene Auszeichnung, damit KI-Druck fairer und spielbarer wirkt"
    ],
    "2.6.48": [
        "mastil.online wurde weiter auf Windows-Download ausgerichtet: kein oeffentliches Browser-Spiel, sondern klare Setup-Seite",
        "Alte Web-Spieladressen zeigen jetzt deutlicher, dass MASTIL als Windows-App installiert werden soll",
        "Website-Texte, Download-Hinweise und Projektbeschreibung wurden auf den fluessigen Windows-Fokus bereinigt"
    ],
    "2.6.47": [
        "KI-Reaktion erweitert: Feindkommandanten werden nach starken Befehlsketten wachsam und bereiten schneller Gegenbefehle vor",
        "Das Feindkommando-Panel zeigt diese Wachsamkeit mit eigener Meldung, damit Spieler die Antwort erkennen koennen",
        "Befehlsketten bleiben stark, erzeugen aber mehr lebendigen Gegenspiel-Druck in längeren Schlachten"
    ],
    "2.6.46": [
        "Reichsarchiv ausgebaut: neue Kriegslehren, Tastatur-Befehlsfolgen und spielnahe Hinweise direkt in den Legenden",
        "Jedes Reich besitzt jetzt einen kompakten dreistufigen Feldzugplan passend zu Spielstil, Risiko und Bossziel",
        "Legenden- und Credits-Fenster schließen jetzt ergonomisch mit Escape und bleiben auf kleinen Fenstern besser lesbar"
    ],
    "2.6.45": [
        "Neue Befehlsketten-Mechanik: passende Folgen aus Plan, Reserve, Flanke, Belagerung und Frontangriff geben taktischen Rhythmus",
        "Erfolgreiche Befehlsketten erhöhen leicht die Moral, verkürzen Cooldowns und erscheinen als eigener Kampfeffekt",
        "Ruhmwertung, Spielzusammenfassung, Manöverstatistik und Auszeichnungen berücksichtigen Befehlsketten"
    ],
    "2.6.44": [
        "Turm- und Burgdesign verbessert: Rollenbanner, Ausbaupunkte und Kronenzeichen machen wichtige Standorte klarer lesbar",
        "Neue Garnisonsanzeige direkt am Turm zeigt schneller, ob eine Stellung voll, stabil oder gefährdet ist",
        "Gold-, Truppen- und Wachtürme erhalten stärkere visuelle Identität passend zur jeweiligen Rolle"
    ],
    "2.6.43": [
        "Neuer Kriegsrat-Befehl: bewertet die aktuelle Frontlage und löst automatisch die sinnvollste Aktion aus",
        "Der Kriegsrat berücksichtigt Frontdruck, Reserve, Belagerung, Angriffschance, Ausbau und Sammelbefehl",
        "Befehlsleiste um ein eigenes Kriegsrat-Symbol erweitert; Leiste bleibt fuer Windows-Spieler kompakt bedienbar"
    ],
    "2.6.42": [
        "Windows-Steuerung erweitert: wichtige Kampfbefehle reagieren jetzt direkt auf Tastaturbefehle",
        "Mausklick und Tastatur nutzen dieselbe Befehlslogik, damit Angriffe, Reserve, Ausbau und Karte gleich zuverlässig bleiben",
        "Gedrückte Befehle erhalten einen kurzen visuellen Puls und Tooltips zeigen die passende Taste"
    ],
    "2.6.41": [
        "Neuer Reservebefehl im Windows-Spiel: hintere Türme schicken gezielt Truppen an bedrohte Frontposten",
        "Reserve nutzt Frontdruck, Versorgung und gesicherte Wege, statt Truppen zufällig zu verschieben",
        "Befehlsleiste, Auswertung, Auszeichnung und taktischer Rat wurden um Reserve/Marschbefehl erweitert"
    ],
    "2.6.40": [
        "Website-Ausrichtung umgestellt: mastil.online ist jetzt die offizielle Windows-Download-Seite statt Browser-Spielportal",
        "Alte Browser-Spielaufrufe fuehren im Web-Build auf einen sauberen Windows-Download-Hinweis",
        "Spieltexte und Statushinweise wurden auf Windows-Version, Installer und lokalen Offline-Modus angepasst"
    ],
    "2.6.39": [
        "Gefechtsgrößen wirken stärker im echten Spiel: Standard, Groß und Kriegskarte enthalten mehr Orte",
        "Kriegskarte und Reichskrieg starten mit passenden seitlichen Vorburgen, die an das Straßennetz angebunden sind",
        "Gefechtsvorschau und echte Kartenlogik wurden synchronisiert, damit ausgewählte Größe und Startstellung übereinstimmen"
    ],
    "2.6.38": [
        "Hauptmenü ergonomisch verbessert: die drei wichtigsten Aktionen erscheinen früher und sind im Kriegstisch schneller erreichbar",
        "Menü-Karten zeigen jetzt dynamische Feldzug- und Gefechtsdaten direkt am Button",
        "Startbildschirm kompakter abgestimmt, damit weniger Inhalt abgeschnitten wird und der Kommandotisch ruhiger wirkt"
    ],
    "2.6.37": [
        "Neue Nachschubkonvois im laufenden Spiel: Märkte, Straßen und stabile Versorgungslinien schicken periodisch Truppen und Gold an schwache Fronttürme",
        "Strategiepanel zeigt jetzt den Konvoi-Status direkt neben der Versorgung, damit Spieler sehen, ob Markt oder Straße fehlen",
        "Matchwertung und Spielzusammenfassung zählen erfolgreiche Konvois mit"
    ],
    "2.6.36": [
        "Gefechtsmodus erweitert: neue Kriegskarten-Vorschau mit sichtbaren Wegen, Startburgen, neutralen Orten, Feindburgen und Bossfront",
        "Kartenwahl reagiert jetzt klarer auf Größe, Gegnerzahl, Schwierigkeit, KI-Plan und Reichsfarbe",
        "Gefechtsfenster ist ergonomischer lesbar, weil Vorschau, Werte und Textbriefing getrennte Aufgaben bekommen"
    ],
    "2.6.35": [
        "Hauptmenü weiter zum MASTIL-Kartentisch ausgebaut: neuer Kommandotisch, dynamische Frontdaten und stimmigere Befehlsoptik",
        "Türme und Schlösser zeigen Upgrade-Stufen deutlicher mit Mauern, Bannern, Stützpfeilern, Zitadellenringen und Burgstandort-Details",
        "Legenden- und Credits-Fenster erhalten ruhigere Leseflächen und größere Scrollbereiche",
        "Canvas-Hintergrund hat jetzt eine dunkle Kartenbasis, damit beim Laden oder Wechseln keine weiße Fläche durchscheint"
    ],
    "2.6.34": [
        "Neue Angriffsprognose auf der Karte: empfohlene Route, Zielbewertung, Chance, Truppenmenge und taktischer Grund werden direkt am Schlachtfeld angezeigt",
        "Angriffs- und Plan-Befehle zeigen jetzt klarere Zielinformationen, damit Entscheidungen schneller und verständlicher werden"
    ],
    "2.6.33": [
        "Hauptmenü als MASTIL-Kriegszentrale überarbeitet: Einsatzbriefing, stärkere Startbefehle und klarere Statusanzeige",
        "Legendenarchiv erweitert: Weltprolog, Spiellehren, Reichsbriefings und bessere Scrollbereiche",
        "Credits und Archivfenster ergonomischer gestaltet, damit lange Inhalte sauber im Fenster bleiben"
    ],
    "2.6.32": [
        "Verbessertes UI-Design: Schriftart für 'Wählt Euer Reich:' an Hauptüberschrift angepasst für ein konsistenteres Erscheinungsbild"
    ],
    "2.6.31": [
        "Kritische Verbesserung der Nationswahl: Direkte Hintergrundmanipulation via JavaScript für garantierte visuelle Unterscheidung zwischen aktiver und inaktiven Nationen"
    ],
    "2.6.30": [
        "Verbesserte visuelle Nationsauswahl: Deutlichere Unterscheidung zwischen aktiven und inaktiven Nationen durch dunklere Hintergrundfarben für alle nicht ausgewählten Nationen"
    ],
    "2.6.29": [
        "Fehlerbehebung: Nationswahl visuelle Hervorhebung korrigiert - Visuelle Markierung wechselt jetzt korrekt zwischen den angeklickten Nationen"
    ],
    "2.6.28": [
        "Fehlerbehebung: Das Auswählen verschiedener Nationen funktioniert nun korrekt - Behebung einer Variablennamenskollision"
    ],
    "2.6.27": [
        "Verbesserte visuelle Hervorhebung der ausgewählten Startnation: Die gewählte Nation bleibt bis zum Klick auf 'Bestätigen' deutlich mit pulsierendem Effekt markiert"
    ],
    "2.6.26": [
        "Neues Nationsemblem in der oberen Spielleiste: Zeigt die vom Spieler gewählte Startnation mit entsprechendem Symbol und Namen an"
    ],
    "2.6.25": [
        "Erweitertes Namenseingabe-Pop-up: Spieler können jetzt ihre Startnation aus fünf verschiedenen Reichen wählen",
        "Neue Willkommensnachricht: Zeigt die gewählte Nation mit eigenem Symbol und einzigartiger Begrüßung für ein personalisiertes Spielerlebnis"
    ],
    "2.6.24": [
        "Vereinfachte Spielsteuerung: Die Drag-and-Drop-Steuerung (Pfeil und Slider) für das Senden von Einheiten wurde entfernt",
        "Der 'Einheiten senden'-Button wurde aus dem Turmmenü entfernt. Der Doppelklick-Schnellangriff ist jetzt die einzige Methode zum Senden von Truppen"
    ],
    "2.6.23": [
        "Verbesserte Schnellangriff-Funktion (Doppelklick): Der gelbe Auswahlkreis bleibt während des Angriffs auf dem eigenen Turm sichtbar, wodurch klarer wird, welcher Turm Einheiten sendet"
    ],
    "2.6.22": [
        "Kritischer Spielfehler behoben: Wellen werden nicht mehr übersprungen - fehlerhafte zweite Implementierung der Wellenprogression entfernt, die dazu führte, dass das Spiel direkt von Welle 1 zu Welle 3 sprang und dann hängen blieb"
    ],
    "2.6.21": [
        "Optimiertes Turm-Aktionsmenü für Mobilgeräte: Flacker-freies, statisches Design mit klarer Darstellung der Bedienelemente ohne Animationen für bessere Stabilität und Benutzbarkeit auf allen Touchscreens"
    ],
    "2.6.20": [
        "Erweiterte Legenden für die Kaiserlichen-Fraktion: Umbenannt zu 'Das Aethelgardische Reich' mit epischen Geschichten über Kaiser Heinrich und Kaiserin Theophanu mit ihren mächtigen Reichsinsignien"
    ],
    "2.6.19": [
        "Erweiterte Legenden für die Abbasiden-Fraktion: Umbenannt zu 'Das Kalifat von Al-Kimiya' mit fesselnden Geschichten über Kalif Al-Mamun und Großwesirin Zaynab mit ihren einzigartigen Wundern der Wissenschaft"
    ],
    "2.6.18": [
        "Erweiterte Legenden für die Maya-Fraktion: Umbenannt zu 'Die Sternenleser von Yaxtun' mit detaillierten Geschichten über Hohepriester-König Pacal und Hohepriesterin Ixchel mit ihren mystischen Artefakten"
    ],
    "2.6.17": [
        "Erweiterte Legenden für die Spanische Fraktion: Detaillierte Geschichten über König Ferrando 'El Navegante' und Königin Isabella 'La Conquistadora' mit ihren magischen Artefakten hinzugefügt"
    ],
    "2.6.16": [
        "Erweiterte Legenden für die Englische Fraktion: Detailliertere Beschreibungen der herrschaftlichen 'Wunder' von König Artus, Königin Eleonora und König Wilhelm für eine noch immersivere Spielerfahrung"
    ],
    "2.6.15": [
        "Neuer 'Legenden von MASTIL' Menüpunkt mit Auswahl von fünf mittelalterlichen Zivilisationen: Die Engländer, Die Spanier, Die Mayas, Die Abbasiden und Die Kaiserlichen"
    ],
    "2.6.14": [
        "iOS-Fix: Fallback-Button für nächste Welle, falls diese nach Sieg über alle Gegner nicht automatisch startet. Debug-Log für Wellenstart hinzugefügt."
    ],
    "2.6.13": [
        "Dynamische Grafikanpassung entfernt. Feste Qualitätsstufen (Niedrig, Mittel, Hoch) – Standard ist jetzt Mittel. Auswahl im Optionsmenü bleibt."
    ],
    "2.6.12": [
        "Verbesserte Animation für das Credits-Accordion: Sanftere und flüssigere Übergänge beim Öffnen und Schließen der Versionseinträge für eine angenehmere Benutzerinteraktion"
    ],
    "2.6.11": [
        "Minimalistischeres UI: Pause-Button zeigt nur noch das Symbol ohne Text für eine klarere Optik",
        "Verbesserte Wellenanzeige: Textelement durch intuitives Symbol ersetzt für ein kompakteres und übersichtlicheres Interface"
    ],
    "2.6.10": [
                "Integrierte Hintergrundmusik für ein immersiveres Spielerlebnis: Mittelalterliche Klänge bringen die Spielwelt zum Leben",
                "Neuer Musik-Steuerungsbutton: Ein- und Ausschalten der Hintergrundmusik mit einem Klick, platziert in der oberen rechten Ecke"
            ],
            "2.6.9": [
                "Optimierte Positionierung der Highscore-Liste: Erzwungene Positionierung am oberen Bildschirmrand mit voller Breite, ohne Transformationen oder Margins für zuverlässige Anzeige auf allen mobilen Geräten",
                "Verbesserte Credit-Accordion-Funktionalität: Zuverlässigeres Öffnen und Schließen der Versionseinträge durch optimierte Event-Handler und CSS-Styles"
            ],
            "2.6.8": [
                "Eleganteres Turm-Aktionsmenü im mittelalterlichen Stil: Anstelle der großen Box erscheinen nun kreisförmige Aktionsschaltflächen mit Animationen direkt um den ausgewählten Turm herum"
            ],
            "2.6.7": [
                "Kritischer Bugfix: Fehler im Wellensystem behoben - Neue Wellen werden jetzt zuverlässig gestartet, nachdem alle Gegner besiegt wurden"
            ],
            "2.6.6": [
                "Das Trophäen-Emblem über dem Titel der Highscore-Liste wurde entfernt für ein aufgeräumteres Design"
            ],
            "2.6.5": [
                "Die Highscore-Liste wird jetzt im Vollbildmodus angezeigt und überdeckt die Spielüberschrift vollständig für eine optimale Darstellung auf allen Geräten"
            ],
            "2.6.4": [
                "Komplett überarbeitete Positionierung der Highscore-Liste für mobile Geräte: Garantiert am obersten Bildschirmrand fixiert, ohne Abstand und mit optimierter Anzeige aller Einträge"
            ],
            "2.6.3": [
                "Neues Schließen-Button-Design: X-Symbol in der oberen rechten Ecke der Highscore-Liste für garantierte Erreichbarkeit"
            ],
            "2.6.2": [
                "Deutlich kompaktere Highscore-Liste: Kleinere Schrift, reduzierte Abstände und optimierter Button für maximale Anzahl sichtbarer Einträge"
            ],
            "2.6.1": [
                "Weiter optimierte Positionierung der Highscore-Liste: Direkt am oberen Bildschirmrand mit maximaler verfügbarer Höhe für vollständige Anzeige aller Einträge"
            ],
            "2.6.0": [
                "Deutlich verbesserte Positionierung der Highscore-Liste: Jetzt am oberen Bildschirmrand für maximale Sichtbarkeit aller Einträge"
            ],
            "2.5.9": [
                "Verbesserte Darstellung der Highscore-Liste: Optimierte Position und Größe für bessere Sichtbarkeit auf allen Geräten"
            ],
            "2.5.8": [
                "Fehlerbehebung im Credits-Accordion: Versionen können jetzt wieder problemlos geöffnet und geschlossen werden"
            ],
            "2.5.7": [
                "Verbesserte Zuverlässigkeit des Credits-Accordions: Alle Versionselemente werden nun garantiert geschlossen angezeigt, für bessere Übersichtlichkeit besonders auf mobilen Geräten"
            ],
            "2.5.6": [
                "Alle Credits-Versionselemente sind jetzt standardmäßig geschlossen und öffnen sich nicht mehr automatisch, für bessere Übersichtlichkeit besonders auf mobilen Geräten"
            ],
            "2.5.5": [
                "Verbessertes Scrolling in den Credits: Die geöffneten Versionen sind jetzt scrollbar, so dass auch lange Änderungslisten problemlos angezeigt werden können"
            ],
            "2.5.4": [
                "Verbesserte Sichtbarkeit und Erreichbarkeit des 'Neu starten'-Buttons auf dem Game-Over-Bildschirm für eine verbesserte mobile Nutzererfahrung"
            ],
            "2.5.3": [
                "Spielernamensanzeige aus der oberen Leiste entfernt für ein schlankeres Interface"
            ],
            "2.5.2": [
                "Spieltürme haben jetzt einen sanfteren Schatten für verbesserte optische Tiefe",
                "Verbesserte Sichtbarkeit des Spielernamens in der Benutzeroberfläche durch optimierten Kontrast"
            ],
            "2.5.1": [
                "Browser-Tab-Titel auf 'MASTIL' geändert und Favicon von Burg auf Schild geändert",
                "Copyright-Hinweis im gleichen Design wie die Spielüberschrift am unteren Rand der Startseite hinzugefügt",
                "Stern-Symbol aus dem Namenseingabe-Dialog entfernt"
            ],
            "2.5.0": [
                "Credits als strukturiertes Accordion nach Hauptversionen, mit Unterversionen die beim Aufklappen angezeigt werden. Verbesserte Übersichtlichkeit und Navigation durch die Versionshistorie."
            ],
            "2.4.5": [
                "Ladebildschirm: Text jetzt in hellem Gold, mit Glow-Effekt, größerer Cinzel-Schrift, halbtransparentem Hintergrund und besserer Platzierung für optimale Lesbarkeit."
            ],
            "2.4.4": [
                "Das Kreuz auf dem Game-Over-Schild wurde durch ein Schwertsymbol ersetzt."
            ],
            "2.4.3": [
                "Sanfte Fade-In-Animation für Türme und Verbindungen beim Spielstart: Die Spielwelt erscheint schrittweise in einer eleganten Animation."
            ],
            "2.4.2": [
                "Overlay auf dem Ladebildschirm entfernt – jetzt nur noch Hintergrundbild, Ladebalken und Text."
            ],
            "2.4.1": [
                "Verbessertes Credits-Design: Accordion nach Hauptversionen mit animiertem Aufklappen der Unterversionen für bessere Übersichtlichkeit."
            ],
            "2.4.0": [
                "Mittelalterlicher Ladebildschirm mit Pergamentrolle, handschriftlichem Ladetext, aufwändiger Ladebalken-Animation und stilvollen visuellen Effekten für ein immersives Spielerlebnis von Anfang an."
            ],
            "2.3.9": [
                "Mittelalterliche Titelgestaltung: Prachtvolle Überschrift und Untertitel im Pergamentstil mit handschriftlichem Aussehen, Goldakzenten, sanfter Animation und authentischen Schmuckelementen für ein königliches Erscheinungsbild."
            ],
            "2.3.8": [
                "Verbessertes Kartendesign mit mittelalterlichen Elementen: Pergament-Hintergrund, dekorative Kompassrose, authentische Kartengrenzen und alte Landkarten-Textur für ein immersives Spielerlebnis."
            ],
            "2.3.7": [
                "Stilvolle mittelalterliche Menüpunkte auf dem Startbildschirm mit Pergament-Hintergrund, goldenen Ornamenten und Kaligrafie-Schrift für eine authentische Gestaltung passend zum Spielthema."
            ],
            "2.3.6": [
                "Stilvolle mittelalterliche Willkommensnachricht mit Pergament-Design, Kaligrafie-Schrift und eleganter Einblend-Animation für eine immersivere Spielerfahrung."
            ],
            "2.3.5": [
                "Kompaktere Schnellangriff-Meldung: Platzsparende kleine Anzeige direkt am Zielturm statt großer Benachrichtigung für bessere Übersicht im Spiel."
            ],
            "2.3.4": [
                "Einheiten-Animation: Einheiten pulsieren leicht und haben einen sanften Glow-Effekt in der Fraktionsfarbe, wirken dadurch lebendiger und klarer sichtbar."
            ],
            "2.3.3": [
                "Auswahlring um Türme: Dünner, moderner Goldring mit sanftem Glow und dezentem Puls-Effekt. Wirkt hochwertiger und überdeckt das Schloss nicht mehr."
            ],
            "2.3.2": [
                "Schnellangriff-Feature: Doppeltipp auf einen gegnerischen/neutralen Turm sendet automatisch 50% der Einheiten vom ausgewählten Spielerturm"
            ],
            "2.3.1": [
                "Ultra-detaillierte Schloss-Grafiken mit Steinmuster-Texturen",
                "Zinnen, Tore und fraktionsspezifische Dächer für authentische mittelalterliche Optik",
                "Bewegte Fahnen mit Wind-Simulation und fraktionsspezifischen Emblemen",
                "Erweiterte Fenster, Geländer und Mauer-Verbindungen zwischen Türmen",
                "Gesundheitsbalken-ähnliche Einheitenanzeige mit Farbcodierung",
                "Verbesserte Eroberungsanzeige mit pulsierenden Effekten und Partikeln"
            ],
            "2.0.3.6": [
                "Startseiten-Überschrift (MASTIL) und Untertext weiter nach oben verschoben, mehr Abstand zu den Buttons für ein luftigeres Layout."
            ],
            "2.0.3": [
                "Verbesserte mobile Darstellung der Ladeanzeige",
                "Optimierte Viewport-Anpassung für verschiedene Bildschirmgrößen",
                "Angepasste Ladebalken-Darstellung auf mobilen Geräten"
            ],
            "2.0.2": [
                "Verbesserte Scrollbarkeit der Highscore-Liste und Credits auf mobilen Geräten",
                "Optimierte Touch-Interaktion für bessere mobile Bedienung",
                "Angepasste Höhen und Abstände für mobile Ansicht"
            ],
            "2.0.1": [
                "Verbesserte KI-Logik für taktischere Entscheidungen",
                "Optimierte Einheitenverteilung bei Angriffen",
                "Angepasste Schwierigkeitskurve für besseres Spielgefühl",
                "Performance-Optimierungen für flüssigeres Gameplay"
            ],
            "2.0.0": [
                "Major Update: Komplett überarbeitete KI und Wellensystem",
                "Exponentielles Wachstum der Gegner in höheren Wellen",
                "Taktischere KI mit verbesserter Zielauswahl und Strategie",
                "Dynamischere und herausforderndere Gameplay-Mechaniken",
                "Optimierte Performance und Spielablauf"
            ],
            "1.2.6": [
                "Harmonische Fraktionsfarben für bessere Übersicht und angenehmes Spielgefühl.",
                "Credits-Modal auf Mobilgeräten scrollbar."
            ],
            "1.2.3": [
                "Optionen-Menü mit Sprachumschaltung (Deutsch/Englisch), Fortschritt zurücksetzen und Farbschwäche-Modus (Colorblind Mode) hinzugefügt."
            ],
            "1.2.2": [
                "Sanfter Schatten unter der Top-Bar für bessere Lesbarkeit und moderne Optik."
            ],
            "1.2.1.0": [
                "Neuer Pause-Button (⏸) in der Top-Bar: Das Spiel kann jederzeit pausiert und fortgesetzt werden. Während der Pause erscheint ein Overlay mit 'Pause' und einem 'Weiter'-Button."
            ],
            "1.2.0": [
                "Das Tutorial-Fenster erscheint nicht mehr automatisch nach Spielstart, sondern nur noch durch Klick auf den Hilfe-Button. Die Willkommensnachricht erscheint direkt nach der Namenseingabe." 
            ],
            "1.1.5": [
                "Die Willkommensnachricht erscheint jetzt erst nach dem Schließen des Tutorial-Fensters, damit sie garantiert sichtbar ist."
            ],
            "1.1.4.9": [
                "Nach der Namenseingabe wird eine temporäre Willkommensnachricht für den Spieler angezeigt ('Willkommen, Majestät [Spielername]! Viel Erfolg bei deiner Eroberung!')."
            ],
            "1.1.4.8": [
                "Beim Klick auf 'Neu starten' wird die Seite komplett neu geladen (window.location.reload()), sodass das Spiel garantiert sauber zurückgesetzt wird."
            ],
            "1.1.4.7": [
                "Der Hilfe-Button ('?') ist jetzt kleiner, schwarz, transparent und direkt in die Top-Bar rechts neben dem Spielernamen integriert."
            ],
            "1.1.4.6": [
                "Ein Hilfe-Button ('?') oben rechts im Spiel ermöglicht es, das Tutorial-/Spielregeln-Fenster jederzeit erneut zu öffnen."
            ],
            "1.1.4.5": [
                "Der 'Verstanden'-Button im Tutorial-Fenster ist jetzt gezielt gestylt und hebt sich optisch deutlich ab (goldener Verlauf, Schatten, moderner Hover-Effekt)."
            ],
            "1.1.4.4": [
                "Der 'Verstanden'-Button im Tutorial-Fenster ist jetzt optisch hervorgehoben (goldener Farbverlauf, Schatten, moderner Hover-Effekt)."
            ],
            "1.1.4.3": [
                "Der Entwicklervermerk am unteren Rand der Startseite wurde entfernt und ist jetzt ausschließlich im Credits-Bereich sichtbar."
            ],
            "1.1.4.2": [
                "Der Entwicklervermerk 'Developed by H. Haqmal' ist jetzt immer gut sichtbar und goldfarben im Credits-Container platziert."
            ],
            "1.1.4.1": [
                "Die Credits werden jetzt als aufklappbare Accordion-Elemente dargestellt. Nur die Überschriften der Versionen sind sichtbar, beim Anklicken klappt der jeweilige Änderungstext auf."
            ],
            "1.1.4": [
                "Während ein Turm erobert wird, erscheint ein Fortschrittsbalken unter dem Turm, der den Eroberungsfortschritt anzeigt."
            ],
            "1.1.3": [
                "Der Auswahlring um den aktuell ausgewählten Turm ist jetzt dicker, goldfarben und kontrastreicher."
            ],
            "1.1.2": [
                "Der Hintergrund des Einheitenzählers auf den Türmen ist jetzt dunkler und kontrastreicher für bessere Lesbarkeit."
            ],
            "1.1.1": [
                "Der eingegebene Spielername wird nun im Spiel oben rechts im Top-Bar angezeigt."
            ],
            "1.1.0": [
                "Nach Klick auf 'Spiel Starten' erscheint eine Ladeseite mit Ladebalken (10 Sekunden, Hintergrund wie gewünscht).",
                "Direkt danach erscheint ein Pop-up zur Spielernamen-Eingabe ('Majestät, [Spielername]'), ebenfalls mit passendem Hintergrund."
            ],
            "1.0.3": [
                "Entwicklervermerk 'Developed by H. Haqmal' dezent am unteren Rand des Startbildschirms hinzugefügt."
            ],
            "1.0.2": [
                "Bugfix: Das Tutorial-/Spielregeln-Fenster wird jetzt weiter unten und mit mehr Abstand zum oberen Rand angezeigt, sodass die Spielregeln immer vollständig sichtbar sind."
            ],
            "1.0.1": [
                "Fehlerbehebung: Die Versionsnummer auf der Startseite wird jetzt korrekt angezeigt (dynamisch per JavaScript)."
            ],
            "1.0.0": [
                "Initiale Version",
                "Implementierung des Grundspiels",
                "Startbildschirm mit Menü",
                "Turm-basiertes Strategiespiel",
                "Einheitenverwaltung und Kampfsystem",
                "Wellenbasierte Gegner-Spawning",
                "Gold- und Ressourcenmanagement"
            ],
            "1.2.3.1": [
                "Dezente Fade-in- und Scale-Animation beim Öffnen und Schließen des Optionen-Menüs für ein moderneres UI."
            ],
            "1.2.4": [
                "Highscore-Liste als modernes Modal mit Animation, Hervorhebung des eigenen Highscores und Trophäen-Icons für die Top 3."
            ],
            "1.2.5": [
                "Responsives UI für Mobilgeräte: Buttons, Schriftgrößen und Abstände für kleine Bildschirme optimiert."
            ],
            "2.0.3.1": [
                "Einheiten-Slider kompakter und moderner gestaltet: Prozentmarkierungen kleiner, näher am Slider, als Kreise mit Prozentzahl darüber. Aktuelle Auswahl farblich hervorgehoben. Mehr Platz für das Spielfeld."
            ],
            "2.0.3.2": [
                "Turm-Aktionsmenü: Buttons moderner und kompakter gestaltet (flacher, größere Abrundung, dezenter Schatten, kleinerer Abstand, kleinere Schrift, sanfter Hover-Effekt)."
            ],
            "2.0.3.3": [
                "Startseiten-Buttons (menu-button) modern und kompakt gestaltet: Weniger Padding, kleinere Schrift, größere Abrundung, dezenter Schatten, sanfter Hover-Effekt, Buttons rücken näher zusammen. Einheitliches Design mit Turm-Aktionsmenü."
            ],
            "2.0.3.4": [
                "Startseiten-Buttons noch kleiner, modern und leicht transparent: Weniger Padding, kleinere Schrift, border-radius 14px, Hintergrund mit rgba(212,175,55,0.82), dezenter Schatten, sanfter Hover-Effekt mit mehr Transparenz."
            ],
            "2.0.3.5": [
                "Startseiten-Buttons noch transparenter (rgba(212,175,55,0.68)). Helles halbtransparentes Overlay über das Hintergrundbild für mehr Helligkeit auf der Startseite."
            ],
        "2.0.3.16": [
                "Das Info-Panel unten verschwindet jetzt automatisch, sobald ein Turm angeklickt wird."
            ],
        "2.0.4": [
            "Das Namens-Pop-up verwendet jetzt den Titel 'Euer Hoheit, wie lautet euer Name?' für eine noch edlere Ansprache."
        ],
        "2.1.0": [
            "Automatische Anpassung der Menü-Position, sodass das Turm-Menü nie abgeschnitten wird (auch auf kleinen Bildschirmen)",
            "Bugfix: Menü-Buttons werden immer vollständig angezeigt, unabhängig von der Bildschirmgröße oder Position des Turms."
        ],
        "2.1.1": [
            "iOS/Safari: Credits- und Highscore-Modal sind jetzt zuverlässig scrollbar (mobile touch-fix)"
        ],
        "2.1.2": [
            "iOS/Safari: Credits- und Highscore-Modal jetzt mit fester Höhe, Touch-Fix und automatischer Anpassung von touch-action am Body für zuverlässiges Scrollen."
        ],
        "2.1.3": [
            "Globales touch-action: none und user-select: none entfernt – Modals (Credits/Highscore) sind jetzt auf iOS/Safari scrollbar."
        ],
        "2.1.4": [
            "Startbildschirm: Dunkles Overlay entfernt, Hintergrundbild jetzt in voller Helligkeit sichtbar."
        ],
        "2.2.0": [
            "Im Game-Over-Screen wird jetzt die erreichte Welle angezeigt."
        ],
        "2.2.1": [
            "Die Credits-Liste ist jetzt nach Hauptversionen gruppiert und als Accordion aufgebaut."
        ],
        "2.2.2": [
            "Das Credits-Fenster ist jetzt breiter für bessere Lesbarkeit."
        ],
        "2.2.3": [
            "Beim Öffnen der Credits sind jetzt alle Hauptversionen standardmäßig zugeklappt."
        ],
        "2.2.4": [
            "Die Überschrift 'MASTIL' auf dem Startbildschirm ist auf kleinen Bildschirmen jetzt deutlich größer und besser lesbar."
        ],
        "2.2.5": [
            "Die Überschrift 'MASTIL' auf dem Startbildschirm leuchtet beim Laden der Seite kurz hell auf (Glow-Effekt)."
        ],
        "2.2.6": [
            "Die Überschrift 'MASTIL' auf dem Startbildschirm pulsiert beim Laden der Seite sanft wie ein Herzschlag (einmaliger Puls-Effekt)."
        ],
        "2.2.7": [
            "Die Überschrift 'MASTIL' pulsiert dauerhaft sanft wie ein Herzschlag, solange die Startseite sichtbar ist."
        ],
        "2.2.8": [
            "Der Herzschlag-Effekt der Überschrift 'MASTIL' ist jetzt viel langsamer und subtiler (leichter Glow, weniger Vergrößerung)."
        ],
        "2.2.9": [
            "Der Herzschlag-Effekt der Überschrift 'MASTIL' dauert jetzt 8 Sekunden pro Puls (sehr langsam und dezent)."
        ],
        "2.2.10": [
            "Der Herzschlag-Effekt der Überschrift 'MASTIL' dauert jetzt 15 Sekunden pro Puls (ultra langsam und dezent)."
        ],
        "2.2.11": [
            "Die Überschrift 'MASTIL' leuchtet beim Laden der Startseite einmalig langsam auf und bleibt dann dauerhaft hell (kein Pulsieren mehr)."
        ],
        "2.2.12": [
            "Der Einheiten-Slider steht beim Öffnen jetzt immer auf 50 % (statt 25 %)."
        ],
        "2.2.13": [
            "Das Info-Panel unten verschwindet jetzt automatisch, sobald ein Turm angeklickt wird."
        ],
        "2.3.0": [
            "Revolutionäres 2.5D-Schloss-Design mit isometrischer Perspektive",
            "Detaillierte Schloss-Grafiken mit Türmen, Mauern und Dächern",
            "Level-abhängige Architektur: Mehr Türme und Details bei höheren Levels",  
            "3D-Schatten und Tiefeneffekte für realistische Optik",
            "Fahnen für Level 4+ Schlösser als Statussymbol"
        ],
        "2.3.4": [
            "Auswahlring um Türme: Jetzt größer und transparenter für einen noch moderner, dezenteren Look."
        ],
        "2.4.0": [
            "Türme können jetzt bis Level 25 aufgewertet werden. Ab Level 5 Banner, ab Level 8 goldene Dächer, ab Level 12 animierte Banner, ab Level 16 zusätzliche Fenster/Lichter, ab Level 20 goldene Statuen, ab Level 25 epischer Glow. Nebenturm-Anzahl wächst mit Level."
        ],
        "2.4.1": [
            "Beim Besitzerwechsel (Eroberung) wird das Level des Turms immer auf 1 zurückgesetzt."
        ],
        "2.4.2": [
            "Die maximale Einheitenkapazität eines Turms wächst jetzt: Level 1 = 10, dann je Level +5. (Formel: 10 + (Level-1)*5)"
        ],
    };

    // Start screen menu functions
    function startGame() {
        if (window.mastilStartFlowActive) return;
        window.mastilStartFlowActive = true;
        // Zeige Ladebildschirm
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('playername-modal').style.display = 'none';
        
        // Variable ist bereits global definiert, keine erneute Zuweisung hier notwendig

        // Ladezustand als ruhige Feldzug-Vorbereitung anzeigen.
        let progress = 0;
        const loadingBar = document.getElementById('loading-bar');
        const loadingBarGlow = document.getElementById('loading-bar-glow');
        const loadingSteps = Array.from(document.querySelectorAll('.mastil-loading-step'));
        if (loadingBar) {
            loadingBar.style.width = '0%';
        }
        if (loadingBarGlow) {
            loadingBarGlow.style.display = 'block';
        }
        loadingSteps.forEach((step, index) => {
            step.classList.toggle('is-active', index === 0);
            step.classList.remove('is-complete');
        });
        const interval = setInterval(() => {
            progress += 1;
            if (loadingBar) {
                loadingBar.style.width = progress + '%';
            }
            const activeStep = Math.min(loadingSteps.length - 1, Math.floor(progress / 25));
            loadingSteps.forEach((step, index) => {
                step.classList.toggle('is-complete', index < activeStep);
                step.classList.toggle('is-active', index === activeStep);
            });
            if (progress >= 100) {
                clearInterval(interval);
                if (loadingBarGlow) {
                    loadingBarGlow.style.display = 'none';
                }
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('playername-modal').style.display = 'flex';
                document.getElementById('playername-input').focus();
                window.mastilStartFlowActive = false;
                
                // Standardmäßig England als Nation auswählen und hervorheben
                setTimeout(() => {
                    selectFaction('england');
                }, 100);
            }
        }, 30);
    }

    // Speichern der ausgewählten Fraktion - als globale Variable deklariert
    window.selectedFaction = 'england'; // Standard-Fraktion
    
    function selectFaction(faction) {
        console.log(`Nationswahl: ${faction} ausgewählt`);
        
        // Entferne die aktive Klasse von allen Buttons und setze Hintergrund zurück
        const buttons = document.querySelectorAll('.faction-button');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = '#b5a68a'; // Dunklerer Hintergrund für inaktive Buttons
            btn.style.boxShadow = 'none';
            // Zusätzliche Klasse für Accessibility entfernen
            btn.setAttribute('aria-selected', 'false');
        });
        
        // Setze die aktive Klasse auf den ausgewählten Button
        const selectedButton = document.querySelector(`.faction-button[data-faction="${faction}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
            selectedButton.setAttribute('aria-selected', 'true');
            selectedButton.style.background = '#f5eeda'; // Heller Hintergrund für den aktiven Button
            selectedButton.style.boxShadow = '0 0 8px #d4af37, inset 0 0 10px rgba(212, 175, 55, 0.3)';
            
            // Visuelles Feedback für den Nutzer
            const icon = selectedButton.querySelector('.faction-icon');
            if (icon) {
                // Kurze Animation für visuelles Feedback
                icon.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 300);
            }
        }
        
        // Speichere die ausgewählte Fraktion in der globalen Variable
        window.selectedFaction = faction;
        
        // Debug-Ausgabe zur Überprüfung
        console.log(`Fraktion gesetzt auf: ${window.selectedFaction}`);
        
        // Zeige einen Hinweis, dass eine Nation gewählt wurde
        const confirmButton = document.querySelector('#playername-modal .mastil-name-submit');
        if (confirmButton) {
            confirmButton.classList.add('nation-selected');
        }
    }

    function submitPlayerName() {
        if (window.mastilSubmittingPlayerName) return;
        const name = document.getElementById('playername-input').value.trim();
        if (!name) {
            document.getElementById('playername-input').focus();
            return;
        }
        window.mastilSubmittingPlayerName = true;
        
        // Add brief animation effect to button on submit
        const submitBtn = document.querySelector('#playername-modal .mastil-name-submit');
        if (submitBtn) {
            submitBtn.classList.add('submitting');
        }
        
        // Store player name and faction
        window.PLAYER_NAME = name;
        window.PLAYER_FACTION = window.selectedFaction;
        
        console.log(`Spieler hat Name "${name}" und Fraktion "${window.selectedFaction}" gewählt`);
        
        // Delay transition slightly for smooth effect
        setTimeout(() => {
            document.getElementById('playername-modal').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            
            // Show royal welcome message with faction information
            showRoyalWelcome(name, window.selectedFaction);
            
            // Zeige Nationsemblem in der Top-Bar
            updateNationEmblem(window.selectedFaction);
            
            if (typeof initGame === 'function') {
                initGame();
            }
            if (submitBtn) {
                submitBtn.classList.remove('submitting');
            }
            window.mastilSubmittingPlayerName = false;
        }, 300);
    }

    function setupOptionsCloseListener() {
        var closeBtn = document.getElementById('options-close-btn');
        if (closeBtn) {
            // Entferne alten Listener falls vorhanden
            closeBtn.removeEventListener('click', closeOptions);
            // Setze neuen Listener
            closeBtn.addEventListener('click', function() {
                console.log('closeOptions aufgerufen (Listener gesetzt)');
                closeOptions();
            });
            console.log('options-close-btn-Listener gesetzt (setupOptionsCloseListener)');
        } else {
            console.log("options-close-btn nicht gefunden (setupOptionsCloseListener)");
        }
    }

    function showOptions() {
        var modal = document.getElementById('options-modal');
        modal.classList.add('active');
        // Stelle sicher, dass der Listener gesetzt ist
        setupOptionsCloseListener();
    }

    function showHighscores() {
        renderHighscoreList();
        var modal = document.getElementById('highscore-modal');
        
        // Stelle sicher, dass die Highscore-Liste den gesamten Bildschirm füllt
        document.body.style.overflow = 'hidden'; // Verhindert Scrollen im Hintergrund
        
        // Optimierte Styles für zuverlässige Positionierung auf allen Geräten
        modal.style.position = 'fixed';
        modal.style.inset = '0'; // Shorthand für top, right, bottom, left 0
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.right = '0';
        modal.style.bottom = '0';
        modal.style.width = '100%';
        modal.style.height = '100vh';
        modal.style.maxHeight = '100vh';
        modal.style.zIndex = '9999';
        modal.style.margin = '0';
        modal.style.padding = '10px 28px 20px 28px'; // Reduzierte Paddings für mehr Platz
        modal.style.borderRadius = '0';
        modal.style.transform = 'none';
        modal.style.translate = 'none'; // Verhindert potenzielle Transform-Konflikte
        modal.style.boxSizing = 'border-box';
        
        // Wichtig für mobiles Scrollen
        modal.style.overflowY = 'auto';
        modal.style.webkitOverflowScrolling = 'touch';
        modal.style.touchAction = 'pan-y';
        
        modal.classList.add('active');
        
        // Dispatch custom show event for touch handlers
        modal.dispatchEvent(new Event('show'));
        
        // Scroll to top to ensure visibility and reset mobile position
        window.scrollTo(0, 0);
        
        // Setze einen kleinen Timeout für iOS-Geräte, um sicherzustellen,
        // dass die Scrollposition korrekt behandelt wird
        setTimeout(function() {
            window.scrollTo(0, 0);
            modal.scrollTop = 0;
        }, 50);
    }

    function showCredits() {
        renderCreditsAccordion();
        document.getElementById('credits-modal').style.display = 'block';
        
        // Mit einem kurzen Timeout sicherstellen, dass die DOM-Elemente gerendert sind
        setTimeout(function() {
            // Direkt auf alle Accordion-Titel und Panels zugreifen und aktive Klassen entfernen
            const allAccordionTitles = document.querySelectorAll('#credits-modal .accordion-title, #credits-modal .inner-accordion-title');
            const allAccordionPanels = document.querySelectorAll('#credits-modal .accordion-panel, #credits-modal .inner-accordion-panel');
            
            allAccordionTitles.forEach(title => {
                title.classList.remove('active');
            });
            
            allAccordionPanels.forEach(panel => {
                panel.classList.remove('active');
            });
        }, 50); // Kurzes Timeout zur Sicherstellung, dass DOM aktualisiert wurde
    }

    function closeCredits() {
        document.getElementById('credits-modal').style.display = 'none';
    }
    
    function showLegends() {
        const modal = document.getElementById('legends-modal');
        modal.style.display = 'block';
        modal.scrollTop = 0;
    }
    
    function closeLegends() {
        document.getElementById('legends-modal').style.display = 'none';
    }
    
    // Funktion zum Aktualisieren des Nationsemblems in der Top-Bar
    function updateNationEmblem(factionId) {
        const emblemContainer = document.getElementById('nation-emblem');
        const nationIcon = emblemContainer.querySelector('.nation-icon');
        const nationName = emblemContainer.querySelector('.nation-name');
        const factionIconClasses = {
            england: 'mastil-icon-england',
            spain: 'mastil-icon-spain',
            maya: 'mastil-icon-maya',
            abbasid: 'mastil-icon-abbasid',
            hre: 'mastil-icon-hre'
        };
        
        // Setze Icon und Name entsprechend der Fraktion
        nationIcon.textContent = '';
        nationIcon.className = `nation-icon mastil-faction-icon ${factionIconClasses[factionId] || 'mastil-icon-england'}`;
        switch(factionId) {
            case 'england':
                nationName.textContent = 'Ritter von Albion';
                break;
            case 'spain':
                nationName.textContent = 'Solterraner';
                break;
            case 'maya':
                nationName.textContent = 'Sternenleser';
                break;
            case 'abbasid':
                nationName.textContent = 'Al-Kimiya';
                break;
            case 'hre':
                nationName.textContent = 'Aethelgard';
                break;
            default:
                nationName.textContent = 'Edles Reich';
        }
        
        // Stelle sicher, dass das Emblem sichtbar ist
        emblemContainer.style.display = 'flex';
    }
    
    function showCivilizationLegend(civId) {
        // Deactivate all buttons
        const buttons = document.querySelectorAll('.legend-button');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Activate the selected button
        const selectedButton = document.querySelector(`.legend-button[onclick*="${civId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
        
        // Get the content container
        const contentContainer = document.getElementById('legend-content');
        contentContainer.style.display = 'block';
        const legendsModal = document.getElementById('legends-modal');
        if (legendsModal) legendsModal.scrollTop = 0;
        
        // Prepare content based on selected civilization
        let content = '';
        switch(civId) {
            case 'england':
                content = `
                    <h3>Die Ritter von Albion</h3>
                    <p>Das Königreich Albion ist bekannt für seine mächtigen Langbogenschützen, tadellosen Ritter und überlegene Verteidigungsstrategie. Ihre Geschichte ist geprägt von legendären Herrschern, deren Vermächtnis das Reich bis heute prägt.</p>
                    
                    <div class="legends-accordion">
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">König Artus der Einiger und der Kelch der Harmonie</button>
                            <div class="legend-accordion-panel">
                                <p>In den tiefsten Nebeln einer längst vergangenen Ära, als das Land, das man später Albion nennen sollte, noch ein Flickenteppich aus zänkischen Baronien und verfeindeten Stadtstaaten war, trat ein Mann auf den Plan, dessen Name bis heute in den Liedern der Barden widerhallt: Artus, später gerühmt als "der Einiger". Er war kein Spross eines mächtigen Geschlechts, kein anerkannter Erbe eines großen Throns, sondern ein Mann von einfachem Adel, dessen Herz jedoch von einer Vision brennender als jedes Schmiedefeuer erfüllt war – der Vision eines geeinten, friedvollen Albions.</p>
                                <p>Die Zeiten waren düster. Misstrauen vergiftete die Beziehungen zwischen den Menschen, und das Gesetz des Stärkeren herrschte unangefochten. Burgen erhoben sich trotzig gegeneinander, und das Leid des einfachen Volkes war unermesslich. Viele hatten versucht, die Ordnung mit Schwert und Feuer zu erzwingen, doch sie waren alle gescheitert, denn Gewalt gebar nur neue Gewalt. Artus jedoch wählte einen anderen Weg, einen Weg, der ihm durch ein "Wunder" geebnet wurde, das ihm unter mysteriösen Umständen zuteilwurde: der Kelch der Harmonie.</p>
                                <p>Die Legenden streiten sich über den Ursprung dieses Artefakts. Manche sagen, er sei ein Geschenk der scheuen Waldgeister gewesen, andere, er sei aus einem gefallenen Stern geschmiedet worden. Sicher ist nur, dass der Kelch, schlicht und aus einem unbekannten, warm leuchtenden Metall gefertigt, eine sanfte, doch unwiderstehliche Magie ausstrahlte. Es wurde erzählt, dass jeder Tropfen Wasser, der aus ihm getrunken wurde, nicht nur den Durst stillte, sondern auch die bittersten Herzen von Groll, Neid und Hass reinigte und sie mit einem tiefen Verständnis für das Gegenüber und einem unstillbaren Verlangen nach Eintracht erfüllte.</p>
                                <p>Mit diesem Kelch als seinem einzigen Schild und seiner Überzeugung als seiner einzigen Waffe begann Artus seine schier unmögliche Mission. Er lud die streitlustigsten Barone, die stolzesten Fürstinnen und die misstrauischsten Klanführer an seinen einfachen Holztisch, der später zur berühmten Tafelrunde werden sollte. Statt Heere aufzustellen, bot er ihnen Wasser aus dem Kelch der Harmonie an. Viele kamen mit Hohn auf den Lippen und Waffen in den Händen, doch nachdem sie getrunken hatten, so berichten die Chroniken, legten sie ihre Schwerter nieder, lauschten den Worten ihrer einstigen Feinde und fanden in den Augen des anderen nicht mehr den Rivalen, sondern den Nachbarn, den Bruder, den Menschen.</p>
                                <p>Ein besonders hartnäckiger Fall war der des grimmigen Fürsten Vorlag vom Wolfsfels, dessen Fehde mit dem Hause der Falkenküste bereits drei Generationen überdauert hatte. Artus suchte ihn in seiner düsteren Feste auf. Vorlag, ein Hüne von einem Mann, lachte Artus und seinen "Zaubertrank" zunächst aus. Doch die ruhige Würde des Königs und die sanfte Ausstrahlung des Kelches bewogen ihn schließlich, einen Schluck zu nehmen. Die Wirkung, so heißt es, war augenblicklich. Vorlags verhärtete Züge entspannten sich, und er soll geweint haben, als er die Sinnlosigkeit des jahrzehntelangen Blutvergießens erkannte. Noch am selben Tag ritt er zur Falkenküste, nicht um zu kämpfen, sondern um Frieden zu schließen – einen Frieden, der unter dem wachsamen Auge von Artus und der stillen Magie des Kelches für immer halten sollte.</p>
                                <p>So, durch Geduld, Weisheit und das sanfte Wirken des Kelches der Harmonie, schmiedete Artus aus den zerstrittenen Fragmenten ein geeintes Königreich Albion. Seine Tafelrunde wurde zum Symbol dieser neuen Ära, in der Gerechtigkeit und gegenseitiger Respekt höher galten als blanke Macht. Albion erlebte unter seiner Herrschaft eine Blütezeit des Friedens und des Wohlstands, die als das Goldene Zeitalter in die Geschichte einging, ein leuchtendes Beispiel dafür, dass die stärksten Bande nicht mit Eisen, sondern mit Verständnis und Harmonie geschmiedet werden. Der Kelch selbst verschwand nach Artus' Tod auf ebenso mysteriöse Weise, wie er erschienen war, doch sein Erbe lebt in den Herzen derer weiter, die an die Macht des Friedens glauben.</p>
                            </div>
                        </div>
                        
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">Königin Eleonora Eisenherz und die Greifenstandarte</button>
                            <div class="legend-accordion-panel">
                                <p>Jahrzehnte nach Artus' goldenem Frieden zogen dunkle Wolken am Horizont von Albion auf. Aus den eisigen Nordlanden und den sturmgepeitschten Meeren fielen wilde Plündererhorden ein, die Küstenstädte brannten und das Binnenland mit Furcht überzogen. In dieser verzweifelten Stunde, als viele Adlige zögerten und zauderten, erhob sich eine Frau, deren Mut so unerschütterlich war wie ihr Wille: Königin Eleonora, die das Volk bald ehrfürchtig "Eisenherz" nennen sollte. Sie war keine Königin, die sich in Seide hüllte und aus der Ferne Befehle gab, sondern eine wahre Schildmaid, die ihr Volk anführte, oft selbst in glänzender Rüstung an der Spitze ihrer Ritter.</p>
                                <p>Eleonoras Aufstieg war steinig gewesen; als Frau auf dem Thron musste sie sich doppelt beweisen. Doch ihre strategische Schärfe und ihre Fähigkeit, die Herzen ihrer Soldaten zu entflammen, waren unbestreitbar. Als die Bedrohung durch die Nordmänner ihren Höhepunkt erreichte und selbst die stärksten Festungen des Südens zitterten, offenbarte sich das "Wunder", das mit Eleonoras Namen für immer verbunden bleiben sollte: die Greifenstandarte.</p>
                                <p>Dieses Banner war kein gewöhnliches Feldzeichen. Es war ein riesiges, prachtvoll besticktes Tuch, das einen majestätischen goldenen Greifen auf tiefblauem Grund zeigte – das Wappentier ihres Hauses. Doch die Legende besagt, dass das Tuch selbst aus den Federn eines Himmelsgreifen gewebt und der Faden mit dem Blut eines alten Waldgeistes gefärbt worden war. Wenn die Standarte im Schlachtenlärm entrollt wurde und der aufgestickte Greif im Wind zu leben schien, erfüllte sie Eleonoras Krieger mit einer wilden, unbezwingbaren Kraft. Ihre müden Glieder wurden stark, ihre Ängste wichen unerschütterlicher Entschlossenheit, und selbst die zahlenmäßig überlegenen Feinde begannen zu zögern, wenn sie den mythischen Greifen erblickten. Es hieß, die Standarte könne den Ausgang einer Schlacht wenden, bevor das erste Schwert gezogen wurde, denn sie nährte die Tapferkeit der Ihren und säte lähmende Zweifel in die Herzen der Gegner.</p>
                                <p>Die entscheidende Schlacht fand an den Kreideklippen von Adlershorst statt. Eine gewaltige Flotte der Nordmänner war gelandet, ihre Krieger tobten bereits durch die Küstendörfer. Eleonora, an der Spitze ihrer königlichen Garde und mit der Greifenstandarte hoch über sich, stellte sich ihnen entgegen. Die Schlacht war brutal und blutig. Mehrmals drohte Eleonoras Linie zu brechen, doch jedes Mal, wenn der Wind die Standarte entfaltete und der goldene Greif in der Sonne gleißte, schöpften ihre Männer und Frauen neuen Mut. Eleonora selbst kämpfte wie eine Löwin, ihr Schwert sang ein Lied des Todes für die Invasoren. Angesichts dieser unnachgiebigen Verteidigung und der fast übernatürlichen Moral der Albioner begannen die Nordmänner schließlich zu weichen und flohen in panischer Unordnung zurück zu ihren Schiffen.</p>
                                <p>Dieser Sieg, errungen unter dem Zeichen der Greifenstandarte, sicherte nicht nur die Küsten Albions, sondern markierte auch den Beginn einer neuen Ära der Expansion. Königin Eleonora Eisenherz nutzte den Respekt und die Furcht, die ihr Name nun hervorrief, um die Grenzen ihres Reiches zu festigen und es zu einer Macht zu formen, mit der man rechnen musste. Die Greifenstandarte wurde zum Symbol ihrer unerschrockenen Herrschaft und der unbezwingbaren Seele Albions.</p>
                            </div>
                        </div>
                        
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">König Wilhelm der Seefahrer und der Kompass der Verlorenen Gezeiten</button>
                            <div class="legend-accordion-panel">
                                <p>Nach den kriegerischen Zeiten von Königin Eleonora folgte eine Periode des relativen Friedens, doch eine neue Herausforderung tat sich für Albion auf: Die alten Handelsrouten über die See wurden unsicher, blockiert durch erstarkende Piratenfürsten und rivalisierende Seemächte. Der Wohlstand des Inselreichs, der stark vom Handel abhing, begann zu schwinden. In dieser Zeit der maritimen Krise bestieg König Wilhelm den Thron, ein Mann, dessen Blick schon immer sehnsüchtig auf den unendlichen Weiten des Ozeans geruht hatte. Man nannte ihn bald "den Seefahrer", nicht weil er selbst unzählige Reisen unternahm, sondern weil er die kühnsten Kapitäne und Kartographen seiner Zeit versammelte und sie mit einer Vision von Entdeckung und maritimer Dominanz inspirierte.</p>
                                <p>Das Herzstück seiner ehrgeizigen Pläne war ein einzigartiges "Wunder", das auf geheimnisvolle Weise in den Besitz der Krone gelangt war: der Kompass der Verlorenen Gezeiten. Dieses Artefakt war keine gewöhnliche Magnetnadel. Gefertigt aus einem bläulich schimmernden Metall, das auf keiner bekannten Karte verzeichnet war, und besetzt mit einem zentralen Kristall, der bei Annäherung an Land leise zu summen begann, wies dieser Kompass nicht stur nach Norden. Stattdessen, so erzählten es die Seeleute, die ihn benutzt hatten, zeigte seine Nadel stets den sichersten und schnellsten Weg zu jedem vom Kapitän gewünschten Ziel – selbst wenn dieses Ziel nur in den verblassenden Erinnerungen alter Seekarten oder den fantastischen Erzählungen gestrandeter Fischer existierte. Er konnte durch die dichtesten Nebelbänke führen, verriet verborgene Strömungen und warnte vor nahenden Monsterstürmen, lange bevor der Himmel sich verdunkelte.</p>
                                <p>Mit dem Kompass der Verlorenen Gezeiten als unschätzbarem Werkzeug rüstete König Wilhelm eine Flotte von Expeditionsschiffen aus. Diese kühnen Seefahrer, geleitet von dem mystischen Artefakt, stießen in unbekannte Gewässer vor. Sie entdeckten neue Kontinente, reiche Inseln voller exotischer Güter und knüpften Handelsbeziehungen mit Völkern, von deren Existenz Albion zuvor nicht einmal geträumt hatte. Die "Verlorenen Routen", die der Kompass ihnen wies, umgingen die von Piraten verseuchten Gewässer und brachten einen nie dagewesenen Strom von Reichtum und Wissen zurück in die Häfen Albions.</p>
                                <p>Eine der berühmtesten Expeditionen unter Wilhelms Patronat war die des Kapitäns Lyonesse, die mit Hilfe des Kompasses die sagenumwobenen Sonneninseln fand, deren Bewohner Gold wie Kieselsteine behandelten. Die Rückkehr der "Sonnenwind", beladen mit Schätzen und Karten neuer Welten, löste im ganzen Reich einen Freudentaumel aus und festigte Wilhelms Ruf als weiser und vorausschauender Monarch.</p>
                                <p>König Wilhelm der Seefahrer verwandelte Albion von einer bedrängten Inselnation in ein blühendes maritimes Imperium. Er gründete die Königliche Navigationsakademie, ließ präzise Seekarten der neuen Routen erstellen und baute eine Flotte, die die Handelswege für Generationen sicherte. Der Kompass der Verlorenen Gezeiten wurde zum bestgehüteten Geheimnis der Krone, ein Schlüssel zu Albions globalem Einfluss und ein Symbol für den unstillbaren Entdeckergeist, den König Wilhelm in seinem Volk geweckt hatte.</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'spain':
                content = `
                    <h3>Die Solterraner von Esperia</h3>
                    <p>Das sonnenverwöhnte Königreich Esperia ist bekannt für seine mächtigen Galeonen, geschickten Konquistadoren und sein weitreichendes Kolonialimperium. Seine Geschichte ist geprägt von kühnen Seefahrern und entschlossenen Herrschern, die mit Hilfe mystischer Artefakte die Grenzen der bekannten Welt erweiterten.</p>
                    
                    <div class="legends-accordion">
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">König Ferrando "El Navegante" und das Astrolabium der Sternenpfade</button>
                            <div class="legend-accordion-panel">
                                <p>Als die bekannten Karten von MASTIL endeten und nur noch weiße Flecken von "Hier sind Drachen" zeugten, bestieg König Ferrando, den man später ehrfurchtsvoll "El Navegante" – den Seefahrer – nennen sollte, den Thron des sonnenverwöhnten Königreichs Esperia. Andere Herrscher gaben sich mit ihren angestammten Ländereien zufrieden, doch Ferrandos Blick war stets auf den Horizont gerichtet, auf die unendlichen Weiten des Ozeans, von denen die alten Fischer nur mit gesenkter Stimme und einem Kreuzzeichen flüsterten. Er träumte nicht von kleinen Grenzverschiebungen, sondern von neuen Kontinenten, von unermesslichen Schätzen und davon, den Namen Esperias bis ans Ende der Welt zu tragen.</p>
                                <p>Viele hielten ihn für einen Träumer, einen Fantasten, der die knappen Ressourcen des Reiches für aussichtslose Unternehmungen verschwenden würde. Doch Ferrando besaß nicht nur eine unstillbare Neugier, sondern auch ein "Wunder", das seine kühnsten Träume in greifbare Nähe rückte: das Astrolabium der Sternenpfade. Dieses komplexe Instrument aus poliertem Gold und eingelassenen Himmelskristallen war kein gewöhnliches Navigationsgerät. Es war ein Erbstück seiner Dynastie, von dem es hieß, es sei von den Sternen selbst gefallen oder von einem Meeresgott einem seiner Vorfahren geschenkt worden. Wenn man bei Nacht hindurchblickte, so die Legende, zeigte das Astrolabium nicht nur die bekannten Sternbilder, sondern auch verborgene kosmische Ströme und leuchtende Pfade, die sicher durch unbekannte Gewässer führten – Wege, die kein gewöhnlicher Kompass und keine sterbliche Karte je offenbaren könnten. Es warnte vor magnetischen Anomalien, verriet die Position tückischer Riffe noch meilenweit entfernt und soll sogar die Stimmung des Ozeans selbst haben vorhersagen können.</p>
                                <p>Mit dem Astrolabium als Herzstück seiner Vision gründete Ferrando die Königliche Armada der Entdecker. Er versammelte die mutigsten Kapitäne, die fähigsten Kartographen und die abenteuerlustigsten Seelen seines Reiches. Schiff um Schiff stach unter seinem Banner in See, nicht um zu plündern, sondern um zu finden. Die ersten Expeditionen, geleitet von Kapitänen, die Ferrando persönlich im Gebrauch des Astrolabiums unterwiesen hatte, kehrten mit unglaublichen Berichten zurück: von Inseln, deren Strände aus glitzerndem Vulkanglas bestanden, von Kontinenten, auf denen riesige, sanftmütige Bestien weideten, und von Völkern, die mit Perlen und seltenen Gewürzen Handel trieben.</p>
                                <p>König Ferrando "El Navegante" verwandelte Esperia von einem beschaulichen Königreich in eine aufstrebende Seemacht. Er ließ neue Häfen bauen, förderte den Schiffbau und die Kartographie und legte den Grundstein für ein Imperium, dessen Einfluss sich bald über alle bekannten und neu entdeckten Meere erstrecken sollte. Das Astrolabium der Sternenpfade wurde zum Symbol dieser Ära des Aufbruchs, ein Zeugnis dafür, dass mit Mut, Weitsicht und einem Funken "Wunder" selbst die entferntesten Horizonte erreichbar sind.</p>
                            </div>
                        </div>
                        
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">Königin Isabella "La Conquistadora" und das Zepter der Goldenen Sonne</button>
                            <div class="legend-accordion-panel">
                                <p>Auf das Zeitalter der Entdeckungen unter Ferrando folgte die Ära der Expansion, und keine Figur verkörpert diese Epoche mehr als Königin Isabella, die Erste ihres Namens, oft mit einer Mischung aus Furcht und Bewunderung "La Conquistadora" genannt. Während Ferrando die Türen zu neuen Welten aufstieß, war es Isabella, die mit eiserner Entschlossenheit und unerschütterlichem Glauben an die Bestimmung Esperias hindurchschritt, um diese neuen Ländereien unter ihre Krone zu bringen. Sie war eine Herrscherin von asketischer Strenge, tief religiös und überzeugt davon, dass es ihre heilige Pflicht sei, die "unzivilisierten" Völker der neu entdeckten Gebiete unter die erleuchtende Herrschaft Esperias zu führen – ob sie wollten oder nicht.</p>
                                <p>Ihr zur Seite stand ein mächtiges "Wunder", das ihre Eroberungszüge oft erst ermöglichte: das Zepter der Goldenen Sonne. Dieses prachtvolle, fast blendend helle Goldzepter, gekrönt von einem ungeschliffenen Sonnenedelstein, soll die Macht der Sonne selbst kanalisiert haben. In Isabellas Händen konnte es einen Lichtstrahl aussenden, der so intensiv war, dass er feindliche Truppen blendete und panische Furcht in ihren Reihen auslöste. Es wurde auch berichtet, dass das Zepter in Gegenwart von "heidnischen" Götzen oder dunkler Magie zu pulsieren begann und eine reinigende Aura ausstrahlte, die den Glauben ihrer Soldaten stärkte und ihre Moral unbesiegbar machte. Für viele ihrer Anhänger war das Zepter der Beweis, dass ihre Mission gottgewollt war.</p>
                                <p>Unter Isabellas Führung segelten Flotten von schwer bewaffneten Galeonen und Karavellen über den Ozean, an Bord nicht nur Soldaten und Siedler, sondern auch Priester und Missionare. Die Chroniken berichten von kühnen Landungen an unbekannten Küsten, von blutigen Schlachten gegen exotische Krieger in undurchdringlichen Dschungeln und von der Gründung neuer Kolonien und Vizekönigreiche im Namen der Krone Esperias. Wo immer Isabellas Banner – oft begleitet vom gleißenden Licht des Zepters der Goldenen Sonne – erschien, wurden alte Reiche gestürzt und neue Provinzen dem wachsenden Imperium einverleibt.</p>
                                <p>Die Herrschaft von Königin Isabella "La Conquistadora" war geprägt von unermesslichem Goldfluss nach Esperia, von der Ausbreitung ihrer Kultur und ihres Glaubens, aber auch von der brutalen Unterwerfung indigener Völker und der Zerstörung ihrer Traditionen. Sie bleibt eine der umstrittensten und gleichzeitig mächtigsten Figuren in den Legenden von MASTIL, eine Herrscherin, deren "Wunder" half, ein Weltreich zu schmieden, dessen Glanz jedoch oft auf dem Leid anderer erbaut wurde.</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'maya':
                content = `
                    <h3>Die Sternenleser von Yaxtun</h3>
                    <p>Im Herzen dichtester Dschungel erheben sich die majestätischen Stufenpyramiden von Yaxtun, einem Volk, dessen Meister der Astronomie, Mathematik und heiligen Kalendersysteme waren. Ihre Gesellschaft wird von weisen Hohepriester-Königen und -Königinnen geführt, die sowohl weltliche als auch spirituelle Macht in sich vereinen und durch mystische Artefakte mit den Göttern kommunizieren.</p>
                    
                    <div class="legends-accordion">
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">Hohepriester-König Pacal "Der Himmelsdeuter" und der Obsidian-Spiegel von Itzamná</button>
                            <div class="legend-accordion-panel">
                                <p>In den tiefen, smaragdgrünen Dschungeln, wo die Pyramiden von Yaxtun wie steinerne Berge die Baumwipfel durchbrachen, herrschte einst Hohepriester-König Pacal, den sein Volk ehrfürchtig "Der Himmelsdeuter" nannte. Er war nicht nur ein weltlicher Regent, der über Recht und Ordnung wachte, sondern auch der höchste Diener der Götter, ein Mittler zwischen der Welt der Sterblichen und den unergründlichen Reichen des Kosmos. Seine Tage verbrachte er ebenso oft in den Observatorien auf den Spitzen der Tempel, die Sterne studierend, wie in den Thronsälen, um die Geschicke seines Volkes zu lenken. Die Sternenleser von Yaxtun glaubten, dass das Schicksal in den Himmelskörpern geschrieben stand, und Pacal war der Meisterleser dieser himmlischen Chronik.</p>
                                <p>Das "Wunder", das Pacals Herrschaft und seine außergewöhnliche Weisheit begründete, war der Obsidian-Spiegel von Itzamná. Dieses Artefakt, ein perfekt polierter, tiefschwarzer Spiegel von makelloser Oberfläche, soll ein Geschenk des Schöpfergottes Itzamná selbst gewesen sein. Es wurde in der heiligsten Kammer des Haupttempels aufbewahrt und nur von Pacal in Nächten besonderer himmlischer Konjunktionen konsultiert. Blickte der Hohepriester-König in seine unergründliche Tiefe, so die Legenden, spiegelte der Obsidian nicht nur die Sterne wider, sondern enthüllte verborgene Muster, kommende Ereignisse und sogar die Gedanken der Götter. Er sah darin den optimalen Zeitpunkt für Aussaat und Ernte, warnte vor drohenden Dürreperioden oder feindlichen Überfällen und empfing Visionen, die den Bau neuer Tempel und die Durchführung komplexer Zeremonien anleiteten, um die Götter gnädig zu stimmen.</p>
                                <p>Eine berühmte Legende erzählt, wie eine benachbarte, kriegerische Dynastie einen Überraschungsangriff auf Yaxtun plante, verborgen durch die dichtesten Dschungelpfade. Doch Pacal, gewarnt durch eine Vision im Obsidian-Spiegel, die ihm marschierende Jaguarkrieger in einem ihm unbekannten Talabschnitt zeigte, konnte seine Truppen rechtzeitig mobilisieren. Er legte einen ausgeklügelten Hinterhalt an genau jeder Stelle, die ihm der Spiegel offenbart hatte. Die Feinde, die sich unentdeckt wähnten, liefen direkt in die Falle und wurden vernichtend geschlagen, ohne dass Yaxtun größere Verluste erlitt.</p>
                                <p>Hohepriester-König Pacal "Der Himmelsdeuter" sicherte durch seine Weisheit, die er aus dem Obsidian-Spiegel schöpfte, seinem Volk nicht nur Frieden und Wohlstand, sondern auch ein tiefes Gefühl der Verbundenheit mit dem Kosmos. Unter seiner Führung erreichten die Künste der Astronomie, Mathematik und Kalenderberechnung in Yaxtun eine nie dagewesene Blüte. Der Obsidian-Spiegel wurde zum Symbol seiner Herrschaft – ein Fenster zu den Geheimnissen des Universums, das nur den reinsten Herzen und schärfsten Verstand seine Mysterien offenbarte.</p>
                            </div>
                        </div>
                        
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">Hohepriesterin Ixchel "Die Mondweberin" und die Jade-Tafeln der Zyklen</button>
                            <div class="legend-accordion-panel">
                                <p>Nach einer Reihe von kriegerischen Königen, die Yaxtun zwar vergrößert, aber auch erschöpft hatten, bestieg Hohepriesterin Ixchel den Jaguarthron. Sie war keine Feldherrin, sondern eine Mystikerin und Heilerin, deren Sanftmut und tiefe spirituelle Verbindung zur Mondgöttin ihr den Beinamen "Die Mondweberin" einbrachten. Sie erkannte, dass die wahre Stärke ihres Volkes nicht allein in scharfen Obsidianklingen lag, sondern im Verständnis der großen Zyklen des Lebens, des Todes und der Wiedergeburt, die das Universum und das Schicksal der Sterblichen bestimmten.</p>
                                <p>Ixchels "Wunder" waren die Jade-Tafeln der Zyklen, eine Sammlung von zwölf dünnen, leuchtend grünen Jadesteinen, auf denen in komplexen Glyphen die Gesetze der Zeit und die Muster der Schöpfung eingraviert waren. Man munkelte, diese Tafeln seien älter als die Pyramiden selbst, vielleicht sogar älter als die Menschheit, und enthielten das Wissen der ersten Götter. Ixchel verbrachte Nächte in tiefer Meditation über diesen Tafeln. Es heißt, sie konnte darin nicht nur die exakten Bahnen der Sterne und die Wiederkehr kosmischer Ereignisse über Jahrtausende hinweg ablesen, sondern auch die Zyklen von Wohlstand und Not, von Krieg und Frieden für ihr Volk vorhersagen. Wichtiger noch, die Tafeln sollen ihr das Wissen um Rituale und Opfergaben offenbart haben, mit denen man diese Zyklen positiv beeinflussen und das Gleichgewicht der Welt wiederherstellen konnte.</p>
                                <p>Als eine verheerende Seuche das Land heimsuchte und die besten Heiler Yaxtuns ratlos waren, zog sich Ixchel mit den Jade-Tafeln in das Allerheiligste des Mondtempels zurück. Nach drei Tagen und Nächten des Fastens und der Kontemplation trat sie hervor, mit einer neuen Zeremonie und genauen Anweisungen für die Priester und das Volk. Sie lehrte sie, bestimmte heilige Kräuter zu sammeln, Reinigungsrituale bei spezifischen Mondphasen durchzuführen und Schreine an Knotenpunkten der Erdenergie zu errichten. Skeptiker murrten, doch das Volk, das Ixchels Weisheit vertraute, folgte ihren Anweisungen. Langsam, aber stetig wich die Seuche, und das Land erholte sich.</p>
                                <p>Hohepriesterin Ixchel "Die Mondweberin" brachte Yaxtun nicht durch Eroberung, sondern durch Harmonie und tiefes spirituelles Verständnis eine neue Blüte. Sie lehrte ihr Volk, im Einklang mit den Rhythmen der Natur und des Kosmos zu leben. Die Jade-Tafeln der Zyklen wurden unter ihrer Obhut nicht als Werkzeug der Macht, sondern als Schlüssel zur Weisheit und zum Gleichgewicht verehrt, ein Vermächtnis, das die Sternenleser von Yaxtun noch lange prägen sollte.</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'abbasid':
                content = `
                    <h3>Das Kalifat von Al-Kimiya</h3>
                    <p>Das prachtvolle Kalifat von Al-Kimiya ist eine Zivilisation, in der Wissenschaft, Gelehrsamkeit und Alchemie höher geschätzt werden als militärische Eroberungen. Berühmt für ihre imposanten Akademien, fortschrittlichen Observatorien und tiefgründigen mathematischen Kenntnisse, werden sie von weisen Kalifen und Großwesiren geführt, die selbst oft brillante Gelehrte, Astronomen oder Alchemisten sind.</p>
                    
                    <div class="legends-accordion">
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">Kalif Al-Mamun "Der Himmelsvermesser" und das Astrolabium der Wahren Kurse</button>
                            <div class="legend-accordion-panel">
                                <p>In der Blütezeit des Kalifats von Al-Kimiya, als die Hauptstadt eine strahlende Metropole des Wissens und der Künste war, die Gelehrte aus aller Herren Länder anzog, herrschte Kalif Al-Mamun, den man ehrfürchtig "Den Himmelsvermesser" nannte. Er war nicht nur ein gütiger und gerechter Herrscher, sondern auch ein brillanter Mathematiker und Astronom, dessen Leidenschaft den Sternen galt. Unter seiner Schirmherrschaft entstand das legendäre "Haus der Weisheit", eine unvergleichliche Bibliothek und Akademie, in der die größten Denker seiner Zeit alte Schriften übersetzten, neue Theorien entwickelten und die Grenzen des menschlichen Wissens erweiterten. Al-Mamun selbst verbrachte viele Nächte in dem eigens für ihn erbauten Observatorium, das die Wüste vor den Toren der Stadt überragte, und kartierte die Himmel mit einer Präzision, die seine Zeitgenossen in Staunen versetzte.</p>
                                <p>Das "Wunder", das Al-Mamuns wissenschaftliche Bestrebungen krönte und seinem Reich unschätzbare Vorteile brachte, war das Astrolabium der Wahren Kurse. Dieses meisterhaft gefertigte Instrument aus poliertem Messing, Silber und seltenen Wüstengläsern war weit mehr als ein gewöhnliches Astrolabium. Es wurde von den besten Handwerkern und Mathematikern des Kalifats nach Al-Mamuns eigenen, komplexen Berechnungen gefertigt und enthielt Zahnräder und Linsen von unerreichbarer Feinheit. Die Legende besagt, dass das Astrolabium nicht nur die Positionen der Sterne mit absoluter Genauigkeit bestimmen konnte, sondern auch verborgene Energielinien der Erde und kosmische Einflüsse aufzuspüren vermochte. Karawanen, die ihre Routen nach den Berechnungen des Astrolabiums planten, fanden stets die kürzesten Wege zu verborgenen Oasen und umgingen gefährliche Sandstürme. Schiffe, die mit Kopien seiner Karten segelten, erreichten ferne Küsten mit bis dahin ungekannter Sicherheit.</p>
                                <p>Es wird erzählt, dass Al-Mamun einmal eine große Dürre vorhersah, die sein Land bedrohte, indem er eine ungewöhnliche Konstellation im Astrolabium der Wahren Kurse interpretierte. Aufgrund dieser Warnung ließ er riesige unterirdische Zisternen anlegen und neue, trockenheitsresistente Getreidesorten aus fernen Ländern importieren. Als die Dürre tatsächlich kam und benachbarte Reiche unter Hungersnöten litten, blieben die Kornkammern von Al-Kimiya gefüllt, und sein Volk wurde verschont – ein Beweis für die Macht, die in der Verbindung von Weisheit, Wissenschaft und vorausschauender Führung lag.</p>
                                <p>Kalif Al-Mamun "Der Himmelsvermesser" hinterließ ein Erbe des Wissensdurstes und der wissenschaftlichen Exzellenz. Das Astrolabium der Wahren Kurse wurde zum Symbol für das Goldene Zeitalter von Al-Kimiya, eine Zeit, in der Vernunft und Entdeckung heller strahlten als die Wüstensonne selbst und die Grenzen des Bekannten mutig erweitert wurden.</p>
                            </div>
                        </div>
                        
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">Großwesirin Zaynab "Die Alchemistin der Seelen" und das Elixier der Beständigkeit</button>
                            <div class="legend-accordion-panel">
                                <p>Nicht immer saß ein Kalif auf dem Thron von Al-Kimiya, der selbst die größten Entdeckungen machte. Manchmal war es ein weiser Berater, der im Schatten wirkte. Zur Zeit des jungen und eher kunstsinnigen Kalifen Harun II. war es die Großwesirin Zaynab, eine Frau von außergewöhnlicher Intelligenz und tiefgründigem Wissen in den verborgenen Künsten der Alchemie und der Naturphilosophie. Das Volk nannte sie ehrfurchtsvoll, aber auch mit einer gewissen Scheu, "Die Alchemistin der Seelen", denn man sagte ihr nach, sie könne nicht nur Metalle verwandeln, sondern auch den Charakter von Menschen durchschauen und lenken.</p>
                                <p>Zaynabs Laboratorien, tief verborgen in den Fundamenten des Palastes, waren Orte fieberhafter Forschung. Sie studierte die Schriften der Alten, experimentierte mit seltenen Mineralien, Kräutern aus entlegenen Oasen und den mystischen Eigenschaften von Sternenlicht, das durch speziell geschliffene Kristalle gebündelt wurde. Ihr Ziel war nicht Gold, wie bei vielen Alchemisten ihrer Zeit, sondern die Essenz der Dinge zu verstehen und daraus Nutzen für das Kalifat zu ziehen. Das "Wunder", das sie schließlich hervorbrachte und das dem Reich unermesslichen Nutzen stiftete, war das Elixier der Beständigkeit.</p>
                                <p>Dieses Elixier, dessen genaue Zusammensetzung nur Zaynab kannte, war keine Flüssigkeit, die Unsterblichkeit verlieh oder Blei in Gold verwandelte. Seine Wirkung war subtiler und weitreichender: Es konnte Materialien von außergewöhnlicher Haltbarkeit und Widerstandsfähigkeit hervorbringen. Mit dem Elixier behandelte Ziegel wurden härter als Granit, damit getränkte Hölzer widerstanden Feuer und Fäulnis, und Metalle, die damit veredelt wurden, rosteten nie und behielten ihre Schärfe für Äonen.</p>
                                <p>Als eine feindliche Nomadenhorde die Grenzen des Kalifats bedrohte und ihre Belagerungsmaschinen selbst die stärksten Mauern der Grenzfestungen zu zermürben drohten, kam Zaynabs Stunde. Sie ließ die Mauern der am stärksten gefährdeten Festung mit dem Elixier der Beständigkeit tränken. Die Belagerer, die mit leichten Siegen gerechnet hatten, verzweifelten an den nun fast unzerstörbaren Wällen. Ihre Rammböcke zersplitterten, ihre Geschosse prallten ab, und die Moral der Verteidiger, die sahen, wie ihre Festung standhielt, wuchs ins Unermessliche. Der Angriff wurde abgewehrt, nicht durch eine große Feldschlacht, sondern durch die stille, alchemistische Macht, die Zaynab entfesselt hatte.</p>
                                <p>Großwesirin Zaynab "Die Alchemistin der Seelen" bewies, dass wahre Macht nicht nur in Armeen und Eroberungen liegt, sondern auch im tiefen Verständnis der Natur und der Kunst, ihre Geheimnisse zum Wohle des Volkes zu nutzen. Das Elixier der Beständigkeit erlaubte den Bau von Aquädukten, die die Wüste zum Blühen brachten, von Bibliotheken, deren Schriftrollen die Zeiten überdauerten, und von Verteidigungsanlagen, die das Kalifat für viele Generationen schützten.</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'hre':
                content = `
                    <h3>Das Aethelgardische Reich</h3>
                    <p>Das imposante Aethelgardische Reich ist ein komplexes Mosaik aus Fürstentümern, Herzogtümern und freien Städten, das durch die zentrale Autorität des Kaisers zusammengehalten wird. Seine Herrschaft wird legitimiert durch heilige Reliquien und Reichsinsignien, denen mystische Kräfte innewohnen. Die Geschichte des Reiches ist geprägt von starken Herrscherpersönlichkeiten, die diese machtvollen Artefakte zu nutzen wussten.</p>
                    
                    <div class="legends-accordion">
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">Kaiser Heinrich "Der Reichserneuerer" und die Krone der Uralten Könige</button>
                            <div class="legend-accordion-panel">
                                <p>Das Aethelgardische Reich, ein riesiges Mosaik aus Herzogtümern, Fürstbistümern und freien Städten, stand oft am Rande des Zerfalls. Ehrgeizige Kurfürsten und mächtige Herzöge stellten die Autorität des Kaisers immer wieder in Frage, und innere Kriege drohten das stolze Erbe der alten Kaiser zu vernichten. In einer solchen dunklen Stunde der Zersplitterung bestieg Heinrich, ein junger Herzog aus einem unbedeutenden Grenzland, durch eine überraschende Wahl den Kaiserthron. Viele sahen in ihm nur eine Marionette der mächtigeren Fürsten, doch sie hatten seine Entschlossenheit und das "Wunder", das seine Herrschaft legitimieren sollte, unterschätzt: die Krone der Uralten Könige.</p>
                                <p>Diese Krone war mehr als nur ein Schmuckstück aus Gold und Edelsteinen. Sie war das heiligste und mächtigste Insigne des Reiches, von dem es hieß, sie sei von den Gründervätern selbst getragen worden und enthalte die Essenz imperialer Autorität. Seit Generationen hatte jedoch kein Kaiser mehr ihre volle Macht entfalten können; sie galt als erkaltet, ihre Magie als verblasst. Doch als Heinrich bei seiner Krönung die Krone auf sein Haupt setzte, geschah das Unglaubliche: Die Edelsteine begannen, von innen heraus zu leuchten, ein sanftes, goldenes Licht erfüllte den Dom, und alle anwesenden Fürsten spürten, so berichten die Chroniken, eine Welle von Ehrfurcht und den unabweisbaren Drang zur Loyalität. Die Krone hatte Heinrich als würdig anerkannt.</p>
                                <p>Mit der wiedererwachten Macht der Krone der Uralten Könige zog Heinrich durch das Reich. Die Krone verlieh seinen Worten ein Gewicht, dem sich niemand entziehen konnte. Ihre Aura soll nicht nur Menschen beeinflusst, sondern auch das Land selbst beruhigt haben – Rebellionen erloschen, alte Fehden wurden beigelegt, und selbst die widerspenstigsten Fürsten erkannten seine Oberhoheit an. Es wird erzählt, dass bei einem Reichstag in der Festung Ehrenstein, als mehrere Herzöge offen seine Autorität anzweifelten, Heinrich die Krone erhob. Ihr Leuchten wurde so intensiv, dass die Wappen der Zweifler auf ihren Schilden zu verblassen schienen, während das kaiserliche Adlersymbol auf Heinrichs Banner hell erstrahlte. Beschämt und beeindruckt erneuerten sie ihren Treueeid.</p>
                                <p>Kaiser Heinrich, nun "Der Reichserneuerer" genannt, nutzte die durch die Krone verliehene Legitimität und Macht nicht zur Tyrannei, sondern um das Reich zu einen, gerechte Gesetze zu erlassen und die Grenzen zu sichern. Er stellte die zentrale kaiserliche Autorität wieder her, nicht allein durch Waffengewalt, sondern durch die spirituelle Kraft des heiligsten Symbols des Reiches. Die Krone der Uralten Könige wurde unter seiner Herrschaft zu einem wahren "Wunder" der Einheit und des Friedens in einem Reich, das so oft von innerem Zwist geplagt war.</p>
                            </div>
                        </div>
                        
                        <div class="legend-accordion-item">
                            <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">Kaiserin Theophanu "Die Gesetzgeberin" und das Zepter der Waage</button>
                            <div class="legend-accordion-panel">
                                <p>Nachdem Kaiser Heinrich das Reich geeint hatte, folgte eine Periode des Wachstums, aber auch der rechtlichen Unsicherheit, da alte Gesetze mit neuen Realitäten kollidierten. Es bedurfte einer Herrscherin von außergewöhnlicher Weisheit und unparteiischem Urteilsvermögen, um Ordnung in das komplexe Rechtssystem des Aethelgardischen Reiches zu bringen. Diese Aufgabe fiel Kaiserin Theophanu zu, einer gelehrten Frau aus einem fernen, verbündeten Königreich, die durch Heirat auf den Thron gelangt war und deren Scharfsinn und Gerechtigkeitssinn bald legendär wurden.</p>
                                <p>Theophanus "Wunder" war kein Instrument des Krieges oder der direkten Machtprojektion, sondern ein Symbol und Werkzeug der Gerechtigkeit: das Zepter der Waage. Dieses Zepter, gefertigt aus poliertem Elfenbein und gekrönt von einer kunstvoll gearbeiteten goldenen Waage, deren Schalen bei Unwahrheit oder Ungerechtigkeit erzitterten, war seit jeher Teil der Reichsinsignien, doch erst Theophanu verstand seine wahre Natur und Macht. Es wurde gesagt, wenn die Kaiserin das Zepter bei Gerichtssitzungen oder wichtigen Ratsversammlungen in Händen hielt, konnte keine Lüge vor ihr bestehen. Die Schalen der Waage auf dem Zepter neigten sich sichtbar, wenn falsche Zeugenaussagen gemacht wurden oder wenn ein vorgeschlagenes Gesetz ungerecht war.</p>
                                <p>Mit Hilfe des Zepters der Waage begann Theophanu die Mammutaufgabe, die Gesetze des Reiches zu reformieren und zu kodifizieren. Sie reiste durch alle Herzogtümer, hörte sich die Klagen des Volkes an, studierte alte Rechtstexte und saß unzähligen Gerichtsverhandlungen vor. In einer berühmten Verhandlung beschuldigten zwei mächtige Grafen einander des Landraubs. Die Beweislage war verworren, und ein Bürgerkrieg drohte. Theophanu ließ beide Grafen unter Eid aussagen, während sie das Zepter hielt. Als der eine Graf sprach, blieben die Schalen ruhig; als der andere seine Version darlegte, begannen sie heftig zu zittern und gaben ein leises, klagendes Summen von sich. Die Lüge war entlarvt, der Schuldige überführt, und ein Krieg wurde verhindert.</p>
                                <p>Kaiserin Theophanu "Die Gesetzgeberin" nutzte das Zepter der Waage, um ein einheitliches, gerechtes Gesetzeswerk für das gesamte Aethelgardische Reich zu schaffen – den "Codex Theophanu". Dieses Werk brachte nicht nur Klarheit und Vorhersehbarkeit in die Rechtsprechung, sondern stärkte auch das Vertrauen des Volkes in die kaiserliche Autorität und legte den Grundstein für eine langanhaltende Periode inneren Friedens und Stabilität. Das Zepter wurde zum Sinnbild ihrer Herrschaft: ein unbestechlicher Garant für Recht und Gerechtigkeit.</p>
                            </div>
                        </div>
                    </div>
                `;
                break;
            default:
                content = '<p>Wähle eine Zivilisation aus, um ihre Geschichte zu entdecken.</p>';
        }
        
        contentContainer.innerHTML = content;
        
        // Automatisches Scrollen zum Textanfang
        setTimeout(function() {
            const legendsModal = document.getElementById('legends-modal');
            const h3Element = contentContainer.querySelector('h3');
            if (h3Element && legendsModal) {
                // Berechne die Position des h3-Elements relativ zum Modal
                const h3Position = h3Element.getBoundingClientRect().top;
                const modalPosition = legendsModal.getBoundingClientRect().top;
                const scrollPosition = h3Position - modalPosition - 20; // 20px Abstand
                
                legendsModal.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }, 100); // Kurze Verzögerung für DOM-Aktualisierung
    }

    // Prevent scrolling on mobile devices
    document.addEventListener('touchmove', function(e) {
        if (document.getElementById('start-screen').style.display !== 'none') {
            e.preventDefault();
        }
    }, { passive: false });

    // Set version string on start screen - Update auf 2.5.4
    window.addEventListener('DOMContentLoaded', function() {
        var versionSpan = document.getElementById('version-string');
        if (versionSpan) {
            versionSpan.textContent = 'v' + GAME_VERSION.major + '.' + GAME_VERSION.minor + '.' + GAME_VERSION.patch;
        }
        // Einmaliges, langsames Aufleuchten für Überschrift auf Startseite
        var title = document.querySelector('.game-title');
        if (title) {
            title.classList.add('glow');
        }
    });

    // Credits-Accordion-Logik (ab v2.2.3: alle Hauptversionen zugeklappt)
    function renderCreditsAccordion() {
        const modal = document.getElementById('credits-modal');
        const content = modal.querySelector('.credits-content');
        
        // Stelle sicher, dass das Modal-Event für das Schließen der Accordions registriert ist
        if (!modal.hasAttribute('accordion-init')) {
            modal.setAttribute('accordion-init', 'true');
            // Event für das Zurücksetzen der Accordions beim Öffnen hinzufügen
            modal.addEventListener('shown.bs.modal', resetAllAccordions);
            // Alternative für nicht-Bootstrap-Events
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'style' && 
                        modal.style.display === 'block') {
                        resetAllAccordions();
                    }
                });
            });
            observer.observe(modal, { attributes: true });
        }
        
        // Gruppiere Versionen nach Hauptversion
        const grouped = {};
        Object.keys(VERSION_HISTORY).forEach(v => {
            const main = v.split('.')[0];
            if (!grouped[main]) grouped[main] = [];
            grouped[main].push(v);
        });
        // Sortiere Hauptversionen absteigend
        const mainVersions = Object.keys(grouped).sort((a, b) => b - a);
        let html = `<h2>MASTIL - Credits & Version</h2>`;
        html += `<div class="mastil-credits-publisher">
            <span>Publisher</span>
            <strong>Bytewerk Studio</strong>
            <small>Windows-EXE, Download-Website und lokale Offline-KI für MASTIL.</small>
        </div>`;
        html += `<div class='accordion-credits'>`;
        mainVersions.forEach((main, idx) => {
            // Alle Hauptversionen standardmäßig geschlossen
            html += `<div class='accordion-item'>
                <button class='accordion-title' onclick='toggleAccordion(this)'>Version ${main}</button>
                <div class='accordion-panel'>`;
            
            // Erstelle ein inneres Accordion für Unterversionen
            html += `<div class='inner-accordion-credits'>`;
            
            // Sortiere Unterversionen absteigend
            const subVersions = grouped[main].sort((a, b) => {
                const pa = a.split('.').map(Number);
                const pb = b.split('.').map(Number);
                for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
                    if ((pb[i]||0) !== (pa[i]||0)) return (pb[i]||0)-(pa[i]||0);
                }
                return 0;
            });
            
            // Gruppiere Unterversionen nach Minor-Version
            const groupedMinor = {};
            subVersions.forEach(v => {
                const parts = v.split('.');
                const minorKey = parts.length > 1 ? parts[1] : '0';
                if (!groupedMinor[minorKey]) groupedMinor[minorKey] = [];
                groupedMinor[minorKey].push(v);
            });
            
            // Sortiere Minor-Versionen absteigend
            const minorVersions = Object.keys(groupedMinor).sort((a, b) => b - a);
            
            minorVersions.forEach(minor => {
                // Sortiere innerhalb jeder Minor-Version
                const sortedVersions = groupedMinor[minor].sort((a, b) => {
                    const pa = a.split('.').map(Number);
                    const pb = b.split('.').map(Number);
                    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
                        if ((pb[i]||0) !== (pa[i]||0)) return (pb[i]||0)-(pa[i]||0);
                    }
                    return 0;
                });
                
                // Füge Minor-Version als Unteraccordion hinzu
                html += `<div class='inner-accordion-item'>
                    <button class='inner-accordion-title' onclick='toggleInnerAccordion(this)'>Version ${main}.${minor}</button>
                    <div class='inner-accordion-panel'>`;
                
                sortedVersions.forEach(v => {
                    html += `<div class='version-entry'><div class='version-number'>Version ${v}</div>
                        <ul>${VERSION_HISTORY[v].map(change => `<li>${change}</li>`).join('')}</ul></div>`;
                });
                
                html += `</div></div>`;
            });
            
            html += `</div>`; // Ende inneres Accordion
            html += `</div></div>`; // Ende äußeres Accordion-Item
        });
        html += `</div>`;
        html += `<h3>Entwicklung</h3>
            <p>MASTIL wurde entwickelt als ein Tower-Defense Strategiespiel mit einzigartigen Mechaniken.</p>
            <h3>Spielmechaniken</h3>
            <ul>
                <li>Turm-basiertes Strategiesystem</li>
                <li>Dynamisches Einheitenmanagement</li>
                <li>Wellenbasierte Herausforderungen</li>
                <li>Ressourcen- und Goldmanagement</li>
                <li>Mehrere Fraktionen mit unterschiedlichen Eigenschaften</li>
            </ul>`;
        html += `<div style='text-align:center;margin:18px 0 0 0;'><span style='color:#fff;font-size:0.92em;font-weight:normal;opacity:0.7;'>Developed by H. Haqmal</span></div>`;
        content.innerHTML = html;
    }

    function toggleAccordion(btn) {
        // Verwende stopPropagation um Event-Bubbling zu verhindern
        event.stopPropagation();
        
        const panel = btn.nextElementSibling;
        const isActive = btn.classList.contains('active');
        
        // Close all other accordion items
        const allBtns = document.querySelectorAll('.accordion-title');
        const allPanels = document.querySelectorAll('.accordion-panel');
        
        allBtns.forEach(b => {
            if (b !== btn) b.classList.remove('active');
        });
        
        allPanels.forEach(p => {
            if (p !== panel) {
                p.classList.remove('active');
                // Sanfte Animationen für das Schließen
                p.style.transition = "max-height 0.4s ease-out, padding 0.3s ease-out";
                p.style.maxHeight = "0";
                p.style.padding = "0 15px";
            }
        });
        
        // Toggle current accordion item
        if (isActive) {
            btn.classList.remove('active');
            panel.classList.remove('active');
            // Sanfte Animationen für das Schließen
            panel.style.transition = "max-height 0.4s ease-out, padding 0.3s ease-out";
            panel.style.maxHeight = "0";
            panel.style.padding = "0 15px";
        } else {
            btn.classList.add('active');
            panel.classList.add('active');
            // Sanfte Animationen für das Öffnen
            panel.style.transition = "max-height 0.5s ease-in, padding 0.4s ease-in";
            panel.style.maxHeight = "1000px"; // Großer Wert für alle Inhalte
            panel.style.padding = "15px";
        }
        
        // Verhindern dass das Event zum Body propagiert
        return false;
    }
    
    function toggleInnerAccordion(btn) {
        // Verwende stopPropagation um Event-Bubbling zu verhindern
        event.stopPropagation();
        
        const panel = btn.nextElementSibling;
        const isActive = btn.classList.contains('active');
        
        // Toggle current inner accordion item
        if (isActive) {
            btn.classList.remove('active');
            panel.classList.remove('active');
            // Sanfte Animationen für das Schließen
            panel.style.transition = "max-height 0.4s ease-out, padding 0.3s ease-out";
            panel.style.maxHeight = "0";
            panel.style.padding = "0 15px";
        } else {
            btn.classList.add('active');
            panel.classList.add('active');
            // Sanfte Animationen für das Öffnen
            panel.style.transition = "max-height 0.5s ease-in, padding 0.4s ease-in";
            panel.style.maxHeight = "1000px"; // Großer Wert für alle Inhalte
            panel.style.padding = "15px";
        }
        
        // Verhindern dass das Event zum Body propagiert
        return false;
    }
    
    // Funktion zum Umschalten der Legenden-Akkordeons mit verbesserter mobiler Unterstützung
    function toggleLegendAccordion(btn) {
        // Verwende stopPropagation um Event-Bubbling zu verhindern
        event.stopPropagation();
        
        const panel = btn.nextElementSibling;
        const isActive = btn.classList.contains('active');
        const legendsModal = document.getElementById('legends-modal');
        
        // Close all other legend accordion items
        const legendsContainer = btn.closest('.legends-accordion');
        const siblingBtns = legendsContainer.querySelectorAll('.legend-accordion-title');
        const siblingPanels = legendsContainer.querySelectorAll('.legend-accordion-panel');
        
        siblingBtns.forEach(b => {
            if (b !== btn) b.classList.remove('active');
        });
        
        siblingPanels.forEach(p => {
            if (p !== panel) {
                p.classList.remove('active');
                // Sanfte Animationen für das Schließen
                p.style.transition = "max-height 0.3s ease-out, padding 0.2s ease-out";
                p.style.maxHeight = "0";
                p.style.padding = "0 15px";
            }
        });
        
        // Toggle current legend accordion item
        if (isActive) {
            btn.classList.remove('active');
            panel.classList.remove('active');
            // Sanfte Animationen für das Schließen
            panel.style.transition = "max-height 0.3s ease-out, padding 0.2s ease-out";
            panel.style.maxHeight = "0";
            panel.style.padding = "0 15px";
        } else {
            btn.classList.add('active');
            panel.classList.add('active');
            // Sanfte Animationen für das Öffnen
            panel.style.transition = "max-height 0.5s ease-in, padding 0.4s ease-in";
            
            // Größere Höhe für mobile Geräte, um mehr Inhalt zu zeigen
            const isMobile = window.innerWidth <= 600;
            panel.style.maxHeight = isMobile ? "60vh" : "1000px";
            panel.style.padding = "15px";
            
            // Stellen sicher, dass die Panel-Scrollfunktion korrekt eingerichtet ist
            panel.style.overflowY = "auto";
            panel.style.webkitOverflowScrolling = "touch";
            panel.style.touchAction = "pan-y";
            
            // Scrollt zum geöffneten Panel mit Verzögerung
            setTimeout(() => {
                // Berechne die Position des Buttons relativ zum Modal
                const btnPosition = btn.getBoundingClientRect().top;
                const modalPosition = legendsModal.getBoundingClientRect().top;
                const scrollPosition = btnPosition - modalPosition - 20; // 20px Abstand
                
                // Scrolle zum geöffneten Panel
                legendsModal.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }, 300); // Kurze Verzögerung für Animation
        }
        
        // Verhindern dass das Event zum Body propagiert
        return false;
    }
    
    function resetAllAccordions() {
        console.log('resetAllAccordions aufgerufen');
        
        // Setze zuerst einen Timeout, um sicherzustellen, dass der DOM vollständig geladen ist
        setTimeout(function() {
            try {
                // Schließe alle Haupt-Accordions
                const allMainBtns = document.querySelectorAll('#credits-modal .accordion-title');
                const allMainPanels = document.querySelectorAll('#credits-modal .accordion-panel');
                
                console.log('Gefundene Hauptbuttons:', allMainBtns.length);
                console.log('Gefundene Hauptpanels:', allMainPanels.length);
                
                // Buttons deaktivieren
                allMainBtns.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Panels schließen mit definitiven Inline-Styles
                allMainPanels.forEach(panel => {
                    panel.classList.remove('active');
                    // Direkte Style-Zuweisung mit sanften Übergängen
                    panel.style.transition = "max-height 0.4s ease-out, padding 0.3s ease-out";
                    panel.style.maxHeight = "0";
                    panel.style.padding = "0 15px";
                    // Zusätzlich overflow ausblenden während der Transition
                    panel.style.overflow = "hidden";
                });
                
                // Schließe alle inneren Accordions
                const allInnerBtns = document.querySelectorAll('#credits-modal .inner-accordion-title');
                const allInnerPanels = document.querySelectorAll('#credits-modal .inner-accordion-panel');
                
                console.log('Gefundene Inner-Buttons:', allInnerBtns.length);
                console.log('Gefundene Inner-Panels:', allInnerPanels.length);
                
                // Buttons deaktivieren
                allInnerBtns.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Panels schließen mit definitiven Inline-Styles
                allInnerPanels.forEach(panel => {
                    panel.classList.remove('active');
                    // Direkte Style-Zuweisung mit sanften Übergängen
                    panel.style.transition = "max-height 0.4s ease-out, padding 0.3s ease-out";
                    panel.style.maxHeight = "0";
                    panel.style.padding = "0 15px";
                    // Zusätzlich overflow ausblenden während der Transition
                    panel.style.overflow = "hidden";
                });
            } catch (e) {
                console.error("Fehler beim Zurücksetzen der Accordions:", e);
            }
        }, 50); // Kürzerer Timeout für schnellere Reaktion
    }

    function showTutorial() {
        const tutorialElement = document.getElementById('tutorial');
        tutorialElement.style.display = 'block';
        
        // Scroll to top of tutorial when showing it
        if (tutorialElement.scrollTo) {
            tutorialElement.scrollTo(0, 0);
        }

        // Special handling for mobile devices
        if (window.innerWidth <= 768) {
            // Ensure the tutorial is positioned well on mobile
            tutorialElement.style.maxHeight = Math.min(window.innerHeight * 0.8, 500) + 'px';
        }
    }

    function closeTutorial() {
        document.getElementById('tutorial').style.display = 'none';
        
        // Check if we're on mobile and restore any special handling we did
        if (window.innerWidth <= 768) {
            // No additional cleanup needed for now
        }
    }

    function pauseGame() {
        if (!gameActive) return;
        gameActive = false;
        document.getElementById('pause-overlay').classList.add('active');
    }
    function resumeGame() {
        console.log('resumeGame aufgerufen');
        if (gameActive) return;
        gameActive = true;
        document.getElementById('pause-overlay').classList.remove('active');
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
        function returnToMainMenu() {
            // Spiel zurücksetzen
            gameActive = false;
            // UI-Elemente zurücksetzen
            document.getElementById('pause-overlay').classList.remove('active');
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('start-screen').style.display = 'flex';
            // Spielzustand zurücksetzen
            towers = [];
            units = [];
            selectedTower = null;
            targetTower = null;
            isDragging = false;
            // Canvas leeren
            if (ctx) {
                ctx.clearRect(0, 0, gameWidth, gameHeight);
            }
        }

        window.addEventListener('DOMContentLoaded', function() {
            var resumeBtn = document.getElementById('resume-btn');
            var mainMenuBtn = document.getElementById('main-menu-btn');
            if (resumeBtn) {
                resumeBtn.addEventListener('click', resumeGame);
            }
            if (mainMenuBtn) {
                mainMenuBtn.addEventListener('click', returnToMainMenu);
            }
            
            // Initialisiere die Musik beim Laden der Seite
            initBackgroundMusic();
            
            // Handle window resize for responsive tutorial window
            window.addEventListener('resize', function() {
                const tutorialElement = document.getElementById('tutorial');
                if (tutorialElement && tutorialElement.style.display === 'block') {
                    // Adjust tutorial height based on screen size
                    if (window.innerWidth <= 768) {
                        tutorialElement.style.maxHeight = Math.min(window.innerHeight * 0.8, 500) + 'px';
                    } else {
                        tutorialElement.style.maxHeight = '90vh';
                    }
                }
                
                // Adjust legends modal on resize
                const legendsModal = document.getElementById('legends-modal');
                if (legendsModal && legendsModal.style.display === 'block') {
                    if (window.innerWidth <= 600) {
                        // Mobile optimization
                        const activePanel = document.querySelector('.legend-accordion-panel.active');
                        if (activePanel) {
                            activePanel.style.maxHeight = '60vh';
                            activePanel.style.overflowY = 'auto';
                        }
                    }
                }
            });
            
            // Improve mobile scrolling for legends modal
            const legendsModal = document.getElementById('legends-modal');
            if (legendsModal) {
                legendsModal.addEventListener('touchstart', function(e) {
                    if (e.target.closest('.legend-accordion-panel.active')) {
                        e.stopPropagation();
                    }
                }, { passive: true });
            }
        });
        
        const MUSIC_VOLUME_KEY = 'mastil-music-volume';

        function clampAudioPercent(value, fallback) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) return fallback;
            return Math.max(0, Math.min(100, Math.round(numeric)));
        }

        function getSavedMusicVolumePercent() {
            return clampAudioPercent(localStorage.getItem(MUSIC_VOLUME_KEY), 50);
        }

        function updateMusicVolumeControls(percent) {
            const value = clampAudioPercent(percent, getSavedMusicVolumePercent());
            const range = document.getElementById('music-volume-range');
            const label = document.getElementById('music-volume-value');
            if (range && String(range.value) !== String(value)) {
                range.value = String(value);
            }
            if (label) {
                label.textContent = `${value}%`;
            }
        }

        function applyMusicVolume(percent, persist = true) {
            const value = clampAudioPercent(percent, 50);
            if (backgroundMusic) {
                backgroundMusic.volume = value / 100;
            }
            if (persist) {
                localStorage.setItem(MUSIC_VOLUME_KEY, String(value));
            }
            updateMusicVolumeControls(value);
        }

        function setupAudioOptionControls() {
            const musicRange = document.getElementById('music-volume-range');
            if (musicRange && musicRange.dataset.mastilReady !== 'true') {
                musicRange.dataset.mastilReady = 'true';
                musicRange.value = String(getSavedMusicVolumePercent());
                musicRange.addEventListener('input', function() {
                    applyMusicVolume(this.value);
                });
            }
            applyMusicVolume(getSavedMusicVolumePercent(), false);
        }

        window.MastilMusic = {
            applyVolume: applyMusicVolume,
            getVolume: getSavedMusicVolumePercent
        };

        // Funktion für die Initialisierung der Hintergrundmusik
        function initBackgroundMusic() {
            if (backgroundMusic) {
                // Stelle sicher, dass die Lautstärke angemessen ist
                applyMusicVolume(getSavedMusicVolumePercent(), false);
                
                // Vorladung der Musik
                backgroundMusic.load();
                
                // Füge Event-Listener hinzu, um Musikstatus zu aktualisieren
                backgroundMusic.addEventListener('play', function() {
                    isMusicPlaying = true;
                    updateMusicButtonAppearance();
                });
                
                backgroundMusic.addEventListener('pause', function() {
                    isMusicPlaying = false;
                    updateMusicButtonAppearance();
                });
                
                // Direkter Startversuch für die Musik (kann aufgrund von Browser-Richtlinien blockiert werden)
                backgroundMusic.play().catch(function(error) {
                    console.log('Autoplay wurde verhindert, warte auf Benutzerinteraktion:', error);
                    
                    // Bei Autoplay-Einschränkungen von Browsern setzen wir Event-Listener
                    // auf verschiedene Benutzerinteraktionen, um die Musik zu starten
                    const startMusicOnInteraction = function() {
                        if (!isMusicPlaying) {
                            backgroundMusic.play().catch(function(error) {
                                console.log('Musik konnte nicht gestartet werden:', error);
                            });
                        }
                        // Entferne die Event-Listener nach dem ersten Aufruf
                        document.removeEventListener('click', startMusicOnInteraction);
                        document.removeEventListener('touchstart', startMusicOnInteraction);
                        document.removeEventListener('keydown', startMusicOnInteraction);
                    };
                    
                    // Füge Event-Listener zu verschiedenen Interaktionsmöglichkeiten hinzu
                    document.addEventListener('click', startMusicOnInteraction);
                    document.addEventListener('touchstart', startMusicOnInteraction);
                    document.addEventListener('keydown', startMusicOnInteraction);
                });
                
                // Stelle sicher, dass Buttons den aktuellen Status zeigen
                updateMusicButtonAppearance();
                updateMusicVolumeControls(getSavedMusicVolumePercent());
            }
        }
        
        // Funktion zum Umschalten der Musik (ein/aus)
        function toggleMusic() {
            if (backgroundMusic) {
                if (isMusicPlaying) {
                    backgroundMusic.pause();
                    isMusicPlaying = false;
                } else {
                    backgroundMusic.play().catch(function(error) {
                        console.log('Musik konnte nicht gestartet werden:', error);
                    });
                    isMusicPlaying = true;
                }
                updateMusicButtonAppearance();
            }
        }
        
        // Funktion zum Aktualisieren der Darstellung der Musik-Buttons
        function updateMusicButtonAppearance() {
            function setMusicButton(button) {
                if (!button) return;
                button.classList.add('mastil-music-btn');
                button.classList.toggle('mastil-audio-on', isMusicPlaying);
                button.classList.toggle('mastil-audio-off', !isMusicPlaying);
                button.title = isMusicPlaying ? 'Musik aus' : 'Musik ein';
                button.style.color = isMusicPlaying ? '#d4af37' : '#f5e6c5';
                if (!button.querySelector('.mastil-music-icon')) {
                    button.innerHTML = '<span class="mastil-music-icon" aria-hidden="true"></span>';
                }
            }

            if (musicBtnInGame) {
                setMusicButton(musicBtnInGame);
            }
            
            if (musicBtnStartScreen) {
                setMusicButton(musicBtnStartScreen);
            }
        }

        // Sprachumschaltung
        const LANGUAGES = {
            de: {
                options: 'Optionen',
                lang: 'Sprache:',
                cb: 'Farbschwäche-Modus:',
                reset: 'Fortschritt zurücksetzen:',
                quality: 'Grafikqualität:',
                qualityHigh: 'Hoch',
                qualityMedium: 'Mittel',
                qualityLow: 'Niedrig',
                musicVolume: 'Musiklautstärke:',
                sfxVolume: 'Effektlautstärke:',
                resetBtn: 'Zurücksetzen',
                close: 'Schließen',
                resetConfirm: 'Bist du sicher? Alle Fortschritte werden gelöscht!',
                resetDone: 'Fortschritt gelöscht!'
            },
            en: {
                options: 'Options',
                lang: 'Language:',
                cb: 'Colorblind Mode:',
                reset: 'Reset Progress:',
                quality: 'Graphics Quality:',
                qualityHigh: 'High',
                qualityMedium: 'Medium',
                qualityLow: 'Low',
                musicVolume: 'Music Volume:',
                sfxVolume: 'Effect Volume:',
                resetBtn: 'Reset',
                close: 'Close',
                resetConfirm: 'Are you sure? All progress will be deleted!',
                resetDone: 'Progress deleted!'
            }
        };
        function setLanguage(lang) {
            document.getElementById('options-title').textContent = LANGUAGES[lang].options;
            document.getElementById('lang-label').textContent = LANGUAGES[lang].lang;
            document.getElementById('cb-label').textContent = LANGUAGES[lang].cb;
            document.getElementById('reset-label').textContent = LANGUAGES[lang].reset;
            document.getElementById('quality-label').textContent = LANGUAGES[lang].quality;
            const musicVolumeLabel = document.getElementById('music-volume-label');
            const sfxVolumeLabel = document.getElementById('sfx-volume-label');
            if (musicVolumeLabel) musicVolumeLabel.textContent = LANGUAGES[lang].musicVolume;
            if (sfxVolumeLabel) sfxVolumeLabel.textContent = LANGUAGES[lang].sfxVolume;
            document.getElementById('reset-btn').textContent = LANGUAGES[lang].resetBtn;
            document.getElementById('options-close-btn').textContent = LANGUAGES[lang].close;
            
            // Aktualisiere Qualitätsauswahl-Optionen
            const qualitySelect = document.getElementById('quality-select');
            if (qualitySelect) {
                const options = qualitySelect.options;
                options[0].textContent = LANGUAGES[lang].qualityHigh;
                options[1].textContent = LANGUAGES[lang].qualityMedium;
                options[2].textContent = LANGUAGES[lang].qualityLow;
            }
            // Top-Bar
            document.getElementById('wave-display').textContent = '1'; // Zeigt nur die Wellennummer, unabhängig von der Sprache
        }
        // Farbschwäche-Modus
        function setColorblindMode(enabled) {
            if (enabled) {
                document.documentElement.style.setProperty('--player-color', '#0072B2'); // Blau
                document.documentElement.style.setProperty('--enemy-color', '#D55E00'); // Orange
                document.documentElement.style.setProperty('--neutral-color', '#999999'); // Grau
            } else {
                document.documentElement.style.setProperty('--player-color', '#3498db');
                document.documentElement.style.setProperty('--enemy-color', '#e74c3c');
                document.documentElement.style.setProperty('--neutral-color', '#95a5a6');
            }
        }
        // Fortschritt zurücksetzen
        function resetProgress() {
            const lang = document.getElementById('lang-select').value;
            if (confirm(LANGUAGES[lang].resetConfirm)) {
                localStorage.clear();
                alert(LANGUAGES[lang].resetDone);
                window.location.reload();
            }
        }
        // Event-Listener für Optionen
        window.addEventListener('DOMContentLoaded', function() {
            console.log('DOMContentLoaded!');
            var langSelect = document.getElementById('lang-select');
            if (langSelect) {
                langSelect.addEventListener('change', function() { setLanguage(this.value); });
                setLanguage(langSelect.value);
            }
            var cbToggle = document.getElementById('cb-toggle');
            if (cbToggle) {
                cbToggle.addEventListener('change', function() { setColorblindMode(this.checked); });
                setColorblindMode(cbToggle.checked);
            }
            var resetBtn = document.getElementById('reset-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', resetProgress);
            }
            setupAudioOptionControls();
            
            // Qualitätsauswahl
            var qualitySelect = document.getElementById('quality-select');
            if (qualitySelect) {
                try {
                    // Lade gespeicherte Qualitätseinstellung oder verwende MEDIUM als festen Standard
                    const savedQuality = localStorage.getItem('graphicsQuality') || 'MEDIUM';
                    
                    // Wenn ungültig oder nicht existiert, auf 'MEDIUM' als globalen Standard setzen
                    if (!QUALITY_SETTINGS[savedQuality]) {
                        console.warn(`Ungültige Qualitätseinstellung: ${savedQuality}, setze auf MEDIUM zurück`);
                        qualitySelect.value = 'MEDIUM';
                        currentQuality = 'MEDIUM';
                        localStorage.setItem('graphicsQuality', 'MEDIUM');
                    } else {
                        qualitySelect.value = savedQuality;
                        currentQuality = savedQuality;
                        console.log(`Grafikqualität aus lokaler Speicherung geladen: ${currentQuality}`);
                    }
                    
                    qualitySelect.addEventListener('change', function() {
                        try {
                            const newQuality = this.value;
                            if (newQuality === 'HIGH' || newQuality === 'MEDIUM' || newQuality === 'LOW') {
                                currentQuality = newQuality;
                                localStorage.setItem('graphicsQuality', newQuality);
                                // Speichere Zeitstempel der manuellen Änderung
                                localStorage.setItem('manualQualityTimestamp', Date.now().toString());
                                // Nur initial oder in Optionen eine Benachrichtigung anzeigen
                                if (!gameActive) {
                                    showQualityChangeNotification(newQuality);
                                }
                            } else {
                                console.warn(`Ungültiger Qualitätswert ausgewählt: ${newQuality}`);
                            }
                        } catch (error) {
                            console.error("Fehler bei der Qualitätseinstellung:", error);
                        }
                    });
                } catch (error) {
                    console.error("Fehler bei der Initialisierung der Qualitätsauswahl:", error);
                }
            }
            
            // Setze den Listener für den Schließen-Button
            setupOptionsCloseListener();
        });

        function escapeHighscoreText(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function formatHighscoreNumber(value) {
            const number = Number(value) || 0;
            return number.toLocaleString('de-DE');
        }

        function renderHighscoreList() {
            let highscores = [];
            try {
                highscores = JSON.parse(localStorage.getItem('highscores') || '[]');
                if (!Array.isArray(highscores)) highscores = [];
            } catch (error) {
                highscores = [];
            }
            if (highscores.length === 0) {
                highscores = [
                    { name: 'Bytewerk Studio', score: 12000, wave: 6, date: 'Demo' },
                    { name: 'Ritter von Albion', score: 9600, wave: 5, date: 'Demo' },
                    { name: 'Schildwall', score: 8200, wave: 4, date: 'Demo' },
                    { name: 'Goldturm-Meister', score: 6400, wave: 3, date: 'Demo' },
                    { name: 'Grenzwacht', score: 4200, wave: 2, date: 'Demo' }
                ];
            }
            highscores.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
            const playerName = window.PLAYER_NAME || 'Du';
            const list = document.getElementById('highscore-list');
            if (!list) return;
            const best = highscores[0] || { score: 0, wave: 1 };
            const totalGames = highscores.filter((entry) => entry.source === 'mastil').length;
            list.innerHTML = `
                <div class="mastil-highscore-summary">
                    <div><span>Bester Ruhm</span><strong>${formatHighscoreNumber(best.score)}</strong></div>
                    <div><span>Beste Welle</span><strong>${formatHighscoreNumber(best.wave || 1)}</strong></div>
                    <div><span>Gespeicherte Partien</span><strong>${formatHighscoreNumber(totalGames || highscores.length)}</strong></div>
                </div>
            `;
            highscores.slice(0, 25).forEach((entry, idx) => {
                const rank = idx + 1;
                const medalClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
                const rankLabel = rank <= 3 ? ['I', 'II', 'III'][idx] : rank;
                const own = entry.name === playerName ? 'own' : '';
                const waveLabel = entry.wave ? `Welle ${formatHighscoreNumber(entry.wave)}` : 'Welle -';
                const dateLabel = entry.date || 'Lokal';
                list.innerHTML += `<div class="highscore-entry ${own}">
                    <span class="highscore-rank ${medalClass}">${rankLabel}</span>
                    <span class="highscore-name">
                        <strong>${escapeHighscoreText(entry.name || 'Herrscher')}</strong>
                        <small>${escapeHighscoreText(waveLabel)} | ${escapeHighscoreText(dateLabel)}</small>
                    </span>
                    <span class="highscore-score">${formatHighscoreNumber(entry.score)}</span>
                </div>`;
            });
        }
        // Event-Listener für Highscore-Modal
        window.addEventListener('DOMContentLoaded', function() {
            var closeBtn = document.getElementById('highscore-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeHighscores);
            }
        });
        
        // Event-Listener für Legends-X-Close Button
        window.addEventListener('DOMContentLoaded', function() {
            var legendsXCloseBtn = document.getElementById('legends-x-close');
            if (legendsXCloseBtn) {
                legendsXCloseBtn.addEventListener('click', closeLegends);
            }
        });
        
        // Event-Listener für Credits-X-Close Button
        window.addEventListener('DOMContentLoaded', function() {
            var creditsXCloseBtn = document.getElementById('credits-x-close');
            if (creditsXCloseBtn) {
                creditsXCloseBtn.addEventListener('click', closeCredits);
            }
        });
        
        // Event-Listener für Options-X-Close Button
        window.addEventListener('DOMContentLoaded', function() {
            var optionsXCloseBtn = document.getElementById('options-x-close');
            if (optionsXCloseBtn) {
                optionsXCloseBtn.addEventListener('click', closeOptions);
            }
        });

        // ... existing code ...
        /* 
         * HINWEIS: Diese Funktion wird nicht mehr verwendet. 
         * Die tatsächliche Implementierung von startNextWave() 
         * findet sich weiter unten im Code (ca. Zeile 5824).
         * Siehe Versionshinweis v2.6.22: Behebung des Wellen-Überspringens.
         */

        // Neue Funktion zum Zurücksetzen des Spielfelds
        function resetGameBoard() {
            // Lösche alle Türme außer dem Spielerturm
            const playerTower = towers.find(t => t.faction === FACTIONS.PLAYER);
            towers = playerTower ? [playerTower] : [];
            
            // Setze den Spielerturm auf die Startposition zurück
            if (playerTower) {
                playerTower.x = gameWidth * 0.2;
                playerTower.y = gameHeight * 0.5;
                playerTower.type = TOWER_TYPES.NORMAL;
                playerTower.level = 1;
                playerTower.maxUnits = getTowerMaxUnits(playerTower.faction, playerTower.type, playerTower.level);
                playerTower.units = Math.min(10, playerTower.maxUnits);
                playerTower.fortifiedUntil = 0;
            }
            
            // Erstelle neue neutrale Türme (leicht variierende Anzahl)
            const numNeutralTowers = 8 + Math.floor(Math.random() * 5); // 8-12 Türme
            const neutralTypes = [TOWER_TYPES.WATCH, TOWER_TYPES.TROOP, TOWER_TYPES.GOLD, TOWER_TYPES.NORMAL, TOWER_TYPES.GOLD];
            for (let i = 0; i < numNeutralTowers; i++) {
                let x, y;
                let validPosition = false;
                
                // Suche nach einer gültigen Position
                while (!validPosition) {
                    x = gameWidth * (0.2 + Math.random() * 0.6);
                    y = gameHeight * (0.2 + Math.random() * 0.6);
                    validPosition = checkTowerPlacementValid(x, y);
                }
                
                towers.push(createTower(x, y, FACTIONS.NEUTRAL, neutralTypes[i % neutralTypes.length], 1));
            }
            
            // Erstelle neue feindliche Türme
            const numEnemyTowers = 2 + Math.floor(wave / 2); // Linear wachsende Anzahl
            const enemyTypes = [TOWER_TYPES.TROOP, TOWER_TYPES.GOLD, TOWER_TYPES.NORMAL, TOWER_TYPES.WATCH];
            for (let i = 0; i < numEnemyTowers; i++) {
                let x, y;
                const edgeChoice = Math.floor(Math.random() * 4);
                
                switch (edgeChoice) {
                    case 0: // Oben
                        x = gameWidth * (0.2 + Math.random() * 0.6);
                        y = gameHeight * 0.1;
                        break;
                    case 1: // Rechts
                        x = gameWidth * 0.9;
                        y = gameHeight * (0.2 + Math.random() * 0.6);
                        break;
                    case 2: // Unten
                        x = gameWidth * (0.2 + Math.random() * 0.6);
                        y = gameHeight * 0.9;
                        break;
                    case 3: // Links
                        x = gameWidth * 0.1;
                        y = gameHeight * (0.2 + Math.random() * 0.6);
                        break;
                }
                
                if (checkTowerPlacementValid(x, y)) {
                    const enemyFaction = i % 3 === 0 ? FACTIONS.ENEMY_3 : 
                                      i % 2 === 0 ? FACTIONS.ENEMY_2 : 
                                      FACTIONS.ENEMY_1;
                    
                    // Linear wachsende Stärke
                    const enemyLevel = Math.max(1, Math.min(5, Math.floor(wave / 3)));
                    const newTower = createTower(x, y, enemyFaction, enemyTypes[i % enemyTypes.length], enemyLevel);
                    
                    // Linear wachsende Starteinheiten
                    const baseUnitPercent = 0.4 + (wave * 0.05); // 40% + 5% pro Welle
                    const unitPercent = Math.min(0.9, baseUnitPercent + (Math.random() * 0.1));
                    newTower.units = Math.floor(newTower.maxUnits * unitPercent);
                    
                    towers.push(newTower);
                }
            }
        }

        // Verbesserte taktische KI-Logik
        function updateAI(deltaTime) {
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
        // ... existing code ...

        // Doppeltipp-Variablen hinzufügen
        let lastTapTime = 0;
        let lastTappedTower = null;
        const DOUBLE_TAP_DELAY = 300; // 300ms für Doppeltipp

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
                } else {
                    // Clicked outside, hide UI
                    hideTowerMenu();
                    hideUnitSlider();
                    selectedTower = null;
                    isDragging = false;
                    lastTappedTower = null;
                }
            } else {
                // Clicked outside, hide UI
                hideTowerMenu();
                hideUnitSlider();
                selectedTower = null;
                isDragging = false;
                lastTappedTower = null;
            }
        }

        // Neue Funktion für Schnellangriff
        function handleQuickAttack(targetTower) {
            // Prüfe ob Zielturm gegnerisch oder neutral ist
            if (targetTower.faction === FACTIONS.PLAYER) {
                return; // Kann nicht eigene Türme angreifen
            }
            
            // Finde den stärksten Spielerturm in der Nähe
            const playerTowers = towers.filter(t => t.faction === FACTIONS.PLAYER && t.units > 0);
            
            if (playerTowers.length === 0) {
                return; // Keine Spielertürme mit Einheiten
            }
            
            // Verwende den ausgewählten Turm oder den nächstgelegenen
            let sourceTower = selectedTower;
            
            if (!sourceTower || sourceTower.faction !== FACTIONS.PLAYER || sourceTower.units === 0) {
                // Finde nächstgelegenen Spielerturm mit Einheiten
                let closestDistance = Infinity;
                
                for (const tower of playerTowers) {
                    const dx = tower.x - targetTower.x;
                    const dy = tower.y - targetTower.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        sourceTower = tower;
                    }
                }
            }
            
            if (sourceTower && sourceTower.units > 0) {
                // Sende 50% der Einheiten
                const unitsToSend = Math.max(1, Math.floor(sourceTower.units * 0.5));
                
                // Wichtig: Setze den ausgewählten Turm auf den Quellturm
                // für die visuelle Markierung während des Angriffs
                selectedTower = sourceTower;
                
                // Sende Einheiten zum Ziel
                sendUnitsFromTower(sourceTower, targetTower, unitsToSend);
                
                // Zeige kompakte visuelle Anzeige direkt am Zielturm
                showQuickAttackIndicator(sourceTower, targetTower, unitsToSend);
                
                // Schließe eventuell offene Menüs
                hideTowerMenu();
                hideUnitSlider();
                
                // Behalte die Auswahl für 1,5 Sekunden, dann entferne sie
                setTimeout(() => {
                    // Nur zurücksetzen, wenn der Turm noch der ausgewählte ist
                    if (selectedTower === sourceTower) {
                        selectedTower = null;
                    }
                }, 1500);
            }
        }

        // ... existing code ...

    (function installMastilArchiveWindows() {
        const factionIconClasses = {
            england: 'mastil-icon-england',
            spain: 'mastil-icon-spain',
            maya: 'mastil-icon-maya',
            abbasid: 'mastil-icon-abbasid',
            hre: 'mastil-icon-hre'
        };

        const MASTIL_LORE = {
            england: {
                name: 'Ritter von Albion',
                archive: 'Archiv der Tafelwacht',
                motto: 'Halten, sammeln, dann mit voller Ordnung vorstoßen.',
                region: 'Nebelmarken von Albion',
                style: 'Defensives Reich mit starken Kernburgen und zuverlässigen Gegenstößen.',
                power: 'Bessere Standhaftigkeit an wichtigen Knotenpunkten.',
                risk: 'Langsamer Aufbau, wenn Handelswege früh verloren gehen.',
                boss: 'Der Greifenmarschall',
                color: '#2e5d88',
                chapters: [
                    {
                        title: 'Der erste Schwur',
                        text: 'Albion begann nicht als Königreich, sondern als ein Ring zerstrittener Burgen. Artus sammelte die kleineren Häuser nicht mit Drohung, sondern mit einem Eid: Kein Turm steht allein, solange eine Straße nach Hause führt.'
                    },
                    {
                        title: 'Die Greifenstandarte',
                        text: 'Eleonora Eisenherz verwandelte diesen Eid in Kriegsordnung. Unter ihrer Standarte hielten wenige Verteidiger ganze Täler, bis Verstärkung über die befestigten Wege kam.'
                    },
                    {
                        title: 'Auf dem Spielfeld',
                        text: 'Albion fühlt sich gut an, wenn du erst sichere Linien baust, dann gezielt planst und einen starken Gegenangriff aus mehreren Türmen auslöst.'
                    }
                ],
                heroes: [
                    {
                        name: 'Artus der Einiger',
                        relic: 'Kelch der Harmonie',
                        story: 'Sein Wunder beruhigte verfeindete Häuser und machte aus alten Fehden Versorgungsbündnisse. In MASTIL steht Artus für stabile Fronten und kluge Bündelung deiner Kräfte.'
                    },
                    {
                        name: 'Eleonora Eisenherz',
                        relic: 'Greifenstandarte',
                        story: 'Wenn die Front zu brechen drohte, hob Eleonora die Standarte über die Mauern. Ihre Legende passt zu Momenten, in denen ein einziger befestigter Turm eine ganze Welle aufhält.'
                    },
                    {
                        name: 'Wilhelm der Seefahrer',
                        relic: 'Kompass der Verlorenen Gezeiten',
                        story: 'Wilhelm öffnete sichere Handelswege durch Nebel und Sturm. Seine Lehre: Wer Wege kontrolliert, kontrolliert das Tempo der Schlacht.'
                    }
                ]
            },
            spain: {
                name: 'Die Solterraner',
                archive: 'Chroniken von Esperia',
                motto: 'Sonne, Tempo und ein Angriff, bevor der Feind atmet.',
                region: 'Goldene Grenzlande',
                style: 'Aggressive Expansion, starke Einnahmen und schneller Druck auf neutrale Festungen.',
                power: 'Bessere Chancen, frühe Rohstofforte in eine Offensive zu verwandeln.',
                risk: 'Überdehnung wird hart bestraft, wenn die Wege nicht gesichert sind.',
                boss: 'Isabellas Sonnenkomtur',
                color: '#b9483d',
                chapters: [
                    {
                        title: 'Die Karten jenseits der Sonne',
                        text: 'Die Solterraner glauben, dass jede Karte nur eine Einladung ist, weiterzugehen. Ferrando ließ neue Wege markieren, bevor seine Gegner überhaupt wussten, dass dort ein Pass existiert.'
                    },
                    {
                        title: 'Das Reich der schnellen Banner',
                        text: 'Isabella ordnete jedes eroberte Schloss in ein Netz aus Vorrat, Signalfeuern und Marschpunkten ein. So wurden kleine Siege zu einer Lawine.'
                    },
                    {
                        title: 'Auf dem Spielfeld',
                        text: 'Solterra belohnt mutige Spieler: früh neutrale Türme nehmen, Goldorte halten und mit Flanken verhindern, dass die KI sich sammelt.'
                    }
                ],
                heroes: [
                    {
                        name: 'Ferrando El Navegante',
                        relic: 'Astrolabium der Sternenpfade',
                        story: 'Ferrando sah Routen dort, wo andere nur Risiko sahen. Seine Legende passt zum Kartenlesen: kurze Wege, schnelle Angriffe, keine verschwendete Bewegung.'
                    },
                    {
                        name: 'Isabella La Conquistadora',
                        relic: 'Zepter der Goldenen Sonne',
                        story: 'Isabella machte aus Gold Disziplin. Im Spiel erinnert sie daran, dass Einkommen nur dann stark ist, wenn es sofort in Druck und Upgrades fließt.'
                    }
                ]
            },
            maya: {
                name: 'Sternenleser von Yaxtun',
                archive: 'Sternentafeln von Yaxtun',
                motto: 'Wer den nächsten Zyklus kennt, verschwendet keine Truppe.',
                region: 'Dschungel von Yaxtun',
                style: 'Kontrolliertes Wachstum, gute Reaktion auf Ereignisse und starke Planung.',
                power: 'Mehr Nutzen aus Zielen, Bosswarnungen und taktischen Markierungen.',
                risk: 'Braucht Übersicht; chaotische Mehrfronten kosten schnell Momentum.',
                boss: 'Der Jaguarschamane',
                color: '#1f7a66',
                chapters: [
                    {
                        title: 'Der Spiegel im Tempel',
                        text: 'Pacal blickte in den Obsidian-Spiegel und sah keine Zukunft, sondern Muster. Die Sternenleser wurden groß, weil sie Angriffe erwarteten, bevor Trommeln erklangen.'
                    },
                    {
                        title: 'Die Jade-Tafeln',
                        text: 'Ixchel ordnete Ernten, Rituale und Verteidigung nach Zyklen. Ihre Städte wuchsen nicht zufällig: Jeder Weg, jede Pyramide, jeder Wachposten hatte einen Platz.'
                    },
                    {
                        title: 'Auf dem Spielfeld',
                        text: 'Yaxtun passt zu Spielern, die ruhig lesen, Ziele markieren und dann sauber reagieren. Lass die KI in ungünstige Wege laufen.'
                    }
                ],
                heroes: [
                    {
                        name: 'Pacal der Himmelsdeuter',
                        relic: 'Obsidian-Spiegel von Itzamna',
                        story: 'Pacal gewann Schlachten oft vor dem ersten Angriff, weil er wusste, welche Straße wichtig werden würde. Seine Lehre ist Vorplanung.'
                    },
                    {
                        name: 'Ixchel die Mondweberin',
                        relic: 'Jade-Tafeln der Zyklen',
                        story: 'Ixchel bewahrte Yaxtun vor Übermut. Im Spiel steht sie für Geduld: erst das Netz, dann der Schlag.'
                    }
                ]
            },
            abbasid: {
                name: 'Kalifat von Al-Kimiya',
                archive: 'Haus der Weisheit',
                motto: 'Wissen ist eine Mauer, und eine gute Mauer gewinnt Zeit.',
                region: 'Oasenringe von Al-Kimiya',
                style: 'Technische Überlegenheit, starke Upgrades und robuste Verteidigung.',
                power: 'Bessere Wirkung aus befestigten und spezialisierten Türmen.',
                risk: 'Wenn der frühe Aufbau gestört wird, fehlen Reserven für lange Kriege.',
                boss: 'Der Sandmechanikus',
                color: '#b88734',
                chapters: [
                    {
                        title: 'Die Stadt aus Licht und Zahlen',
                        text: 'Al-Kimiya wurde um Bibliotheken, Werkstätten und Sternwarten gebaut. Wo andere nur Mauern sahen, berechneten seine Gelehrten Winkel, Vorrat und Reichweite.'
                    },
                    {
                        title: 'Das Elixier der Beständigkeit',
                        text: 'Zaynab machte Festungen haltbar, Brunnen sicher und Waffen verlässlich. Das Kalifat gewinnt nicht durch Hast, sondern durch bessere Vorbereitung.'
                    },
                    {
                        title: 'Auf dem Spielfeld',
                        text: 'Al-Kimiya ist stark, wenn du klug upgradest, Engstellen hältst und den Gegner an Mauern ausbluten lässt, bevor du vorrückst.'
                    }
                ],
                heroes: [
                    {
                        name: 'Al-Mamun der Himmelsvermesser',
                        relic: 'Astrolabium der Wahren Kurse',
                        story: 'Al-Mamun machte Wissen zur Infrastruktur. In MASTIL bedeutet das: Wege verstehen, Risiken messen, dann handeln.'
                    },
                    {
                        name: 'Zaynab die Alchemistin',
                        relic: 'Elixier der Beständigkeit',
                        story: 'Ihre Mauern hielten, weil sie nicht nur gebaut, sondern begriffen wurden. Sie steht für starke Verteidigung und sinnvolle Upgrades.'
                    }
                ]
            },
            hre: {
                name: 'Aethelgardisches Reich',
                archive: 'Reichsannalen von Aethelgard',
                motto: 'Ordnung über Entfernung, Krone über Chaos.',
                region: 'Nachtfestung und Kaiserstraße',
                style: 'Ausgewogene Macht mit starker Kontrolle über zentrale Wege und große Karten.',
                power: 'Gute Stabilität, wenn mehrere Fronten über ein Zentrum verbunden sind.',
                risk: 'Verliert an Kraft, wenn das Reich in getrennte Inseln zerfällt.',
                boss: 'Der Kronenbrecher',
                color: '#6f638f',
                chapters: [
                    {
                        title: 'Die Krone erwacht',
                        text: 'Aethelgard war ein Mosaik aus stolzen Städten und misstrauischen Fürsten. Heinrichs Krone zwang sie nicht nieder; sie erinnerte sie daran, dass getrennte Banner einzeln fallen.'
                    },
                    {
                        title: 'Der Codex der Waage',
                        text: 'Theophanu gab dem Reich Regeln, auf die selbst Rivalen vertrauten. Mit ihr wurden Straßen sicherer, Steuern planbarer und Belagerungen seltener.'
                    },
                    {
                        title: 'Auf dem Spielfeld',
                        text: 'Aethelgard liebt Zentralität: Halte Kreuzungen, verbinde Burgen und führe Kriege nicht als einzelne Duelle, sondern als Reichssystem.'
                    }
                ],
                heroes: [
                    {
                        name: 'Heinrich der Reichserneuerer',
                        relic: 'Krone der Uralten Könige',
                        story: 'Heinrich gewann Loyalität durch sichtbare Ordnung. Im Spiel steht er für starke Mitte und verlässliche Frontlinien.'
                    },
                    {
                        name: 'Theophanu die Gesetzgeberin',
                        relic: 'Zepter der Waage',
                        story: 'Theophanu machte Chaos messbar und Streit entscheidbar. Ihre Lehre: Eine klare Regel im richtigen Moment spart mehr Truppen als ein großer Angriff.'
                    }
                ]
            }
        };

        const MASTIL_WORLD_CHAPTERS = [
            {
                name: 'Startgebiet',
                waves: 'Wellen 1-5',
                boss: 'Grenzwacht Roderich',
                text: 'Erste Wege, Märkte und Burgen. Hier lernt der Spieler, Linien zu schließen und neutrale Türme sinnvoll zu nehmen.'
            },
            {
                name: 'Grenzlande',
                waves: 'Wellen 6-10',
                boss: 'Der Eisenvogt',
                text: 'Engpässe und Frontdruck. Versorgung und befestigte Kreuzungen werden wichtiger als reine Masse.'
            },
            {
                name: 'Wüstenreich',
                waves: 'Wellen 11-15',
                boss: 'Sultan der Sandkrone',
                text: 'Weite Wege, Märkte und Steinbrüche. Wer Einkommen nicht schützt, verliert den langen Krieg.'
            },
            {
                name: 'Nachtfestung',
                waves: 'Wellen 16-20',
                boss: 'Nachtgraf Malrec',
                text: 'Waldwege, Hinterhalte und riskante Fronten. Gute Planung verhindert, dass die KI die Karte zerreißt.'
            },
            {
                name: 'Endboss-Zitadelle',
                waves: 'Wellen 21-25',
                boss: 'Kaiser Veyron',
                text: 'Aschefelder und Zitadellen. Jede Straße, jede Belagerung und jeder Ausbau zählt.'
            }
        ];

        const MASTIL_CURRENT_STATUS = [
            ['Kartenwege', 'Sichtbare Straßen, Wegpunkte, Frontwege, Wege-Aufträge und Kreuzungsboni.'],
            ['Gefecht', 'Kartenwahl, Größe, Gegnerzahl, Reichsfarbe, Schwierigkeit und KI-Kriegsplan.'],
            ['Spielsteuerung', 'Taktische Befehle mit Kosten, Bereitschaft, Risikoanzeige und klaren Symbolen.'],
            ['Weltkarte', 'Fünf Regionen mit Bossfronten, wechselnden Hintergründen und Fortschrittspfad.'],
            ['Windows-Download', 'mastil.online fuehrt zum Setup-Installer; gespielt wird als Windows-Version.'],
            ['Lizenz', 'Demo bis Welle 5, Vollversion 10,99 EUR und Aktivierungsfluss im Spiel.']
        ];

        const MASTIL_WORLD_DOCTRINES = [
            ['Wege entscheiden', 'Türme sind nicht nur Punkte. Straßen, Kreuzungen und Nachschub bestimmen, ob ein Angriff rechtzeitig ankommt.'],
            ['Gold braucht Schutz', 'Einkommen ist stark, aber nur mit gehaltenen Märkten und gesicherten Wegen wird daraus ein Sieg.'],
            ['Bosswellen brechen Linien', 'Alle fünf Wellen prüft ein Boss dein Reich. Reserven und Upgrades zählen dann mehr als blinde Masse.']
        ];

        const MASTIL_ARCHIVE_COMMANDS = [
            ['Space', 'Kriegsrat', 'Lässt die aktuelle Lage auswerten und wählt den sinnvollsten Befehl.'],
            ['2 → 5', 'Plan + Flanke', 'Markiere ein Ziel und setze es danach von der Seite unter Druck.'],
            ['7 → 4', 'Reserve + Front', 'Ziehe Truppen an den Brennpunkt und brich anschließend die Linie.'],
            ['8 → 3', 'Belagerung + Schnellangriff', 'Schwäche starke Burgen und nutze das kurze Zeitfenster.']
        ];

        const MASTIL_FACTION_TACTICS = {
            england: [
                ['Früh halten', 'Wachturm oder Hügel sichern, dann schwache Fronten befestigen.'],
                ['Reserve führen', 'Sammeln und Reserve nutzen, bevor der Gegner die Linie zerreißt.'],
                ['Boss brechen', 'Belagerung vorbereiten und erst nach Schildwall angreifen.']
            ],
            spain: [
                ['Märkte nehmen', 'Goldorte früh sichern und offene Wege schließen.'],
                ['Tempo kaufen', 'Mit Einkommen Ausbau, Flanke und Belagerung schneller abwechseln.'],
                ['Druck halten', 'Konvois schützen, damit jede Welle mit Vorrat beginnt.']
            ],
            maya: [
                ['Wald lesen', 'Wachtürme und Hinterhalte nutzen, bevor große Angriffe starten.'],
                ['Feind schwächen', 'Plan und Flanke kombinieren, dann die verwundete Stellung nehmen.'],
                ['Boss ausbluten', 'Nicht blind stürmen: Druck sammeln und mit Befehlsketten brechen.']
            ],
            abbasid: [
                ['Wissen sichern', 'Gold- und Wachtürme verbinden, damit Befehle häufiger bereit sind.'],
                ['Belagern lernen', 'Starke Festungen erst schwächen, dann mit Reserve nachsetzen.'],
                ['Rechnen statt raten', 'Kriegsrat nutzen, wenn mehrere Ziele gleichzeitig locken.']
            ],
            hre: [
                ['Mitte bauen', 'Kreuzungen und Burgen verbinden, statt nur außen zu expandieren.'],
                ['Ordnung halten', 'Isolierte Türme schließen und Feinddruck früh parieren.'],
                ['Reichsschlag', 'Plan, Belagerung und Frontangriff als saubere Kette spielen.']
            ]
        };

        function compareVersionsDesc(a, b) {
            const pa = a.split('.').map(Number);
            const pb = b.split('.').map(Number);
            for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
                const delta = (pb[i] || 0) - (pa[i] || 0);
                if (delta !== 0) return delta;
            }
            return 0;
        }

        function openArchiveModal(modal) {
            if (!modal) return;
            modal.style.display = 'grid';
            modal.scrollTop = 0;
            modal.classList.add('mastil-window-open');
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'auto';
        }

        function closeArchiveModal(modal) {
            if (!modal) return;
            modal.style.display = 'none';
            modal.classList.remove('mastil-window-open');
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }

        function buildLoreHome() {
            const factions = Object.entries(MASTIL_LORE).map(([id, lore]) => `
                <button class="mastil-lore-route" onclick="showCivilizationLegend('${id}')">
                    <span class="mastil-faction-icon ${factionIconClasses[id]}" aria-hidden="true"></span>
                    <strong>${lore.name}</strong>
                    <small>${lore.region}</small>
                </button>
            `).join('');
            const chapters = MASTIL_WORLD_CHAPTERS.map((chapter, index) => `
                <article class="mastil-world-lore-card">
                    <span>${String(index + 1).padStart(2, '0')} · ${chapter.waves}</span>
                    <strong>${chapter.name}</strong>
                    <small>Boss: ${chapter.boss}</small>
                    <p>${chapter.text}</p>
                </article>
            `).join('');
            const doctrines = MASTIL_WORLD_DOCTRINES.map(([title, text]) => `
                <article>
                    <span>${title}</span>
                    <p>${text}</p>
                </article>
            `).join('');
            const commandCards = MASTIL_ARCHIVE_COMMANDS.map(([key, title, text]) => `
                <article>
                    <strong>${key}</strong>
                    <span>${title}</span>
                    <p>${text}</p>
                </article>
            `).join('');

            return `
                <section class="mastil-lore-home">
                    <span class="mastil-kicker">Reichsarchiv</span>
                    <h3>Die Welt hinter den Wellen</h3>
                    <p>MASTIL ist ein Krieg um Wege, Vorräte und alte Schwüre. Wer nur den nächsten Turm sieht, verliert die Karte. Wer Linien, Märkte und Bossfronten versteht, macht aus kleinen Burgen ein Reich.</p>
                    <div class="mastil-lore-prologue">
                        <strong>Die Legende beginnt nach dem Fall der Ersten Zitadelle.</strong>
                        <p>Fünf Reiche erheben Anspruch auf dieselben alten Straßen. Unter jeder Karte liegen vergessene Banner, zerstörte Handelsringe und Bossfestungen, die nur auf einen schwachen Herrscher warten. Jede Partie ist ein neuer Feldzug durch diese Welt.</p>
                    </div>
                    <div class="mastil-doctrine-grid">${doctrines}</div>
                    <div class="mastil-archive-command-strip">${commandCards}</div>
                    <div class="mastil-world-lore">${chapters}</div>
                    <div class="mastil-lore-section-head">
                        <span>Reiche wählen</span>
                        <strong>Spielweise, Helden und Wunder</strong>
                    </div>
                    <div class="mastil-lore-routes">${factions}</div>
                    <p class="mastil-scroll-hint">Wähle ein Reich, um seine Geschichte, Spielweise und Helden zu sehen. Dieses Fenster scrollt getrennt vom Spiel.</p>
                </section>
            `;
        }

        function buildLoreContent(id, lore) {
            const chapters = lore.chapters.map(chapter => `
                <article class="mastil-lore-chapter">
                    <h4>${chapter.title}</h4>
                    <p>${chapter.text}</p>
                </article>
            `).join('');

            const heroes = lore.heroes.map(hero => `
                <div class="legend-accordion-item">
                    <button class="legend-accordion-title" onclick="toggleLegendAccordion(this)">
                        <span>${hero.name}</span>
                        <small>${hero.relic}</small>
                    </button>
                    <div class="legend-accordion-panel">
                        <p>${hero.story}</p>
                    </div>
                </div>
            `).join('');
            const playbook = [
                ['Spielweise', lore.style],
                ['Stärke', lore.power],
                ['Risiko', lore.risk],
                ['Bossziel', `${lore.boss}: Linien halten, dann mit klarer Übermacht brechen.`]
            ].map(([label, text]) => `
                <article>
                    <span>${label}</span>
                    <strong>${text}</strong>
                </article>
            `).join('');
            const tactics = (MASTIL_FACTION_TACTICS[id] || []).map(([title, text], index) => `
                <article class="mastil-lore-step">
                    <span>${String(index + 1).padStart(2, '0')}</span>
                    <strong>${title}</strong>
                    <p>${text}</p>
                </article>
            `).join('');
            const commandBriefing = `
                <section class="mastil-lore-command">
                    <span>Kommandantenbriefing</span>
                    <p>${lore.name} gewinnt, wenn du seine Identität ernst nimmst: ${lore.style} Baue zuerst die passende Kartenstruktur, dann greife mit einem Ziel an, nicht aus Gewohnheit.</p>
                </section>
            `;

            return `
                <button class="mastil-lore-back" onclick="showLoreHome()">Zurück zum Reichsarchiv</button>
                <section class="mastil-lore-hero" style="--lore-color:${lore.color}">
                    <div class="mastil-lore-emblem mastil-faction-icon ${factionIconClasses[id]}" aria-hidden="true"></div>
                    <div>
                        <span>${lore.archive}</span>
                        <h3>${lore.name}</h3>
                        <p>${lore.motto}</p>
                    </div>
                </section>
                <div class="mastil-lore-stats">
                    <div><span>Region</span><strong>${lore.region}</strong></div>
                    <div><span>Stil</span><strong>${lore.style}</strong></div>
                    <div><span>Stärke</span><strong>${lore.power}</strong></div>
                    <div><span>Risiko</span><strong>${lore.risk}</strong></div>
                    <div><span>Boss</span><strong>${lore.boss}</strong></div>
                </div>
                ${commandBriefing}
                <div class="mastil-lore-playbook">${playbook}</div>
                <section class="mastil-lore-tactic-flow">
                    <div class="mastil-lore-section-head">
                        <span>Feldzugplan</span>
                        <strong>Drei Schritte fuer dieses Reich</strong>
                    </div>
                    <div class="mastil-lore-steps">${tactics}</div>
                </section>
                <div class="mastil-lore-grid">${chapters}</div>
                <section class="mastil-lore-chronicle">
                    <div class="mastil-lore-section-head">
                        <span>Helden & Wunder</span>
                        <strong>Aufklappbare Chroniken</strong>
                    </div>
                    <div class="legends-accordion">${heroes}</div>
                </section>
            `;
        }

        function buildCreditHighlights() {
            return [
                ['Studio', 'Bytewerk Studio', 'Offizielle Website, Windows-Version, Installer und Spielausbau.'],
                ['Spielsystem', 'Tower Conquest', 'Kampagne, Gefecht, KI, Wellen, Bosskämpfe, Moral und Kriegsereignisse.'],
                ['Online', 'mastil.online', 'Download ueber GitHub Pages; Echtzeit-Mehrspieler ueber den separaten MASTIL-Server.'],
                ['Design', 'MASTIL Welt', 'Weltkarte, Fraktionen, Hintergründe, Icons, Fenster, Menüs und Kartenstimmung.'],
                ['Qualität', 'Getestete Builds', 'Lokale Prüfungen, Windows-Fokus und regelmäßige Veröffentlichung auf GitHub.'],
                ['Entwicklung', 'H. Haqmal', 'Spielidee, Richtung, offizielle Veröffentlichung und Projektleitung.']
            ].map(([label, title, text]) => `
                <article class="mastil-credit-card">
                    <span>${label}</span>
                    <strong>${title}</strong>
                    <p>${text}</p>
                </article>
            `).join('');
        }

        function buildCurrentStatus() {
            return MASTIL_CURRENT_STATUS.map(([title, text]) => `
                <article class="mastil-status-card">
                    <strong>${title}</strong>
                    <p>${text}</p>
                </article>
            `).join('');
        }

        function buildVersionAccordion() {
            const grouped = {};
            Object.keys(VERSION_HISTORY).sort(compareVersionsDesc).forEach(version => {
                const main = version.split('.')[0];
                if (!grouped[main]) grouped[main] = [];
                grouped[main].push(version);
            });

            return Object.keys(grouped).sort((a, b) => Number(b) - Number(a)).map(main => {
                const minorGroups = {};
                grouped[main].forEach(version => {
                    const minor = version.split('.')[1] || '0';
                    if (!minorGroups[minor]) minorGroups[minor] = [];
                    minorGroups[minor].push(version);
                });

                const minors = Object.keys(minorGroups).sort((a, b) => Number(b) - Number(a)).map(minor => {
                    const entries = minorGroups[minor].sort(compareVersionsDesc).map(version => `
                        <div class="version-entry">
                            <div class="version-number">Version ${version}</div>
                            <ul>${VERSION_HISTORY[version].map(change => `<li>${change}</li>`).join('')}</ul>
                        </div>
                    `).join('');

                    return `
                        <div class="inner-accordion-item">
                            <button class="inner-accordion-title" onclick="toggleInnerAccordion(this)">Version ${main}.${minor}</button>
                            <div class="inner-accordion-panel">${entries}</div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="accordion-item">
                        <button class="accordion-title" onclick="toggleAccordion(this)">Version ${main}</button>
                        <div class="accordion-panel">
                            <div class="inner-accordion-credits">${minors}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        window.renderCreditsAccordion = function renderCreditsAccordionModern() {
            const modal = document.getElementById('credits-modal');
            const content = modal ? modal.querySelector('.credits-content') : null;
            if (!content) return;

            const latestVersion = Object.keys(VERSION_HISTORY).sort(compareVersionsDesc)[0] || '2.6.32';
            content.innerHTML = `
                <section class="mastil-credit-hero">
                    <span class="mastil-kicker">Offizielle Credits</span>
                    <h2>MASTIL</h2>
                    <p>Ein mittelalterliches Tower-Conquest-Spiel fuer Windows, veroeffentlicht ueber die offizielle Download-Seite mastil.online.</p>
                    <div class="mastil-credit-meta">
                        <span>Live-Version ${latestVersion}</span>
                        <span>Preisplan: Demo bis Welle 5, Vollversion 10,99 EUR</span>
                    </div>
                </section>
                <section class="mastil-credit-grid">${buildCreditHighlights()}</section>
                <section class="mastil-credit-note">
                    <strong>Was ist MASTIL?</strong>
                    <p>MASTIL verbindet Kartenkontrolle, Burgen, Türme, Wege, Bosswellen und taktische Befehle. Das Spiel wächst Schritt für Schritt zu einer größeren Welt mit Kampagne, Gefecht, Offline-KI und Online-Modus.</p>
                </section>
                <section class="mastil-current-section">
                    <div class="mastil-lore-section-head">
                        <span>Aktueller Spielstand</span>
                        <strong>Was bereits spielbar ist</strong>
                    </div>
                    <div class="mastil-status-grid">${buildCurrentStatus()}</div>
                </section>
                <section class="mastil-version-section">
                    <div class="mastil-lore-section-head">
                        <span>Versionsarchiv</span>
                        <strong>Änderungen und Ausbau</strong>
                    </div>
                    <div class="accordion-credits mastil-version-log">${buildVersionAccordion()}</div>
                </section>
                <div class="mastil-credit-signature">Developed by H. Haqmal · Bytewerk Studio</div>
            `;
        };

        window.showCredits = function showCreditsModern() {
            window.renderCreditsAccordion();
            const modal = document.getElementById('credits-modal');
            openArchiveModal(modal);
            const content = modal ? modal.querySelector('.credits-content') : null;
            if (content) content.scrollTop = 0;
        };

        window.closeCredits = function closeCreditsModern() {
            closeArchiveModal(document.getElementById('credits-modal'));
        };

        window.showLegends = function showLegendsModern() {
            const modal = document.getElementById('legends-modal');
            const content = document.getElementById('legend-content');
            if (content && !content.dataset.modernLoreReady) {
                content.innerHTML = buildLoreHome();
                content.dataset.modernLoreReady = 'home';
                content.style.display = 'block';
            }
            openArchiveModal(modal);
            if (content) content.scrollTop = 0;
        };

        window.showLoreHome = function showLoreHomeModern() {
            const content = document.getElementById('legend-content');
            if (!content) return;
            content.innerHTML = buildLoreHome();
            content.dataset.modernLoreReady = 'home';
            content.style.display = 'block';
            content.scrollTop = 0;
            document.querySelectorAll('.legend-button').forEach(btn => btn.classList.remove('active'));
        };

        window.closeLegends = function closeLegendsModern() {
            closeArchiveModal(document.getElementById('legends-modal'));
        };

        document.addEventListener('keydown', function closeArchiveWithKeyboard(event) {
            if (!event || event.key !== 'Escape') return;
            const legends = document.getElementById('legends-modal');
            const credits = document.getElementById('credits-modal');
            const legendsOpen = legends && window.getComputedStyle(legends).display !== 'none';
            const creditsOpen = credits && window.getComputedStyle(credits).display !== 'none';
            if (!legendsOpen && !creditsOpen) return;
            event.preventDefault();
            if (creditsOpen) closeArchiveModal(credits);
            if (legendsOpen) closeArchiveModal(legends);
        });

        window.showCivilizationLegend = function showCivilizationLegendModern(civId) {
            const lore = MASTIL_LORE[civId];
            const contentContainer = document.getElementById('legend-content');
            if (!lore || !contentContainer) return;

            document.querySelectorAll('.legend-button').forEach(btn => btn.classList.remove('active'));
            const selectedButton = document.querySelector(`.legend-button[onclick*="${civId}"]`);
            if (selectedButton) selectedButton.classList.add('active');

            contentContainer.innerHTML = buildLoreContent(civId, lore);
            contentContainer.dataset.modernLoreReady = civId;
            contentContainer.style.display = 'block';
            contentContainer.scrollTop = 0;
        };
    })();
