using System.IO;
using Mastil;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Mastil.Editor
{
    public static class MastilProjectSetup
    {
        public const string ScenePath = "Assets/MASTIL/Scenes/Main.unity";
        private const string IconPath = "Assets/MASTIL/Resources/mastil-icon.png";

        public static void Setup()
        {
            Directory.CreateDirectory("Assets/MASTIL/Scenes");

            Scene scene = File.Exists(ScenePath)
                ? EditorSceneManager.OpenScene(ScenePath)
                : EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            Camera camera = Object.FindFirstObjectByType<Camera>();
            if (camera == null)
            {
                GameObject cameraObject = new GameObject("Main Camera");
                camera = cameraObject.AddComponent<Camera>();
                camera.tag = "MainCamera";
            }

            camera.orthographic = true;
            camera.orthographicSize = 5f;
            camera.transform.position = new Vector3(0f, 0f, -10f);
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.02f, 0.04f, 0.05f);

            MastilGame game = Object.FindFirstObjectByType<MastilGame>();
            if (game == null)
            {
                GameObject gameObject = new GameObject("MASTIL Game");
                gameObject.AddComponent<MastilGame>();
            }

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(ScenePath, true)
            };

            PlayerSettings.companyName = "Bytewerk Studio";
            PlayerSettings.productName = "MASTIL";
            PlayerSettings.defaultScreenWidth = 1600;
            PlayerSettings.defaultScreenHeight = 900;
            PlayerSettings.resizableWindow = true;
            PlayerSettings.fullScreenMode = FullScreenMode.Windowed;
            PlayerSettings.runInBackground = false;
            PlayerSettings.SplashScreen.show = false;
            ApplyApplicationIcon();

            AssetDatabase.SaveAssets();
            Debug.Log("MASTIL Unity project setup complete.");
        }

        private static void ApplyApplicationIcon()
        {
            Texture2D icon = AssetDatabase.LoadAssetAtPath<Texture2D>(IconPath);
            if (icon == null)
            {
                Debug.LogWarning($"MASTIL icon was not found at {IconPath}.");
                return;
            }

            TextureImporter importer = AssetImporter.GetAtPath(IconPath) as TextureImporter;
            if (importer != null)
            {
                importer.textureType = TextureImporterType.Default;
                importer.mipmapEnabled = true;
                importer.SaveAndReimport();
            }

            PlayerSettings.SetIcons(NamedBuildTarget.Standalone, new[] { icon }, IconKind.Application);
        }
    }
}
