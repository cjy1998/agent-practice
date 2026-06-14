import { createModel } from "@/utils";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent, HumanMessage } from "langchain";

export default async function main() {
  const model = createModel();
  const mcpClient = new MultiServerMCPClient({
    context7: {
      transport: "http",
      url: "https://mcp.context7.com/mcp",
    },
  });

  try {
    const tools = await mcpClient.getTools();
    console.log("工具", tools);

    const agent = createAgent({
      model,
      tools,
    });

    const query = "你先在可以调用哪些 tool";
    console.log(`👤 User: ${query}\n`);

    const response = await agent.invoke({
      messages: [new HumanMessage(query)],
    });
    const lastMessage = response.messages[response.messages.length - 1];

    console.log(`🤖 Agent: ${lastMessage?.content}\n`);
  } catch (error: unknown) {
    console.error(error);
  }
}
