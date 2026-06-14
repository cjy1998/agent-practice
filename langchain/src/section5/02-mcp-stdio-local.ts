import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { createModel } from "@/utils";
import { createAgent, HumanMessage } from "langchain";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function main() {
  const model = createModel();
  const mcpClient = new MultiServerMCPClient({
    local: {
      transport: "stdio",
      command: "npx",
      args: ["tsx", join(__dirname, "servers/stdio-calculator-server.ts")],
    },
  });

  try {
    const tools = await mcpClient.getTools();
    console.log("tools", tools);
    const agent = createAgent({
      model,
      tools,
    });
    // 4. Test calculations
    console.log("🧮 Testing calculator tool...\n");

    const mathQuery = "What is 15 * 23 + 100?";
    console.log(`👤 User: ${mathQuery}`);

    const mathResponse = await agent.invoke({
      messages: [new HumanMessage(mathQuery)],
    });
    const mathResult = mathResponse.messages[mathResponse.messages.length - 1];
    console.log(`🤖 Agent: ${mathResult?.content}\n`);

    // 5. Test temperature conversion
    console.log("🌡️  Testing temperature conversion...\n");

    const tempQuery = "Convert 100 degrees Fahrenheit to Celsius";
    console.log(`👤 User: ${tempQuery}`);

    const tempResponse = await agent.invoke({
      messages: [new HumanMessage(tempQuery)],
    });
    const tempResult = tempResponse.messages[tempResponse.messages.length - 1];
    console.log(`🤖 Agent: ${tempResult?.content}\n`);

    // 6. Test complex calculation
    console.log("🔢 Testing complex math...\n");

    const complexQuery =
      "Calculate the square root of 144 plus the sine of pi/2";
    console.log(`👤 User: ${complexQuery}`);

    const complexResponse = await agent.invoke({
      messages: [new HumanMessage(complexQuery)],
    });
    const complexResult =
      complexResponse.messages[complexResponse.messages.length - 1];
    console.log(`🤖 Agent: ${complexResult?.content}\n`);
  } catch (error: unknown) {
    console.error(error);
  }
}
