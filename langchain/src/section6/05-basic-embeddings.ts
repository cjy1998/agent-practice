import { OpenAIEmbeddings } from "@langchain/openai";
import { settings } from "../../types/env";
import { cosineSimilarity } from "@/utils";

const embeddings = new OpenAIEmbeddings({
  modelName: settings.embedding_model,
  configuration: {
    baseURL: settings.openai_api_base_url,
  },
  apiKey: settings.openai_api_key,
});

// 创建嵌入
const text = "LangChain makes building AI apps easier";
const embedding = await embeddings.embedQuery(text);

console.log(`Embedding dimensions: ${embedding.length}`);
console.log(`First 10 values: ${embedding.slice(0, 10)}`);

// 相似文本会产生相似的嵌入向量
const similar = await embeddings.embedQuery(
  "LangChain simplifies AI development",
);
const different = await embeddings.embedQuery("I love pizza");

console.log(
  "Similarity (LangChain vs LangChain):",
  cosineSimilarity(embedding, similar).toFixed(3),
);
console.log(
  "Similarity (LangChain vs pizza):",
  cosineSimilarity(embedding, different).toFixed(3),
);
