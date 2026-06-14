import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createModel } from "@/utils";
import { createAgent, HumanMessage } from "langchain";

export default async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const model = createModel();
  const mcpClient = new MultiServerMCPClient({
    context7: {
      transport: "http",
      url: "https://mcp.context7.com/mcp",
    },
    local: {
      transport: "stdio",
      command: "npx",
      args: ["tsx", join(__dirname, "servers/stdio-calculator-server.ts")],
    },
    amapMaps: {
      transport: "http",
      url: "https://mcp.amap.com/mcp?key=",
    },
  });
  const tools = await mcpClient.getTools();

  const agent = createAgent({
    model,
    tools,
  });

  const question1 = "256 * 5";
  console.log("user question:" + question1);
  const req = await agent.invoke({
    messages: [new HumanMessage(question1)],
  });
  console.log("🧠 agent: " + req.messages[req.messages.length - 1]?.content);

  const question2 = "Vue最新的文档，更新了哪些特性？";
  console.log("user question:" + question2);
  const req2 = await agent.invoke({
    messages: [new HumanMessage(question2)],
  });
  console.log("🧠 agent: " + req2.messages[req2.messages.length - 1]?.content);

  const question3 = "从杭州市萧山区银河小区，开车去婺源的路线规划？";
  console.log("user question:" + question3);
  const req3 = await agent.invoke({
    messages: [new HumanMessage(question3)],
  });
  console.log("🧠 agent: " + req3.messages[req3.messages.length - 1]?.content);
}
