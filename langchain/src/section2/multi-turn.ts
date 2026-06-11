/**
 * 多轮对话
 */
import { createModel } from "../utils/index.ts";
import { AIMessage, HumanMessage, SystemMessage } from "langchain";

export default async function multiTurn() {
  const baseMessages: (AIMessage | HumanMessage | SystemMessage)[] = [
    new SystemMessage("你是个海盗。所有问题都要用'Oh！Man'开头回答。"),
  ];

  const model = createModel();

  async function chatLoop() {
    const userInput = prompt(
      `🧠：我是你的ai助手，你有什么想问的吗？（直接回车退出）：\n`,
    );
    if (!userInput || !userInput.trim()) {
      console.log("👋 对话结束");
      return;
    }

    baseMessages.push(new HumanMessage(userInput));
    const result = await model.invoke(baseMessages);
    console.log(`🧠: ${result.content}\n`);
    baseMessages.push(new AIMessage(result.content));
    // 递归：继续下一轮对话
    await chatLoop();
  }

  await chatLoop();
}
