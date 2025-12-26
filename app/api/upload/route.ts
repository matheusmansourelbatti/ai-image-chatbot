import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { describeImage } from "@/lib/vision";
import { embedText } from "@/lib/embeddings";
import { pool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const description = await describeImage(blob.url);

  const embedding = await embedText(description);
  const vectorLiteral = `[${embedding.join(",")}]`;

  const inserted = await pool.query(
    `
    INSERT INTO images (image_url, description, embedding)
    VALUES ($1, $2, $3::vector)
    RETURNING id, image_url, description
    `,
    [blob.url, description, vectorLiteral]
  );

  return NextResponse.json({
    stored: inserted.rows[0],
  });
}
