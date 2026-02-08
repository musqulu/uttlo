"use client";

import { useState, useCallback } from "react";
import { Moon, Sun, RotateCcw, Clock } from "lucide-react";
import { trackToolEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateBedtimes,
  calculateWakeUpTimes,
  formatSleepTime,
  createTimeDate,
  getSleepQualityColor,
  getSleepQualityBgColor,
  FALL_ASLEEP_MINUTES,
  SleepTimeResult,
} from "@/lib/calculators";

interface SleepCalculatorDictionary {
  title: string;
  subtitle: string;
  wakeUpAt: string;
  fallAsleepAt: string;
  calculate: string;
  clear: string;
  cycles: string;
  hours: string;
  optimal: string;
  good: string;
  minimum: string;
  timeToFallAsleep: string;
  results: string;
  bedtimeResults: string;
  wakeUpResults: string;
}

interface SleepCalculatorProps {
  dictionary: SleepCalculatorDictionary;
}

type Mode = "wakeUp" | "bedtime";

export function SleepCalculator({ dictionary }: SleepCalculatorProps) {
  const [mode, setMode] = useState<Mode>("wakeUp");
  const [hours, setHours] = useState("07");
  const [minutes, setMinutes] = useState("00");
  const [results, setResults] = useState<SleepTimeResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getQualityLabel = (quality: string): string => {
    switch (quality) {
      case "optimal":
        return dictionary.optimal;
      case "good":
        return dictionary.good;
      case "minimum":
        return dictionary.minimum;
      default:
        return "";
    }
  };

  const handleCalculate = useCallback(() => {
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);

    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      setError("Podaj prawidłowy czas (godziny: 0-23, minuty: 0-59)");
      setResults(null);
      return;
    }

    const timeDate = createTimeDate(h, m);

    if (mode === "wakeUp") {
      setResults(calculateBedtimes(timeDate));
    } else {
      setResults(calculateWakeUpTimes(timeDate));
    }
    setError(null);
    trackToolEvent("sleep-calculator", "calculators", "use");
  }, [hours, minutes, mode]);

  const handleClear = useCallback(() => {
    setHours("07");
    setMinutes("00");
    setResults(null);
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCalculate();
      }
    },
    [handleCalculate]
  );

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setResults(null);
    setError(null);
    if (newMode === "wakeUp") {
      setHours("07");
      setMinutes("00");
    } else {
      setHours("23");
      setMinutes("00");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Moon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={mode === "wakeUp" ? "default" : "outline"}
            onClick={() => switchMode("wakeUp")}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            {dictionary.wakeUpAt}
          </Button>
          <Button
            variant={mode === "bedtime" ? "default" : "outline"}
            onClick={() => switchMode("bedtime")}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            {dictionary.fallAsleepAt}
          </Button>
        </div>

        {/* Time Input */}
        <div className="space-y-2">
          <Label>
            {mode === "wakeUp" ? dictionary.wakeUpAt : dictionary.fallAsleepAt}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl font-mono h-14"
              placeholder="07"
            />
            <span className="text-3xl font-bold text-muted-foreground">:</span>
            <Input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-center text-2xl font-mono h-14"
              placeholder="00"
            />
          </div>
        </div>

        {/* Calculate & Clear Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleCalculate} className="flex-1" size="lg">
            <Clock className="h-4 w-4 mr-2" />
            {dictionary.calculate}
          </Button>
          <Button variant="outline" onClick={handleClear} size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            {dictionary.clear}
          </Button>
        </div>

        {/* Info about fall asleep time */}
        <p className="text-xs text-center text-muted-foreground">
          {dictionary.timeToFallAsleep}: ~{FALL_ASLEEP_MINUTES} min
        </p>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-center text-muted-foreground">
              {mode === "wakeUp"
                ? dictionary.bedtimeResults
                : dictionary.wakeUpResults}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {results.map((result) => (
                <div
                  key={result.cycles}
                  className={`p-4 rounded-lg border text-center transition-all ${getSleepQualityBgColor(
                    result.quality
                  )}`}
                >
                  <p
                    className={`text-3xl font-bold font-mono ${getSleepQualityColor(
                      result.quality
                    )}`}
                  >
                    {formatSleepTime(result.time)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.cycles} {dictionary.cycles} &middot;{" "}
                    {result.totalHours}h
                  </p>
                  <p
                    className={`text-xs font-medium mt-1 ${getSleepQualityColor(
                      result.quality
                    )}`}
                  >
                    {getQualityLabel(result.quality)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
