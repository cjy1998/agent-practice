/**
 * 人格测试示例
 */

import { ChatOpenAI } from "@langchain/openai";
import { settings } from "../../types/env";
import { HumanMessage, SystemMessage } from "langchain";

export default async function personalityTest() {
  const sysMessage = [
    {
      role: "海盗",
      message: new SystemMessage(
        "你是个海盗。所有问题都要用'Arrr！'和航海术语回答。",
      ),
    },
    {
      role: "商业分析师",
      message: new SystemMessage(
        "你是专业的商业分析师。给出准确、数据驱动的答案。",
      ),
    },
    {
      role: "友善的老师",
      message: new SystemMessage("你是个友善的老师，正在给8岁的孩子讲解概念。"),
    },
  ];

  const question = new HumanMessage("什么是人工智能？");
  const model = new ChatOpenAI({
    model: settings.openai_model,
    apiKey: settings.openai_api_key,
    configuration: {
      baseURL: settings.openai_api_base_url,
    },
  });
  sysMessage.forEach(async (item) => {
    const messages: (SystemMessage | HumanMessage)[] = [];
    messages.push(item.message);
    messages.push(question);

    const result = await model.invoke(messages);
    console.log(`role: ${item.role}\n`);
    console.log(`-`.repeat(50) + "\n");
    console.log(result.content);
    console.log(`-`.repeat(50) + "\n");
  });
}
