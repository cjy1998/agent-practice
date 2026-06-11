import { createModel } from "@/utils";
import { tool } from "langchain";
import { evaluate } from "mathjs";
import z from "zod";
/**
 * 定义工具
 */
const calculatorTool = tool(
  async (input) => {
    try {
      const result = evaluate(input.expression);
      return `The result is ${result}`;
    } catch (error) {
      return `Error evaluating expression: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "calculator",
    //帮助大型语言模型决定何时使用
    description:
      "Useful for performing mathematical calculations. Use this when you need to compute numbers.",
    schema: z.object({
      expression: z
        .string()
        .describe("The mathematical expression to evaluate, e.g., '25 * 4'"),
    }),
  },
);

console.log("Tool created:", calculatorTool.name);
// console.log("Schema:", calculatorTool.schema);

/**
 * 绑定工具到模型
 */
export default async function main() {
  const model = createModel();
  const boundModel = model.bindTools([calculatorTool]);
  const baseMessage: Array<{
    role: string;
    content: string;
    tool_call_id?: string;
  }> = [{ role: "user", content: "What is 25 * 17?" }];
  const result = await boundModel.invoke(baseMessage);
  baseMessage.push({ role: "assistant", content: result.text });
  console.log(result.tool_calls);
  // 工具调用
  const toolCall = result.tool_calls?.[0];
  if (toolCall) {
    const { args } = toolCall;
    const toolResult = await calculatorTool.invoke(
      calculatorTool.schema.parse(args),
    );
    console.log("Tool result:", toolResult);
    baseMessage.push({
      role: "tool",
      content: toolResult,
      tool_call_id: toolCall.id,
    });
    /**
     * 把结果返回给模型
     */
    const finalResult = await boundModel.invoke(baseMessage);
    console.log("Final result:", finalResult.text);
  }
}
