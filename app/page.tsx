import Chat from "../components/Chat";

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>AI Image Chatbot</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Upload images to index them. Search by description to find similar ones.
      </p>
      <div style={{ marginTop: 24 }}>
        <Chat />
      </div>
    </main>
  );
}
