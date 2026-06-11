import { createModel } from "../utils";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
export default async function TemplateFormat() {
  // ChatPromptTemplate
  const chatPrompt = ChatPromptTemplate.fromMessages([
    {
      role: "system",
      content: "你是一个以{style}风格并用{language}回答问题的{role}",
    },
    {
      role: "human",
      content: "{question}",
    },
  ]);
  const model = createModel();
  const result = await chatPrompt.pipe(model).invoke({
    role: "pirate",
    style: "dramatic",
    language: "中文",
    question: "什么是 TypeScript?",
  });
  console.log(result.content);

  console.log("\n2️⃣  PromptTemplate:\n");
  // PromptTemplate
  const stringTemplate = PromptTemplate.fromTemplate(
    "用{style}风格写一段{topic}的开头，用{language}回答",
  );
  const prompt = await stringTemplate.format({
    style: "幽默",
    language: "中文",
    topic: "今天周三",
  });

  console.log(prompt + "\n");

  const result2 = await model.invoke(prompt);
  console.log(result2.content);
}
