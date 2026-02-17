"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  StickyNote,
  Copy,
  Check,
  Trash2,
  Download,
  Search,
  Replace,
  Maximize,
  Minimize,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { trackToolEvent } from "@/lib/analytics";
import { countCharacters, countWords } from "@/lib/text-counter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STORAGE_KEY = "utllo-online-notepad";
const AUTOSAVE_DELAY = 500;

const FONT_SIZES: Record<string, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
  extraLarge: "text-xl",
};

interface OnlineNotepadDictionary {
  title: string;
  subtitle: string;
  placeholder: string;
  characters: string;
  words: string;
  lines: string;
  fontSize: string;
  small: string;
  medium: string;
  large: string;
  extraLarge: string;
  find: string;
  replace: string;
  findPlaceholder: string;
  replacePlaceholder: string;
  replaceAll: string;
  matchesFound: string;
  noMatches: string;
  download: string;
  copy: string;
  copied: string;
  clear: string;
  clearConfirm: string;
  fullscreen: string;
  exitFullscreen: string;
  autoSaved: string;
  newNote: string;
}

interface OnlineNotepadProps {
  dictionary: OnlineNotepadDictionary;
}

export function OnlineNotepad({ dictionary }: OnlineNotepadProps) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [fontSizeKey, setFontSizeKey] = useState("medium");
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showFontMenu, setShowFontMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setText(saved);
        setLastSaved(new Date());
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, text);
        setLastSaved(new Date());
      } catch {
        // localStorage full or not available
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [text]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const chars = countCharacters(text);
    const words = countWords(text);
    const lines = text === "" ? 0 : text.split("\n").length;
    return { chars, words, lines };
  }, [text]);

  // Find matches
  const matchCount = useMemo(() => {
    if (!findQuery) return 0;
    try {
      const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matches = text.match(new RegExp(escaped, "gi"));
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [text, findQuery]);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolEvent("online-notepad", "tools", "copy");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [text]);

  const handleClear = useCallback(() => {
    if (!text) return;
    if (window.confirm(dictionary.clearConfirm)) {
      setText("");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      trackToolEvent("online-notepad", "tools", "use");
    }
  }, [text, dictionary.clearConfirm]);

  const handleDownload = useCallback(() => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "notatka.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    trackToolEvent("online-notepad", "tools", "use");
  }, [text]);

  const handleFindNext = useCallback(() => {
    if (!findQuery || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const startPos = textarea.selectionEnd || 0;
    const lowerText = text.toLowerCase();
    const lowerQuery = findQuery.toLowerCase();
    let idx = lowerText.indexOf(lowerQuery, startPos);
    if (idx === -1) {
      idx = lowerText.indexOf(lowerQuery, 0);
    }
    if (idx !== -1) {
      textarea.focus();
      textarea.setSelectionRange(idx, idx + findQuery.length);
    }
  }, [findQuery, text]);

  const handleFindPrev = useCallback(() => {
    if (!findQuery || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const startPos = Math.max(0, (textarea.selectionStart || 0) - 1);
    const lowerText = text.toLowerCase();
    const lowerQuery = findQuery.toLowerCase();
    let idx = lowerText.lastIndexOf(lowerQuery, startPos);
    if (idx === -1) {
      idx = lowerText.lastIndexOf(lowerQuery);
    }
    if (idx !== -1) {
      textarea.focus();
      textarea.setSelectionRange(idx, idx + findQuery.length);
    }
  }, [findQuery, text]);

  const handleReplaceNext = useCallback(() => {
    if (!findQuery || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const selStart = textarea.selectionStart;
    const selEnd = textarea.selectionEnd;
    const selected = text.slice(selStart, selEnd);

    if (selected.toLowerCase() === findQuery.toLowerCase()) {
      const newText = text.slice(0, selStart) + replaceQuery + text.slice(selEnd);
      setText(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(selStart + replaceQuery.length, selStart + replaceQuery.length);
      }, 0);
    } else {
      handleFindNext();
    }
  }, [findQuery, replaceQuery, text, handleFindNext]);

  const handleReplaceAll = useCallback(() => {
    if (!findQuery) return;
    try {
      const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const newText = text.replace(new RegExp(escaped, "gi"), replaceQuery);
      setText(newText);
      trackToolEvent("online-notepad", "tools", "use");
    } catch {
      // invalid regex
    }
  }, [findQuery, replaceQuery, text]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // fullscreen not supported
    }
  }, []);

  const fontSizeLabel: Record<string, string> = {
    small: dictionary.small,
    medium: dictionary.medium,
    large: dictionary.large,
    extraLarge: dictionary.extraLarge,
  };

  return (
    <div ref={containerRef} className={isFullscreen ? "bg-background p-4 h-screen flex flex-col" : ""}>
      <Card className={`w-full ${isFullscreen ? "flex-1 flex flex-col" : ""}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3">
              <StickyNote className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className={`space-y-4 ${isFullscreen ? "flex-1 flex flex-col" : ""}`}>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Font Size Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFontMenu(!showFontMenu)}
                className="gap-1 text-xs"
              >
                {dictionary.fontSize}: {fontSizeLabel[fontSizeKey]}
                <ChevronDown className="h-3 w-3" />
              </Button>
              {showFontMenu && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-popover border rounded-md shadow-md py-1 min-w-[140px]">
                  {Object.keys(FONT_SIZES).map((key) => (
                    <button
                      key={key}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                        fontSizeKey === key ? "bg-muted font-medium" : ""
                      }`}
                      onClick={() => {
                        setFontSizeKey(key);
                        setShowFontMenu(false);
                      }}
                    >
                      {fontSizeLabel[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Find & Replace Toggle */}
            <Button
              variant={showFindReplace ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFindReplace(!showFindReplace)}
              className="gap-1 text-xs"
            >
              <Search className="h-3.5 w-3.5" />
              {dictionary.find}
            </Button>

            <div className="flex-1" />

            {/* Copy */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!text}
              className="gap-1 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {dictionary.copied}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  {dictionary.copy}
                </>
              )}
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!text}
              className="gap-1 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {dictionary.download}
            </Button>

            {/* Fullscreen */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFullscreen}
              className="gap-1 text-xs"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{dictionary.exitFullscreen}</span>
                </>
              ) : (
                <>
                  <Maximize className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{dictionary.fullscreen}</span>
                </>
              )}
            </Button>

            {/* Clear */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!text}
              className="gap-1 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {dictionary.clear}
            </Button>
          </div>

          {/* Find & Replace Panel */}
          {showFindReplace && (
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={findQuery}
                    onChange={(e) => setFindQuery(e.target.value)}
                    placeholder={dictionary.findPlaceholder}
                    className="w-full h-8 pl-8 pr-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFindNext();
                      }
                    }}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleFindPrev} disabled={!findQuery} className="h-8 px-2">
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleFindNext} disabled={!findQuery} className="h-8 px-2">
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[60px] text-right">
                  {findQuery ? (matchCount > 0 ? `${matchCount} ${dictionary.matchesFound}` : dictionary.noMatches) : ""}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFindReplace(false);
                    setFindQuery("");
                    setReplaceQuery("");
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Replace className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    placeholder={dictionary.replacePlaceholder}
                    className="w-full h-8 pl-8 pr-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleReplaceNext();
                      }
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReplaceNext}
                  disabled={!findQuery}
                  className="h-8 text-xs"
                >
                  {dictionary.replace}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReplaceAll}
                  disabled={!findQuery}
                  className="h-8 text-xs"
                >
                  {dictionary.replaceAll}
                </Button>
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={dictionary.placeholder}
            spellCheck
            className={`w-full p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary font-mono leading-relaxed ${
              FONT_SIZES[fontSizeKey]
            } ${isFullscreen ? "flex-1 min-h-0" : "min-h-[350px]"}`}
          />

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground px-1">
            <div className="flex gap-4">
              <span>{dictionary.characters}: <strong className="text-foreground">{stats.chars.toLocaleString()}</strong></span>
              <span>{dictionary.words}: <strong className="text-foreground">{stats.words.toLocaleString()}</strong></span>
              <span>{dictionary.lines}: <strong className="text-foreground">{stats.lines.toLocaleString()}</strong></span>
            </div>
            {lastSaved && (
              <span className="text-muted-foreground/70">
                {dictionary.autoSaved}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
