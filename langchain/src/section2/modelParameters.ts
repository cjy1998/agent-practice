import { createModel } from "../utils/index";
/**
 * 模型参数
 */
export default async function modelParameters() {
  const temperatures = [0, 0.5, 1];
  for (const temperature of temperatures) {
    const model = createModel({
      parameters: {
        temperature,
        maxTokens: 50,
      },
    });
    const result = await model.invoke(
      "为一篇关于时间旅行的科幻故事写一个有创意的开头。",
    );
    const modelWithRetry = model.withRetry({
      stopAfterAttempt: 3,
    });
    console.log(result.content);
  }
}
