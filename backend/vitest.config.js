import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      // server.js y db/prisma.js solo arrancan el servidor y conectan a Neon (no se prueban sin base real)
      exclude: ["src/server.js", "src/db/**"],
      reporter: ["text-summary", "text"],
      thresholds: { lines: 80, statements: 80 },
    },
  },
});
