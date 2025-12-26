"use client";

export default function UploadButton({ onUpload }: { onUpload: (file: File) => void }) {
  return (
    <label style={{ display: "inline-block", padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>
      Upload image
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />
    </label>
  );
}
