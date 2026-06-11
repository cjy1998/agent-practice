import { createModel, createConversation } from "../utils/index";

export default async function dynamicMessage() {
  const model = createModel();
  const emojiMessages = createConversation(
    "emoji translator",
    [
      { question: "happy", answer: "😊" },
      { question: "sad", answer: "😢" },
      { question: "excited", answer: "🎉" },
    ],
    "surprised",
  );

  console.log("Messages constructed:", emojiMessages.length);
  const response = await model.invoke(emojiMessages);
  console.log("AI Response:", response.content); // Expected: 😮
}
