import React, { useMemo, useState } from "react";

const SAMPLE = `<div style="font-family: Inter, Arial; color: #0f172a; background: rgb(226, 232, 240)">Design System</div>`;

export default function App() {
  const [html, setHtml] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState({ colors: [], fonts: [] });
  const [pdfName, setPdfName] = useState("");
  const [pdfStatus, setPdfStatus] = useState("");

  const hasResults = useMemo(
    () => tokens.colors.length > 0 || tokens.fonts.length > 0,
    [tokens],
  );

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setPdfName(file.name);

    if (file.type !== "application/pdf") {
      setPdfStatus("Please upload a .pdf file.");
      return;
    }

    try {
      const rawText = await file.text();
      const normalizedText = rawText.replace(/\u0000/g, " ");

      setHtml(normalizedText);
      setPdfStatus("PDF loaded. Click \"Extract Schema\" to parse tokens.");
      setTokens({ colors: [], fonts: [] });
    } catch (uploadError) {
      setPdfStatus("");
      setError(
        uploadError instanceof Error
          ? `Failed to read PDF: ${uploadError.message}`
          : "Failed to read PDF",
      );
    }
  };

  const extract = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoints = ["/api/extract", "/.netlify/functions/extract"];
      let response;

      for (const endpoint of endpoints) {
        const candidate = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ html }),
        });

        if (candidate.ok || candidate.status !== 404) {
          response = candidate;
          break;
        }
      }

      if (!response?.ok) {
        throw new Error(`Request failed: ${response?.status ?? "unknown"}`);
      }

      setTokens(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <h1>Design System Extractor</h1>
      <p>Upload a PDF or paste HTML/CSS content to extract colors and font families.</p>

      <section className="upload-area" aria-label="PDF upload area">
        <h2>PDF Upload</h2>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handlePdfUpload}
          aria-label="Upload PDF"
        />
        {pdfName && <p className="status">Loaded file: {pdfName}</p>}
        {pdfStatus && <p className="status">{pdfStatus}</p>}
      </section>

      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        rows={10}
        aria-label="Source HTML"
      />

      <button type="button" onClick={extract} disabled={loading}>
        {loading ? "Extracting..." : "Extract Schema"}
      </button>

      {error && <p className="error">{error}</p>}

      {hasResults && (
        <section className="results">
          <h2>Results</h2>
          <div>
            <h3>Colors</h3>
            <ul>
              {tokens.colors.map((color) => (
                <li key={color}>{color}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Fonts</h3>
            <ul>
              {tokens.fonts.map((font) => (
                <li key={font}>{font}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
