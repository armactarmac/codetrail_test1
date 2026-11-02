import { NextResponse } from 'next/server';
import {
  analyzeLocally,
  compressCodeForPrompt,
  COMPACT_SYSTEM_PROMPT,
  FREE_PROVIDERS,
  getBlockingReason,
  normalizeAgentResult,
  type AIProvider,
  type ScoreResult,
} from '../../../lib/scoring';

export const runtime = 'nodejs';

type ScoreRequest = {
  code?: unknown;
  fileName?: unknown;
  language?: unknown;
  provider?: unknown;
  apiKey?: unknown;
  model?: unknown;
};

function extractJsonObject(text: string): unknown {
  const clean = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(clean);
  } catch {
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(clean.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('Could not parse valid JSON from AI response.');
  }
}

type ModelResource = {
  name: string;
  supportedGenerationMethods?: string[];
};

async function getAvailableGeminiModels(apiKey: string): Promise<{ version: 'v1beta' | 'v1'; models: string[] }> {
  for (const version of ['v1beta', 'v1'] as const) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Invalid or unauthorized Gemini API key. Please check your key from Google AI Studio.');
        }
        continue;
      }

      const data = await res.json() as { models?: ModelResource[] };
      const supported = (data.models ?? [])
        .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''));

      if (supported.length > 0) {
        return { version, models: supported };
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Invalid or unauthorized')) {
        throw e;
      }
    }
  }

  return {
    version: 'v1beta',
    models: ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-pro'],
  };
}

async function scoreWithGemini(
  code: string,
  fileName: string,
  language: string,
  apiKey: string,
  modelName: string,
  fallback: ScoreResult,
): Promise<ScoreResult> {
  const agentCode = compressCodeForPrompt(code, 8000);

  // Dynamically query ListModels from Google to find the active models for this specific API key
  const { version, models: availableModels } = await getAvailableGeminiModels(apiKey);

  const cleanPref = (modelName && modelName !== 'auto' && !modelName.toLowerCase().includes('auto'))
    ? modelName.replace(/^models\//, '').toLowerCase()
    : '';

  const prioritizedCandidates: string[] = [];

  // 1. If preferred model matches an available model
  if (cleanPref) {
    const exact = availableModels.find((m) => m.toLowerCase() === cleanPref);
    if (exact) prioritizedCandidates.push(exact);

    const partial = availableModels.find((m) => m.toLowerCase().includes(cleanPref));
    if (partial && !prioritizedCandidates.includes(partial)) prioritizedCandidates.push(partial);
  }

  // 2. Add all available models containing "flash" (best for free tier speed and quota)
  availableModels
    .filter((m) => m.toLowerCase().includes('flash'))
    .forEach((m) => {
      if (!prioritizedCandidates.includes(m)) prioritizedCandidates.push(m);
    });

  // 3. Add all other available models
  availableModels.forEach((m) => {
    if (!prioritizedCandidates.includes(m)) prioritizedCandidates.push(m);
  });

  // 4. Fallback defaults
  ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-pro'].forEach((m) => {
    if (!prioritizedCandidates.includes(m)) prioritizedCandidates.push(m);
  });

  let lastError: Error | null = null;

  for (const candidate of prioritizedCandidates) {
    const cleanModel = candidate.replace(/^models\//, '');
    const url = `https://generativelanguage.googleapis.com/${version}/models/${encodeURIComponent(cleanModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${COMPACT_SYSTEM_PROMPT}\n\nLang:${language}|File:${fileName}\n\`\`\`\n${agentCode}\n\`\`\`` }],
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 250,
          },
        }),
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errJson = await response.json() as { error?: { message?: string } | string };
          if (typeof errJson.error === 'string') {
            errorDetail = errJson.error;
          } else if (errJson.error && typeof errJson.error.message === 'string') {
            errorDetail = errJson.error.message;
          }
        } catch {
          // ignore json parse error
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid or unauthorized Gemini API key. Please check your key from Google AI Studio.');
        }

        if (response.status === 429) {
          throw new Error('Google Gemini rate limit reached on free tier. Please wait a few seconds and try again.');
        }

        if (response.status === 404) {
          lastError = new Error(errorDetail || `Model ${cleanModel} not found for this key.`);
          continue; // Try next available model in this user's project
        }

        throw new Error(errorDetail || `Google Gemini returned HTTP ${response.status}.`);
      }

      const payload = await response.json() as {
        candidates?: {
          content?: {
            parts?: { text?: string }[];
          };
        }[];
      };

      const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Google Gemini returned an empty response.');

      const parsed = extractJsonObject(rawText);
      return normalizeAgentResult(parsed, fallback, fileName, language);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Invalid or unauthorized') || err.message.includes('rate limit'))) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('No available Gemini model found for this API key.');
}

