"use client";

export default function Results({ results }: { results: any[] | null }) {
  if (!results) return null;
  if (results.length === 0) return <div>No results.</div>;

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Results</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {results.map((r) => (
          <div key={r.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
            <img src={r.image_url} alt={r.description} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} />
            <div style={{ marginTop: 8, fontSize: 13 }}>{r.description}</div>
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>distance: {Number(r.distance).toFixed(4)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
