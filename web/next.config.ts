import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Avoid Next/Turbopack inferring an incorrect monorepo root when other lockfiles
  // exist higher up the filesystem.
  turbopack: {
    root: dirname,
  },
};

export default nextConfig;
