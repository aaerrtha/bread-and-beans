import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the tracing root to this project so Next doesn't pick up an
  // unrelated lockfile higher up in the filesystem.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
