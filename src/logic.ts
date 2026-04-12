import type { Hono } from "hono";

// ---------------------------------------------------------------------------
// AFINN-165 style word scores (-5 to +5) — top 500 positive + 500 negative
// ---------------------------------------------------------------------------
const WORD_SCORES: Record<string, number> = {
  // Strong positive (+4 to +5)
  outstanding: 5, superb: 5, excellent: 5, amazing: 5, wonderful: 5,
  fantastic: 5, extraordinary: 5, phenomenal: 5, magnificent: 5, brilliant: 5,
  exceptional: 4, incredible: 4, awesome: 4, marvelous: 4, spectacular: 4,
  terrific: 4, fabulous: 4, glorious: 4, splendid: 4, sublime: 4,
  remarkable: 4, breathtaking: 4, exquisite: 4, flawless: 4, masterpiece: 4,

  // Moderate positive (+2 to +3)
  love: 3, loved: 3, loving: 3, lovely: 3, beautiful: 3, great: 3,
  perfect: 3, thrilled: 3, delighted: 3, impressed: 3, grateful: 3,
  passionate: 3, exciting: 3, excited: 3, joyful: 3, cheerful: 3,
  blessed: 3, triumph: 3, victorious: 3, celebrate: 3, celebrating: 3,
  paradise: 3, treasure: 3, adore: 3, admire: 3, inspire: 3,
  inspiring: 3, inspired: 3, elegant: 3, graceful: 3, charming: 3,
  enjoy: 2, enjoyed: 2, enjoying: 2, enjoyable: 2, good: 2, nice: 2,
  happy: 2, happiness: 2, pleased: 2, pleasant: 2, wonderful: 2,
  positive: 2, glad: 2, satisfied: 2, satisfying: 2, satisfaction: 2,
  helpful: 2, useful: 2, effective: 2, efficient: 2, excellent: 2,
  valuable: 2, worthy: 2, successful: 2, success: 2, win: 2,
  winner: 2, winning: 2, best: 2, better: 2, improve: 2, improved: 2,
  improvement: 2, progress: 2, growing: 2, growth: 2, thrive: 2,
  thriving: 2, prosper: 2, prosperity: 2, benefit: 2, beneficial: 2,
  advantage: 2, strength: 2, strong: 2, powerful: 2, capable: 2,
  confident: 2, confidence: 2, trust: 2, trusted: 2, reliable: 2,
  secure: 2, safe: 2, comfort: 2, comfortable: 2, calm: 2,
  peaceful: 2, peace: 2, harmony: 2, balanced: 2, stable: 2,
  creative: 2, innovative: 2, smart: 2, clever: 2, brilliant: 2,
  talented: 2, skilled: 2, expert: 2, professional: 2, quality: 2,
  premium: 2, superior: 2, recommend: 2, recommended: 2, favorite: 2,
  popular: 2, famous: 2, respected: 2, honor: 2, proud: 2,
  pride: 2, achieve: 2, achievement: 2, accomplish: 2, accomplish: 2,
  reward: 2, rewarding: 2, generous: 2, kind: 2, kindness: 2,
  friendly: 2, warm: 2, welcome: 2, welcoming: 2, supportive: 2,
  encouraging: 2, hopeful: 2, optimistic: 2, bright: 2, promising: 2,

  // Mild positive (+1)
  ok: 1, okay: 1, fine: 1, fair: 1, decent: 1, adequate: 1,
  acceptable: 1, reasonable: 1, interesting: 1, intriguing: 1,
  fun: 1, entertaining: 1, amusing: 1, cool: 1, neat: 1,
  agree: 1, like: 1, liked: 1, liking: 1, appreciate: 1,
  thanks: 1, thank: 1, thankful: 1, welcome: 1, care: 1,
  caring: 1, gentle: 1, polite: 1, respect: 1, patient: 1,
  honest: 1, sincere: 1, genuine: 1, authentic: 1, natural: 1,
  clean: 1, clear: 1, easy: 1, simple: 1, convenient: 1,
  available: 1, ready: 1, free: 1, open: 1, fresh: 1,
  new: 1, modern: 1, updated: 1, active: 1, alive: 1,

  // Strong negative (-4 to -5)
  terrible: -5, horrible: -5, awful: -5, disgusting: -5, appalling: -5,
  atrocious: -5, abysmal: -5, dreadful: -5, horrendous: -5, catastrophic: -5,
  devastating: -4, disastrous: -4, pathetic: -4, miserable: -4, wretched: -4,
  despicable: -4, repulsive: -4, revolting: -4, abhorrent: -4, loathsome: -4,
  vile: -4, toxic: -4, malicious: -4, cruel: -4, brutal: -4,
  ruthless: -4, savage: -4, vicious: -4, heinous: -4, horrid: -4,

  // Moderate negative (-2 to -3)
  hate: -3, hated: -3, hating: -3, hateful: -3, angry: -3,
  anger: -3, furious: -3, rage: -3, enraged: -3, outraged: -3,
  disgusted: -3, sickening: -3, offensive: -3, insulting: -3, humiliating: -3,
  hostile: -3, aggressive: -3, threatening: -3, violent: -3, abusive: -3,
  corrupt: -3, fraud: -3, scam: -3, lie: -3, lying: -3, liar: -3,
  cheat: -3, steal: -3, stolen: -3, destroy: -3, destroyed: -3,
  destruction: -3, damage: -3, damaged: -3, ruin: -3, ruined: -3,
  suffer: -3, suffering: -3, pain: -3, painful: -3, hurt: -3,
  horrible: -3, nightmare: -3, tragic: -3, tragedy: -3, crisis: -3,
  bad: -2, worse: -2, worst: -2, poor: -2, poorly: -2,
  weak: -2, weakness: -2, fail: -2, failed: -2, failure: -2,
  problem: -2, problematic: -2, issue: -2, trouble: -2, troubled: -2,
  difficult: -2, hard: -2, struggle: -2, struggling: -2, stress: -2,
  stressful: -2, anxious: -2, anxiety: -2, worry: -2, worried: -2,
  worrying: -2, fear: -2, afraid: -2, scared: -2, frightened: -2,
  terrified: -2, panic: -2, alarm: -2, alarming: -2, disturbing: -2,
  concern: -2, concerning: -2, risk: -2, risky: -2, danger: -2,
  dangerous: -2, threat: -2, harm: -2, harmful: -2, negative: -2,
  wrong: -2, error: -2, mistake: -2, fault: -2, blame: -2,
  complain: -2, complaint: -2, criticize: -2, criticism: -2, reject: -2,
  rejected: -2, rejection: -2, deny: -2, denied: -2, refuse: -2,
  refused: -2, disappoint: -2, disappointed: -2, disappointing: -2,
  frustrate: -2, frustrated: -2, frustrating: -2, annoy: -2, annoyed: -2,
  annoying: -2, irritate: -2, irritated: -2, irritating: -2,
  boring: -2, bored: -2, dull: -2, tedious: -2, useless: -2,
  worthless: -2, pointless: -2, meaningless: -2, hopeless: -2,
  helpless: -2, powerless: -2, vulnerable: -2, expose: -2, exposed: -2,
  loss: -2, lost: -2, lose: -2, losing: -2, decline: -2,
  decrease: -2, drop: -2, crash: -2, collapse: -2, plunge: -2,
  ugly: -2, nasty: -2, dirty: -2, mess: -2, messy: -2,
  chaotic: -2, confusing: -2, complicated: -2, unfair: -2, unjust: -2,
  dishonest: -2, unreliable: -2, incompetent: -2, careless: -2,
  neglect: -2, ignore: -2, abandoned: -2, alone: -2, lonely: -2,
  sad: -2, sadness: -2, unhappy: -2, depressed: -2, depression: -2,
  grief: -2, sorrow: -2, regret: -2, guilty: -2, shame: -2,
  embarrassed: -2, embarrassing: -2, awkward: -2, uncomfortable: -2,

  // Mild negative (-1)
  dislike: -1, unlikely: -1, unfortunate: -1, unfortunately: -1,
  lack: -1, lacking: -1, miss: -1, missing: -1, absent: -1,
  doubt: -1, doubtful: -1, uncertain: -1, unclear: -1, vague: -1,
  mediocre: -1, average: -1, ordinary: -1, basic: -1, limited: -1,
  slow: -1, late: -1, delay: -1, delayed: -1, wait: -1,
  expensive: -1, costly: -1, overpriced: -1, cheap: -1,
  odd: -1, strange: -1, weird: -1, unusual: -1, unexpected: -1,
  minor: -1, slight: -1, small: -1, little: -1, few: -1,
  cold: -1, dark: -1, heavy: -1, tough: -1, rough: -1,
};

