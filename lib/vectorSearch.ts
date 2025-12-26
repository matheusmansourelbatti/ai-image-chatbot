import { pool } from "./db";

export async function searchSimilar(embedding: number[], limit = 1) {
  const vectorLiteral = `[${embedding.join(",")}]`;

  const res = await pool.query(
    `
    SELECT id, image_url, description,
           (embedding <=> $1::vector) AS distance
    FROM images
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    [vectorLiteral, limit]
  );

  return res.rows as Array<{
    id: number;
    image_url: string;
    description: string;
    distance: number;
  }>;
}
