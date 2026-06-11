import { createModel } from "../utils/index";
import { HumanMessage, SystemMessage } from "langchain";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export default async function messagesVsTemplates() {
  const model = createModel();
  //messages
  const messages = [
    new SystemMessage("You are a helpful assistant."),
    new HumanMessage("把今天天气怎么样翻译成英文?"),
  ];
  const result = await model.invoke(messages);
  console.log(`messages result: ${result.content}`);
  // templates
  const template = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful translator."],
    ["human", "Translate '{text}' to {language}"],
  ]);
  const templateChain = template.pipe(model);
  const templateResult = await templateChain.invoke({
    text: "今天天气怎么样",
    language: "日语",
  });
  console.log(`template result: ${templateResult.content}`);
}
