export type FindingType = 'error' | 'security';
export type FindingSeverity = 'high' | 'medium' | 'low';
export type CheckTone = 'good' | 'watch';

export type Finding = {
  type: FindingType;
  title: string;
  detail: string;
  line?: number;
  severity: FindingSeverity;
};

export type BlockingReason = {
  category: 'SQL injection' | 'Remote code execution';
  message: string;
  line?: number;
};

export type ScoreResult = {
  source: 'local' | 'ai';
  score: number;
  label: string;
  summary: string;
  errors: number;
  securityFlaws: number;
  checks: { label: string; value: string; tone: CheckTone }[];
  findings: Finding[];
};

export const SUPPORTED_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'JSX',
  'TSX',
  'Python',
  'Java',
  'C / C++',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'SQL',
  'HTML',
  'CSS',
  'JSON',
  'Plain text',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const defaultExtensionByLanguage: Record<string, string> = {
  'JavaScript': 'js',
  'TypeScript': 'ts',
  'JSX': 'jsx',
  'TSX': 'tsx',
  'Python': 'py',
  'Java': 'java',
  'C / C++': 'cpp',
  'Go': 'go',
  'Rust': 'rs',
  'Ruby': 'rb',
  'PHP': 'php',
  'Swift': 'swift',
  'Kotlin': 'kt',
  'SQL': 'sql',
  'HTML': 'html',
  'CSS': 'css',
  'JSON': 'json',
  'Plain text': 'txt',
};

export type AIProvider = 'gemini' | 'openrouter';

export type ProviderConfig = {
  id: AIProvider;
  name: string;
  endpoint: string;
  defaultModel: string;
  models: string[];
  docsUrl: string;
  keyPlaceholder: string;
};

export const FREE_PROVIDERS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini (AI Studio)',
    endpoint: 'https://generativelanguage.googleapis.com',
    defaultModel: 'Auto (Best Available)',
    models: [
      'Auto (Best Available)',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-2.0-flash-exp',
      'gemini-pro',
      'gemini-1.5-pro',
    ],
    docsUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIzaSy...',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter (Free Models)',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'google/gemini-2.0-flash-exp:free',
    models: [
      'google/gemini-2.0-flash-exp:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen-2.5-coder-32b-instruct:free',
      'mistralai/mistral-small-24b-instruct-2501:free',
    ],
    docsUrl: 'https://openrouter.ai/keys',
    keyPlaceholder: 'sk-or-v1-...',
  },
};

export function compressCodeForPrompt(source: string, maxLen = 8000): string {
  const cleaned = source.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');
  if (cleaned.length > maxLen) {
    return `${cleaned.slice(0, maxLen)}\n/* [truncated for token efficiency] */`;
  }
  return cleaned;
}

export const COMPACT_SYSTEM_PROMPT =
  'Terse code quality scorer. Output JSON only: {"score":<0-100>,"errors":<count>,"securityFlaws":<count>,"summary":"<max 25 words>","findings":[{"type":"error"|"security","title":"<terse>","detail":"<terse>","line":<num>,"severity":"high"|"medium"|"low"}]}. Max 5 findings. No preamble or markdown fences.';

const languageByExtension: Record<string, string> = {
  js: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX', py: 'Python',
  rb: 'Ruby', go: 'Go', rs: 'Rust', java: 'Java', css: 'CSS', html: 'HTML',
  json: 'JSON', php: 'PHP', swift: 'Swift', kt: 'Kotlin', sql: 'SQL',
  c: 'C / C++', cpp: 'C / C++', cc: 'C / C++', h: 'C / C++', hpp: 'C / C++',
  txt: 'Plain text',
};

export function detectLanguage(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return languageByExtension[extension] ?? 'Plain text';
}

