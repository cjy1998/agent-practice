import { createModel } from "../utils/index";
import { AIMessageChunk } from "@langchain/core/messages";
/**
 * 跟踪token使用情况
 */
export default async function trackTokenUsage() {
  const model = createModel({ modelName: "qwen3.7-max-2026-05-17" });
  let finalChunk: AIMessageChunk | undefined;
  const result = await model.stream("TUI框架是什么？");
  for await (const chunk of result) {
    process.stdout.write(chunk.content as string);
    finalChunk = chunk;
  }
  const usage = finalChunk?.usage_metadata;
  console.log(`\n 输入token: ${usage?.input_tokens}`);
  console.log(`\n 输出token: ${usage?.output_tokens}`);
  console.log(`\n 总token: ${usage?.total_tokens}`);
}
