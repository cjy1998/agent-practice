import { createModel } from "@/utils";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import z from "zod";
export default async function main() {
  const model = createModel();
  const CompanySchema = z.object({
    name: z.string().describe("Company name"),
    founded: z.number().describe("Year the company was founded"),
    headquarters: z
      .object({
        city: z.string(),
        country: z.string(),
      })
      .describe("Company headquarters location"),
    products: z.array(z.string()).describe("List of main products or services"),
    employeeCount: z.number().describe("Approximate number of employees"),
    isPublic: z.boolean().describe("Whether the company is publicly traded"),
  });
  const structuredModel = model.withStructuredOutput(CompanySchema, {
    strict: true,
    method: "functionCalling",
  });
  const template = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Extract company information from the text. If information is not available, make reasonable estimates.",
    ],
    ["human", "{text}"],
  ]);
  const chain = template.pipe(structuredModel);
  const companyInfo = `
      Microsoft was founded in 1975 and is headquartered in Redmond, Washington.
      The company is publicly traded and has over 220,000 employees worldwide.
      Their main products include Windows, Office, Azure, and Xbox.
    `;
  const result = await chain.invoke({ text: companyInfo });

  console.log("✅ Extracted Company Data:\n");
  console.log(result);
}
