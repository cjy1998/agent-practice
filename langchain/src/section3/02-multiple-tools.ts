import {
  BaseMessage,
  HumanMessage,
  tool,
  ToolMessage,
  type ToolCall,
} from "langchain";
import z from "zod";
import { dirname, join, resolve } from "node:path";
import { mkdir, readdir } from "node:fs/promises";
import { createModel } from "@/utils";
import { DynamicStructuredTool } from "@langchain/core/tools";
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

const readFileTool = tool(
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

const listDirTool = tool(
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

const writeFileTool = tool(
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
const toolCallHandler = async (
  tools: DynamicStructuredTool[],
  toolCall: ToolCall,
) => {
  const tool = tools.find((t) => t.name === toolCall.name);
  if (tool) {
    const toolResult = await tool.invoke(toolCall.args);
    console.log(`tool ${tool.name} result:`, toolResult);
    return toolResult;
  }
  return null;
};

export default async function main() {
  const tools: DynamicStructuredTool[] = [
    readFileTool,
    listDirTool,
    writeFileTool,
  ];
  const model = createModel();
  const boundModel = model.bindTools(tools);
  const baseMessage: BaseMessage[] = [];
  const userInput = prompt(
    `🧠：我是你的ai助手，你有什么想问的吗？（直接回车退出）：\n`,
  );
  if (!userInput) return;
  baseMessage.push(new HumanMessage(userInput));
  const result = await boundModel.invoke(baseMessage);
  console.log("tool calls result:", result);
  if (result.tool_calls && result.tool_calls.length > 0) {
    for (const toolCall of result.tool_calls) {
      const toolCallFinal = {
        ...toolCall,
        id: toolCall.id ?? crypto.randomUUID(),
      };

      const toolResult = await toolCallHandler(tools, toolCallFinal);
      if (toolResult) {
        baseMessage.push(
          new ToolMessage({
            content: toolResult,
            tool_call_id: toolCallFinal.id,
          }),
        );
        const finalResult = await boundModel.invoke(baseMessage);
        console.log("final result:", finalResult);
      }
    }
  }
}
