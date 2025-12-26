import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function describeImage(imageUrl: string) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [
      {
        role: "system",
        content:
          "You are an image captioning assistant. Describe the image clearly and concretely in 1-3 sentences. Include objects, setting, colors, and any notable details.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Describe this image:" },
          { type: "image", image: imageUrl },
        ],
      },
    ],
  });

  return text.trim();
}
