import { commonTools, createModel } from "@/utils";
import {
  AIMessage,
  createAgent,
  createMiddleware,
  HumanMessage,
  SystemMessage,
} from "langchain";

export default async function main() {
  const basicModel = createModel();
  const capableModel = createModel({ modelName: "qwen3.7-max-2026-05-17" });

  const dynamicModelSelection = createMiddleware({
    name: "dynamicModelSelection",
    wrapModelCall: (req, handler) => {
      const messageCount = req.messages.length;
      if (messageCount > 10) {
        console.log(`  [Middleware] Switching to more capable model`);
        return handler({
          ...req,
          model: capableModel,
        });
      }
      return handler(req);
    },
  });

  const toolErrorHandler = createMiddleware({
    name: "toolErrorHandler",
    wrapToolCall: async (req, handler) => {
      try {
        return await handler(req);
      } catch (error) {
        console.error(`  [Middleware] Tool "${req.tool}" failed`);
        throw error;
      }
    },
  });

  const agent = createAgent({
    model: basicModel,
    tools: commonTools,
    middleware: [dynamicModelSelection, toolErrorHandler],
  });

  const baseMessages: (AIMessage | HumanMessage | SystemMessage)[] = [];

  async function chatLoop() {
    // bun的prompt函数
    const userInput = prompt(
      `🧠：我是你的ai助手，你有什么想问的吗？（直接回车退出）：\n`,
    );
    if (!userInput || !userInput.trim()) {
      console.log("👋 对话结束");
      return;
    }

    baseMessages.push(new HumanMessage(userInput));
    const result = await agent.invoke({
      messages: baseMessages,
    });
    console.log(
      `🧠: ${result.messages[result.messages.length - 1]?.content}\n`,
    );
    const lastMessage = result.messages[result.messages.length - 1];
    baseMessages.push(new AIMessage(lastMessage!.content as string));
    // 递归：继续下一轮对话
    await chatLoop();
  }

  await chatLoop();
}
