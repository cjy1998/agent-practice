import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";

const __dirname = dirname(fileURLToPath(import.meta.url));
export default async function loadText() {
  const sampleText = `
LangChain.js is a framework for building applications with large language models.

It provides tools for:
- Working with different AI providers
- Managing prompts and templates
- Processing and storing documents
- Building RAG systems
- Creating AI agents

The framework is designed to be modular and composable, allowing developers
to build complex AI applications by combining simple, reusable components.
`.trim();
  const filePath = join(__dirname, "data", "sample.txt");
  writeFileSync(filePath, sampleText);

  const loader = new TextLoader(filePath);
  const docs = await loader.load();
  console.log("Loaded documents:", docs.length);
  console.log("Content:", docs[0].pageContent);
  console.log("Metadata:", docs[0].metadata);
}
