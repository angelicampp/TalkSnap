import OpenAI from "openai";
import { readFile } from 'fs/promises';
const prompts = JSON.parse(
  await readFile(
    new URL('./prompts.json', import.meta.url)
  )
);

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: 'sk-987118c1cf7945289714647542fd860c'
});

export async function summarize(lang, transcript) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: prompts[lang] },
      { role: "user", content: transcript },
    ],
    model: "deepseek-chat",
  });

  return completion.choices[0].message.content
}
