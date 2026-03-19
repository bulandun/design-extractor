const COLOR_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b|rgba?\([^\)]+\)|hsla?\([^\)]+\)/g;

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))];
}

function extractFonts(html = "") {
  const familyMatches = [...html.matchAll(/font-family\s*:\s*([^;\"\n]+)/gi)].map(
    (match) => match[1],
  );

  return unique(
    familyMatches
      .flatMap((value) => value.split(","))
      .map((value) => value.replace(/["']/g, "")),
  );
}

function extractColors(html = "") {
  return unique(html.match(COLOR_REGEX) || []);
}

export function parseDesignTokens(source = "") {
  return {
    colors: extractColors(source),
    fonts: extractFonts(source),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { html = "" } = payload;
    const tokens = parseDesignTokens(html);

    return res.status(200).json(tokens);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to extract design tokens",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
