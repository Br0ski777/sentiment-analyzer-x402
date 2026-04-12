import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "sentiment-analyzer",
  slug: "sentiment-analyzer",
  description: "Analyze text sentiment with emotion detection, confidence scores, and key phrase extraction.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/analyze",
      price: "$0.005",
      description: "Analyze sentiment of a single text",
      toolName: "text_analyze_sentiment",
      toolDescription: "Use this when you need to determine the sentiment of text. Returns sentiment (positive/negative/neutral), confidence score 0-100, emotion detection (joy/anger/fear/surprise/sadness), and key phrases driving the sentiment. Do NOT use for summarization — use ai_summarize_text. Do NOT use for content extraction — use web_scrape_to_markdown.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "The text to analyze for sentiment" },
        },
        required: ["text"],
      },
    },
    {
      method: "POST",
      path: "/api/analyze/batch",
      price: "$0.04",
      description: "Analyze sentiment of up to 20 texts in batch",
      toolName: "text_analyze_sentiment_batch",
      toolDescription: "Use this when you need to analyze sentiment of multiple texts at once (up to 20). Returns array of sentiment results with emotions and key phrases for each text. Do NOT use for single text — use text_analyze_sentiment.",
      inputSchema: {
        type: "object",
        properties: {
          texts: { type: "array", items: { type: "string" }, description: "Array of texts to analyze (max 20)" },
        },
        required: ["texts"],
      },
    },
  ],
};
