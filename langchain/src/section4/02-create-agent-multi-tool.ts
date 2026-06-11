import { createModel, commonTools } from "@/utils";
import { createAgent, HumanMessage } from "langchain";

export default async function createAgentBasic() {
  const model = createModel();
  const agent = createAgent({
    model,
    tools: commonTools,
  });

  const querys = ["What is 125*8?", "查看一下有什么文件"];

  for (const query of querys) {
    const response = await agent.invoke({
      messages: [new HumanMessage(query)],
    });
    const lastMessage = response.messages[response.messages.length - 1];
    console.log(`User: ${query}`);
    console.log(`Agent: ${lastMessage?.content}\n`);
  }
}
