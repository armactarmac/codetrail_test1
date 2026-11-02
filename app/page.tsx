'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  defaultExtensionByLanguage,
  detectLanguage,
  detectLanguageFromCode,
  FREE_PROVIDERS,
  getBlockingReason,
  SUPPORTED_LANGUAGES,
  type AIProvider,
  type ScoreResult,
} from '../lib/scoring';

type IconProps = { size?: number; strokeWidth?: number };

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#c6f2dd] text-[#102742]">
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
        <path d="M5.7 3.4 2.6 8.5l3.1 5.1M11.3 3.4l3.1 5.1-3.1 5.1M9.5 2.7 7.4 14.3" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function UploadIcon({ size = 18, strokeWidth = 1.8 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5v2.25A2.25 2.25 0 0 0 7.25 19h9.5A2.25 2.25 0 0 0 19 16.75V14.5" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ScoreIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19.5h16M6.5 16V9.5M12 16V5.5M17.5 16v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="m5 7 4-3 4 2 5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function FileIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13.5 3H7.75A1.75 1.75 0 0 0 6 4.75v14.5A1.75 1.75 0 0 0 7.75 21h8.5A1.75 1.75 0 0 0 18 19.25V7.5L13.5 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M13 3v5h5M9 13h6M9 16.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function AnalysisSpinner({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return <span className={`h-4 w-4 animate-spin rounded-full border-2 ${tone === 'light' ? 'border-[#b7deca]/60 border-t-[#3f9a6b]' : 'border-white/30 border-t-[#8be0b5]'}`} aria-hidden="true" />;
}

function KeyIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 2-2 2m-1.5 1.5L14 9l-1.5-1.5-2 2 1.5 1.5L9 14l-1.5-1.5-2 2 1.5 1.5-4.5 4.5a2.12 2.12 0 0 0 3 3L10 19l1.5 1.5 2-2-1.5-1.5 3-3 1.5 1.5 2-2-1.5-1.5 3.5-3.5a2.12 2.12 0 0 0-3-3Z" />
      <circle cx="7.5" cy="16.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function EyeIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
    </svg>
  );
}

const starterCode = '';

export default function Home() {
  const [code, setCode] = useState(starterCode);
  const [fileName, setFileName] = useState('untitled.js');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('JavaScript');
  const [languageManuallySelected, setLanguageManuallySelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [scoreExpanded, setScoreExpanded] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [aiErrorFallback, setAiErrorFallback] = useState<ScoreResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  // Free AI provider state
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('Auto (Best Available)');

  // Modal setup state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [tempProvider, setTempProvider] = useState<AIProvider>('gemini');
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempModel, setTempModel] = useState('Auto (Best Available)');
  const [showApiKey, setShowApiKey] = useState(false);
  const [dynamicGeminiModels, setDynamicGeminiModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Load credentials from browser localStorage on client mount
  useEffect(() => {
    try {
      const savedProvider = (localStorage.getItem('codetrails_ai_provider') as AIProvider) || 'gemini';
      const savedKey = localStorage.getItem('codetrails_ai_key') || '';
      let savedModel = localStorage.getItem('codetrails_ai_model') || FREE_PROVIDERS[savedProvider]?.defaultModel || 'Auto (Best Available)';
      // Reset any legacy/unsupported model that failed previously to 'Auto (Best Available)'
      if (savedModel.includes('1.5-pro') || savedModel.includes('2.0-flash') || savedModel.includes('2.5-flash')) {
        savedModel = 'Auto (Best Available)';
      }
      setProvider(savedProvider);
      setApiKey(savedKey);
      setModel(savedModel);
    } catch {
      // Ignore localStorage issues in sandboxed environments
    }
  }, []);

  const lines = useMemo(() => code.split('\n'), [code]);
  const editorHeight = Math.min(Math.max(lines.length * 24 + 48, 156), 390);
  const safetyBlock = code.trim() ? getBlockingReason(code) : null;
  const safetyMessage = submissionError ?? (safetyBlock ? `${safetyBlock.message}${safetyBlock.line ? ` Line ${safetyBlock.line}.` : ''}` : (!code.trim() ? 'Add some code before scoring.' : null));

  async function loadModelsForApiKey(overrideKey?: string) {
    const keyToUse = (overrideKey ?? tempApiKey).trim();
    if (!keyToUse || tempProvider !== 'gemini') return;
    setIsLoadingModels(true);
    try {
      const res = await fetch(`/api/score?apiKey=${encodeURIComponent(keyToUse)}&provider=gemini`);
      const data = await res.json() as { models?: string[] };
      if (data.models && data.models.length > 0) {
        setDynamicGeminiModels(data.models);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingModels(false);
    }
  }

  function openSetup() {
    setTempProvider(provider);
    setTempApiKey(apiKey);
    setTempModel(model || FREE_PROVIDERS[provider].defaultModel);
    setShowApiKey(false);
    setIsSetupOpen(true);
    if (apiKey && provider === 'gemini') {
      loadModelsForApiKey(apiKey);
    }
  }

  function handleProviderChange(newProvider: AIProvider) {
    setTempProvider(newProvider);
    setTempModel(FREE_PROVIDERS[newProvider].defaultModel);
    if (newProvider === 'gemini' && tempApiKey.trim()) {
      loadModelsForApiKey(tempApiKey.trim());
    }
  }

  function saveSetup() {
    const cleanKey = tempApiKey.trim();
    const cleanModel = tempModel || FREE_PROVIDERS[tempProvider].defaultModel;
    setProvider(tempProvider);
    setApiKey(cleanKey);
    setModel(cleanModel);
    try {
      localStorage.setItem('codetrails_ai_provider', tempProvider);
      localStorage.setItem('codetrails_ai_key', cleanKey);
      localStorage.setItem('codetrails_ai_model', cleanModel);
    } catch {
      // Ignore
    }
    setIsSetupOpen(false);
    setSubmissionError(null);
    setAiErrorFallback(null);
  }

  function clearKey() {
    setTempApiKey('');
    setApiKey('');
    try {
      localStorage.removeItem('codetrails_ai_key');
    } catch {
      // Ignore
    }
    setIsSetupOpen(false);
    setSubmissionError(null);
    setAiErrorFallback(null);
  }

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setCode(String(reader.result ?? ''));
      setFileName(file.name);
      setSelectedLanguage(detectLanguage(file.name));
      setLanguageManuallySelected(false);
      setScoreResult(null);
      setScoreExpanded(false);
      setSubmissionError(null);
      setAiErrorFallback(null);
    };
    reader.readAsText(file);
  }

  function handleLanguageChange(newLang: string) {
    setSelectedLanguage(newLang);
    setLanguageManuallySelected(true);
    if (fileName.startsWith('untitled.')) {
      const ext = defaultExtensionByLanguage[newLang] ?? 'txt';
      setFileName(`untitled.${ext}`);
    }
    setScoreResult(null);
    setScoreExpanded(false);
    setSubmissionError(null);
    setAiErrorFallback(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) readFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  async function scoreCode(forceLocal = false) {
    if (!code.trim()) {
      setSubmissionError('Add some code before scoring.');
      return;
    }
    if (safetyBlock) {
      setSubmissionError(`${safetyBlock.message}${safetyBlock.line ? ` Line ${safetyBlock.line}.` : ''}`);
      return;
    }
    setSubmissionError(null);
    setAiErrorFallback(null);
    setIsScoring(true);
    try {
      const activeKey = forceLocal ? '' : apiKey;
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          fileName,
          language: selectedLanguage,
          provider,
          apiKey: activeKey,
          model,
        }),
      });
      const payload = await response.json() as ScoreResult | { error?: string; isAiError?: boolean; fallbackResult?: ScoreResult; line?: number };
      if (!response.ok) {
        if ('isAiError' in payload && payload.isAiError && payload.fallbackResult) {
          setAiErrorFallback(payload.fallbackResult);
          throw new Error(payload.error || 'AI scoring request failed.');
        }
        const error = 'error' in payload && payload.error ? payload.error : 'This submission could not be scored.';
        const line = 'line' in payload && payload.line ? ` Line ${payload.line}.` : '';
        throw new Error(`${error}${line}`);
      }
      setScoreResult(payload as ScoreResult);
      setScoreExpanded(false);
    } catch (error) {
      setScoreResult(null);
      setSubmissionError(error instanceof Error ? error.message : 'This submission could not be scored.');
    } finally {
      setIsScoring(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="flex w-full items-center justify-between px-6 pb-8 pt-7 lg:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label="Code Trails home">
          <LogoMark />
          <span className="text-[18px] font-bold tracking-[-0.04em] text-[#102742]">Code Trails</span>
        </a>

        <div>
          {apiKey ? (
            <button
              type="button"
              onClick={openSetup}
              className="flex items-center gap-2 rounded-full border border-[#bfe6d1] bg-[#f4fcf8] px-3.5 py-1.5 text-[12px] font-medium text-[#286f51] shadow-sm transition hover:bg-[#e6f7ef]"
              aria-label="Configure Free AI"
            >
              <span className="h-2 w-2 rounded-full bg-[#34d399] animate-pulse" />
              <span>{FREE_PROVIDERS[provider]?.name.split(' ')[0]}: <span className="font-semibold">{model.split('/').pop()}</span></span>
              <span className="text-[10px] text-[#5aa882]">⚙</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openSetup}
              className="flex items-center gap-2 rounded-full border border-[#dce6e6] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#4b6470] shadow-sm transition hover:border-[#b2d6c6] hover:text-[#286f51]"
              aria-label="Configure Free AI"
            >
              <KeyIcon size={13} />
              <span>Local Mode</span>
              <span className="rounded bg-[#ecf7f1] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3d9168]">Enable Free AI</span>
            </button>
          )}
        </div>
      </header>

      <section id="top" className="mx-auto max-w-[820px] scroll-mt-8 px-5 pb-24 lg:px-8" aria-label="Code scoring workspace">
        <div className="overflow-hidden rounded-[18px] border border-[#dce6e6] bg-white shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eeee] px-5 py-3.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e5f7ed] text-[#4eaf82]"><FileIcon /></span>
              <span className="max-w-[150px] truncate text-[13px] font-semibold text-[#29475b] sm:max-w-[220px]" title={fileName}>
                {fileName !== 'untitled.js' && !fileName.startsWith('untitled.') ? fileName : 'Your code'}
              </span>
              <div className="flex items-center gap-1.5 rounded-lg border border-[#dce6e6] bg-[#f8fafa] px-2 py-1 text-[11px] text-[#29475b] transition hover:border-[#bfd6cb] focus-within:border-[#73c59a] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#73c59a]">
                <label htmlFor="language-select" className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a9ba1]">Language</label>
                <span className="hidden text-[9px] font-semibold uppercase tracking-[0.08em] text-[#7ab494] sm:inline">{languageManuallySelected ? 'Manual' : 'Auto'}</span>
                <select
                  id="language-select"
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="cursor-pointer bg-transparent text-[11px] font-semibold text-[#29475b] outline-none"
                  aria-label="Select programming language"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#8da0a6]">
              <span>{lines.length} {lines.length === 1 ? 'line' : 'lines'}</span>
              <span className="h-3 w-px bg-[#dfe8e8]" />
              <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 font-semibold text-[#569c7b] transition hover:text-[#2d7958]"><UploadIcon size={14} /> Open file</button>
              <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} accept="*/*" />
            </div>
          </div>

          <div
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{ height: editorHeight }}
            className={`relative flex bg-[#fbfcfc] transition-colors ${isDragging ? 'bg-[#effaf4]' : ''}`}
          >
            <div ref={gutterRef} style={{ height: editorHeight }} className="code-scroll pointer-events-none min-w-[49px] select-none overflow-x-hidden overflow-y-hidden border-r border-[#edf1f1] bg-[#f8fafa] py-5 text-right font-mono text-[12px] leading-[1.8] text-[#b1bfc2] sm:min-w-[60px] sm:pr-4">
              {lines.map((_, index) => <div key={index}>{String(index + 1).padStart(2, '0')}</div>)}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(event) => {
                const nextCode = event.target.value;
                setCode(nextCode);
                if (!languageManuallySelected && fileName.startsWith('untitled.')) {
                  setSelectedLanguage(detectLanguageFromCode(nextCode));
                }
                setScoreResult(null);
                setScoreExpanded(false);
                setSubmissionError(null);
                setAiErrorFallback(null);
              }}
              spellCheck={false}
              aria-label="Code input"
              style={{ height: editorHeight }}
              onScroll={(event) => { if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop; }}
              className="code-scroll relative z-10 flex-1 resize-none overflow-auto bg-transparent px-4 py-5 font-mono text-[12px] leading-[1.8] text-[#29475b] outline-none placeholder:text-[#a8b8ba] sm:px-5"
              placeholder="Paste your code here, or drop a file..."
            />
            {isDragging && <div className="pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-[#75c79e] bg-[#ecfbf3]/90 text-sm font-semibold text-[#3c956d]">Drop your code file here</div>}
          </div>

          <div className="flex flex-col items-center justify-center gap-2 border-t border-[#e8eeee] bg-white px-5 py-5 sm:px-6">
            <button
              type="button"
              onClick={() => scoreCode(false)}
              disabled={isScoring || !code.trim() || Boolean(safetyBlock)}
              className="group flex min-w-[178px] items-center justify-center gap-2 rounded-lg bg-[#102742] px-6 py-3 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(16,39,66,.16)] transition hover:bg-[#1a3c5e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ScoreIcon />
              {isScoring ? (apiKey ? 'Analysing with AI...' : 'Running checks...') : (apiKey ? 'Score with AI' : 'Score the code')}
              {isScoring ? <AnalysisSpinner /> : null}
              {!isScoring && <span className="text-[#76d6a6] transition-transform group-hover:translate-x-0.5">→</span>}
            </button>
            {safetyMessage && (
              <div className="flex flex-col items-center gap-1 text-center">
                <p role="alert" className="text-[11px] font-medium text-[#b45f5f]">{safetyMessage}</p>
                {aiErrorFallback && (
                  <button
                    type="button"
                    onClick={() => {
                      setScoreResult(aiErrorFallback);
                      setAiErrorFallback(null);
                      setSubmissionError(null);
                    }}
                    className="text-[11px] font-semibold text-[#286f51] underline hover:text-[#194835]"
                  >
                    View local scan results instead →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-9" aria-live="polite">
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5ca982]">Code score</p>
              <h1 className="text-[22px] font-semibold tracking-[-0.035em] text-[#102742]">Score summary</h1>
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] text-[#9aabad] sm:flex">
              <span className={`h-1.5 w-1.5 rounded-full ${scoreResult ? 'bg-[#65c993]' : 'bg-[#c7d3d3]'}`} />
              {scoreResult
                ? (scoreResult.source === 'ai'
                    ? `Scored by ${FREE_PROVIDERS[provider]?.name.split(' ')[0]} (${model.split('/').pop()})`
                    : 'Scored locally')
                : 'Waiting for code'}
            </span>
          </div>

          <div className={`rounded-[16px] border bg-white p-5 shadow-[0_8px_30px_rgba(9,44,77,.04)] transition-colors sm:p-6 ${scoreResult ? 'border-[#bfe6d1]' : 'border-[#dce6e6]'}`}>
            {isScoring ? (
              <div className="analysis-pulse flex min-h-[82px] flex-col justify-center rounded-xl bg-[#f7fbf9] px-5 py-4" role="status" aria-live="polite">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e2f7eb] text-[#4eaf82]"><AnalysisSpinner tone="light" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-[#29475b]">{apiKey ? 'AI is reviewing your code' : 'Running local checks'}</p>
                      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#79a58f]">In progress</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#8a9da1]">Checking errors, security flows, and code quality.</p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#dff0e7]"><div className="analysis-scan h-full w-1/4 rounded-full bg-[#67c797]" /></div>
                  </div>
                </div>
              </div>
            ) : !scoreResult ? (
              <div className="flex min-h-[82px] items-center justify-center gap-3 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f8f4] text-[#6abb8e]"><ScoreIcon /></div>
                <div className="text-left">
                  <p className="text-[13px] font-medium text-[#58717e]">Your code score will appear here</p>
                  <p className="mt-1 text-[11px] text-[#9aabad]">Paste or upload code, then score it.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 border-r border-[#edf1f1] pr-5">
                    <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border-[6px] border-[#c6f2dd] bg-[#f4fcf8] text-[22px] font-bold tracking-[-0.06em] text-[#286f51]">{scoreResult.score}</div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#29475b]">{scoreResult.label}</p>
                      <p className="text-[10px] text-[#9aabad]">out of 100</p>
                    </div>
                  </div>
                  <div className="grid min-w-[250px] flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                    {scoreResult.checks.map((check) => (
                      <div key={check.label} className="rounded-lg bg-[#f7faf9] px-3 py-2">
                        <p className="text-[10px] font-medium text-[#8da0a6]">{check.label}</p>
                        <p className={`mt-1 text-[11px] font-semibold ${check.tone === 'watch' ? 'text-[#b6844f]' : 'text-[#4b9975]'}`}>{check.value}</p>
                      </div>
                    ))}
                  </div>
                  <button type="button" aria-expanded={scoreExpanded} onClick={() => setScoreExpanded((expanded) => !expanded)} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#dce6e6] px-3 py-2 text-[11px] font-semibold text-[#52717b] transition hover:border-[#9ecfba] hover:text-[#286f51]">
                    {scoreExpanded ? 'Hide details' : 'View details'}<span className={`text-[#55b887] transition-transform ${scoreExpanded ? 'rotate-90' : ''}`}>→</span>
                  </button>
                </div>

                {scoreExpanded && (
                  <div className="mt-5 border-t border-[#edf1f1] pt-5">
                    <p className="text-[14px] font-semibold text-[#29475b]">{scoreResult.source === 'ai' ? 'AI code quality score' : 'Local code quality score'}</p>
                    <p className="mt-2 text-[13px] leading-6 text-[#718794]">{scoreResult.summary}</p>
                    {scoreResult.findings.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8da0a6]">Findings</p>
                        {scoreResult.findings.slice(0, 6).map((finding, index) => (
                          <div key={`${finding.title}-${finding.line ?? index}`} className="flex items-start gap-2 text-[11px] leading-5 text-[#718794]">
                            <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${finding.type === 'security' ? 'bg-[#df9a63]' : 'bg-[#d1b46c]'}`} />
                            <span><span className="font-semibold text-[#4b6470]">{finding.title}</span>{finding.line ? ` · line ${finding.line}` : ''} — {finding.detail}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-[12px] text-[#4b9975]">No findings detected.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Inline Free AI Setup Modal */}
      {isSetupOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#102742]/40 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsSetupOpen(false); }}
        >
          <div className="w-full max-w-md rounded-[20px] border border-[#dce6e6] bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#edf1f1] pb-4">
              <div>
                <h2 id="modal-title" className="text-[16px] font-bold text-[#102742]">Connect Free AI</h2>
                <p className="text-[11px] text-[#788e96]">Zero-cost code scoring with free AI models</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSetupOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8a9ba1] hover:bg-[#f2f6f6] hover:text-[#29475b]"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Provider Selection Tabs */}
              <div>
                <label className="text-[11px] font-semibold text-[#3b5563]">Free AI Provider</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-xl bg-[#f5f8f8] p-1">
                  <button
                    type="button"
                    onClick={() => handleProviderChange('gemini')}
                    className={`rounded-lg py-2 text-[12px] font-semibold transition ${
                      tempProvider === 'gemini'
                        ? 'bg-white text-[#102742] shadow-sm'
                        : 'text-[#6b828a] hover:text-[#29475b]'
                    }`}
                  >
                    Google Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderChange('openrouter')}
                    className={`rounded-lg py-2 text-[12px] font-semibold transition ${
                      tempProvider === 'openrouter'
                        ? 'bg-white text-[#102742] shadow-sm'
                        : 'text-[#6b828a] hover:text-[#29475b]'
                    }`}
                  >
                    OpenRouter (Free)
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label htmlFor="model-select" className="text-[11px] font-semibold text-[#3b5563]">Free Model</label>
                    {tempProvider === 'gemini' && tempApiKey.trim() && (
                      <button
                        type="button"
                        onClick={() => loadModelsForApiKey()}
                        disabled={isLoadingModels}
                        className="text-[10px] font-medium text-[#449870] hover:underline disabled:opacity-50"
                      >
                        {isLoadingModels ? 'Detecting...' : 'Detect for key ↺'}
                      </button>
                    )}
                  </div>
                  <a
                    href={FREE_PROVIDERS[tempProvider].docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-medium text-[#449870] hover:underline"
                  >
                    Get free key ↗
                  </a>
                </div>
                <select
                  id="model-select"
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#dce6e6] bg-[#fbfcfc] px-3 py-2 text-[12px] font-semibold text-[#29475b] outline-none transition focus:border-[#76cca2] focus:bg-white"
                >
                  {(tempProvider === 'gemini' && dynamicGeminiModels.length > 0
                    ? ['Auto (Best Available)', ...dynamicGeminiModels]
                    : FREE_PROVIDERS[tempProvider].models
                  ).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {tempProvider === 'gemini' && tempModel === 'Auto (Best Available)' && (
                  <p className="mt-1 text-[10px] text-[#718794]">
                    Automatically selects the best active Gemini flash model supported by your key.
                  </p>
                )}
              </div>

              {/* API Key Input */}
              <div>
                <label htmlFor="api-key-input" className="text-[11px] font-semibold text-[#3b5563]">
                  {FREE_PROVIDERS[tempProvider].name.split(' ')[0]} API Key
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <input
                    id="api-key-input"
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={FREE_PROVIDERS[tempProvider].keyPlaceholder}
                    className="w-full rounded-lg border border-[#dce6e6] bg-[#fbfcfc] py-2 pl-3 pr-10 text-[12px] font-mono text-[#29475b] outline-none transition placeholder:text-[#a8b8ba] focus:border-[#76cca2] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    className="absolute right-2.5 text-[#8fa2a8] hover:text-[#29475b]"
                    aria-label={showApiKey ? 'Hide key' : 'Show key'}
                  >
                    {showApiKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-[#8fa2a8]">
                  Stored locally in your browser. Tokens are optimized via compact prompting and blank-space stripping.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-[#edf1f1] pt-4">
              {apiKey ? (
                <button
                  type="button"
                  onClick={clearKey}
                  className="text-[11px] font-medium text-[#b35d5d] hover:underline"
                >
                  Clear key & revert to local
                </button>
              ) : (
                <span className="text-[11px] text-[#8fa2a8]">Local mode is active</span>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSetupOpen(false)}
                  className="rounded-lg border border-[#dce6e6] px-3 py-1.5 text-[12px] font-semibold text-[#54707c] hover:bg-[#f6f9f9]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSetup}
                  className="rounded-lg bg-[#102742] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#1c3d61]"
                >
                  Save & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
