export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { word } = req.body;
  if (!word) return res.status(400).json({ error: "No word provided" });

  const SYSTEM_PROMPT = `You are a Cantonese language expert. When given an English word, respond ONLY with a JSON object (no markdown, no backticks) in this exact format:

{
  "word": "the English word",
  "partOfSpeech": "noun|verb|adjective|adverb|etc",
  "translations": [
    {
      "characters": "漢字",
      "jyutping": "jyut6 ping3",
      "meaning": "brief English gloss if needed"
    }
  ],
  "classifiers": [
    {
      "characters": "個",
      "jyutping": "go3",
      "usage": "general/most common usage context"
    }
  ],
  "notes": "optional cultural or usage note, or null"
}

Rules:
- Include classifiers (量詞) ONLY for nouns. For all other parts of speech, set "classifiers" to an empty array [].
- Provide 1-3 most common translations.
- Provide 1-3 relevant classifiers for nouns, ordered by most common first.
- Jyutping must use tone numbers (1-6).
- If the word has no good Cantonese equivalent, say so in notes and give the closest translation.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: word }],
      }),
    });

    const data = await response.json();
    const text = data.content.map((b) => b.text || "").join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.status(200).json(parsed);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Translation failed" });
  }
}