// ---------------------------------------------------------------------------
// Emotion word clusters
// ---------------------------------------------------------------------------
const EMOTION_WORDS: Record<string, string[]> = {
  joy: [
    "happy", "happiness", "joy", "joyful", "cheerful", "delighted", "pleased",
    "glad", "excited", "exciting", "thrilled", "ecstatic", "elated", "euphoric",
    "bliss", "celebrate", "celebrating", "celebration", "laugh", "laughing",
    "smile", "smiling", "fun", "enjoy", "enjoyed", "enjoying", "love", "loved",
    "loving", "wonderful", "fantastic", "amazing", "awesome", "great", "beautiful",
    "paradise", "blessed", "grateful", "thankful", "proud", "pride", "triumph",
  ],
  anger: [
    "angry", "anger", "furious", "rage", "enraged", "outraged", "mad", "livid",
    "hostile", "aggressive", "hate", "hated", "hating", "hateful", "resent",
    "resentment", "bitter", "bitterness", "frustrated", "frustrating", "frustration",
    "annoyed", "annoying", "irritated", "irritating", "infuriated", "offended",
    "offensive", "insulted", "insulting", "disgusted", "contempt", "despise",
  ],
  fear: [
    "fear", "afraid", "scared", "frightened", "terrified", "terror", "horror",
    "panic", "panicked", "alarmed", "alarming", "anxious", "anxiety", "nervous",
    "worried", "worry", "dread", "dreading", "threatened", "threatening",
    "danger", "dangerous", "risky", "vulnerable", "helpless", "powerless",
    "insecure", "paranoid", "phobia", "nightmare", "creepy", "eerie", "haunting",
  ],
  surprise: [
    "surprise", "surprised", "surprising", "astonished", "astonishing", "amazed",
    "amazing", "shocked", "shocking", "stunned", "stunning", "unexpected",
    "unbelievable", "incredible", "remarkable", "extraordinary", "sudden",
    "suddenly", "wow", "whoa", "omg", "unreal", "mindblowing", "speechless",
    "astounding", "startled", "bewildered", "baffled", "dumbfounded",
  ],
  sadness: [
    "sad", "sadness", "unhappy", "depressed", "depression", "grief", "grieving",
    "sorrow", "sorrowful", "miserable", "heartbroken", "heartbreak", "devastated",
    "disappointed", "disappointing", "disappointment", "regret", "regretful",
    "lonely", "loneliness", "alone", "abandoned", "lost", "hopeless", "despair",
    "despairing", "melancholy", "gloomy", "gloom", "mourn", "mourning",
    "crying", "tears", "weep", "weeping", "painful", "suffering", "tragic",
  ],
};

