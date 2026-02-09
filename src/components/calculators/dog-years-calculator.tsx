"use client";

import { useState, useCallback } from "react";
import { Dog, RotateCcw } from "lucide-react";
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
  DogSize,
  DogYearsResult,
  DogLifeStage,
  calculateDogYears,
  DOG_LIFE_EXPECTANCY,
} from "@/lib/calculators";

interface DogYearsCalculatorDictionary {
  title: string;
  subtitle: string;
  dogAge: string;
  dogSize: string;
  small: string;
  smallDesc: string;
  medium: string;
  mediumDesc: string;
  large: string;
  largeDesc: string;
  giant: string;
  giantDesc: string;
  calculate: string;
  clear: string;
  humanYears: string;
  lifeStage: string;
  result: string;
  lifeExpectancy: string;
  puppy: string;
  young: string;
  adult: string;
  senior: string;
  geriatric: string;
}

interface DogYearsCalculatorProps {
  dictionary: DogYearsCalculatorDictionary;
}

const DOG_SIZES: { value: DogSize; weight: string }[] = [
  { value: "small", weight: "<10 kg" },
  { value: "medium", weight: "10-25 kg" },
  { value: "large", weight: "25-45 kg" },
  { value: "giant", weight: ">45 kg" },
];

const LIFE_STAGE_COLORS: Record<DogLifeStage, string> = {
  puppy: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
  young: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
  adult: "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400",
  senior: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400",
  geriatric: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400",
};

export function DogYearsCalculator({ dictionary }: DogYearsCalculatorProps) {
  const [dogAge, setDogAge] = useState("3");
  const [size, setSize] = useState<DogSize>("medium");
  const [result, setResult] = useState<DogYearsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lifeStageLabels: Record<DogLifeStage, string> = {
    puppy: dictionary.puppy,
    young: dictionary.young,
    adult: dictionary.adult,
    senior: dictionary.senior,
    geriatric: dictionary.geriatric,
  };

  const sizeLabels: Record<DogSize, string> = {
    small: dictionary.small,
    medium: dictionary.medium,
    large: dictionary.large,
    giant: dictionary.giant,
  };

  const sizeDescs: Record<DogSize, string> = {
    small: dictionary.smallDesc,
    medium: dictionary.mediumDesc,
    large: dictionary.largeDesc,
    giant: dictionary.giantDesc,
  };

  const handleCalculate = useCallback(() => {
    const age = parseFloat(dogAge);
    if (isNaN(age) || age < 0 || age > 30) {
      setError("Wiek psa musi być między 0 a 30 lat");
      setResult(null);
      return;
    }

    const calcResult = calculateDogYears(age, size);
    setResult(calcResult);
    setError(null);
    trackToolEvent("dog-years-calculator", "calculators", "use");
  }, [dogAge, size]);

  const handleClear = useCallback(() => {
    setDogAge("3");
    setSize("medium");
    setResult(null);
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleCalculate();
    },
    [handleCalculate]
  );

  const lifeExp = DOG_LIFE_EXPECTANCY[size];

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Dog className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dog Age Input */}
        <div className="space-y-2">
          <Label htmlFor="dog-age">{dictionary.dogAge}</Label>
          <Input
            id="dog-age"
            type="number"
            value={dogAge}
            onChange={(e) => setDogAge(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="3"
            min="0"
            max="30"
            step="0.5"
            className="text-lg"
          />
        </div>

        {/* Dog Size Selector */}
        <div className="space-y-2">
          <Label>{dictionary.dogSize}</Label>
          <div className="grid grid-cols-2 gap-3">
            {DOG_SIZES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSize(s.value)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  size === s.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <span className="font-semibold text-sm block">
                  {sizeLabels[s.value]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {sizeDescs[s.value]} ({s.weight})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleCalculate} className="flex-1" size="lg">
            <Dog className="h-4 w-4 mr-2" />
            {dictionary.calculate}
          </Button>
          <Button variant="outline" onClick={handleClear} size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            {dictionary.clear}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Main Result */}
            <div className="text-center p-6 rounded-xl border bg-muted/30">
              <p className="text-sm text-muted-foreground mb-2">
                {dictionary.humanYears}
              </p>
              <p className="text-5xl font-bold text-primary mb-1">
                {result.humanYears}
              </p>
              <p className="text-sm text-muted-foreground">
                {dictionary.result}
              </p>
            </div>

            {/* Life Stage */}
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold text-sm ${
                  LIFE_STAGE_COLORS[result.lifeStage]
                }`}
              >
                {dictionary.lifeStage}: {lifeStageLabels[result.lifeStage]}
              </span>
            </div>

            {/* Life Expectancy */}
            <div className="text-center text-sm text-muted-foreground">
              <p>
                {dictionary.lifeExpectancy}: {lifeExp.min}-{lifeExp.max} lat (
                {sizeLabels[size].toLowerCase()})
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
