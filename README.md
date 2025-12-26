# AI Image Chatbot (Next.js + Vercel AI SDK + Postgres/pgvector)

A simple AI chatbot that lets users:

- **Upload an image** → the app generates a description (vision model), embeds the description, and stores it in Postgres.
- **Search for an image** by text → the app embeds the query and runs a **vector similarity search** against stored image embeddings.

## Tech Stack

- **Next.js** (App Router)
- **Vercel AI SDK** (chat endpoint)
- **Postgres + pgvector** (embedding storage + similarity search)
- **Vercel Blob** (image storage)
- **OpenAI** (image description + text embeddings)

---

## Features

### Upload flow
1. User uploads an image.
2. Server uploads it to Vercel Blob (public URL).
3. Server generates an image description using a vision model.
4. Server generates an embedding from the description.
5. Stores `{image_url, description, embedding}` in Postgres.

### Search flow
1. User chooses "search" in the chat.
2. User provides a short description of what they want.
3. Server embeds that query text.
4. Runs pgvector similarity search against stored image embeddings.
5. Returns the closest matches and displays images in the UI.

---

## Requirements

- Node.js 18+ (recommended)
- A Postgres database with **pgvector** enabled (Neon, Supabase, etc.)
- An OpenAI API key (paid API access required)
- A Vercel Blob store + read/write token

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require
OPENAI_API_KEY=sk-...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

---

## Database Setup (pgvector + schema)

Run the migrations under /sql to the database

---

## Install + Run Locally

npm install
npm run dev

Then open:

http://localhost:3000