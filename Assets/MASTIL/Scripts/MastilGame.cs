using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Mastil
{
    public sealed class MastilGame : MonoBehaviour
    {
        private enum ScreenMode
        {
            MainMenu,
            WorldMap,
            SkirmishSetup,
            Battle,
            Options,
            Result
        }

        private enum Faction
        {
            Neutral,
            Player,
            Enemy
        }

        private sealed class Tower
        {
            public int Id;
            public string Name = "";
            public Faction Owner;
            public Vector2 Position;
            public int Level;
            public int Units;
            public int MaxUnits;
            public bool Castle;
            public string Role = "";
            public float Training;
        }

        private sealed class Road
        {
            public int A;
            public int B;
        }

        private sealed class UnitGroup
        {
            public Faction Owner;
            public int FromId;
            public int TargetId;
            public int Amount;
            public Vector2 Position;
            public float Progress;
        }

        private sealed class Region
        {
            public string Name = "";
            public string Description = "";
            public string Boss = "";
            public string Difficulty = "";
            public int WavesFrom;
            public int WavesTo;
            public Color ColorA;
            public Color ColorB;
            public bool Unlocked;
        }

        private sealed class BattleMap
        {
            public string Name = "";
            public string Size = "";
            public string Description = "";
            public int ExtraNeutral;
            public int ExtraEnemy;
            public float GoldMultiplier = 1f;
            public Color GroundA;
            public Color GroundB;
            public Color WaterColor;
        }

        private sealed class FloatingText
        {
            public string Text = "";
            public Vector2 Position;
            public Color Color;
            public float Age;
            public float Lifetime = 1.8f;
        }

        private ScreenMode mode = ScreenMode.MainMenu;
        private readonly List<Tower> towers = new List<Tower>();
        private readonly List<Road> roads = new List<Road>();
        private readonly List<UnitGroup> units = new List<UnitGroup>();
        private readonly List<Region> regions = new List<Region>();
        private readonly List<BattleMap> battleMaps = new List<BattleMap>();
        private readonly List<FloatingText> floatingTexts = new List<FloatingText>();
        private readonly Dictionary<string, Texture2D> textureCache = new Dictionary<string, Texture2D>();

        private Texture2D pixel = null;
        private Texture2D menuTexture = null;
        private Texture2D mapTexture = null;
        private Texture2D battleTexture = null;
        private Texture2D panelTexture = null;
        private Texture2D selectedTexture = null;
        private Texture2D brandIcon = null;

        private GUIStyle titleStyle = null;
        private GUIStyle subtitleStyle = null;
        private GUIStyle bodyStyle = null;
        private GUIStyle smallStyle = null;
        private GUIStyle buttonStyle = null;
        private GUIStyle ghostButtonStyle = null;
        private GUIStyle panelStyle = null;
        private GUIStyle dangerStyle = null;

        private Tower selectedTower;
        private float gold;
        private float aiTimer;
        private float pulse;
        private string battleMessage = "";
        private string resultTitle = "";
        private string resultText = "";
        private int chosenRegion;
        private int difficulty = 1;
        private Color playerColor = new Color(0.25f, 0.74f, 1.0f);
        private Color enemyColor = new Color(0.92f, 0.22f, 0.16f);
        private Vector2 legendScroll;
        private bool showGrid = true;
        private bool campaignBattle = true;
        private int mapChoice;
        private float tacticCooldown;
        private string currentMapName = "Tal der Kronen";
        private AudioSource audioSource = null;
        private AudioClip clickClip = null;
        private AudioClip attackClip = null;
        private AudioClip upgradeClip = null;
        private AudioClip captureClip = null;
        private AudioClip winClip = null;
        private AudioClip loseClip = null;

        private const int BaseScreenWidth = 1600;
        private const int BaseScreenHeight = 900;

        private void Awake()
        {
            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 1;
            CreateTextures();
            CreateRegions();
            CreateBattleMaps();
            CreateAudio();
        }

        private void Update()
        {
            pulse += Time.deltaTime;
            UpdateFloatingTexts(Time.deltaTime);
            if (mode != ScreenMode.Battle)
            {
                return;
            }

            tacticCooldown = Mathf.Max(0f, tacticCooldown - Time.deltaTime);
            UpdateEconomy(Time.deltaTime);
            UpdateUnits(Time.deltaTime);
            UpdateAi(Time.deltaTime);
            CheckBattleEnd();
        }

        private void OnGUI()
        {
            if (titleStyle == null)
            {
                CreateStyles();
            }

            float scale = Mathf.Min(Screen.width / (float)BaseScreenWidth, Screen.height / (float)BaseScreenHeight);
            scale = Mathf.Clamp(scale, 0.72f, 1.25f);
            GUI.matrix = Matrix4x4.TRS(Vector3.zero, Quaternion.identity, new Vector3(scale, scale, 1f));
            Rect canvas = new Rect(0, 0, Screen.width / scale, Screen.height / scale);

            switch (mode)
            {
                case ScreenMode.MainMenu:
                    DrawMainMenu(canvas);
                    break;
                case ScreenMode.WorldMap:
                    DrawWorldMap(canvas);
                    break;
                case ScreenMode.SkirmishSetup:
                    DrawSkirmishSetup(canvas);
                    break;
                case ScreenMode.Battle:
                    DrawBattle(canvas);
                    break;
                case ScreenMode.Options:
                    DrawOptions(canvas);
                    break;
                case ScreenMode.Result:
                    DrawResult(canvas);
                    break;
            }
        }

        private void DrawMainMenu(Rect canvas)
        {
            GUI.DrawTexture(canvas, menuTexture, ScaleMode.StretchToFill);
            DrawVignette(canvas);

            Rect left = new Rect(84, 84, 560, canvas.height - 140);
            GUI.Label(new Rect(left.x, left.y, left.width, 76), "MASTIL", titleStyle);
            GUI.Label(new Rect(left.x + 4, left.y + 82, left.width, 82), "Burgen, Wege und Reiche im taktischen Gefecht", subtitleStyle);
            if (brandIcon != null)
            {
                GUI.DrawTexture(new Rect(left.x + 388, left.y + 4, 136, 136), brandIcon, ScaleMode.ScaleToFit, true);
            }

            GUI.Label(new Rect(left.x + 4, left.y + 172, left.width, 118),
                "Waehle dein Reich, erobere Tuerme entlang echter Wege und fuehre deine Truppen gegen die KI. Diese Unity-Version ist der neue spielbare Kern fuer Windows.",
                bodyStyle);

            float buttonY = left.y + 328;
            if (GUI.Button(new Rect(left.x, buttonY, 360, 58), "Kampagne starten", buttonStyle))
            {
                PlaySound(clickClip, 0.55f);
                campaignBattle = true;
                mode = ScreenMode.WorldMap;
            }

            if (GUI.Button(new Rect(left.x, buttonY + 76, 360, 54), "Gefecht gegen KI", buttonStyle))
            {
                PlaySound(clickClip, 0.55f);
                campaignBattle = false;
                mode = ScreenMode.SkirmishSetup;
            }

            if (GUI.Button(new Rect(left.x, buttonY + 148, 360, 54), "Einstellungen", ghostButtonStyle))
            {
                PlaySound(clickClip, 0.4f);
                mode = ScreenMode.Options;
            }

            if (GUI.Button(new Rect(left.x, buttonY + 220, 360, 54), "Spiel beenden", ghostButtonStyle))
            {
                Application.Quit();
            }

            Rect legend = new Rect(canvas.width - 540, 92, 440, 620);
            DrawPanel(legend, new Color(0.03f, 0.07f, 0.08f, 0.78f));
            GUI.Label(new Rect(legend.x + 30, legend.y + 28, legend.width - 60, 44), "Die Legende von Mastil", subtitleStyle);
            Rect viewRect = new Rect(0, 0, legend.width - 70, 780);
            legendScroll = GUI.BeginScrollView(new Rect(legend.x + 26, legend.y + 88, legend.width - 52, legend.height - 116), legendScroll, viewRect);
            GUI.Label(new Rect(0, 0, viewRect.width, 740),
                "Vor vielen Wintern zerbrach das Reich Mastil in fuenf Gebiete. Jeder Turm sicherte eine Strasse, jedes Schloss schuetzte ein Volk, und jedes Tal hatte seinen eigenen Eid.\n\n" +
                "Jetzt ruecken fremde Banner durch die Grenzlande. Deine Aufgabe ist nicht nur schneller zu klicken, sondern gute Wege zu waehlen: Nachschub, Upgrades und Timing entscheiden den Krieg.\n\n" +
                "Die erste spielbare Unity-Fassung konzentriert sich auf das Gefecht: Tuerme besetzen, Burgen ausbauen, Truppen ueber verbundene Wege schicken und die KI zurueckdraengen.\n\n" +
                "Naechste Ausbaustufen: mehr Karten, echte Fraktionen, Boss-Festungen, Spezialfaehigkeiten und eine groessere Kampagne.",
                bodyStyle);
            GUI.EndScrollView();
        }

        private void DrawWorldMap(Rect canvas)
        {
            GUI.DrawTexture(canvas, mapTexture, ScaleMode.StretchToFill);
            DrawVignette(canvas);

            GUI.Label(new Rect(70, 46, 720, 76), "Weltkarte von Mastil", titleStyle);
            GUI.Label(new Rect(74, 128, 760, 44), "Waehle das Gebiet fuer dein naechstes Gefecht.", subtitleStyle);

            Rect map = new Rect(78, 202, canvas.width - 156, canvas.height - 290);
            DrawPanel(map, new Color(0.02f, 0.05f, 0.06f, 0.70f));
            DrawWorldPaths(map);

            for (int i = 0; i < regions.Count; i++)
            {
                Region region = regions[i];
                Vector2 p = RegionPosition(i, map);
                Rect node = new Rect(p.x - 90, p.y - 90, 180, 180);
                DrawRegionNode(node, region, i == chosenRegion);

                if (GUI.Button(node, GUIContent.none, GUIStyle.none))
                {
                    PlaySound(clickClip, 0.35f);
                    chosenRegion = i;
                }
            }

            Region selected = regions[chosenRegion];
            Rect details = new Rect(canvas.width - 530, canvas.height - 248, 450, 156);
            DrawPanel(details, new Color(0.01f, 0.03f, 0.04f, 0.86f));
            GUI.Label(new Rect(details.x + 24, details.y + 20, details.width - 48, 34), selected.Name, subtitleStyle);
            GUI.Label(new Rect(details.x + 24, details.y + 60, details.width - 48, 36), $"Wellen {selected.WavesFrom}-{selected.WavesTo}  |  Boss: {selected.Boss}", smallStyle);
            GUI.Label(new Rect(details.x + 24, details.y + 94, details.width - 48, 34), selected.Description, bodyStyle);

            if (GUI.Button(new Rect(78, canvas.height - 156, 250, 54), "Zurueck", ghostButtonStyle))
            {
                PlaySound(clickClip, 0.35f);
                mode = ScreenMode.MainMenu;
            }

            if (GUI.Button(new Rect(348, canvas.height - 156, 300, 54), "Gebiet spielen", buttonStyle))
            {
                PlaySound(clickClip, 0.55f);
                campaignBattle = true;
                mapChoice = Mathf.Clamp(chosenRegion / 2, 0, battleMaps.Count - 1);
                StartBattle();
            }
        }

        private void DrawSkirmishSetup(Rect canvas)
        {
            GUI.DrawTexture(canvas, mapTexture, ScaleMode.StretchToFill);
            DrawVignette(canvas);

            GUI.Label(new Rect(72, 46, 780, 76), "Gefecht gegen KI", titleStyle);
            GUI.Label(new Rect(78, 126, 860, 44), "Trainiere, fuehre Kriege und waehle die Karte vor dem Start.", subtitleStyle);

            Rect mapPanel = new Rect(78, 210, canvas.width - 156, 330);
            DrawPanel(mapPanel, new Color(0.02f, 0.05f, 0.06f, 0.78f));
            GUI.Label(new Rect(mapPanel.x + 28, mapPanel.y + 22, mapPanel.width - 56, 34), "Karte waehlen", subtitleStyle);

            float cardWidth = (mapPanel.width - 86) / Mathf.Max(1, battleMaps.Count);
            for (int i = 0; i < battleMaps.Count; i++)
            {
                BattleMap battleMap = battleMaps[i];
                Rect card = new Rect(mapPanel.x + 28 + i * (cardWidth + 14), mapPanel.y + 82, cardWidth, 210);
                DrawPanel(card, i == mapChoice ? new Color(0.12f, 0.27f, 0.23f, 0.90f) : new Color(0.05f, 0.09f, 0.10f, 0.82f));
                GUI.Label(new Rect(card.x + 18, card.y + 18, card.width - 36, 30), battleMap.Name, bodyStyle);
                GUI.Label(new Rect(card.x + 18, card.y + 56, card.width - 36, 24), $"Groesse: {battleMap.Size}", smallStyle);
                GUI.Label(new Rect(card.x + 18, card.y + 90, card.width - 36, 74), battleMap.Description, smallStyle);
                Color old = GUI.color;
                GUI.color = Color.Lerp(battleMap.GroundA, battleMap.GroundB, 0.45f);
                GUI.DrawTexture(new Rect(card.x + 18, card.y + 164, card.width - 36, 20), pixel);
                GUI.color = old;

                if (GUI.Button(card, GUIContent.none, GUIStyle.none))
                {
                    PlaySound(clickClip, 0.35f);
                    mapChoice = i;
                }
            }

            Rect settings = new Rect(78, 574, canvas.width - 156, 184);
            DrawPanel(settings, new Color(0.02f, 0.05f, 0.06f, 0.82f));
            GUI.Label(new Rect(settings.x + 28, settings.y + 18, 240, 32), "Kriegsregeln", subtitleStyle);
            GUI.Label(new Rect(settings.x + 28, settings.y + 70, 180, 26), "Schwierigkeit", bodyStyle);

            DrawDifficultyButton(new Rect(settings.x + 220, settings.y + 62, 150, 44), "Leicht", 0);
            DrawDifficultyButton(new Rect(settings.x + 386, settings.y + 62, 150, 44), "Normal", 1);
            DrawDifficultyButton(new Rect(settings.x + 552, settings.y + 62, 150, 44), "Schwer", 2);

            GUI.Label(new Rect(settings.x + 28, settings.y + 124, 180, 26), "Reichsfarbe", bodyStyle);
            DrawColorButton(new Rect(settings.x + 220, settings.y + 118, 78, 38), new Color(0.25f, 0.74f, 1.0f));
            DrawColorButton(new Rect(settings.x + 314, settings.y + 118, 78, 38), new Color(0.25f, 0.92f, 0.48f));
            DrawColorButton(new Rect(settings.x + 408, settings.y + 118, 78, 38), new Color(1.0f, 0.72f, 0.22f));
            DrawColorButton(new Rect(settings.x + 502, settings.y + 118, 78, 38), new Color(0.72f, 0.44f, 1.0f));

            if (GUI.Button(new Rect(canvas.width - 648, canvas.height - 96, 240, 54), "Zurueck", ghostButtonStyle))
            {
                PlaySound(clickClip, 0.35f);
                mode = ScreenMode.MainMenu;
            }

            if (GUI.Button(new Rect(canvas.width - 380, canvas.height - 96, 300, 54), "Gefecht starten", buttonStyle))
            {
                PlaySound(clickClip, 0.6f);
                campaignBattle = false;
                StartBattle();
            }
        }

        private void DrawBattle(Rect canvas)
        {
            Rect map = new Rect(24, 24, canvas.width - 408, canvas.height - 48);
            Rect side = new Rect(canvas.width - 360, 24, 336, canvas.height - 48);

            DrawBattleMap(map);
            DrawBattleSidebar(side);
            HandleBattleInput(map);
        }

        private void DrawBattleSidebar(Rect side)
        {
            DrawPanel(side, new Color(0.02f, 0.05f, 0.06f, 0.94f));
            GUI.Label(new Rect(side.x + 22, side.y + 20, side.width - 44, 44), "Gefecht", subtitleStyle);
            GUI.Label(new Rect(side.x + 22, side.y + 72, side.width - 44, 30), $"Gold: {Mathf.FloorToInt(gold)}", bodyStyle);
            GUI.Label(new Rect(side.x + 22, side.y + 108, side.width - 44, 30), $"Schwierigkeit: {DifficultyName()}", smallStyle);
            GUI.Label(new Rect(side.x + 22, side.y + 132, side.width - 44, 24), $"{currentMapName} | {(campaignBattle ? "Kampagne" : "Freies Gefecht")}", smallStyle);

            Rect status = new Rect(side.x + 22, side.y + 164, side.width - 44, 106);
            DrawPanel(status, new Color(0.06f, 0.10f, 0.10f, 0.72f));
            if (selectedTower != null)
            {
                GUI.Label(new Rect(status.x + 16, status.y + 14, status.width - 32, 26), selectedTower.Name, bodyStyle);
                GUI.Label(new Rect(status.x + 16, status.y + 44, status.width - 32, 24), $"{OwnerName(selectedTower.Owner)} | Stufe {selectedTower.Level} | {selectedTower.Units}/{selectedTower.MaxUnits}", smallStyle);
                GUI.Label(new Rect(status.x + 16, status.y + 70, status.width - 32, 24), selectedTower.Role, smallStyle);
            }
            else
            {
                GUI.Label(new Rect(status.x + 16, status.y + 18, status.width - 32, 60), "Waehle einen eigenen Turm oder ein Schloss.", bodyStyle);
            }

            bool canAttack = selectedTower != null && selectedTower.Owner == Faction.Player && selectedTower.Units >= 12;
            GUI.enabled = canAttack;
            if (GUI.Button(new Rect(side.x + 22, side.y + 292, side.width - 44, 48), "Angriff auf naechstes Ziel", buttonStyle))
            {
                if (selectedTower != null)
                {
                    Tower target = FindBestTarget(selectedTower, Faction.Player);
                    if (target != null)
                    {
                        SendUnits(selectedTower, target, Mathf.Max(8, selectedTower.Units / 2));
                    }
                }
            }
            GUI.enabled = true;

            bool canUpgrade = selectedTower != null && selectedTower.Owner == Faction.Player && gold >= UpgradeCost(selectedTower) && selectedTower.Level < 5;
            GUI.enabled = canUpgrade;
            string upgradeText = selectedTower == null ? "Upgrade" : $"Upgrade ({UpgradeCost(selectedTower)} Gold)";
            if (GUI.Button(new Rect(side.x + 22, side.y + 354, side.width - 44, 46), upgradeText, buttonStyle))
            {
                UpgradeSelectedTower();
            }
            GUI.enabled = true;

            bool canRally = selectedTower != null && selectedTower.Owner == Faction.Player && tacticCooldown <= 0f && gold >= 45;
            GUI.enabled = canRally;
            if (GUI.Button(new Rect(side.x + 22, side.y + 414, side.width - 44, 44), tacticCooldown <= 0f ? "Banner sammeln (45 Gold)" : $"Banner bereit in {Mathf.CeilToInt(tacticCooldown)}s", ghostButtonStyle))
            {
                RallySelectedTower();
            }
            GUI.enabled = true;

            bool canFortify = selectedTower != null && selectedTower.Owner == Faction.Player && gold >= 35 && selectedTower.Units < selectedTower.MaxUnits;
            GUI.enabled = canFortify;
            if (GUI.Button(new Rect(side.x + 22, side.y + 470, side.width - 44, 44), "Festung versorgen (35 Gold)", ghostButtonStyle))
            {
                FortifySelectedTower();
            }
            GUI.enabled = true;

            if (GUI.Button(new Rect(side.x + 22, side.y + 534, side.width - 44, 42), "Weltkarte", ghostButtonStyle))
            {
                PlaySound(clickClip, 0.35f);
                mode = ScreenMode.WorldMap;
            }

            if (GUI.Button(new Rect(side.x + 22, side.y + 588, side.width - 44, 42), "Neues Gefecht", ghostButtonStyle))
            {
                PlaySound(clickClip, 0.35f);
                StartBattle();
            }

            Rect help = new Rect(side.x + 22, side.y + side.height - 196, side.width - 44, 156);
            DrawPanel(help, new Color(0.05f, 0.08f, 0.09f, 0.74f));
            GUI.Label(new Rect(help.x + 16, help.y + 14, help.width - 32, 32), "Spielregeln", bodyStyle);
            GUI.Label(new Rect(help.x + 16, help.y + 50, help.width - 32, 86),
                "Eigene Tuerme erzeugen Gold und Soldaten. Angriffe laufen nur ueber Wege. Banner sammeln ruft Reserve, Versorgung fuellt wichtige Burgen auf.",
                smallStyle);

            if (!string.IsNullOrEmpty(battleMessage))
            {
                GUI.Label(new Rect(side.x + 22, side.y + side.height - 34, side.width - 44, 26), battleMessage, dangerStyle);
            }
        }

        private void DrawOptions(Rect canvas)
        {
            GUI.DrawTexture(canvas, menuTexture, ScaleMode.StretchToFill);
            DrawVignette(canvas);

            Rect panel = new Rect(canvas.width * 0.5f - 360, 98, 720, 610);
            DrawPanel(panel, new Color(0.02f, 0.05f, 0.06f, 0.88f));
            GUI.Label(new Rect(panel.x + 34, panel.y + 28, panel.width - 68, 48), "Einstellungen", subtitleStyle);
            GUI.Label(new Rect(panel.x + 34, panel.y + 92, panel.width - 68, 40), "Schwierigkeit", bodyStyle);

            if (GUI.Button(new Rect(panel.x + 34, panel.y + 142, 200, 48), "Leicht", difficulty == 0 ? buttonStyle : ghostButtonStyle))
            {
                difficulty = 0;
            }

            if (GUI.Button(new Rect(panel.x + 258, panel.y + 142, 200, 48), "Normal", difficulty == 1 ? buttonStyle : ghostButtonStyle))
            {
                difficulty = 1;
            }

            if (GUI.Button(new Rect(panel.x + 482, panel.y + 142, 200, 48), "Schwer", difficulty == 2 ? buttonStyle : ghostButtonStyle))
            {
                difficulty = 2;
            }

            GUI.Label(new Rect(panel.x + 34, panel.y + 232, panel.width - 68, 40), "Deine Reichsfarbe", bodyStyle);
            DrawColorButton(new Rect(panel.x + 34, panel.y + 282, 110, 54), new Color(0.25f, 0.74f, 1.0f));
            DrawColorButton(new Rect(panel.x + 158, panel.y + 282, 110, 54), new Color(0.25f, 0.92f, 0.48f));
            DrawColorButton(new Rect(panel.x + 282, panel.y + 282, 110, 54), new Color(1.0f, 0.72f, 0.22f));
            DrawColorButton(new Rect(panel.x + 406, panel.y + 282, 110, 54), new Color(0.72f, 0.44f, 1.0f));

            showGrid = GUI.Toggle(new Rect(panel.x + 34, panel.y + 384, 320, 34), showGrid, "Kartenlinien anzeigen", bodyStyle);

            GUI.Label(new Rect(panel.x + 34, panel.y + 436, panel.width - 68, 72),
                "Diese Einstellungen wirken direkt auf das naechste Gefecht. Spaeter kommen mehr Karten, Fraktionen und Spezialfaehigkeiten dazu.",
                bodyStyle);

            if (GUI.Button(new Rect(panel.x + 34, panel.y + panel.height - 84, 230, 50), "Zurueck", ghostButtonStyle))
            {
                mode = ScreenMode.MainMenu;
            }
        }

        private void DrawResult(Rect canvas)
        {
            GUI.DrawTexture(canvas, mapTexture, ScaleMode.StretchToFill);
            DrawVignette(canvas);
            Rect panel = new Rect(canvas.width * 0.5f - 360, canvas.height * 0.5f - 210, 720, 420);
            DrawPanel(panel, new Color(0.02f, 0.05f, 0.06f, 0.90f));
            GUI.Label(new Rect(panel.x + 36, panel.y + 34, panel.width - 72, 58), resultTitle, titleStyle);
            GUI.Label(new Rect(panel.x + 40, panel.y + 126, panel.width - 80, 96), resultText, bodyStyle);

            if (GUI.Button(new Rect(panel.x + 42, panel.y + panel.height - 110, 260, 52), "Noch ein Gefecht", buttonStyle))
            {
                StartBattle();
            }

            if (GUI.Button(new Rect(panel.x + 322, panel.y + panel.height - 110, 220, 52), "Weltkarte", ghostButtonStyle))
            {
                mode = ScreenMode.WorldMap;
            }
        }

        private void DrawBattleMap(Rect map)
        {
            GUI.DrawTexture(map, battleTexture, ScaleMode.StretchToFill);

            if (showGrid)
            {
                Color old = GUI.color;
                GUI.color = new Color(1f, 1f, 1f, 0.07f);
                for (int i = 1; i < 8; i++)
                {
                    float x = map.x + map.width * i / 8f;
                    GUI.DrawTexture(new Rect(x, map.y, 1, map.height), pixel);
                }

                for (int i = 1; i < 5; i++)
                {
                    float y = map.y + map.height * i / 5f;
                    GUI.DrawTexture(new Rect(map.x, y, map.width, 1), pixel);
                }

                GUI.color = old;
            }

            DrawLandscape(map);

            foreach (Road road in roads)
            {
                Tower a = towers[road.A];
                Tower b = towers[road.B];
                DrawRoad(WorldToScreen(a.Position, map), WorldToScreen(b.Position, map));
            }

            foreach (UnitGroup group in units)
            {
                DrawUnitGroup(group, map);
            }

            foreach (Tower tower in towers)
            {
                DrawTower(tower, map);
            }

            foreach (FloatingText text in floatingTexts)
            {
                DrawFloatingText(text, map);
            }
        }

        private void HandleBattleInput(Rect map)
        {
            Event current = Event.current;
            if (current.type != EventType.MouseDown || current.button != 0 || !map.Contains(current.mousePosition))
            {
                return;
            }

            Tower clicked = FindTowerAt(current.mousePosition, map);
            if (clicked == null)
            {
                return;
            }

            if (clicked.Owner == Faction.Player)
            {
                selectedTower = clicked;
                battleMessage = $"{clicked.Name} ausgewaehlt.";
                PlaySound(clickClip, 0.25f);
                current.Use();
                return;
            }

            if (selectedTower != null && selectedTower.Owner == Faction.Player)
            {
                if (CanAttack(selectedTower, clicked))
                {
                    SendUnits(selectedTower, clicked, Mathf.Max(8, selectedTower.Units / 2));
                }
                else
                {
                    battleMessage = "Dieses Ziel ist nicht direkt verbunden.";
                    PlaySound(clickClip, 0.18f);
                }

                current.Use();
            }
        }

        private void StartBattle()
        {
            towers.Clear();
            roads.Clear();
            units.Clear();
            floatingTexts.Clear();
            selectedTower = null;
            BattleMap battleMap = battleMaps[Mathf.Clamp(mapChoice, 0, battleMaps.Count - 1)];
            currentMapName = battleMap.Name;
            battleTexture = MakeBattleTexture(1280, 720);
            gold = Mathf.RoundToInt(110 * battleMap.GoldMultiplier);
            aiTimer = 3.0f;
            tacticCooldown = 0f;
            battleMessage = "Erobere die verbundenen Tuerme.";

            float enemyBoost = difficulty * 0.15f;
            AddTower("Koenigsburg", Faction.Player, new Vector2(0.12f, 0.55f), 2, 42, true, "Startschloss");
            AddTower("Westwacht", Faction.Player, new Vector2(0.24f, 0.36f), 1, 24, false, "Bogenturm");
            AddTower("Muehlenpass", Faction.Neutral, new Vector2(0.35f, 0.65f), 1, 22, false, "Passwacht");
            AddTower("Steinbruecke", Faction.Neutral, new Vector2(0.48f, 0.46f), 1, 28, false, "Brueckenturm");
            AddTower("Nordturm", Faction.Neutral, new Vector2(0.60f, 0.74f), 2, 34, false, "Signalfeuer");
            AddTower("Rotwacht", Faction.Enemy, new Vector2(0.70f, 0.35f), 2, Mathf.RoundToInt(34 * (1f + enemyBoost)), false, "Belagerungsturm");
            AddTower("Dunkelburg", Faction.Enemy, new Vector2(0.82f, 0.58f), 3, Mathf.RoundToInt(54 * (1f + enemyBoost)), true, "Feindschloss");

            if (battleMap.ExtraNeutral >= 1)
            {
                Tower southGate = AddTower("Suedtor", Faction.Neutral, new Vector2(0.45f, 0.24f), 1, 24, false, "Handelsturm");
                Link(1, southGate.Id);
                Link(southGate.Id, 3);
                Link(southGate.Id, 5);
            }

            if (battleMap.ExtraNeutral >= 2)
            {
                Tower highWatch = AddTower("Hochwacht", Faction.Neutral, new Vector2(0.54f, 0.86f), 2, 38, false, "Bergwacht");
                Link(2, highWatch.Id);
                Link(highWatch.Id, 4);
                Link(highWatch.Id, 6);
            }

            if (battleMap.ExtraEnemy >= 1)
            {
                Tower ashFort = AddTower("Aschenfort", Faction.Enemy, new Vector2(0.90f, 0.28f), 2, Mathf.RoundToInt(42 * (1f + enemyBoost)), true, "Vorburg");
                Link(5, ashFort.Id);
                Link(6, ashFort.Id);
            }

            if (battleMap.ExtraEnemy >= 2)
            {
                Tower kingWall = AddTower("Koenigswall", Faction.Enemy, new Vector2(0.92f, 0.74f), 4, Mathf.RoundToInt(66 * (1f + enemyBoost)), true, "Bosswall");
                Link(6, kingWall.Id);
                Link(4, kingWall.Id);
            }

            Link(0, 1);
            Link(0, 2);
            Link(1, 3);
            Link(2, 3);
            Link(2, 4);
            Link(3, 5);
            Link(4, 6);
            Link(5, 6);
            Link(3, 6);

            selectedTower = towers[0];
            PlaySound(clickClip, 0.45f);
            AddFloatingText("Krieg beginnt", selectedTower.Position, new Color(1f, 0.84f, 0.42f));
            mode = ScreenMode.Battle;
        }

        private Tower AddTower(string name, Faction owner, Vector2 position, int level, int unitsCount, bool castle, string role)
        {
            int maxUnits = castle ? 70 + level * 18 : 42 + level * 12;
            Tower tower = new Tower
            {
                Id = towers.Count,
                Name = name,
                Owner = owner,
                Position = position,
                Level = level,
                Units = Mathf.Min(unitsCount, maxUnits),
                MaxUnits = maxUnits,
                Castle = castle,
                Role = role
            };
            towers.Add(tower);
            return tower;
        }

        private void Link(int a, int b)
        {
            roads.Add(new Road { A = a, B = b });
        }

        private void UpdateEconomy(float dt)
        {
            float goldGain = 0f;
            foreach (Tower tower in towers)
            {
                if (tower.Owner == Faction.Player)
                {
                    goldGain += (0.38f + tower.Level * 0.11f + (tower.Castle ? 0.16f : 0f)) * dt;
                }

                if (tower.Owner != Faction.Neutral)
                {
                    float production = (1.8f + tower.Level * 0.54f + (tower.Castle ? 0.7f : 0f)) * dt;
                    if (tower.Owner == Faction.Enemy)
                    {
                        production *= 0.88f + difficulty * 0.22f;
                    }

                    tower.Training += production;
                    int ready = Mathf.FloorToInt(tower.Training);
                    if (ready > 0)
                    {
                        tower.Training -= ready;
                        tower.Units = Mathf.Min(tower.MaxUnits, tower.Units + ready);
                    }
                }
            }

            gold += goldGain;
        }

        private void UpdateUnits(float dt)
        {
            for (int i = units.Count - 1; i >= 0; i--)
            {
                UnitGroup group = units[i];
                Tower from = towers[group.FromId];
                Tower target = towers[group.TargetId];
                float distance = Vector2.Distance(from.Position, target.Position);
                float speed = 0.20f + (group.Owner == Faction.Player ? 0.02f : 0f);
                group.Progress += dt * speed / Mathf.Max(0.08f, distance);
                group.Position = Vector2.Lerp(from.Position, target.Position, group.Progress);

                if (group.Progress >= 1f)
                {
                    ResolveArrival(group, target);
                    units.RemoveAt(i);
                }
            }
        }

        private void ResolveArrival(UnitGroup group, Tower target)
        {
            if (target.Owner == group.Owner)
            {
                target.Units = Mathf.Min(target.MaxUnits, target.Units + group.Amount);
                return;
            }

            target.Units -= group.Amount;
            if (target.Units < 0)
            {
                target.Owner = group.Owner;
                target.Units = Mathf.Min(target.MaxUnits, Mathf.Abs(target.Units) + 4);
                battleMessage = group.Owner == Faction.Player ? $"{target.Name} erobert." : $"{target.Name} verloren.";
                AddFloatingText(group.Owner == Faction.Player ? "Erobert" : "Verloren", target.Position, OwnerColor(group.Owner));
                PlaySound(captureClip, group.Owner == Faction.Player ? 0.65f : 0.45f);
                if (group.Owner == Faction.Player)
                {
                    selectedTower = target;
                }
            }
        }

        private void UpdateAi(float dt)
        {
            aiTimer -= dt;
            if (aiTimer > 0f)
            {
                return;
            }

            aiTimer = Mathf.Lerp(5.4f, 2.8f, difficulty / 2f) + UnityEngine.Random.Range(0.0f, 1.4f);
            List<Tower> candidates = towers.Where(t => t.Owner == Faction.Enemy && t.Units > Mathf.Max(18, t.MaxUnits * 0.48f)).ToList();
            if (candidates.Count == 0)
            {
                return;
            }

            Tower source = candidates.OrderByDescending(t => t.Units).First();
            Tower target = FindBestTarget(source, Faction.Enemy);
            if (target != null)
            {
                SendUnits(source, target, Mathf.Max(9, Mathf.FloorToInt(source.Units * (0.40f + difficulty * 0.08f))));
            }
        }

        private Tower FindBestTarget(Tower source, Faction owner)
        {
            IEnumerable<Tower> connected = ConnectedTowers(source).Where(t => t.Owner != owner);
            if (!connected.Any())
            {
                connected = towers.Where(t => t.Owner != owner);
            }

            return connected
                .OrderBy(t => t.Owner == Faction.Neutral ? 0 : 1)
                .ThenBy(t => t.Units)
                .ThenBy(t => Vector2.Distance(source.Position, t.Position))
                .FirstOrDefault();
        }

        private IEnumerable<Tower> ConnectedTowers(Tower source)
        {
            foreach (Road road in roads)
            {
                if (road.A == source.Id)
                {
                    yield return towers[road.B];
                }
                else if (road.B == source.Id)
                {
                    yield return towers[road.A];
                }
            }
        }

        private bool CanAttack(Tower source, Tower target)
        {
            return roads.Any(r => (r.A == source.Id && r.B == target.Id) || (r.B == source.Id && r.A == target.Id));
        }

        private void SendUnits(Tower source, Tower target, int amount)
        {
            if (source.Owner == Faction.Neutral || source.Units < 8 || source.Id == target.Id)
            {
                return;
            }

            if (!CanAttack(source, target))
            {
                return;
            }

            int sent = Mathf.Clamp(amount, 6, Mathf.Max(6, source.Units - 4));
            source.Units -= sent;
            units.Add(new UnitGroup
            {
                Owner = source.Owner,
                FromId = source.Id,
                TargetId = target.Id,
                Amount = sent,
                Position = source.Position,
                Progress = 0f
            });

            battleMessage = source.Owner == Faction.Player ? $"{sent} Soldaten marschieren." : "Der Feind rueckt vor.";
            AddFloatingText($"-{sent}", source.Position, OwnerColor(source.Owner));
            PlaySound(source.Owner == Faction.Player ? attackClip : clickClip, source.Owner == Faction.Player ? 0.55f : 0.22f);
        }

        private void UpgradeSelectedTower()
        {
            if (selectedTower == null || selectedTower.Owner != Faction.Player || selectedTower.Level >= 5)
            {
                return;
            }

            int cost = UpgradeCost(selectedTower);
            if (gold < cost)
            {
                return;
            }

            gold -= cost;
            selectedTower.Level++;
            selectedTower.MaxUnits += selectedTower.Castle ? 24 : 16;
            selectedTower.Units = Mathf.Min(selectedTower.MaxUnits, selectedTower.Units + 12);
            if (selectedTower.Level >= 4)
            {
                selectedTower.Castle = true;
                selectedTower.Role = "Ausgebaute Festung";
            }

            battleMessage = $"{selectedTower.Name} wurde ausgebaut.";
            AddFloatingText("Upgrade", selectedTower.Position, new Color(1f, 0.82f, 0.35f));
            PlaySound(upgradeClip, 0.65f);
        }

        private void RallySelectedTower()
        {
            if (selectedTower == null || selectedTower.Owner != Faction.Player || gold < 45 || tacticCooldown > 0f)
            {
                return;
            }

            gold -= 45;
            tacticCooldown = 18f;
            int reserve = 18 + selectedTower.Level * 5 + (selectedTower.Castle ? 8 : 0);
            selectedTower.Units = Mathf.Min(selectedTower.MaxUnits, selectedTower.Units + reserve);
            battleMessage = $"Reserve sammelt sich bei {selectedTower.Name}.";
            AddFloatingText($"+{reserve} Reserve", selectedTower.Position, new Color(0.75f, 1f, 0.72f));
            PlaySound(captureClip, 0.45f);
        }

        private void FortifySelectedTower()
        {
            if (selectedTower == null || selectedTower.Owner != Faction.Player || gold < 35)
            {
                return;
            }

            int missing = selectedTower.MaxUnits - selectedTower.Units;
            if (missing <= 0)
            {
                return;
            }

            gold -= 35;
            int supply = Mathf.Min(missing, 14 + selectedTower.Level * 4);
            selectedTower.Units += supply;
            battleMessage = $"{selectedTower.Name} wird versorgt.";
            AddFloatingText($"+{supply}", selectedTower.Position, new Color(0.68f, 0.90f, 1f));
            PlaySound(upgradeClip, 0.35f);
        }

        private int UpgradeCost(Tower tower)
        {
            if (tower == null)
            {
                return 0;
            }

            return 70 + tower.Level * 45 + (tower.Castle ? 30 : 0);
        }

        private void CheckBattleEnd()
        {
            bool playerAlive = towers.Any(t => t.Owner == Faction.Player) || units.Any(u => u.Owner == Faction.Player);
            bool enemyAlive = towers.Any(t => t.Owner == Faction.Enemy) || units.Any(u => u.Owner == Faction.Enemy);

            if (!playerAlive)
            {
                resultTitle = "Niederlage";
                resultText = "Dein letztes Banner ist gefallen. Verstaerke frueh deine Wege und greife nicht zu tief in feindliches Gebiet an.";
                PlaySound(loseClip, 0.70f);
                mode = ScreenMode.Result;
            }
            else if (!enemyAlive)
            {
                resultTitle = "Sieg";
                resultText = "Mastil haelt stand. Du hast die feindlichen Burgen erobert und die Strassen wieder verbunden.";
                PlaySound(winClip, 0.78f);
                mode = ScreenMode.Result;
            }
        }

        private void CreateRegions()
        {
            regions.Clear();
            regions.Add(new Region
            {
                Name = "Startgebiet",
                Description = "Gruene Felder, erste Wachposten und sichere Wege.",
                Boss = "Hauptmann Arven",
                Difficulty = "Leicht",
                WavesFrom = 1,
                WavesTo = 5,
                ColorA = new Color(0.19f, 0.48f, 0.33f),
                ColorB = new Color(0.65f, 0.78f, 0.43f),
                Unlocked = true
            });
            regions.Add(new Region
            {
                Name = "Grenzlande",
                Description = "Engpaesse und lange Nachschubwege.",
                Boss = "Der Eisenreiter",
                Difficulty = "Normal",
                WavesFrom = 6,
                WavesTo = 10,
                ColorA = new Color(0.44f, 0.43f, 0.32f),
                ColorB = new Color(0.72f, 0.61f, 0.35f),
                Unlocked = true
            });
            regions.Add(new Region
            {
                Name = "Wuestenreich",
                Description = "Offene Flaechen, schnelle Ueberfaelle.",
                Boss = "Sahra die Glut",
                Difficulty = "Normal",
                WavesFrom = 11,
                WavesTo = 15,
                ColorA = new Color(0.56f, 0.37f, 0.20f),
                ColorB = new Color(0.86f, 0.65f, 0.33f),
                Unlocked = true
            });
            regions.Add(new Region
            {
                Name = "Nachtfestung",
                Description = "Starke Gegner, kurze Reaktionszeiten.",
                Boss = "Morak Nachtkrone",
                Difficulty = "Schwer",
                WavesFrom = 16,
                WavesTo = 20,
                ColorA = new Color(0.12f, 0.17f, 0.28f),
                ColorB = new Color(0.36f, 0.44f, 0.62f),
                Unlocked = true
            });
            regions.Add(new Region
            {
                Name = "Endboss-Zitadelle",
                Description = "Der letzte Wall des feindlichen Reiches.",
                Boss = "Koenig Veyr",
                Difficulty = "Boss",
                WavesFrom = 21,
                WavesTo = 25,
                ColorA = new Color(0.30f, 0.08f, 0.10f),
                ColorB = new Color(0.72f, 0.25f, 0.18f),
                Unlocked = true
            });
        }

        private void CreateBattleMaps()
        {
            battleMaps.Clear();
            battleMaps.Add(new BattleMap
            {
                Name = "Tal der Kronen",
                Size = "Klein",
                Description = "Schneller Einstieg mit klaren Wegen und wenig Fronten.",
                ExtraNeutral = 0,
                ExtraEnemy = 0,
                GoldMultiplier = 1.0f,
                GroundA = new Color(0.14f, 0.31f, 0.22f),
                GroundB = new Color(0.45f, 0.50f, 0.27f),
                WaterColor = new Color(0.10f, 0.23f, 0.32f, 0.42f)
            });
            battleMaps.Add(new BattleMap
            {
                Name = "Brueckenbruch",
                Size = "Mittel",
                Description = "Mehr Wege, ein Suedtor und gefaehrliche Flanken.",
                ExtraNeutral = 1,
                ExtraEnemy = 1,
                GoldMultiplier = 1.15f,
                GroundA = new Color(0.20f, 0.27f, 0.24f),
                GroundB = new Color(0.50f, 0.43f, 0.25f),
                WaterColor = new Color(0.08f, 0.25f, 0.35f, 0.55f)
            });
            battleMaps.Add(new BattleMap
            {
                Name = "Koenigswall",
                Size = "Gross",
                Description = "Viele Tuerme, zwei feindliche Burgen und ein langer Krieg.",
                ExtraNeutral = 2,
                ExtraEnemy = 2,
                GoldMultiplier = 1.30f,
                GroundA = new Color(0.12f, 0.18f, 0.24f),
                GroundB = new Color(0.38f, 0.32f, 0.24f),
                WaterColor = new Color(0.07f, 0.12f, 0.18f, 0.48f)
            });
        }

        private void CreateAudio()
        {
            audioSource = gameObject.AddComponent<AudioSource>();
            audioSource.playOnAwake = false;
            audioSource.volume = 0.75f;
            clickClip = CreateToneClip("mastil-click", 520f, 0.06f, 0.22f);
            attackClip = CreateToneClip("mastil-attack", 180f, 0.18f, 0.40f);
            upgradeClip = CreateToneClip("mastil-upgrade", 680f, 0.24f, 0.36f);
            captureClip = CreateToneClip("mastil-capture", 390f, 0.34f, 0.42f);
            winClip = CreateChordClip("mastil-victory", new[] { 392f, 494f, 587f }, 0.55f, 0.40f);
            loseClip = CreateChordClip("mastil-defeat", new[] { 220f, 185f, 147f }, 0.65f, 0.36f);
        }

        private AudioClip CreateToneClip(string name, float frequency, float duration, float volume)
        {
            const int sampleRate = 44100;
            int samples = Mathf.CeilToInt(sampleRate * duration);
            float[] data = new float[samples];
            for (int i = 0; i < samples; i++)
            {
                float t = i / (float)sampleRate;
                float envelope = Mathf.Sin(Mathf.Clamp01(i / (float)samples) * Mathf.PI);
                float wave = Mathf.Sin(2f * Mathf.PI * frequency * t) * 0.70f;
                wave += Mathf.Sin(2f * Mathf.PI * frequency * 1.5f * t) * 0.22f;
                data[i] = wave * envelope * volume;
            }

            AudioClip clip = AudioClip.Create(name, samples, 1, sampleRate, false);
            clip.SetData(data, 0);
            return clip;
        }

        private AudioClip CreateChordClip(string name, float[] frequencies, float duration, float volume)
        {
            const int sampleRate = 44100;
            int samples = Mathf.CeilToInt(sampleRate * duration);
            float[] data = new float[samples];
            for (int i = 0; i < samples; i++)
            {
                float t = i / (float)sampleRate;
                float envelope = Mathf.Sin(Mathf.Clamp01(i / (float)samples) * Mathf.PI);
                float sum = 0f;
                foreach (float frequency in frequencies)
                {
                    sum += Mathf.Sin(2f * Mathf.PI * frequency * t);
                }

                data[i] = sum / Mathf.Max(1, frequencies.Length) * envelope * volume;
            }

            AudioClip clip = AudioClip.Create(name, samples, 1, sampleRate, false);
            clip.SetData(data, 0);
            return clip;
        }

        private void PlaySound(AudioClip clip, float volume)
        {
            if (audioSource != null && clip != null)
            {
                audioSource.PlayOneShot(clip, volume);
            }
        }

        private void AddFloatingText(string text, Vector2 position, Color color)
        {
            floatingTexts.Add(new FloatingText
            {
                Text = text,
                Position = position,
                Color = color,
                Age = 0f
            });
        }

        private void UpdateFloatingTexts(float dt)
        {
            for (int i = floatingTexts.Count - 1; i >= 0; i--)
            {
                floatingTexts[i].Age += dt;
                if (floatingTexts[i].Age >= floatingTexts[i].Lifetime)
                {
                    floatingTexts.RemoveAt(i);
                }
            }
        }

        private void CreateTextures()
        {
            pixel = MakeTexture(1, 1, (x, y) => Color.white);
            panelTexture = MakeTexture(16, 16, (x, y) => new Color(0.02f, 0.04f, 0.045f, 0.95f));
            selectedTexture = MakeTexture(8, 8, (x, y) => new Color(1.0f, 0.83f, 0.34f, 1f));
            menuTexture = MakeGradient(1280, 720, new Color(0.02f, 0.06f, 0.07f), new Color(0.11f, 0.17f, 0.16f), true);
            mapTexture = MakeWorldTexture(1280, 720);
            battleTexture = MakeBattleTexture(1280, 720);
            brandIcon = Resources.Load<Texture2D>("mastil-icon");
        }

        private void CreateStyles()
        {
            titleStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 68,
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(0.96f, 0.91f, 0.74f) },
                wordWrap = true
            };
            subtitleStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 28,
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(0.92f, 0.93f, 0.86f) },
                wordWrap = true
            };
            bodyStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 20,
                normal = { textColor = new Color(0.83f, 0.88f, 0.82f) },
                wordWrap = true
            };
            smallStyle = new GUIStyle(GUI.skin.label)
            {
                fontSize = 16,
                normal = { textColor = new Color(0.70f, 0.78f, 0.72f) },
                wordWrap = true
            };
            dangerStyle = new GUIStyle(smallStyle)
            {
                normal = { textColor = new Color(1f, 0.76f, 0.42f) },
                alignment = TextAnchor.MiddleCenter
            };
            buttonStyle = new GUIStyle(GUI.skin.button)
            {
                fontSize = 20,
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white, background = MakeButtonTexture(new Color(0.08f, 0.42f, 0.38f), new Color(0.18f, 0.66f, 0.52f)) },
                hover = { textColor = Color.white, background = MakeButtonTexture(new Color(0.12f, 0.50f, 0.44f), new Color(0.26f, 0.75f, 0.60f)) },
                active = { textColor = Color.white, background = MakeButtonTexture(new Color(0.05f, 0.28f, 0.28f), new Color(0.16f, 0.54f, 0.46f)) },
                alignment = TextAnchor.MiddleCenter,
                padding = new RectOffset(14, 14, 8, 8)
            };
            ghostButtonStyle = new GUIStyle(buttonStyle)
            {
                normal = { textColor = new Color(0.92f, 0.96f, 0.90f), background = MakeButtonTexture(new Color(0.04f, 0.08f, 0.09f), new Color(0.08f, 0.13f, 0.14f)) },
                hover = { textColor = Color.white, background = MakeButtonTexture(new Color(0.07f, 0.14f, 0.15f), new Color(0.11f, 0.20f, 0.20f)) }
            };
            panelStyle = new GUIStyle(GUI.skin.box)
            {
                normal = { background = panelTexture },
                border = new RectOffset(8, 8, 8, 8),
                padding = new RectOffset(16, 16, 16, 16)
            };
        }

        private void DrawColorButton(Rect rect, Color color)
        {
            Color old = GUI.color;
            GUI.color = color;
            GUI.DrawTexture(rect, pixel);
            GUI.color = old;

            if (NearlySame(color, playerColor))
            {
                GUI.color = Color.white;
                DrawLine(new Vector2(rect.x, rect.y), new Vector2(rect.xMax, rect.y), 4, selectedTexture);
                DrawLine(new Vector2(rect.x, rect.yMax), new Vector2(rect.xMax, rect.yMax), 4, selectedTexture);
                DrawLine(new Vector2(rect.x, rect.y), new Vector2(rect.x, rect.yMax), 4, selectedTexture);
                DrawLine(new Vector2(rect.xMax, rect.y), new Vector2(rect.xMax, rect.yMax), 4, selectedTexture);
                GUI.color = old;
            }

            if (GUI.Button(rect, GUIContent.none, GUIStyle.none))
            {
                PlaySound(clickClip, 0.30f);
                playerColor = color;
            }
        }

        private void DrawDifficultyButton(Rect rect, string label, int value)
        {
            if (GUI.Button(rect, label, difficulty == value ? buttonStyle : ghostButtonStyle))
            {
                PlaySound(clickClip, 0.35f);
                difficulty = value;
            }
        }

        private bool NearlySame(Color a, Color b)
        {
            return Mathf.Abs(a.r - b.r) + Mathf.Abs(a.g - b.g) + Mathf.Abs(a.b - b.b) < 0.05f;
        }

        private void DrawPanel(Rect rect, Color color)
        {
            Color old = GUI.color;
            GUI.color = color;
            GUI.Box(rect, GUIContent.none, panelStyle);
            GUI.color = old;
        }

        private void DrawVignette(Rect canvas)
        {
            Color old = GUI.color;
            GUI.color = new Color(0f, 0f, 0f, 0.22f);
            GUI.DrawTexture(new Rect(0, 0, canvas.width, 80), pixel);
            GUI.DrawTexture(new Rect(0, canvas.height - 100, canvas.width, 100), pixel);
            GUI.DrawTexture(new Rect(0, 0, 80, canvas.height), pixel);
            GUI.DrawTexture(new Rect(canvas.width - 80, 0, 80, canvas.height), pixel);
            GUI.color = old;
        }

        private void DrawLandscape(Rect map)
        {
            Color old = GUI.color;
            GUI.color = new Color(0.18f, 0.34f, 0.25f, 0.34f);
            GUI.DrawTexture(new Rect(map.x + map.width * 0.14f, map.y + map.height * 0.18f, map.width * 0.24f, map.height * 0.12f), pixel);
            GUI.DrawTexture(new Rect(map.x + map.width * 0.57f, map.y + map.height * 0.69f, map.width * 0.23f, map.height * 0.10f), pixel);
            GUI.color = new Color(0.10f, 0.23f, 0.32f, 0.42f);
            DrawLine(new Vector2(map.x + map.width * 0.07f, map.y + map.height * 0.82f), new Vector2(map.x + map.width * 0.91f, map.y + map.height * 0.14f), 18, pixel);
            GUI.color = old;
        }

        private void DrawWorldPaths(Rect map)
        {
            for (int i = 0; i < regions.Count - 1; i++)
            {
                DrawRoad(RegionPosition(i, map), RegionPosition(i + 1, map));
            }
        }

        private void DrawRegionNode(Rect rect, Region region, bool selected)
        {
            Texture2D nodeTex = GetRegionTexture(region, selected);
            GUI.DrawTexture(rect, nodeTex, ScaleMode.StretchToFill);
            GUI.Label(new Rect(rect.x + 14, rect.y + 50, rect.width - 28, 44), region.Name, new GUIStyle(bodyStyle)
            {
                alignment = TextAnchor.MiddleCenter,
                fontStyle = FontStyle.Bold
            });
            GUI.Label(new Rect(rect.x + 18, rect.y + 100, rect.width - 36, 28), region.Difficulty, new GUIStyle(smallStyle)
            {
                alignment = TextAnchor.MiddleCenter
            });
        }

        private Vector2 RegionPosition(int index, Rect map)
        {
            float[] xs = { 0.12f, 0.32f, 0.52f, 0.72f, 0.88f };
            float[] ys = { 0.66f, 0.42f, 0.58f, 0.34f, 0.58f };
            return new Vector2(map.x + map.width * xs[index], map.y + map.height * ys[index]);
        }

        private void DrawTower(Tower tower, Rect map)
        {
            Vector2 pos = WorldToScreen(tower.Position, map);
            float size = tower.Castle ? 94 : 72;
            Rect icon = new Rect(pos.x - size * 0.5f, pos.y - size * 0.58f, size, size);

            if (selectedTower == tower)
            {
                Color old = GUI.color;
                GUI.color = new Color(1f, 0.85f, 0.26f, 0.65f + Mathf.Sin(pulse * 5f) * 0.14f);
                GUI.DrawTexture(new Rect(icon.x - 7, icon.y - 7, icon.width + 14, icon.height + 14), selectedTexture);
                GUI.color = old;
            }

            GUI.DrawTexture(icon, GetTowerTexture(tower), ScaleMode.StretchToFill);

            Rect label = new Rect(pos.x - 78, icon.yMax + 2, 156, 42);
            GUI.Label(label, $"{tower.Name}\n{tower.Units}/{tower.MaxUnits}", new GUIStyle(smallStyle)
            {
                alignment = TextAnchor.UpperCenter,
                fontStyle = FontStyle.Bold,
                normal = { textColor = OwnerColor(tower.Owner) }
            });
        }

        private void DrawUnitGroup(UnitGroup group, Rect map)
        {
            Vector2 pos = WorldToScreen(group.Position, map);
            Color old = GUI.color;
            GUI.color = OwnerColor(group.Owner);
            GUI.DrawTexture(new Rect(pos.x - 11, pos.y - 11, 22, 22), pixel);
            GUI.color = old;
            GUI.Label(new Rect(pos.x - 24, pos.y - 38, 48, 24), group.Amount.ToString(), new GUIStyle(smallStyle)
            {
                alignment = TextAnchor.MiddleCenter,
                fontStyle = FontStyle.Bold,
                normal = { textColor = Color.white }
            });
        }

        private void DrawFloatingText(FloatingText text, Rect map)
        {
            float t = Mathf.Clamp01(text.Age / text.Lifetime);
            Vector2 pos = WorldToScreen(text.Position, map);
            pos.y -= 40f + t * 42f;
            Color color = text.Color;
            color.a = 1f - t;

            GUI.Label(new Rect(pos.x - 84, pos.y - 18, 168, 36), text.Text, new GUIStyle(bodyStyle)
            {
                alignment = TextAnchor.MiddleCenter,
                fontStyle = FontStyle.Bold,
                normal = { textColor = color }
            });
        }

        private void DrawRoad(Vector2 a, Vector2 b)
        {
            DrawRoad(a, b, 10f);
        }

        private void DrawRoad(Vector2 a, Vector2 b, float thickness)
        {
            DrawLine(a, b, thickness + 8f, MakeRoadTexture(new Color(0.08f, 0.07f, 0.05f, 0.55f)));
            DrawLine(a, b, thickness, MakeRoadTexture(new Color(0.48f, 0.37f, 0.22f, 0.88f)));
            DrawLine(a, b, Mathf.Max(2f, thickness * 0.18f), MakeRoadTexture(new Color(0.78f, 0.62f, 0.36f, 0.50f)));
        }

        private void DrawLine(Vector2 a, Vector2 b, float thickness, Texture2D texture)
        {
            Matrix4x4 matrix = GUI.matrix;
            Color old = GUI.color;
            float angle = Mathf.Atan2(b.y - a.y, b.x - a.x) * Mathf.Rad2Deg;
            float length = Vector2.Distance(a, b);
            GUIUtility.RotateAroundPivot(angle, a);
            GUI.DrawTexture(new Rect(a.x, a.y - thickness * 0.5f, length, thickness), texture);
            GUI.matrix = matrix;
            GUI.color = old;
        }

        private Vector2 WorldToScreen(Vector2 pos, Rect map)
        {
            return new Vector2(map.x + pos.x * map.width, map.y + pos.y * map.height);
        }

        private Tower FindTowerAt(Vector2 mouse, Rect map)
        {
            Tower best = null;
            float bestDistance = 999f;
            foreach (Tower tower in towers)
            {
                Vector2 screen = WorldToScreen(tower.Position, map);
                float d = Vector2.Distance(mouse, screen);
                float radius = tower.Castle ? 54f : 44f;
                if (d < radius && d < bestDistance)
                {
                    best = tower;
                    bestDistance = d;
                }
            }

            return best;
        }

        private Texture2D GetTowerTexture(Tower tower)
        {
            string key = $"tower-{tower.Owner}-{tower.Level}-{tower.Castle}-{OwnerColor(tower.Owner)}";
            if (textureCache.TryGetValue(key, out Texture2D cached))
            {
                return cached;
            }

            Texture2D tex = MakeTowerTexture(128, 128, OwnerColor(tower.Owner), tower.Level, tower.Castle);
            textureCache[key] = tex;
            return tex;
        }

        private Texture2D GetRegionTexture(Region region, bool selected)
        {
            string key = $"region-{region.Name}-{selected}";
            if (textureCache.TryGetValue(key, out Texture2D cached))
            {
                return cached;
            }

            Texture2D tex = MakeTexture(160, 160, (x, y) =>
            {
                float nx = (x - 80) / 80f;
                float ny = (y - 80) / 80f;
                float dist = Mathf.Sqrt(nx * nx + ny * ny);
                if (dist > 1f)
                {
                    return Color.clear;
                }

                Color baseColor = Color.Lerp(region.ColorA, region.ColorB, Mathf.Clamp01(1f - dist));
                if (selected && dist > 0.84f)
                {
                    baseColor = new Color(1f, 0.82f, 0.32f, 1f);
                }

                return baseColor;
            });
            textureCache[key] = tex;
            return tex;
        }

        private Texture2D MakeTowerTexture(int width, int height, Color banner, int level, bool castle)
        {
            Texture2D tex = new Texture2D(width, height, TextureFormat.RGBA32, false)
            {
                filterMode = FilterMode.Point,
                wrapMode = TextureWrapMode.Clamp
            };

            Color stone = castle ? new Color(0.46f, 0.48f, 0.46f, 1f) : new Color(0.55f, 0.56f, 0.51f, 1f);
            Color dark = new Color(0.16f, 0.18f, 0.17f, 1f);
            Color roof = castle ? new Color(0.24f, 0.22f, 0.20f, 1f) : new Color(0.30f, 0.19f, 0.12f, 1f);

            Clear(tex);
            FillEllipse(tex, 64, 106, castle ? 42 : 32, 10, new Color(0f, 0f, 0f, 0.32f));

            if (castle)
            {
                FillRect(tex, 20, 54, 88, 50, stone);
                FillRect(tex, 26, 40, 16, 56, stone * 0.88f);
                FillRect(tex, 86, 40, 16, 56, stone * 0.88f);
                FillRect(tex, 48, 28, 32, 76, stone);
                FillTriangle(tex, new Vector2Int(42, 28), new Vector2Int(86, 28), new Vector2Int(64, 8), roof);
                FillTriangle(tex, new Vector2Int(20, 40), new Vector2Int(48, 40), new Vector2Int(34, 18), roof);
                FillTriangle(tex, new Vector2Int(80, 40), new Vector2Int(108, 40), new Vector2Int(94, 18), roof);
                FillRect(tex, 54, 72, 20, 32, dark);
            }
            else
            {
                FillRect(tex, 38, 44, 52, 60, stone);
                FillTriangle(tex, new Vector2Int(32, 44), new Vector2Int(96, 44), new Vector2Int(64, 18), roof);
                FillRect(tex, 56, 74, 16, 30, dark);
            }

            for (int i = 0; i < level; i++)
            {
                int x = 32 + i * 13;
                FillRect(tex, x, 34, 8, 8, new Color(0.86f, 0.84f, 0.73f, 1f));
            }

            FillRect(tex, 64, 18, 4, 42, dark);
            FillTriangle(tex, new Vector2Int(68, 20), new Vector2Int(98, 30), new Vector2Int(68, 40), banner);
            FillRect(tex, 28, 92, 72, 6, banner * 0.8f);

            tex.Apply(false, false);
            return tex;
        }

        private Texture2D MakeBattleTexture(int width, int height)
        {
            BattleMap battleMap = battleMaps.Count > 0 ? battleMaps[Mathf.Clamp(mapChoice, 0, battleMaps.Count - 1)] : null;
            return MakeTexture(width, height, (x, y) =>
            {
                float nx = x / (float)width;
                float ny = y / (float)height;
                float ridge = Mathf.PerlinNoise(nx * 3.3f + 4f, ny * 3.1f + 2f);
                float field = Mathf.PerlinNoise(nx * 12f, ny * 10f) * 0.12f;
                Color low = battleMap != null ? battleMap.GroundA : new Color(0.16f, 0.30f, 0.22f, 1f);
                Color high = battleMap != null ? battleMap.GroundB : new Color(0.43f, 0.48f, 0.28f, 1f);
                Color baseColor = Color.Lerp(low, high, ridge * 0.7f + field);
                if ((ny > 0.72f && nx < 0.45f) || (mapChoice == 1 && Mathf.Abs(nx - ny) < 0.08f))
                {
                    Color water = battleMap != null ? battleMap.WaterColor : new Color(0.12f, 0.23f, 0.31f, 1f);
                    baseColor = Color.Lerp(baseColor, water, mapChoice == 1 ? 0.48f : 0.35f);
                }

                if (mapChoice == 2 && ridge > 0.72f)
                {
                    baseColor = Color.Lerp(baseColor, new Color(0.55f, 0.54f, 0.47f, 1f), 0.38f);
                }

                return baseColor;
            });
        }

        private Texture2D MakeWorldTexture(int width, int height)
        {
            return MakeTexture(width, height, (x, y) =>
            {
                float nx = x / (float)width;
                float ny = y / (float)height;
                float n = Mathf.PerlinNoise(nx * 4f, ny * 3f);
                Color a = new Color(0.09f, 0.19f, 0.18f, 1f);
                Color b = new Color(0.28f, 0.35f, 0.24f, 1f);
                Color c = Color.Lerp(a, b, n);
                if (nx > 0.64f && ny < 0.46f)
                {
                    c = Color.Lerp(c, new Color(0.32f, 0.24f, 0.18f, 1f), 0.55f);
                }

                return c;
            });
        }

        private Texture2D MakeGradient(int width, int height, Color a, Color b, bool withLight)
        {
            return MakeTexture(width, height, (x, y) =>
            {
                float nx = x / (float)width;
                float ny = y / (float)height;
                Color color = Color.Lerp(a, b, nx * 0.7f + ny * 0.3f);
                if (withLight)
                {
                    float glow = Mathf.Clamp01(1f - Vector2.Distance(new Vector2(nx, ny), new Vector2(0.76f, 0.32f)) * 1.7f);
                    color = Color.Lerp(color, new Color(0.62f, 0.50f, 0.28f, 1f), glow * 0.24f);
                }

                return color;
            });
        }

        private Texture2D MakeButtonTexture(Color a, Color b)
        {
            return MakeTexture(12, 12, (x, y) =>
            {
                float t = y / 11f;
                return Color.Lerp(a, b, t);
            });
        }

        private Texture2D MakeRoadTexture(Color color)
        {
            string key = $"road-{color}";
            if (textureCache.TryGetValue(key, out Texture2D cached))
            {
                return cached;
            }

            Texture2D tex = MakeTexture(1, 1, (x, y) => color);
            textureCache[key] = tex;
            return tex;
        }

        private Texture2D MakeTexture(int width, int height, Func<int, int, Color> pixelFactory)
        {
            Texture2D texture = new Texture2D(width, height, TextureFormat.RGBA32, false)
            {
                filterMode = FilterMode.Bilinear,
                wrapMode = TextureWrapMode.Clamp
            };

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    texture.SetPixel(x, y, pixelFactory(x, y));
                }
            }

            texture.Apply(false, false);
            return texture;
        }

        private void Clear(Texture2D tex)
        {
            for (int y = 0; y < tex.height; y++)
            {
                for (int x = 0; x < tex.width; x++)
                {
                    tex.SetPixel(x, y, Color.clear);
                }
            }
        }

        private void FillRect(Texture2D tex, int x, int y, int w, int h, Color color)
        {
            for (int yy = Mathf.Max(0, y); yy < Mathf.Min(tex.height, y + h); yy++)
            {
                for (int xx = Mathf.Max(0, x); xx < Mathf.Min(tex.width, x + w); xx++)
                {
                    tex.SetPixel(xx, yy, color);
                }
            }
        }

        private void FillEllipse(Texture2D tex, int cx, int cy, int rx, int ry, Color color)
        {
            for (int y = cy - ry; y <= cy + ry; y++)
            {
                for (int x = cx - rx; x <= cx + rx; x++)
                {
                    float dx = (x - cx) / (float)rx;
                    float dy = (y - cy) / (float)ry;
                    if (dx * dx + dy * dy <= 1f && x >= 0 && x < tex.width && y >= 0 && y < tex.height)
                    {
                        tex.SetPixel(x, y, color);
                    }
                }
            }
        }

        private void FillTriangle(Texture2D tex, Vector2Int a, Vector2Int b, Vector2Int c, Color color)
        {
            int minX = Mathf.Max(0, Mathf.Min(a.x, Mathf.Min(b.x, c.x)));
            int maxX = Mathf.Min(tex.width - 1, Mathf.Max(a.x, Mathf.Max(b.x, c.x)));
            int minY = Mathf.Max(0, Mathf.Min(a.y, Mathf.Min(b.y, c.y)));
            int maxY = Mathf.Min(tex.height - 1, Mathf.Max(a.y, Mathf.Max(b.y, c.y)));

            float area = Edge(a, b, c);
            if (Mathf.Abs(area) < 0.001f)
            {
                return;
            }

            for (int y = minY; y <= maxY; y++)
            {
                for (int x = minX; x <= maxX; x++)
                {
                    Vector2Int p = new Vector2Int(x, y);
                    float w0 = Edge(b, c, p);
                    float w1 = Edge(c, a, p);
                    float w2 = Edge(a, b, p);
                    if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0))
                    {
                        tex.SetPixel(x, y, color);
                    }
                }
            }
        }

        private float Edge(Vector2Int a, Vector2Int b, Vector2Int c)
        {
            return (c.x - a.x) * (b.y - a.y) - (c.y - a.y) * (b.x - a.x);
        }

        private Color OwnerColor(Faction owner)
        {
            switch (owner)
            {
                case Faction.Player:
                    return playerColor;
                case Faction.Enemy:
                    return enemyColor;
                default:
                    return new Color(0.78f, 0.74f, 0.62f, 1f);
            }
        }

        private string OwnerName(Faction owner)
        {
            switch (owner)
            {
                case Faction.Player:
                    return "Dein Reich";
                case Faction.Enemy:
                    return "Feind";
                default:
                    return "Neutral";
            }
        }

        private string DifficultyName()
        {
            switch (difficulty)
            {
                case 0:
                    return "Leicht";
                case 2:
                    return "Schwer";
                default:
                    return "Normal";
            }
        }
    }
}
