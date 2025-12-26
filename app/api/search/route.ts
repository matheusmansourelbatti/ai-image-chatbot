import { NextResponse } from "next/server";
import { embedText } from "@/lib/embeddings";
import { searchSimilar } from "@/lib/vectorSearch";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { query, limit } = await req.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const embedding = await embedText(query);
  const results = await searchSimilar(embedding, typeof limit === "number" ? limit : 1);

  return NextResponse.json({ results });
}