async function scoreWithOpenRouter(
  code: string,
  fileName: string,
  language: string,
  apiKey: string,
  modelName: string,
  fallback: ScoreResult,
): Promise<ScoreResult> {
  const provider = FREE_PROVIDERS.openrouter;
  const endpoint = provider.endpoint;
  const model = modelName || provider.defaultModel;

  const agentCode = compressCodeForPrompt(code, 8000);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Code Trails',
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 180,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: COMPACT_SYSTEM_PROMPT },
        { role: 'user', content: `Lang:${language}|File:${fileName}\n\`\`\`\n${agentCode}\n\`\`\`` },
      ],
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json() as { error?: { message?: string } | string };
      if (typeof errJson.error === 'string') {
        errorDetail = errJson.error;
      } else if (errJson.error && typeof errJson.error.message === 'string') {
        errorDetail = errJson.error.message;
      }
    } catch {
      // ignore json parse error
    }

    if (response.status === 401) {
      throw new Error('Invalid or unauthorized OpenRouter API key.');
    }
    if (response.status === 429) {
      throw new Error('OpenRouter free model rate limit reached. Please wait a moment and try again.');
    }
    throw new Error(errorDetail || `OpenRouter returned HTTP ${response.status}.`);
  }

  const payload = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned an empty response.');

  const sanitizedContent = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const parsed = JSON.parse(sanitizedContent) as unknown;
  return normalizeAgentResult(parsed, fallback, fileName, language);
}

async function scoreWithAgent(
  code: string,
  fileName: string,
  language: string,
  providerKey: AIProvider,
  apiKey: string,
  modelName: string,
  fallback: ScoreResult,
): Promise<ScoreResult> {
  if (providerKey === 'gemini') {
    return scoreWithGemini(code, fileName, language, apiKey, modelName, fallback);
  }
  return scoreWithOpenRouter(code, fileName, language, apiKey, modelName, fallback);
}

export async function POST(request: Request) {
  let body: ScoreRequest;
  try {
    body = await request.json() as ScoreRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const code = typeof body.code === 'string' ? body.code : '';
  const fileName = typeof body.fileName === 'string' && body.fileName ? body.fileName : 'untitled.js';
  const language = typeof body.language === 'string' && body.language ? body.language : undefined;
  if (!code.trim()) return NextResponse.json({ error: 'Code is required.' }, { status: 400 });
  if (code.length > 10_000_000) return NextResponse.json({ error: 'Code exceeds the 10 MB limit.' }, { status: 413 });

  const blockingReason = getBlockingReason(code);
  if (blockingReason) {
    return NextResponse.json({ blocked: true, error: blockingReason.message, category: blockingReason.category, line: blockingReason.line }, { status: 422 });
  }

  const localResult = analyzeLocally(code, fileName, language);
  const resolvedLanguage = localResult.checks.find((check) => check.label === 'Language')?.value ?? 'Plain text';

  const explicitKey = typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : (process.env.AI_AGENT_API_KEY ?? '');
  const rawProvider = typeof body.provider === 'string' ? body.provider : 'gemini';
  const providerKey: AIProvider = rawProvider === 'openrouter' ? 'openrouter' : 'gemini';
  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : '';

  // If no AI key was provided, respond with local scan results
  if (!explicitKey) {
    return NextResponse.json(localResult);
  }

  try {
    const result = await scoreWithAgent(code, fileName, resolvedLanguage, providerKey, explicitKey, model, localResult);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI scoring failed.';
    return NextResponse.json(
      {
        error: message,
        isAiError: true,
        fallbackResult: localResult,
      },
      { status: 422 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('apiKey');
  const provider = searchParams.get('provider') || 'gemini';

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required.' }, { status: 400 });
  }

  if (provider === 'gemini') {
    try {
      const { models } = await getAvailableGeminiModels(apiKey);
      return NextResponse.json({ models });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to query models.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  return NextResponse.json({ models: FREE_PROVIDERS.openrouter.models });
}
