"use client";

import { useState, useCallback, useMemo } from "react";
import {
  GitCompareArrows,
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  Minus,
  Plus,
  Equal,
} from "lucide-react";
import * as Diff from "diff";
import { trackToolEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ViewMode = "side-by-side" | "inline";
type CompareLevel = "line" | "word" | "character";

interface DiffCheckerDictionary {
  title: string;
  subtitle: string;
  originalLabel: string;
  modifiedLabel: string;
  originalPlaceholder: string;
  modifiedPlaceholder: string;
  compare: string;
  clear: string;
  swap: string;
  copy: string;
  copied: string;
  sideBySide: string;
  inline: string;
  lineDiff: string;
  wordDiff: string;
  charDiff: string;
  ignoreWhitespace: string;
  ignoreCase: string;
  additions: string;
  deletions: string;
  unchanged: string;
  noDifferences: string;
  textsIdentical: string;
  compareLevel: string;
  viewMode: string;
  options: string;
  diffResult: string;
  lineNumber: string;
}

interface DiffCheckerProps {
  dictionary: DiffCheckerDictionary;
}

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function DiffChecker({ dictionary }: DiffCheckerProps) {
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [compareLevel, setCompareLevel] = useState<CompareLevel>("word");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const hasInput = originalText.length > 0 || modifiedText.length > 0;

  const diffResult = useMemo(() => {
    if (!originalText && !modifiedText) return null;

    let left = originalText;
    let right = modifiedText;

    if (ignoreCase) {
      left = left.toLowerCase();
      right = right.toLowerCase();
    }

    let parts: DiffPart[];

    switch (compareLevel) {
      case "line":
        parts = Diff.diffLines(left, right, {
          ignoreWhitespace,
        });
        break;
      case "word":
        if (ignoreWhitespace) {
          parts = Diff.diffWords(left, right);
        } else {
          parts = Diff.diffWordsWithSpace(left, right);
        }
        break;
      case "character":
        parts = Diff.diffChars(left, right);
        break;
      default:
        parts = Diff.diffWords(left, right);
    }

    return parts;
  }, [originalText, modifiedText, compareLevel, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    if (!diffResult) return { additions: 0, deletions: 0, unchanged: 0 };

    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    for (const part of diffResult) {
      const count =
        compareLevel === "line"
          ? (part.value.match(/\n/g) || []).length + (part.value.endsWith("\n") ? 0 : 1)
          : part.value.length;

      if (part.added) {
        additions += count;
      } else if (part.removed) {
        deletions += count;
      } else {
        unchanged += count;
      }
    }

    return { additions, deletions, unchanged };
  }, [diffResult, compareLevel]);

  const isIdentical = useMemo(() => {
    if (!diffResult) return false;
    return diffResult.every((part) => !part.added && !part.removed);
  }, [diffResult]);

  const handleSwap = useCallback(() => {
    setOriginalText(modifiedText);
    setModifiedText(originalText);
    trackToolEvent("diff-checker", "tools", "use");
  }, [originalText, modifiedText]);

  const handleClear = useCallback(() => {
    setOriginalText("");
    setModifiedText("");
    trackToolEvent("diff-checker", "tools", "use");
  }, []);

  const handleCopy = useCallback(async () => {
    if (!diffResult) return;
    const text = diffResult
      .map((part) => {
        const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
        if (compareLevel === "line") {
          return part.value
            .split("\n")
            .filter((l) => l !== "")
            .map((l) => `${prefix}${l}`)
            .join("\n");
        }
        return `${prefix}${part.value}`;
      })
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolEvent("diff-checker", "tools", "copy");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [diffResult, compareLevel]);

  const renderInlineDiff = () => {
    if (!diffResult) return null;

    if (isIdentical && hasInput) {
      return (
        <div className="p-6 text-center text-muted-foreground">
          <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="font-medium">{dictionary.textsIdentical}</p>
        </div>
      );
    }

    return (
      <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-auto max-h-[500px]">
        {diffResult.map((part, i) => {
          if (part.added) {
            return (
              <span
                key={i}
                className="bg-green-500/20 text-green-700 dark:text-green-300 decoration-green-500"
              >
                {part.value}
              </span>
            );
          }
          if (part.removed) {
            return (
              <span
                key={i}
                className="bg-red-500/20 text-red-700 dark:text-red-300 line-through decoration-red-500"
              >
                {part.value}
              </span>
            );
          }
          return <span key={i}>{part.value}</span>;
        })}
      </div>
    );
  };

  const renderSideBySideDiff = () => {
    if (!diffResult) return null;

    if (isIdentical && hasInput) {
      return (
        <div className="p-6 text-center text-muted-foreground">
          <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <p className="font-medium">{dictionary.textsIdentical}</p>
        </div>
      );
    }

    const leftParts: DiffPart[] = [];
    const rightParts: DiffPart[] = [];

    for (const part of diffResult) {
      if (part.added) {
        rightParts.push(part);
      } else if (part.removed) {
        leftParts.push(part);
      } else {
        leftParts.push(part);
        rightParts.push(part);
      }
    }

    return (
      <div className="grid grid-cols-2 divide-x max-h-[500px] overflow-auto">
        <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
          {leftParts.map((part, i) =>
            part.removed ? (
              <span
                key={i}
                className="bg-red-500/20 text-red-700 dark:text-red-300"
              >
                {part.value}
              </span>
            ) : (
              <span key={i}>{part.value}</span>
            )
          )}
        </div>
        <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
          {rightParts.map((part, i) =>
            part.added ? (
              <span
                key={i}
                className="bg-green-500/20 text-green-700 dark:text-green-300"
              >
                {part.value}
              </span>
            ) : (
              <span key={i}>{part.value}</span>
            )
          )}
        </div>
      </div>
    );
  };

  const unitLabel =
    compareLevel === "line"
      ? dictionary.lineDiff.toLowerCase()
      : compareLevel === "word"
        ? dictionary.wordDiff.toLowerCase()
        : dictionary.charDiff.toLowerCase();

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <GitCompareArrows className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input textareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {dictionary.originalLabel}
            </label>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder={dictionary.originalPlaceholder}
              className="w-full p-3 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm min-h-[200px] leading-relaxed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {dictionary.modifiedLabel}
            </label>
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              placeholder={dictionary.modifiedPlaceholder}
              className="w-full p-3 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm min-h-[200px] leading-relaxed"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-muted/30">
          {/* Compare level */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">
              {dictionary.compareLevel}:
            </span>
            {(["line", "word", "character"] as CompareLevel[]).map((level) => (
              <Button
                key={level}
                variant={compareLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setCompareLevel(level)}
                className="text-xs h-7 px-2"
              >
                {level === "line"
                  ? dictionary.lineDiff
                  : level === "word"
                    ? dictionary.wordDiff
                    : dictionary.charDiff}
              </Button>
            ))}
          </div>

          <div className="hidden sm:block w-px h-5 bg-border" />

          {/* View mode */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">
              {dictionary.viewMode}:
            </span>
            <Button
              variant={viewMode === "side-by-side" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("side-by-side")}
              className="text-xs h-7 px-2"
            >
              {dictionary.sideBySide}
            </Button>
            <Button
              variant={viewMode === "inline" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("inline")}
              className="text-xs h-7 px-2"
            >
              {dictionary.inline}
            </Button>
          </div>

          <div className="hidden sm:block w-px h-5 bg-border" />

          {/* Options */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-border"
              />
              {dictionary.ignoreWhitespace}
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="rounded border-border"
              />
              {dictionary.ignoreCase}
            </label>
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwap}
              disabled={!hasInput}
              className="text-xs h-7 px-2 gap-1"
            >
              <ArrowRightLeft className="h-3 w-3" />
              {dictionary.swap}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!diffResult}
              className="text-xs h-7 px-2 gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  {dictionary.copied}
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  {dictionary.copy}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!hasInput}
              className="text-xs h-7 px-2 gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              {dictionary.clear}
            </Button>
          </div>
        </div>

        {/* Diff output */}
        {diffResult && hasInput && (
          <div className="space-y-3">
            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs px-1">
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Plus className="h-3.5 w-3.5" />
                <strong>{stats.additions}</strong> {dictionary.additions}{" "}
                ({unitLabel})
              </span>
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <Minus className="h-3.5 w-3.5" />
                <strong>{stats.deletions}</strong> {dictionary.deletions}{" "}
                ({unitLabel})
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Equal className="h-3.5 w-3.5" />
                <strong>{stats.unchanged}</strong> {dictionary.unchanged}{" "}
                ({unitLabel})
              </span>
            </div>

            {/* Diff content */}
            <div className="rounded-lg border bg-muted/20 overflow-hidden">
              {viewMode === "inline"
                ? renderInlineDiff()
                : renderSideBySideDiff()}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasInput && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {dictionary.noDifferences}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
