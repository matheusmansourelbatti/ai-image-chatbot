import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

import { embedText } from "@/lib/embeddings";
import { searchSimilar } from "@/lib/vectorSearch";

export const runtime = "nodejs";

type Msg = { role: "user" | "assistant"; content: string };

function lastUserMessage(messages: Msg[]) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content ?? "";
  }
  return "";
}

function findLastUserIndexMatching(messages: Msg[], predicate: (s: string) => boolean) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && predicate(messages[i].content ?? "")) return i;
  }
  return -1;
}

function formatResults(results: Array<{ id: number; image_url: string; description: string; distance: number }>) {
  if (!results.length) {
    return `No similar images found. Try a more specific description.

RESULTS_JSON:${JSON.stringify({ results: [] })}`;
  }

  const lines = results.map(
    (r) =>
      `- ${r.image_url} — ${r.description} (distance: ${Number(r.distance).toFixed(4)})`
  );

  return `Here are the closest matches:
${lines.join("\n")}

RESULTS_JSON:${JSON.stringify({
    results: results.map((r) => ({
      id: r.id,
      image_url: r.image_url,
      description: r.description,
      distance: r.distance,
    })),
  })}`;
}


export async function POST(req: Request) {
  const body = await req.json();
  const messages = (body?.messages ?? []) as Msg[];

  const lastUser = lastUserMessage(messages).trim();
  const lastUserLower = lastUser.toLowerCase();

  if (!lastUser) {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: `Ask exactly: "Do you want to upload an image or search for an image?"`,
      messages,
    });
    return result.toTextStreamResponse();
  }

  if (lastUserLower === "upload" || lastUserLower.includes("upload")) {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: `
You are an AI chatbot for an image library.
The user chose UPLOAD. Tell them to click the Upload button and pick an image.
Be concise.
`.trim(),
      messages,
    });
    return result.toTextStreamResponse();
  }

  if (lastUserLower === "search" || lastUserLower.includes("search")) {
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: `
You are an AI chatbot for an image library.
The user chose SEARCH. Ask them to describe the image they want in 1 sentence.
`.trim(),
      messages,
    });
    return result.toTextStreamResponse();
  }

  const lastSearchChoiceIdx = findLastUserIndexMatching(messages, (s) =>
    (s ?? "").toLowerCase().includes("search")
  );

  if (lastSearchChoiceIdx !== -1 && lastSearchChoiceIdx < messages.length - 1) {
    const embedding = await embedText(lastUser);
    const results = await searchSimilar(embedding, 1);

    return new Response(formatResults(results), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: `
You are an AI chatbot for an image library.
Ask exactly: "Do you want to upload an image or search for an image?"
If the user gives something else, repeat the question and ask them to answer with "upload" or "search".
`.trim(),
    messages,
  });

  return result.toTextStreamResponse();
}
