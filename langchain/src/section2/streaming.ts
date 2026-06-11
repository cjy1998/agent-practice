import { createModel } from "../utils/index.ts";
import { AIMessage, HumanMessage, SystemMessage } from "langchain";
/**
 * 流式输出
 */
export default async function streaming() {
  const model = createModel();
  const messages = [
    new SystemMessage("你是一个温柔的人？"),
    new HumanMessage(
      "对比一下python、java、go,对比元素需要加入中国国内招聘市场的岗位数量、热度",
    ),
  ];
  const result = await model.stream(messages);
  for await (const chunk of result) {
    const content = typeof chunk.content === "string" ? chunk.content : "";
    //这是Node.js / Bun 内置的进程 I/O API，作用是把内容直接写入终端（标准输出），不带换行符。
    process.stdout.write(content);
  }
}
