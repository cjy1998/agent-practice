import { chatLoop, commonTools, createModel } from "@/utils";
import {
  createAgent,
  createMiddleware,
  summarizationMiddleware,
} from "langchain";

export default async function main() {
  const logger = createMiddleware({
    name: "Logger",
    wrapModelCall: (req, handler) => {
      console.log(`[State] Messages: ${req.messages.length}`);
      return handler(req);
    },
  });
  const model = createModel();
  const agent = createAgent({
    model,
    tools: commonTools,
    middleware: [
      summarizationMiddleware({
        model,
        // 何时进行总结
        trigger: {
          tokens: 200,
          messages: 4,
          //上下文窗口
          // fraction: 0.5,
        },
        // 保留要求
        keep: {
          messages: 2,
          // tokens: 100,
          // fraction: 0.2,
        },
      }),
      logger,
    ],
  });
  await chatLoop({ agent });
}
