import "./types/env.ts";
import main from "./src/section4/04-built-in-middleware.ts";

try {
  await main();
} catch (error) {
  console.error(error);
}
