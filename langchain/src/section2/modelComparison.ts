/**
 * 模型比较示例
 */

import { ChatOpenAI } from "@langchain/openai";
import { settings } from "../../types/env";

export default async function main() {
  console.log("🔬 Comparing AI Models\n");
  const models = ["qwen3.6-plus", "kimi-k2.6"];
  const prompt = "用一句话解释编程中的递归。";
  for (const modelName of models) {
    console.log(`🔍 Model: ${modelName}\n`);
    console.log("-".repeat(50));

    const model = new ChatOpenAI({
      modelName,
      apiKey: settings.openai_api_key,
      configuration: {
        baseURL: settings.openai_api_base_url,
      },
    });

    const startTime = Date.now();
    const response = await model.invoke(prompt);
    const duration = Date.now() - startTime;

    console.log(`Response: ${response.content}`);
    console.log(`⏱️  Time: ${duration}ms`);
  }
}
