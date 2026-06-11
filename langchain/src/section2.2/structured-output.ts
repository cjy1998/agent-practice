import { createModel } from "../utils/index";
import { z } from "zod";
export default async function main() {
  const model = createModel();
  const personSchema = z.object({
    name: z.string().describe("姓名"),
    age: z.number().describe("年龄"),
    email: z.string().email().describe("邮箱地址"),
  });

  const structuredModel = model.withStructuredOutput(personSchema, {
    strict: true,
    method: "functionCalling",
  });
  const structuredOutput = await structuredModel.invoke(
    "我的名字是张三，年龄28岁，邮箱是1258963@qq.com",
  );

  console.log(structuredOutput);
}
