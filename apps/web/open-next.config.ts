import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    runtime: "edge",
    placement: "global",
  },
  middleware: {
    external: true,
  },
};

export default config;
