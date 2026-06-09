using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;

namespace Mastil.Editor
{
    public static class MastilBuild
    {
        public static void BuildWindowsDesktop()
        {
            MastilProjectSetup.Setup();

            string outputDir = Path.GetFullPath("Build/Windows");
            Directory.CreateDirectory(outputDir);

            string exePath = Path.Combine(outputDir, "MASTIL.exe");
            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = new[] { MastilProjectSetup.ScenePath },
                locationPathName = exePath,
                target = BuildTarget.StandaloneWindows64,
                options = BuildOptions.None
            };

            BuildReport report = BuildPipeline.BuildPlayer(options);
            if (report.summary.result != BuildResult.Succeeded)
            {
                throw new Exception($"MASTIL Windows build failed: {report.summary.result}");
            }
        }
    }
}
