import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "sentiment-analyzer",
  slug: "sentiment-analyzer",
  description: "Sentiment analysis with emotion detection, confidence scores, and key phrase extraction. Single or batch mode.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/analyze",
      price: "$0.005",
      description: "Analyze sentiment of a single text",
      toolName: "text_analyze_sentiment",
      toolDescription: `Use this when you need to determine the emotional tone and sentiment of text. Returns structured sentiment analysis with emotion breakdown and key drivers.

1. sentiment: overall sentiment label (positive, negative, neutral)
2. confidence: confidence score 0-100
3. emotions: detected emotions with scores (joy, anger, fear, surprise, sadness)
4. keyPhrases: array of phrases driving the sentiment
5. score: numeric sentiment score from -1.0 (negative) to 1.0 (positive)

Example output: {"sentiment":"positive","confidence":87,"score":0.73,"emotions":{"joy":0.82,"surprise":0.15,"anger":0.01,"fear":0.01,"sadness":0.01},"keyPhrases":["excellent results","exceeded expectations"]}

Use this BEFORE responding to customer feedback, reviews, or social media mentions. Essential for brand monitoring, support ticket triage, and content tone analysis.

Do NOT use for summarization -- use ai_summarize_text. Do NOT use for content extraction -- use web_scrape_to_markdown. Do NOT use for text classification -- use text_classify_content.`,
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
      toolDescription: `Use this when you need to analyze sentiment of multiple texts at once (up to 20). Returns an array of individual sentiment results in one call.

1. results: array of sentiment objects, one per input text
2. Each result contains: sentiment, confidence, score, emotions, keyPhrases
3. averageSentiment: overall average sentiment score across all texts
4. distribution: count of positive/negative/neutral texts

Example output: {"results":[{"sentiment":"positive","confidence":91,"score":0.8},{"sentiment":"negative","confidence":74,"score":-0.6}],"averageSentiment":0.1,"distribution":{"positive":1,"negative":1,"neutral":0}}

Use this FOR bulk analysis of reviews, survey responses, or social media feeds. Essential when comparing sentiment across multiple data points.

Do NOT use for single text -- use text_analyze_sentiment. Do NOT use for text classification -- use text_classify_content. Do NOT use for language detection -- use text_detect_language.`,
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
