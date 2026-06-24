import "./types/env.ts";
import main from "./src/section6/01-load-text.ts";

try {
  await main();
} catch (error) {
  console.error(error);
}
