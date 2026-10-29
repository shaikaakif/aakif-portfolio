import { rmSync } from "node:fs";

rmSync(".next/cache", { recursive: true, force: true });
