/**
 * 消息示例
 */

import { AIMessage, HumanMessage, SystemMessage } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { settings } from "../../types/env";
const model = new ChatOpenAI({
  model: settings.openai_model,
  apiKey: settings.openai_api_key,
  configuration: {
    baseURL: settings.openai_api_base_url,
  },
  temperature: 0.2,
  maxRetries: 3,
  timeout: 60000,
});

const messgaes = [
  new SystemMessage(
    "你是一个代码助手，每次回答后，都需要提示用户，‘该回答由AI产生，请仔细检查！’",
  ),
  new HumanMessage("列举一下ts中不经常用到的方法或者API"),
];

export default async function main() {
  const result = await model.invoke(messgaes);
  console.log(result.content);
}
