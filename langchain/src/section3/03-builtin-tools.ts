import { createModel } from "@/utils";
import { tools } from "@langchain/openai";
/**
 * 内置工具
 */
export default async function main() {
  const model = createModel();
  const bindModel = model.bindTools([tools.webSearch()]);
  const response = await bindModel.invoke(
    "What are the latest TypeScript 5.9 features?",
  );
  console.log(response);
}
