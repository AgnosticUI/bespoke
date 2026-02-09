/**
 * match-niche.ts
 * Analyzes user description and classifies into niche taxonomy
 *
 * Usage: npx tsx scripts/match-niche.ts --description "patient portal for telemedicine"
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { resetState, completeStage } from './utils/state-manager.js';

interface NicheData {
  niche_id: string;
  niche_name: string;
  description: string;
  application_types: string[];
  primary_keywords: string[];
  secondary_keywords: string[];
  negative_keywords: string[];
  phrases: string[];
}

interface Taxonomy {
  niches: NicheData[];
}

interface MatchResult {
  niche_id: string;
  application_type: string;
  confidence: number;
  reasoning: string;
  matched_keywords: string[];
  alternative_niches: Array<{
    niche_id: string;
    confidence: number;
    application_type?: string;
  }>;
}

// Parse CLI arguments
function parseArgs(): { description: string; strict: boolean; minConfidence: number } {
  const args = process.argv.slice(2);
  let description = '';
  let strict = false;
  let minConfidence = 0.5;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--description' && args[i + 1]) {
      description = args[i + 1];
      i++;
    } else if (args[i] === '--strict') {
      strict = true;
    } else if (args[i] === '--min-confidence' && args[i + 1]) {
      minConfidence = parseFloat(args[i + 1]);
      i++;
    }
  }

  if (!description) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Missing --description parameter' }));
    process.exit(1);
  }

  return { description, strict, minConfidence };
}

// Tokenize description into words, bigrams, and trigrams
function tokenize(text: string): Set<string> {
  const cleaned = text.toLowerCase().replace(/[^\w\s-]/g, ' ');
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  const tokens = new Set<string>();

  // Add individual words
  words.forEach(w => tokens.add(w));

  // Add bigrams
  for (let i = 0; i < words.length - 1; i++) {
    tokens.add(`${words[i]} ${words[i + 1]}`);
  }

  // Add trigrams
  for (let i = 0; i < words.length - 2; i++) {
    tokens.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  return tokens;
}

// Match application type within a niche
function matchApplicationType(tokens: Set<string>, niche: NicheData): string {
  const appTypeScores: Record<string, number> = {};

  for (const appType of niche.application_types) {
    let score = 0;
    const appTypeWords = appType.split('-');

    for (const word of appTypeWords) {
      if (tokens.has(word)) score += 2;
    }

    if (tokens.has(appType)) score += 5;
    if (tokens.has(appType.replace(/-/g, ' '))) score += 5;

    appTypeScores[appType] = score;
  }

  const sorted = Object.entries(appTypeScores).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[1] > 0 ? sorted[0][0] : niche.application_types[0];
}

// Main matching function
function matchNiche(description: string): MatchResult {
  // Load taxonomy
  const taxonomyPath = resolve('data/niche-taxonomy.json');
  const taxonomy: Taxonomy = JSON.parse(readFileSync(taxonomyPath, 'utf-8'));

  const tokens = tokenize(description);
  const descLower = description.toLowerCase();
  const nicheScores: Record<string, number> = {};
  const matchedKeywords: Record<string, string[]> = {};

  // Score each niche
  for (const niche of taxonomy.niches) {
    let score = 0;
    const keywords: string[] = [];

    // Primary keywords (10 points each)
    for (const kw of niche.primary_keywords) {
      if (tokens.has(kw) || descLower.includes(kw)) {
        score += 10;
        keywords.push(kw);
      }
    }

    // Secondary keywords (5 points each)
    for (const kw of niche.secondary_keywords) {
      if (tokens.has(kw) || descLower.includes(kw)) {
        score += 5;
        keywords.push(kw);
      }
    }

    // Negative keywords (-8 points each)
    for (const kw of niche.negative_keywords) {
      if (tokens.has(kw) || descLower.includes(kw)) {
        score -= 8;
      }
    }

    // Phrases (15 points each)
    for (const phrase of niche.phrases) {
      if (descLower.includes(phrase)) {
        score += 15;
        keywords.push(phrase);
      }
    }

    nicheScores[niche.niche_id] = Math.max(0, score);
    matchedKeywords[niche.niche_id] = keywords;
  }

  // Normalize to confidence
  const totalScore = Object.values(nicheScores).reduce((a, b) => a + b, 0);
  const confidences: Record<string, number> = {};

  for (const [id, score] of Object.entries(nicheScores)) {
    confidences[id] = totalScore > 0 ? score / totalScore : 0;
  }

  // Sort by confidence
  const sorted = Object.entries(confidences).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0 || sorted[0][1] === 0) {
    return {
      niche_id: 'saas',
      application_type: 'web-app',
      confidence: 0.3,
      reasoning: 'No specific domain detected. Defaulting to general web application.',
      matched_keywords: [],
      alternative_niches: taxonomy.niches.slice(0, 3).map(n => ({
        niche_id: n.niche_id,
        confidence: 0.1
      }))
    };
  }

  const primaryNicheId = sorted[0][0];
  const primaryConfidence = sorted[0][1];
  const primaryNiche = taxonomy.niches.find(n => n.niche_id === primaryNicheId)!;
  const appType = matchApplicationType(tokens, primaryNiche);

  // Build alternatives
  const alternatives = sorted.slice(1, 4)
    .filter(([_, conf]) => conf > 0.1)
    .map(([id, conf]) => {
      const niche = taxonomy.niches.find(n => n.niche_id === id)!;
      return {
        niche_id: id,
        confidence: Math.round(conf * 100) / 100,
        application_type: matchApplicationType(tokens, niche)
      };
    });

  // Generate reasoning
  const keywords = matchedKeywords[primaryNicheId];
  const reasoning = keywords.length > 0
    ? `Matched keywords: ${keywords.slice(0, 5).join(', ')}. ${primaryNiche.description}`
    : primaryNiche.description;

  return {
    niche_id: primaryNicheId,
    application_type: appType,
    confidence: Math.round(primaryConfidence * 100) / 100,
    reasoning,
    matched_keywords: keywords,
    alternative_niches: alternatives
  };
}

// Main execution
const { description } = parseArgs();
const result = matchNiche(description);

// Reset pipeline state and record niche match
resetState();
completeStage('understand_problem', 'wireframe_selection', {
  inferred_niche: result.niche_id,
  application_type: result.application_type,
  niche_confidence: result.confidence,
});

console.log(JSON.stringify(result, null, 2));
