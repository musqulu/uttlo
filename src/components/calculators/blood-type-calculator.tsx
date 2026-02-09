"use client";

import { useState, useCallback } from "react";
import { Droplets, RotateCcw } from "lucide-react";
import { trackToolEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BloodType,
  RhFactor,
  BloodTypeResult,
  calculateChildBloodTypes,
} from "@/lib/calculators";

interface BloodTypeCalculatorDictionary {
  title: string;
  subtitle: string;
  parent1: string;
  parent2: string;
  bloodGroup: string;
  rhFactor: string;
  calculate: string;
  clear: string;
  results: string;
  probability: string;
  possibleTypes: string;
  noResults: string;
}

interface BloodTypeCalculatorProps {
  dictionary: BloodTypeCalculatorDictionary;
}

const BLOOD_TYPES: BloodType[] = ["A", "B", "AB", "O"];
const RH_FACTORS: RhFactor[] = ["+", "-"];

const BLOOD_TYPE_COLORS: Record<string, string> = {
  "A+": "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400",
  "A-": "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400",
  "B+": "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
  "B-": "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
  "AB+": "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400",
  "AB-": "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400",
  "O+": "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
  "O-": "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
};

export function BloodTypeCalculator({ dictionary }: BloodTypeCalculatorProps) {
  const [parent1Type, setParent1Type] = useState<BloodType>("A");
  const [parent1Rh, setParent1Rh] = useState<RhFactor>("+");
  const [parent2Type, setParent2Type] = useState<BloodType>("B");
  const [parent2Rh, setParent2Rh] = useState<RhFactor>("+");
  const [results, setResults] = useState<BloodTypeResult[] | null>(null);

  const handleCalculate = useCallback(() => {
    const childTypes = calculateChildBloodTypes(
      parent1Type,
      parent1Rh,
      parent2Type,
      parent2Rh
    );
    setResults(childTypes);
    trackToolEvent("blood-type-calculator", "calculators", "use");
  }, [parent1Type, parent1Rh, parent2Type, parent2Rh]);

  const handleClear = useCallback(() => {
    setParent1Type("A");
    setParent1Rh("+");
    setParent2Type("B");
    setParent2Rh("+");
    setResults(null);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Droplets className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parent Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parent 1 */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <h3 className="font-semibold text-center">{dictionary.parent1}</h3>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{dictionary.bloodGroup}</p>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((type) => (
                  <Button
                    key={`p1-${type}`}
                    variant={parent1Type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setParent1Type(type)}
                    className="font-bold"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{dictionary.rhFactor}</p>
              <div className="grid grid-cols-2 gap-2">
                {RH_FACTORS.map((rh) => (
                  <Button
                    key={`p1-rh-${rh}`}
                    variant={parent1Rh === rh ? "default" : "outline"}
                    size="sm"
                    onClick={() => setParent1Rh(rh)}
                    className="font-bold"
                  >
                    Rh{rh}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="inline-flex items-center gap-1.5 text-lg font-bold px-4 py-1.5 rounded-full bg-primary/10 text-primary">
                {parent1Type}{parent1Rh}
              </span>
            </div>
          </div>

          {/* Parent 2 */}
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <h3 className="font-semibold text-center">{dictionary.parent2}</h3>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{dictionary.bloodGroup}</p>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((type) => (
                  <Button
                    key={`p2-${type}`}
                    variant={parent2Type === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setParent2Type(type)}
                    className="font-bold"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{dictionary.rhFactor}</p>
              <div className="grid grid-cols-2 gap-2">
                {RH_FACTORS.map((rh) => (
                  <Button
                    key={`p2-rh-${rh}`}
                    variant={parent2Rh === rh ? "default" : "outline"}
                    size="sm"
                    onClick={() => setParent2Rh(rh)}
                    className="font-bold"
                  >
                    Rh{rh}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="inline-flex items-center gap-1.5 text-lg font-bold px-4 py-1.5 rounded-full bg-primary/10 text-primary">
                {parent2Type}{parent2Rh}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleCalculate} className="flex-1" size="lg">
            <Droplets className="h-4 w-4 mr-2" />
            {dictionary.calculate}
          </Button>
          <Button variant="outline" onClick={handleClear} size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            {dictionary.clear}
          </Button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <h3 className="font-semibold text-center text-lg">
              {dictionary.possibleTypes}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {results.map((result) => (
                <div
                  key={result.type}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    BLOOD_TYPE_COLORS[result.type] || "bg-muted border-border"
                  }`}
                >
                  <span className="text-2xl font-bold">{result.type}</span>
                  <span className="text-sm mt-1 opacity-80">
                    {result.probability}%
                  </span>
                </div>
              ))}
            </div>
            {results.length === 0 && (
              <p className="text-center text-muted-foreground">
                {dictionary.noResults}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