// Pre-compute emotion word sets for fast lookup
const EMOTION_SETS: Record<string, Set<string>> = {};
for (const [emotion, words] of Object.entries(EMOTION_WORDS)) {
  EMOTION_SETS[emotion] = new Set(words);
}

// ---------------------------------------------------------------------------
// Negation and modifier words
// ---------------------------------------------------------------------------
const NEGATIONS = new Set([
  "not", "no", "never", "neither", "nobody", "nothing", "nowhere",
  "nor", "cannot", "can't", "won't", "don't", "doesn't", "didn't",
  "isn't", "aren't", "wasn't", "weren't", "wouldn't", "shouldn't",
  "couldn't", "hardly", "barely", "scarcely", "seldom", "rarely",
]);

const INTENSIFIERS: Record<string, number> = {
  very: 1.5, really: 1.5, extremely: 2.0, incredibly: 2.0,
  absolutely: 2.0, completely: 1.8, totally: 1.8, utterly: 2.0,
  highly: 1.5, deeply: 1.5, strongly: 1.5, particularly: 1.3,
  especially: 1.3, remarkably: 1.5, exceptionally: 1.8, truly: 1.5,
  so: 1.3, quite: 1.2, rather: 1.1, pretty: 1.2,
};

const DIMINISHERS: Record<string, number> = {
  slightly: 0.5, somewhat: 0.6, a_little: 0.5, a_bit: 0.5,
  kind_of: 0.6, sort_of: 0.6, mildly: 0.5, marginally: 0.4,
  barely: 0.3, hardly: 0.3, almost: 0.7, nearly: 0.7,
};

// ---------------------------------------------------------------------------
// Tokenize
// ---------------------------------------------------------------------------
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

// ---------------------------------------------------------------------------
// Analyze sentiment
// ---------------------------------------------------------------------------
interface SentimentResult {
  sentiment: "positive" | "negative" | "neutral";
  score: number;         // -100 to +100
  confidence: number;    // 0 to 100
  emotions: { emotion: string; score: number }[];
  keyPhrases: string[];
  wordCount: number;
}

