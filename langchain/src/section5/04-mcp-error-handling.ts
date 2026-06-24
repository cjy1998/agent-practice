import { createMCPClientSafely, createModel } from "@/utils";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createAgent, HumanMessage } from "langchain";

export default async function main() {
  let mcpClient: MultiServerMCPClient | null = null;
  try {
    mcpClient = await createMCPClientSafely({
      context7: {
        transport: "http",
        url: "https://mcp.context7.com/mcp",
      },
    });
    if (!mcpClient) {
      console.log("\n 请尝试重新运行");
      throw new Error("没有获取到MCP客户端");
    }
    let tools: any = [];

    try {
      tools = await mcpClient!.getTools();
      console.log(`✅ Retrieved ${tools.length} tools successfully\n`);
      tools.forEach((tool: any) => {
        console.log(`   • ${tool.name}`);
      });
    } catch (error) {
      console.error(
        "❌ Failed to fetch tools:",
        error instanceof Error ? error.message : error,
      );
      console.log("💡 Fallback: Using empty tools array");
      tools = [];
    }
    if (tools.length === 0) {
      console.log("⚠️  No tools available - agent will run without MCP tools");
      console.log("   This is graceful degradation - app continues to work!");
    }
    const model = createModel();
    // 创建一个带重试机制的模型
    const modelWithRetry = model.withRetry({
      // 设置重试次数
      stopAfterAttempt: 3,
    });
    const agent = createAgent({
      model: modelWithRetry,
      tools,
    });
    const query = "What is React? Get the latest documentation.";

    try {
      const timeOutMs = 50000;
      const responsePromise = agent.invoke({
        messages: [new HumanMessage(query)],
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), timeOutMs),
      );
      const response = (await Promise.race([
        responsePromise,
        timeoutPromise,
      ])) as any;

      const lastMessage = response.messages[response.messages.length - 1];
      console.log(`🤖 Agent: ${lastMessage.content}\n`);
    } catch (error) {
      console.error(
        "❌ Query failed:",
        error instanceof Error ? error.message : error,
      );

      // Fallback response
      console.log("💡 Fallback: Providing cached/default response");
      console.log(
        "🤖 Agent: I'm experiencing connectivity issues. Please try again later.",
      );
    }
  } catch (error) {}
}
