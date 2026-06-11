import { createModel, commonTools } from "@/utils";
import { createAgent, HumanMessage } from "langchain";

export default async function createAgentBasic() {
  const model = createModel();
  const agent = createAgent({
    model,
    tools: commonTools,
  });

  const query = "What is 125*8?";
  const result = await agent.invoke({ messages: [new HumanMessage(query)] });

  const lastMessage = result.messages[result.messages.length - 1];
  console.log(`Agent: ${lastMessage?.content}`);
}
