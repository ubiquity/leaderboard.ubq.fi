import { config } from "dotenv";
import esbuild from "esbuild";
import { invertColors } from "./plugins/invert-colors";
import { execSync } from "child_process";
config();

const typescriptEntries = ["src/home/home.ts"];
const cssEntries = ["static/style/style.css"];
const entries = [...typescriptEntries, ...cssEntries, "static/favicon.svg", "static/icon-512x512.png"];

export const esBuildContext: esbuild.BuildOptions = {
  plugins: [invertColors],
  sourcemap: true,
  entryPoints: entries,
  bundle: true,
  minify: false,
  loader: {
    ".png": "file",
    ".woff": "file",
    ".woff2": "file",
    ".eot": "file",
    ".ttf": "file",
    ".svg": "file",
    ".json": "file",
  },
  outdir: "static/dist",
  define: createEnvDefines(["SUPABASE_ACCESS_TOKEN", "SUPABASE_DB_PASSWORD", "SUPABASE_PROJECT_ID"], {
    SUPABASE_STORAGE_KEY: generateSupabaseStorageKey(),
    commitHash: execSync(`git rev-parse --short HEAD`).toString().trim(),
  }),
};

esbuild
  .build(esBuildContext)
  .then(() => console.log("\tesbuild complete"))
  .catch(console.error);

function createEnvDefines(environmentVariables: string[], generatedAtBuild: Record<string, unknown>): Record<string, string> {
  const defines: Record<string, string> = {};
  for (const name of environmentVariables) {
    const envVar = process.env[name];
    if (envVar !== undefined) {
      defines[name] = JSON.stringify(envVar);
    } else {
      throw new Error(`Missing environment variable: ${name}`);
    }
  }
  for (const key of Object.keys(generatedAtBuild)) {
    if (Object.prototype.hasOwnProperty.call(generatedAtBuild, key)) {
      defines[key] = JSON.stringify(generatedAtBuild[key]);
    }
  }
  return defines;
}

export function generateSupabaseStorageKey(): string | null {
  const id = process.env.SUPABASE_PROJECT_ID;
  if (!id) {
    console.error("SUPABASE_PROJECT_ID environment variable is not set");
    return null;
  }
  const url = `https://${id}.supabase.co`;

  const urlParts = url.split(".");
  if (urlParts.length === 0) {
    console.error("Invalid SUPABASE_URL environment variable");
    return null;
  }

  const domain = urlParts[0];
  const lastSlashIndex = domain.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    console.error("Invalid SUPABASE_URL format");
    return null;
  }

  return domain.substring(lastSlashIndex + 1);
}
