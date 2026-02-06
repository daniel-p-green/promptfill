#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const usage = () => {
  console.log(`Usage:
  node tools/create-remotion-brand-kit-starter.mjs --out <dir> [--brand stripe] [--mode embed|dependency]

Examples:
  node tools/create-remotion-brand-kit-starter.mjs --out ./starter-stripe
  node tools/create-remotion-brand-kit-starter.mjs --out ./starter-stripe --mode dependency`);
};

const parseArgs = (argv) => {
  const options = {
    out: null,
    brand: "stripe",
    mode: "embed",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--out") {
      options.out = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--brand") {
      options.brand = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--mode") {
      options.mode = argv[i + 1];
      i += 1;
      continue;
    }
    throw new Error(`Unknown arg: ${arg}`);
  }

  if (!options.out) {
    throw new Error("--out is required");
  }

  if (!["embed", "dependency"].includes(options.mode)) {
    throw new Error("--mode must be 'embed' or 'dependency'");
  }

  if (options.brand !== "stripe") {
    throw new Error("Only --brand stripe is currently supported in v1");
  }

  return options;
};

const ensureEmptyOrCreate = async (dir) => {
  try {
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) {
      throw new Error(`Output path exists but is not a directory: ${dir}`);
    }
    const entries = await fs.readdir(dir);
    if (entries.length > 0) {
      throw new Error(`Output directory is not empty: ${dir}`);
    }
  } catch (error) {
    if (error && error.code === "ENOENT") {
      await fs.mkdir(dir, { recursive: true });
      return;
    }
    throw error;
  }
};

const copyDir = async (src, dest) => {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
};

const write = async (filePath, content) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
};

const createProject = async ({ out, mode }) => {
  const repoRoot = process.cwd();
  const packageDir = path.join(repoRoot, "packages", "brand-kit-stripe");
  const packageSrc = path.join(packageDir, "src");
  const logoSource = path.join(packageSrc, "brand", "logo.svg");

  const importPath = mode === "embed" ? "../brand-kit/stripe" : "@brand-kit/stripe";

  const dependencyMap = {
    "@remotion/cli": "4.0.417",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "remotion": "4.0.417",
    "zod": "3.22.3",
  };

  if (mode === "dependency") {
    const absPath = packageDir.replaceAll("\\", "/");
    dependencyMap["@brand-kit/stripe"] = `file:${absPath}`;
  }

  await write(
    path.join(out, "package.json"),
    `${JSON.stringify(
      {
        name: "remotion-brand-kit-starter",
        private: true,
        scripts: {
          dev: "remotion studio",
          build: "remotion bundle",
          "render:reels": "remotion render BrandKitReel9x16 out/BrandKitReel9x16.mp4",
          "render:yt": "remotion render BrandKitReel16x9 out/BrandKitReel16x9.mp4",
          lint: "tsc --noEmit",
        },
        dependencies: dependencyMap,
        devDependencies: {
          typescript: "5.9.3",
          "@types/react": "19.2.7",
        },
      },
      null,
      2,
    )}\n`,
  );

  await write(
    path.join(out, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2018",
          module: "commonjs",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          lib: ["es2015"],
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          noUnusedLocals: true,
        },
        exclude: ["remotion.config.ts"],
      },
      null,
      2,
    ) + "\n",
  );

  await write(
    path.join(out, "remotion.config.ts"),
    `import {Config} from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
`,
  );

  await write(
    path.join(out, "src", "index.ts"),
    `import {registerRoot} from "remotion";
import {StarterRoot} from "./Root";

registerRoot(StarterRoot);
`,
  );

  await write(
    path.join(out, "src", "comps", "DemoReel.tsx"),
    `import React from "react";
import {
  ScriptDrivenReel,
  scriptDurationInFrames,
  stripeExampleScript,
  parseBrandScript,
} from "${importPath}";

export const StarterDemoReel9x16: React.FC = () => {
  const script = parseBrandScript(stripeExampleScript);
  return (
    <ScriptDrivenReel
      script={script}
      format="reels-9x16"
      energy="medium"
      lengthBucket="15s"
      showSafeGuides={false}
    />
  );
};

export const StarterDemoReel16x9: React.FC = () => {
  const script = parseBrandScript(stripeExampleScript);
  return (
    <ScriptDrivenReel
      script={script}
      format="youtube-16x9"
      energy="subtle"
      lengthBucket="30s"
      showSafeGuides={false}
    />
  );
};

export const demo9x16Duration = scriptDurationInFrames("15s");
export const demo16x9Duration = scriptDurationInFrames("30s");
`,
  );

  await write(
    path.join(out, "src", "Root.tsx"),
    `import React from "react";
import {Composition, Folder} from "remotion";
import {
  StarterDemoReel9x16,
  StarterDemoReel16x9,
  demo9x16Duration,
  demo16x9Duration,
} from "./comps/DemoReel";

export const StarterRoot: React.FC = () => {
  return (
    <Folder name="Starter">
      <Composition
        id="BrandKitReel9x16"
        component={StarterDemoReel9x16}
        durationInFrames={demo9x16Duration}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BrandKitReel16x9"
        component={StarterDemoReel16x9}
        durationInFrames={demo16x9Duration}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
`,
  );

  await write(
    path.join(out, "script.json"),
    `{
  "brandVoice": "confident, friendly, concise",
  "audience": "busy operators",
  "offer": "PromptFill branded workflow setup",
  "scenes": [
    { "id": "hook", "hook": "Stop wasting hours on busywork" },
    { "id": "problem", "bullets": ["Manual follow ups", "Messy handoffs", "No visibility"] },
    { "id": "solution", "claim": "Automate your workflow in 48 hours", "proof": "Templates, integrations, and a reusable branded scene system included" },
    { "id": "cta", "cta": "Book a call", "url": "https://promptfill.app", "caption": "No redesign required" }
  ]
}
`,
  );

  await write(
    path.join(out, "README.md"),
    `# Remotion Brand Kit Starter

Generated by \`tools/create-remotion-brand-kit-starter.mjs\`.

## Scripts

- \`pnpm dev\` (or \`npm run dev\`)
- \`pnpm render:reels\` (or \`npm run render:reels\`)
- \`pnpm render:yt\` (or \`npm run render:yt\`)

## Copy model

Edit \`script.json\` and keep it valid against the kit schema rules.

## Public logo asset

This starter expects \`public/brand/stripe/logo.svg\`.
`,
  );

  await fs.mkdir(path.join(out, "public", "brand", "stripe"), { recursive: true });

  if (mode === "embed") {
    await copyDir(packageSrc, path.join(out, "src", "brand-kit", "stripe"));
  }

  // Ensure logo is available at the canonical runtime path used by staticFile().
  await fs.copyFile(logoSource, path.join(out, "public", "brand", "stripe", "logo.svg"));
};

const main = async () => {
  const opts = parseArgs(process.argv.slice(2));
  const out = path.resolve(process.cwd(), opts.out);
  await ensureEmptyOrCreate(out);
  await createProject({ out, mode: opts.mode });
  console.log(`Created starter at ${out}`);
};

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  usage();
  process.exit(1);
});
