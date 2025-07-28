import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOutput(res.data.data);
    } catch (err) {
      setOutput("Error occurred while processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>📄 Upload PDF</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Upload and Parse"}
      </button>
      {output && (
        <pre style={{ background: "#f0f0f0", padding: 16, marginTop: 20 }}>
          {output}
        </pre>
      )}
    </main>
  );
}
