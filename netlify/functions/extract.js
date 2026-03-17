import { parseDesignTokens } from "../../api/extract.js";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const tokens = parseDesignTokens(payload.html || "");

    return {
      statusCode: 200,
      body: JSON.stringify(tokens),
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to extract design tokens",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
}