/** Lightweight client-safe heuristics for pasted snippets. */
export function detectLanguageFromCode(source: string): SupportedLanguage {
  const code = source.trim();
  if (!code) return 'JavaScript';
  if (/^<\?php\b/i.test(code)) return 'PHP';
  if (/^<!doctype\s+html|<html\b|<body\b/i.test(code)) return 'HTML';
  if (/^\s*[.#]?[\w-]+\s*\{[\s\S]*:[^;{}]+;[\s\S]*\}/m.test(code) && !/[;{}]\s*(?:const|let|var|function)\b/.test(code)) return 'CSS';
  if (/^\s*(?:SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE)\b/i.test(code)) return 'SQL';
  if (/^\s*[\[{][\s\S]*[}\]]\s*$/.test(code) && /"\s*:/.test(code)) {
    try { JSON.parse(code); return 'JSON'; } catch { /* Continue with source heuristics. */ }
  }
  if (/^\s*(?:from\s+\w+\s+import|import\s+\w+|def\s+\w+\s*\(|class\s+\w+\s*\(|if\s+__name__\s*==|print\s*\()/m.test(code) && /:\s*(?:#.*)?$/m.test(code)) return 'Python';
  if (/^\s*(?:package\s+main|func\s+\w+\s*\(|import\s+\()/m.test(code)) return 'Go';
  if (/^\s*(?:fn\s+main|use\s+\w+::|let\s+mut\s+|impl\s+\w+)/m.test(code)) return 'Rust';
  if (/^\s*(?:using\s+namespace\s+std|#include\s*[<"]|std::|int\s+main\s*\()/m.test(code)) return 'C / C++';
  if (/^\s*(?:public\s+(?:static\s+)?class\s+|import\s+java\.|public\s+static\s+void\s+main)/m.test(code)) return 'Java';
  if (/^\s*(?:fun\s+\w+\s*\(|val\s+\w+\s*=|data\s+class\s+)/m.test(code)) return 'Kotlin';
  if (/^\s*(?:import\s+Foundation|\bfunc\s+\w+\s*\(|\blet\s+\w+\s*:\s*\w+)/m.test(code)) return 'Swift';
  if (/^\s*(?:def\s+\w+|require\s+["']|puts\s+)/m.test(code) && /\bend\s*$|\bdo\s*$/m.test(code)) return 'Ruby';
  if (/<[A-Z][A-Za-z0-9]*\b|<\w+\s+[^>]*\{/.test(code)) return /:\s*[A-Za-z_$][\w$]*\s*[=;,)]/.test(code) ? 'TSX' : 'JSX';
  if (/\b(?:interface|type)\s+\w+\s*[={]|:\s*(?:string|number|boolean|unknown|void)\b/.test(code)) return 'TypeScript';
  if (/\b(?:const|let|var|function|require\s*\(|module\.exports|console\.log)\b/.test(code)) return 'JavaScript';
  return 'Plain text';
}

const blockingRules: { category: BlockingReason['category']; pattern: RegExp; message: string }[] = [
  {
    category: 'SQL injection',
    pattern: /(?:['\"]\s*(?:or|and)\s+['\"]?\d+['\"]?\s*=\s*['\"]?\d+|union\s+select|;\s*--|(?:sleep|benchmark)\s*\(|waitfor\s+delay)/i,
    message: 'This submission matches a SQL-injection pattern and was blocked.',
  },
  {
    category: 'Remote code execution',
    pattern: /(?:\beval\s*\(|\bnew\s+Function\s*\(|\b(?:system|shell_exec|passthru|popen)\s*\(|\b(?:child_process\.exec|os\.system|subprocess\.(?:run|popen|call))\s*\(|require\s*\(\s*['\"]child_process['\"]|Runtime\.getRuntime\(\)\.exec\s*\(|curl\s+[^\n|]+\|\s*(?:sh|bash)|wget\s+[^\n|]+\|\s*(?:sh|bash))/i,
    message: 'This submission matches a remote-code-execution pattern and was blocked.',
  },
];

export function getBlockingReason(source: string): BlockingReason | null {
  for (const rule of blockingRules) {
    const match = source.match(rule.pattern);
    if (match) {
      return { category: rule.category, message: rule.message, line: match.index === undefined ? undefined : lineNumberAt(source, match.index) };
    }
  }
  return null;
}

function lineNumberAt(source: string, index: number) {
  return source.slice(0, index).split('\n').length;
}

function findByLine(
  source: string,
  pattern: RegExp,
  finding: Omit<Finding, 'line'>,
): Finding[] {
  return source.split(/\r?\n/).flatMap((line, index) => {
    pattern.lastIndex = 0;
    return pattern.test(line) ? [{ ...finding, line: index + 1 }] : [];
  });
}

function findUnbalancedDelimiters(source: string): Finding[] {
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const opening = new Set(['(', '[', '{']);
  const stack: { token: string; index: number }[] = [];
  const findings: Finding[] = [];
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (character === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === quote) {
        quote = '';
      }
      continue;
    }
    if (character === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (opening.has(character)) {
      stack.push({ token: character, index });
    } else if (pairs[character]) {
      const last = stack.pop();
      if (!last || last.token !== pairs[character]) {
        findings.push({
          type: 'error',
          title: 'Mismatched delimiter',
          detail: `Closing ${character} does not match the opening structure.`,
          line: lineNumberAt(source, index),
          severity: 'high',
        });
      }
    }
  }

  stack.slice(0, 3).forEach((item) => {
    findings.push({
      type: 'error',
      title: 'Unclosed delimiter',
      detail: `The ${item.token} opened here is never closed.`,
      line: lineNumberAt(source, item.index),
      severity: 'high',
    });
  });

  return findings;
}

export function analyzeLocally(
  source: string,
  fileName = 'untitled.js',
  customLanguage?: string,
): ScoreResult {
  const lines = source.split(/\r?\n/);
  const findings: Finding[] = [
    ...findUnbalancedDelimiters(source),
    ...findByLine(source, /\b(TODO|FIXME)\b/i, {
      type: 'error', title: 'Unresolved task marker', detail: 'This code still contains a TODO or FIXME marker.', severity: 'low',
    }),
    ...findByLine(source, /catch\s*\([^)]*\)\s*\{\s*\}/, {
      type: 'error', title: 'Empty error handler', detail: 'An empty catch block can hide runtime failures.', severity: 'medium',
    }),
    ...findByLine(source, /\bconsole\.error\s*\(/, {
      type: 'error', title: 'Error logging found', detail: 'Review whether this error is handled or only logged.', severity: 'low',
    }),
    ...findByLine(source, /(?:api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']{4,}["']/i, {
      type: 'security', title: 'Possible hardcoded secret', detail: 'Move credentials into a secret manager or environment variable.', severity: 'high',
    }),
    ...findByLine(source, /\beval\s*\(|new\s+Function\s*\(/, {
      type: 'security', title: 'Dynamic code execution', detail: 'Dynamic execution can turn untrusted input into executable code.', severity: 'high',
    }),
    ...findByLine(source, /(?:innerHTML\s*=|dangerouslySetInnerHTML)/, {
      type: 'security', title: 'Unsafe HTML injection', detail: 'Sanitize untrusted content before inserting it as HTML.', severity: 'high',
    }),
    ...findByLine(source, /(?:child_process\.exec|\bexec\s*\(|subprocess\.(?:run|Popen)\s*\()/, {
      type: 'security', title: 'Shell execution', detail: 'Validate and constrain all user-controlled input passed to a shell.', severity: 'high',
    }),
    ...findByLine(source, /(?:SELECT|INSERT|UPDATE|DELETE)[\s\S]*(?:\+|\$\{|`)/i, {
      type: 'security', title: 'Possible SQL injection', detail: 'Use parameterized queries instead of building SQL with string values.', severity: 'high',
    }),
    ...findByLine(source, /https?:\/\/(?!localhost|127\.0\.0\.1)/i, {
      type: 'security', title: 'Unencrypted HTTP endpoint', detail: 'Prefer HTTPS when sending code or sensitive data over a network.', severity: 'medium',
    }),
    ...findByLine(source, /(?:verify\s*=\s*False|rejectUnauthorized\s*:\s*false|--no-verify)/i, {
      type: 'security', title: 'TLS verification disabled', detail: 'Disabling certificate verification makes man-in-the-middle attacks easier.', severity: 'high',
    }),
  ];

  const errors = findings.filter((finding) => finding.type === 'error').length;
  const securityFlaws = findings.filter((finding) => finding.type === 'security').length;
  const score = Math.max(0, Math.min(100, 100 - Math.min(55, errors * 8) - Math.min(60, securityFlaws * 18)));
  const label = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Needs attention';
  const language = customLanguage || detectLanguage(fileName);

  return {
    source: 'local',
    score,
    label,
    errors,
    securityFlaws,
    summary: findings.length === 0
      ? 'No obvious errors or security flaws were found by the local checks.'
      : 'This quick scan found issues worth reviewing. An AI agent can provide deeper, language-specific feedback when connected.',
    checks: [
      { label: 'Errors', value: errors ? `${errors} found` : 'Clear', tone: errors ? 'watch' : 'good' },
      { label: 'Security flaws', value: securityFlaws ? `${securityFlaws} found` : 'Clear', tone: securityFlaws ? 'watch' : 'good' },
      { label: 'Lines analyzed', value: `${lines.length}`, tone: 'good' },
      { label: 'Language', value: language, tone: 'good' },
    ],
    findings: findings.slice(0, 12),
  };
}

export function normalizeAgentResult(
  raw: unknown,
  fallback: ScoreResult,
  fileName: string,
  customLanguage?: string,
): ScoreResult {
  if (!raw || typeof raw !== 'object') return fallback;
  const candidate = raw as Record<string, unknown>;
  const score = typeof candidate.score === 'number' ? Math.max(0, Math.min(100, Math.round(candidate.score))) : fallback.score;
  const errors = typeof candidate.errors === 'number' ? Math.max(0, Math.round(candidate.errors)) : fallback.errors;
  const securityFlaws = typeof candidate.securityFlaws === 'number' ? Math.max(0, Math.round(candidate.securityFlaws)) : fallback.securityFlaws;
  const findings = Array.isArray(candidate.findings) ? candidate.findings.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const finding = item as Record<string, unknown>;
    if (typeof finding.title !== 'string' || typeof finding.detail !== 'string') return [];
    return [{
      type: finding.type === 'security' ? 'security' as const : 'error' as const,
      title: finding.title.slice(0, 100),
      detail: finding.detail.slice(0, 240),
      line: typeof finding.line === 'number' ? Math.max(1, Math.round(finding.line)) : undefined,
      severity: (finding.severity === 'high' || finding.severity === 'medium' ? finding.severity : 'low') as FindingSeverity,
    }];
  }).slice(0, 12) : fallback.findings;

  const resolvedLanguage = customLanguage || fallback.checks.find((check) => check.label === 'Language')?.value || detectLanguage(fileName);

  return {
    source: 'ai',
    score,
    label: score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Needs attention',
    summary: typeof candidate.summary === 'string' ? candidate.summary.slice(0, 400) : fallback.summary,
    errors,
    securityFlaws,
    checks: [
      { label: 'Errors', value: errors ? `${errors} found` : 'Clear', tone: errors ? 'watch' : 'good' },
      { label: 'Security flaws', value: securityFlaws ? `${securityFlaws} found` : 'Clear', tone: securityFlaws ? 'watch' : 'good' },
      { label: 'Lines analyzed', value: `${fallback.checks.find((check) => check.label === 'Lines analyzed')?.value ?? '—'}`, tone: 'good' },
      { label: 'Language', value: resolvedLanguage, tone: 'good' },
    ],
    findings,
  };
}
