import "./types/env.ts";
import main from "./src/section5/03-mcp-multi-server.ts";

try {
  await main();
} catch (error) {
  console.error(error);
}
