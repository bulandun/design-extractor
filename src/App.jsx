import { useMemo, useState } from "react";

const SAMPLE = `<div style="font-family: Inter, Arial; color: #0f172a; background: rgb(226, 232, 240)">Design System</div>`;

export default function App() {
  const [html, setHtml] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState({ colors: [], fonts: [] });

  const hasResults = useMemo(
    () => tokens.colors.length > 0 || tokens.fonts.length > 0,
    [tokens],
  );

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
      <p>Paste HTML/CSS content to extract core colors and font families.</p>

      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        rows={10}
        aria-label="Source HTML"
      />

      <button type="button" onClick={extract} disabled={loading}>
        {loading ? "Extracting..." : "Extract Tokens"}
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
