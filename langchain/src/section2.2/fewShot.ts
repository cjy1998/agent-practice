import { createModel } from "../utils";
import {
  ChatPromptTemplate,
  FewShotChatMessagePromptTemplate,
  type BaseMessagePromptTemplateLike,
} from "@langchain/core/prompts";
export default async function fewShot() {
  const model = createModel();
  const examples = [
    { input: "happy", output: "😊" },
    { input: "sad", output: "😢" },
    { input: "excited", output: "🎉" },
  ];
  const template = ChatPromptTemplate.fromMessages([
    ["human", "{input}"],
    ["assistant", "{output}"],
  ]);
  const fewShotPrompt = new FewShotChatMessagePromptTemplate({
    examplePrompt: template,
    examples,
    inputVariables: [],
  });

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful assistant that translates English to emojis.",
    ],
    fewShotPrompt as unknown as BaseMessagePromptTemplateLike,
    ["human", "{input}"],
  ]);

  const chain = prompt.pipe(model);
  const result = await chain.invoke({ input: "happy" });
  console.log(result.content);
}
