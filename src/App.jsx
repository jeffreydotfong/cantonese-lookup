import { useState, useRef } from "react";

export default function CantoneseApp() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const lookup = async () => {
    const word = query.trim();
    if (!word) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      if (!response.ok) throw new Error("API error");
      const parsed = await response.json();
      setResult(parsed);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") lookup();
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <span style={styles.logo}>廣</span>
          <div>
            <h1 style={styles.title}>Cantonese Lookup</h1>
            <p style={styles.subtitle}>English → 廣東話</p>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.searchBox}>
          <input
            ref={inputRef}
            style={styles.input}
            placeholder="Type an English word…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            style={styles.button}
            onClick={lookup}
            disabled={loading || !query.trim()}
            className="lookup-btn"
          >
            {loading ? <span className="spinner" /> : "查"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {result && (
          <div style={styles.card} className="result-card">
            <div style={styles.cardHeader}>
              <span style={styles.englishWord}>{result.word}</span>
              <span style={styles.pos}>{result.partOfSpeech}</span>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionLabel}>Translation</div>
              {result.translations.map((t, i) => (
                <div key={i} style={styles.translationRow}>
                  <span style={styles.chars}>{t.characters}</span>
                  <div style={styles.romaji}>
                    <span style={styles.jyutping}>{t.jyutping}</span>
                    {t.meaning && <span style={styles.gloss}>{t.meaning}</span>}
                  </div>
                </div>
              ))}
            </div>

            {result.classifiers && result.classifiers.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionLabel}>Classifiers 量詞</div>
                <div style={styles.classifierGrid}>
                  {result.classifiers.map((c, i) => (
                    <div key={i} style={styles.classifierCard}>
                      <span style={styles.classifierChar}>{c.characters}</span>
                      <span style={styles.classifierJyut}>{c.jyutping}</span>
                      <span style={styles.classifierUsage}>{c.usage}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.notes && (
              <div style={styles.notes}>
                <span style={styles.notesIcon}>✦</span> {result.notes}
              </div>
            )}
          </div>
        )}

        {!result && !loading && !error && (
          <div style={styles.examples}>
            {["book", "cat", "run", "beautiful", "love"].map((w) => (
              <button
                key={w}
                style={styles.exampleBtn}
                className="example-btn"
                onClick={() => { setQuery(w); }}
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0f0e0c",
    color: "#f0ebe0",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    borderBottom: "1px solid #2a2720",
    padding: "24px 32px",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    maxWidth: 640,
    margin: "0 auto",
  },
  logo: {
    fontSize: 52,
    lineHeight: 1,
    color: "#c8a96e",
    textShadow: "0 0 40px rgba(200,169,110,0.4)",
    fontFamily: "'Noto Serif SC', serif",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "#f0ebe0",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#7a7060",
    letterSpacing: "0.12em",
  },
  main: {
    flex: 1,
    maxWidth: 640,
    width: "100%",
    margin: "0 auto",
    padding: "48px 24px",
  },
  searchBox: {
    display: "flex",
    gap: 12,
    marginBottom: 32,
  },
  input: {
    flex: 1,
    background: "#1a1915",
    border: "1px solid #2e2b24",
    borderRadius: 8,
    padding: "14px 18px",
    fontSize: 18,
    color: "#f0ebe0",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  button: {
    background: "#c8a96e",
    border: "none",
    borderRadius: 8,
    width: 56,
    fontSize: 22,
    color: "#0f0e0c",
    cursor: "pointer",
    fontFamily: "'Noto Serif SC', 'Noto Serif TC', serif",
    fontWeight: 700,
    transition: "background 0.2s, opacity 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#1a1915",
    border: "1px solid #2e2b24",
    borderRadius: 12,
    padding: "28px 32px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: "1px solid #2a2720",
  },
  englishWord: {
    fontSize: 28,
    fontWeight: 700,
    color: "#f0ebe0",
    letterSpacing: "0.02em",
  },
  pos: {
    fontSize: 12,
    color: "#c8a96e",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    background: "rgba(200,169,110,0.12)",
    padding: "3px 8px",
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "#5a5446",
    marginBottom: 14,
  },
  translationRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 12,
  },
  chars: {
    fontSize: 42,
    lineHeight: 1,
    color: "#f0ebe0",
    fontFamily: "'Noto Serif TC', 'Noto Serif SC', serif",
    minWidth: 80,
  },
  romaji: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  jyutping: {
    fontSize: 20,
    color: "#c8a96e",
    fontFamily: "'Courier New', monospace",
    letterSpacing: "0.05em",
  },
  gloss: {
    fontSize: 13,
    color: "#7a7060",
    fontStyle: "italic",
  },
  classifierGrid: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  classifierCard: {
    background: "#141310",
    border: "1px solid #2a2720",
    borderRadius: 8,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    minWidth: 90,
  },
  classifierChar: {
    fontSize: 32,
    fontFamily: "'Noto Serif TC', 'Noto Serif SC', serif",
    color: "#c8a96e",
  },
  classifierJyut: {
    fontSize: 13,
    color: "#c8a96e",
    fontFamily: "'Courier New', monospace",
  },
  classifierUsage: {
    fontSize: 11,
    color: "#5a5446",
    textAlign: "center",
    marginTop: 2,
  },
  notes: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid #2a2720",
    fontSize: 13,
    color: "#7a7060",
    lineHeight: 1.6,
    fontStyle: "italic",
  },
  notesIcon: {
    color: "#c8a96e",
    fontStyle: "normal",
  },
  examples: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  exampleBtn: {
    background: "transparent",
    border: "1px solid #2a2720",
    borderRadius: 6,
    padding: "8px 16px",
    color: "#5a5446",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  error: {
    color: "#c87070",
    fontSize: 14,
    marginTop: -16,
    marginBottom: 16,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&display=swap');
  * { box-sizing: border-box; }
  input:focus {
    border-color: #c8a96e !important;
    box-shadow: 0 0 0 3px rgba(200,169,110,0.1);
  }
  .lookup-btn:hover:not(:disabled) { background: #d4b97e !important; }
  .lookup-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .example-btn:hover { border-color: #c8a96e !important; color: #c8a96e !important; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .result-card { animation: fadeUp 0.35s ease; }
  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(15,14,12,0.3);
    border-top-color: #0f0e0c;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  ::selection { background: rgba(200,169,110,0.3); }
`;
