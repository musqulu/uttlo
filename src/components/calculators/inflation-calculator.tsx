"use client";

import { useState, useCallback } from "react";
import { TrendingUp, RotateCcw, TrendingDown } from "lucide-react";
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
  InflationResult,
  calculateInflation,
  validateInflationInputs,
} from "@/lib/calculators";

interface InflationCalculatorDictionary {
  title: string;
  subtitle: string;
  amount: string;
  inflationRate: string;
  years: string;
  calculate: string;
  clear: string;
  futureValue: string;
  purchasingPowerLoss: string;
  purchasingPowerPercent: string;
  yearByYear: string;
  year: string;
  value: string;
  loss: string;
}

interface InflationCalculatorProps {
  dictionary: InflationCalculatorDictionary;
}

export function InflationCalculator({ dictionary }: InflationCalculatorProps) {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("5");
  const [years, setYears] = useState("10");
  const [result, setResult] = useState<InflationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    const y = parseInt(years, 10);

    const validation = validateInflationInputs(a, r, y);
    if (!validation.valid) {
      setError(validation.error || "Nieprawidłowe dane");
      setResult(null);
      return;
    }

    const calcResult = calculateInflation(a, r, y);
    setResult(calcResult);
    setError(null);
    trackToolEvent("inflation-calculator", "calculators", "use");
  }, [amount, rate, years]);

  const handleClear = useCallback(() => {
    setAmount("1000");
    setRate("5");
    setYears("10");
    setResult(null);
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleCalculate();
    },
    [handleCalculate]
  );

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{dictionary.amount}</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="1000"
                min="0"
                step="100"
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                PLN
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">{dictionary.inflationRate}</Label>
            <div className="relative">
              <Input
                id="rate"
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="5"
                step="0.1"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="years">{dictionary.years}</Label>
            <Input
              id="years"
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="10"
              min="1"
              max="100"
              step="1"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleCalculate} className="flex-1" size="lg">
            <TrendingUp className="h-4 w-4 mr-2" />
            {dictionary.calculate}
          </Button>
          <Button variant="outline" onClick={handleClear} size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            {dictionary.clear}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {dictionary.futureValue}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {result.futureValue.toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal">PLN</span>
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-destructive/5 border-destructive/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {dictionary.purchasingPowerLoss}
                </p>
                <p className="text-2xl font-bold text-destructive">
                  <TrendingDown className="inline h-5 w-5 mr-1" />
                  {result.purchasingPowerLoss.toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal">PLN</span>
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-destructive/5 border-destructive/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {dictionary.purchasingPowerPercent}
                </p>
                <p className="text-2xl font-bold text-destructive">
                  -{result.purchasingPowerPercent}%
                </p>
              </div>
            </div>

            {/* Year-by-Year Table */}
            <div>
              <h3 className="font-semibold mb-3">{dictionary.yearByYear}</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">{dictionary.year}</th>
                      <th className="text-right p-3 font-medium">{dictionary.value}</th>
                      <th className="text-right p-3 font-medium">{dictionary.loss}</th>
                      <th className="text-right p-3 font-medium">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.yearByYear.map((row) => (
                      <tr key={row.year} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{row.year}</td>
                        <td className="p-3 text-right">
                          {row.value.toLocaleString("pl-PL", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          PLN
                        </td>
                        <td className="p-3 text-right text-destructive">
                          +{row.loss.toLocaleString("pl-PL", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          PLN
                        </td>
                        <td className="p-3 text-right text-destructive">
                          +{row.lossPercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