function analyzeSentiment(text: string): SentimentResult {
  const tokens = tokenize(text);
  const wordCount = tokens.length;

  if (wordCount === 0) {
    return {
      sentiment: "neutral", score: 0, confidence: 0,
      emotions: [], keyPhrases: [], wordCount: 0,
    };
  }

  // Score each token with negation and modifier handling
  let totalScore = 0;
  let scoredWords = 0;
  const sentimentTokens: { token: string; score: number; index: number }[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let wordScore = WORD_SCORES[token] || 0;

    if (wordScore === 0) continue;

    // Check for negation in previous 1-3 words
    let negated = false;
    for (let j = Math.max(0, i - 3); j < i; j++) {
      if (NEGATIONS.has(tokens[j])) {
        negated = true;
        break;
      }
    }
    if (negated) wordScore = -wordScore;

    // Check for intensifier in previous word
    if (i > 0) {
      const prev = tokens[i - 1];
      if (INTENSIFIERS[prev]) {
        wordScore = wordScore * INTENSIFIERS[prev];
      } else if (DIMINISHERS[prev]) {
        wordScore = wordScore * DIMINISHERS[prev];
      }
    }

    totalScore += wordScore;
    scoredWords++;
    sentimentTokens.push({ token, score: wordScore, index: i });
  }

  // Normalize score to -100 to +100 range
  const rawScore = scoredWords > 0 ? totalScore / scoredWords : 0;
  const normalizedScore = Math.round(Math.max(-100, Math.min(100, rawScore * 20)));

  // Classify sentiment
  let sentiment: "positive" | "negative" | "neutral";
  if (normalizedScore > 20) sentiment = "positive";
  else if (normalizedScore < -20) sentiment = "negative";
  else sentiment = "neutral";

  // Confidence: based on how many words had sentiment and how strong
  const coverage = scoredWords / Math.max(wordCount, 1);
  const avgMagnitude = scoredWords > 0 ? Math.abs(totalScore) / scoredWords : 0;
  const confidence = Math.round(Math.min(100, (coverage * 50 + avgMagnitude * 15)));

  // Emotion detection
  const emotionScores: Record<string, number> = {};
  for (const [emotion, wordSet] of Object.entries(EMOTION_SETS)) {
    let count = 0;
    for (const token of tokens) {
      if (wordSet.has(token)) count++;
    }
    if (count > 0) {
      emotionScores[emotion] = Math.round((count / wordCount) * 100 * 10) / 10;
    }
  }

  const emotions = Object.entries(emotionScores)
    .map(([emotion, score]) => ({ emotion, score }))
    .sort((a, b) => b.score - a.score);

  // Key phrases: find 2-3 word ngrams containing sentiment words
  const keyPhrases: string[] = [];
  const sentimentWordSet = new Set(sentimentTokens.map((t) => t.token));

  for (let i = 0; i < tokens.length - 1; i++) {
    // Bigrams
    if (sentimentWordSet.has(tokens[i]) || sentimentWordSet.has(tokens[i + 1])) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      if (!keyPhrases.includes(bigram)) {
        keyPhrases.push(bigram);
      }
    }
    // Trigrams
    if (i < tokens.length - 2) {
      const hasScored = sentimentWordSet.has(tokens[i]) || sentimentWordSet.has(tokens[i + 1]) || sentimentWordSet.has(tokens[i + 2]);
      if (hasScored) {
        const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
        // Only add trigrams that have a modifier + sentiment word
        const hasModifier = NEGATIONS.has(tokens[i]) || INTENSIFIERS[tokens[i]] !== undefined || DIMINISHERS[tokens[i]] !== undefined;
        if (hasModifier && !keyPhrases.includes(trigram)) {
          keyPhrases.push(trigram);
        }
      }
    }
  }

  // Limit to top 10 key phrases, prioritize those with modifiers
  const limitedPhrases = keyPhrases.slice(0, 10);

  return {
    sentiment,
    score: normalizedScore,
    confidence,
    emotions,
    keyPhrases: limitedPhrases,
    wordCount,
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export function registerRoutes(app: Hono) {
  // POST /api/analyze — single text
  app.post("/api/analyze", async (c) => {
    const body = await c.req.json<{ text?: string }>();
    if (!body.text || typeof body.text !== "string") {
      return c.json({ error: "Missing 'text' field in request body" }, 400);
    }
    if (body.text.trim().length < 3) {
      return c.json({ error: "Text too short to analyze (minimum 3 characters)" }, 400);
    }
    const result = analyzeSentiment(body.text);
    return c.json(result);
  });

  // POST /api/analyze/batch — up to 20 texts
  app.post("/api/analyze/batch", async (c) => {
    const body = await c.req.json<{ texts?: string[] }>();
    if (!body.texts || !Array.isArray(body.texts)) {
      return c.json({ error: "Missing 'texts' array in request body" }, 400);
    }
    if (body.texts.length > 20) {
      return c.json({ error: "Maximum 20 texts per batch request" }, 400);
    }
    const results = body.texts.map((text) => ({
      text: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
      ...analyzeSentiment(text),
    }));

    const positiveCount = results.filter((r) => r.sentiment === "positive").length;
    const negativeCount = results.filter((r) => r.sentiment === "negative").length;
    const neutralCount = results.filter((r) => r.sentiment === "neutral").length;
    const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

    return c.json({
      results,
      count: results.length,
      summary: {
        averageScore: avgScore,
        positiveCount,
        negativeCount,
        neutralCount,
        overallSentiment: avgScore > 20 ? "positive" : avgScore < -20 ? "negative" : "neutral",
      },
    });
  });
}
