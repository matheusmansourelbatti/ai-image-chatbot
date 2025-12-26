"use client";

import { useRef, useState } from "react";
import UploadButton from "./UploadButton";
import Results from "./Results";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Do you want to upload an image or search for an image?" },
  ]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const assistantBufferRef = useRef("");

  function extractResultsJson(text: string): any[] | null {
    const marker = "RESULTS_JSON:";
    const idx = text.lastIndexOf(marker);
    if (idx === -1) return null;

    const jsonPart = text.slice(idx + marker.length).trim();
    try {
        const parsed = JSON.parse(jsonPart);
        return Array.isArray(parsed?.results) ? parsed.results : null;
    } catch {
        return null;
    }
  }

  async function sendToChat(newMessages: Msg[]) {
    setIsLoading(true);
    assistantBufferRef.current = "";

    const outgoing = [...messages, ...newMessages];

    setMessages([...outgoing, { role: "assistant", content: "" }]);

    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: outgoing }),
    });

    if (!res.ok || !res.body) {
        const raw = await res.text();
        setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
            role: "assistant",
            content: `Error calling /api/chat: ${res.status}\n${raw}`,
        };
        return copy;
        });
        setIsLoading(false);
        return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantBufferRef.current += chunk;

        const maybeResults = extractResultsJson(assistantBufferRef.current);
        if (maybeResults) setResults(maybeResults);

        setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: assistantBufferRef.current };
        return copy;
        });
    }

    setIsLoading(false);
  }

  async function handleUpload(file: File) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const raw = await res.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Upload failed: ${data?.error ?? raw}` },
      ]);
      return;
    }

    const url = data?.stored?.image_url;
    const desc = data?.stored?.description;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Uploaded image: ${url}` },
      { role: "assistant", content: `Stored. Description: ${desc}` },
    ]);
  }

  async function runSearch(query: string) {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: 5 }),
    });
    const data = await res.json();
    setResults(data.results ?? []);
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <UploadButton onUpload={handleUpload} />
        <button
          onClick={() => {
            setMessages([{ role: "assistant", content: "Do you want to upload an image or search for an image?" }]);
            setResults(null);
          }}
          style={{ padding: "8px 12px" }}
        >
          Reset
        </button>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, minHeight: 240 }}>
        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>{m.role}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
          </div>
        ))}
        {isLoading && <div>Thinking…</div>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = text.trim();
          if (!q) return;
          setResults(null);
          void sendToChat([{ role: "user", content: q }]);
          setText("");
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type here…"
          style={{ flex: 1, padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button type="submit" style={{ padding: "10px 14px" }}>
          Send
        </button>
      </form>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => {
            const q = text.trim();
            setResults(null);
            if (q) runSearch(q);
          }}
          style={{ padding: "10px 14px" }}
        >
          Search with current input
        </button>
      </div>

      <Results results={results} />
    </div>
  );
}
