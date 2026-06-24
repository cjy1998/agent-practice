import { ChatOpenAI } from "@langchain/openai";
import { settings } from "../../types/env.ts";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  BaseMessage,
  tool,
} from "langchain";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { evaluate } from "mathjs";
import { dirname, resolve } from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import z from "zod";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

interface IModelParams {
  modelName?: string;
  apiKey?: string;
  apiBaseUrl?: string;
  parameters?: object;
}

export function createModel({
  modelName = settings.openai_model,
  apiKey = settings.openai_api_key,
  apiBaseUrl = settings.openai_api_base_url,
  parameters,
}: IModelParams = {}) {
  return new ChatOpenAI({
    model: modelName,
    apiKey,
    configuration: {
      baseURL: apiBaseUrl,
    },
    ...parameters,
  });
}

interface IChatLoopParams {
  baseMessages?: (AIMessage | HumanMessage | SystemMessage)[];
  agent?: {
    invoke: (input: {
      messages: BaseMessage[];
    }) => Promise<{ messages: BaseMessage[] }>;
  };
}

export async function chatLoop({ baseMessages = [], agent }: IChatLoopParams) {
  if (!agent) {
    throw new Error("agent is required for chatLoop");
  }
  // bun的prompt函数
  const userInput = prompt(
    `🧠：我是你的ai助手，你有什么想问了吗？（直接回车退出）：\n`,
  );
  if (!userInput || !userInput.trim()) {
    console.log("👋 对话结束");
    return;
  }

  baseMessages.push(new HumanMessage(userInput));
  const result = await agent.invoke({
    messages: baseMessages,
  });
  console.log(`🧠: ${result.messages[result.messages.length - 1]?.content}\n`);
  const lastMessage = result.messages[result.messages.length - 1];
  baseMessages.push(new AIMessage(lastMessage!.content as string));
  // 递归：继续下一轮对话
  await chatLoop({ baseMessages, agent });
}

// ===================== 常用 Tool 定义 =====================

/** 路径安全校验，防止路径穿越 */
const BASE_PATH = resolve(import.meta.dir, "../..");
function safePath(inputPath: string): string {
  const absolute = resolve(BASE_PATH, inputPath);
  if (!absolute.startsWith(BASE_PATH)) {
    throw new Error(
      `Access denied: path "${inputPath}" is outside the project directory`,
    );
  }
  return absolute;
}

/** 计算器工具 */
export const calculatorTool: DynamicStructuredTool = tool(
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
    description:
      "Useful for performing mathematical calculations. Use this when you need to compute numbers.",
    schema: z.object({
      expression: z
        .string()
        .describe("The mathematical expression to evaluate, e.g. '25 * 4'"),
    }),
  },
);

/** 读文件工具 */
export const readFileTool: DynamicStructuredTool = tool(
  async (input) => {
    try {
      const filePath = safePath(input.filePath);
      const file = Bun.file(filePath);
      const exists = await file.exists();
      if (!exists) {
        return `Error: File not found: ${input.filePath}`;
      }
      const content = await file.text();
      return content;
    } catch (error) {
      return `Error reading file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "read_file",
    description:
      "Reads the content of a file from the filesystem. Use this when you need to inspect or read a file's contents.",
    schema: z.object({
      filePath: z
        .string()
        .describe("The path to the file to read, e.g. 'src/index.ts'"),
    }),
  },
);

/** 写文件工具 */
export const writeFileTool: DynamicStructuredTool = tool(
  async (input) => {
    try {
      const filePath = safePath(input.filePath);
      const dir = dirname(filePath);
      await mkdir(dir, { recursive: true });
      await Bun.write(filePath, input.content);
      return `Successfully wrote to ${input.filePath}`;
    } catch (error) {
      return `Error writing file: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "write_file",
    description:
      "Writes content to a file on the filesystem. Creates the file and any missing parent directories if needed.",
    schema: z.object({
      filePath: z
        .string()
        .describe("The path to the file to write, e.g. 'src/index.ts'"),
      content: z.string().describe("The content to write to the file"),
    }),
  },
);

/** 列出目录工具 */
export const listDirTool: DynamicStructuredTool = tool(
  async (input) => {
    try {
      const dirPath = safePath(input.dirPath);
      const entries = await readdir(dirPath);
      return entries.join("\n");
    } catch (error) {
      return `Error listing directory: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "list_directory",
    description:
      "Lists files and directories in a given path. Use this when you need to see what files exist in a directory.",
    schema: z.object({
      dirPath: z
        .string()
        .describe("The path to the directory to list, e.g. 'src'"),
    }),
  },
);

/** 所有常用工具集合，方便一次性绑定 */
export const commonTools: DynamicStructuredTool[] = [
  calculatorTool,
  readFileTool,
  writeFileTool,
  listDirTool,
];

// ===================== 工具调用辅助 =====================

/** 根据 toolCall 自动匹配并执行对应工具 */
export async function handleToolCalls(
  tools: DynamicStructuredTool[],
  toolCalls: Array<{
    name: string;
    args: Record<string, unknown>;
    id?: string;
  }>,
): Promise<{ result: string; tool_call_id: string }[]> {
  const results: { result: string; tool_call_id: string }[] = [];
  for (const toolCall of toolCalls) {
    const matchedTool = tools.find((t) => t.name === toolCall.name);
    if (matchedTool) {
      const toolResult = await matchedTool.invoke(toolCall.args);
      results.push({
        result: toolResult,
        tool_call_id: toolCall.id ?? crypto.randomUUID(),
      });
    }
  }
  return results;
}

// ===================== 对话构建 =====================

export function createConversation(
  role: string,
  examples: Array<{ question: string; answer: string }>,
  newQuestion: string,
): BaseMessage[] {
  const messages: BaseMessage[] = [new SystemMessage(`You are a ${role}.`)];

  // Add few-shot examples
  examples.forEach(({ question, answer }) => {
    messages.push(new HumanMessage(question));
    messages.push(new AIMessage(answer));
  });

  messages.push(new HumanMessage(newQuestion));
  return messages;
}

// 安全构建MCP
export async function createMCPClientSafely(config: any) {
  try {
    const client = new MultiServerMCPClient(config);
    const tools = await client.getTools();
    console.log(`✅ Connected! Retrieved ${tools.length} tools`);
    return client;
  } catch (error) {
    console.error("Error connecting to MCP:", error);
    return null;
  }
}

// 计算相似度
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magA * magB);
}
