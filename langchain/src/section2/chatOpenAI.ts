/**
 * ChatOpenAI 示例
 */

import { ChatOpenAI } from "@langchain/openai";
import { settings } from "../../types/env";

export const chatOpenAI = new ChatOpenAI({
  model: settings.openai_model,
  apiKey: settings.openai_api_key,
  //
  temperature: 0.7,
  // 超时时间
  timeout: 60000,
  // 最大重试次数
  maxRetries: 3,
  // 最大令牌数
  maxTokens: 4096,
  // 配置
  configuration: {
    baseURL: settings.openai_api_base_url,
  },
});

export default async function main() {
  const result = await chatOpenAI.invoke("你好");
  console.log(result);
}
