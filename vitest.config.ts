import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["apps/web/src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["apps/web/src/features/forms/validation.ts"],
      reporter: ["text", "html"],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
      },
    },
  },
});
