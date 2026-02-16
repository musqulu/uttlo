"use client";

import { useState, useCallback } from "react";
import { Zap, RotateCcw } from "lucide-react";
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
  ElectricityCostResult,
  calculateElectricityCost,
  validateElectricityInputs,
} from "@/lib/calculators";

interface Appliance {
  name: string;
  watts: number;
  hours: number;
}

interface ElectricityCalculatorDictionary {
  title: string;
  subtitle: string;
  power: string;
  powerPlaceholder: string;
  hoursPerDay: string;
  hoursPerDayPlaceholder: string;
  electricityPrice: string;
  electricityPricePlaceholder: string;
  billingPeriod: string;
  billingPeriodPlaceholder: string;
  calculate: string;
  clear: string;
  results: string;
  dailyUsage: string;
  totalUsage: string;
  dailyCost: string;
  monthlyCost: string;
  yearlyCost: string;
  presets: string;
  presetsHint: string;
  days: string;
  defaultPrice: string;
  appliances: Appliance[];
}

interface ElectricityCalculatorProps {
  dictionary: ElectricityCalculatorDictionary;
}

export function ElectricityCalculator({ dictionary }: ElectricityCalculatorProps) {
  const [watts, setWatts] = useState("2000");
  const [hours, setHours] = useState("4");
  const [price, setPrice] = useState(dictionary.defaultPrice);
  const [days, setDays] = useState("30");
  const [result, setResult] = useState<ElectricityCostResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    const w = parseFloat(watts);
    const h = parseFloat(hours);
    const p = parseFloat(price);
    const d = parseInt(days, 10);

    const validation = validateElectricityInputs(w, h, p, d);
    if (!validation.valid) {
      setError(validation.error || "Invalid data");
      setResult(null);
      return;
    }

    const calcResult = calculateElectricityCost(w, h, p, d);
    setResult(calcResult);
    setError(null);
    trackToolEvent("electricity-calculator", "calculators", "use");
  }, [watts, hours, price, days]);

  const handleClear = useCallback(() => {
    setWatts("2000");
    setHours("4");
    setPrice(dictionary.defaultPrice);
    setDays("30");
    setResult(null);
    setError(null);
  }, [dictionary.defaultPrice]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleCalculate();
    },
    [handleCalculate]
  );

  const handlePreset = useCallback((appliance: Appliance) => {
    setWatts(String(appliance.watts));
    setHours(String(appliance.hours));
    if (!price) setPrice(dictionary.defaultPrice);
  }, [price, dictionary.defaultPrice]);

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Zap className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset appliances */}
        <div className="space-y-2">
          <Label>{dictionary.presets}</Label>
          <p className="text-xs text-muted-foreground">{dictionary.presetsHint}</p>
          <div className="flex flex-wrap gap-2">
            {dictionary.appliances.map((appliance) => (
              <button
                key={appliance.name}
                type="button"
                onClick={() => handlePreset(appliance)}
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-primary/10 hover:border-primary/50 transition-colors"
              >
                {appliance.name}
                <span className="text-muted-foreground">{appliance.watts}W</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="el-watts">{dictionary.power}</Label>
            <div className="relative">
              <Input
                id="el-watts"
                type="number"
                value={watts}
                onChange={(e) => setWatts(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={dictionary.powerPlaceholder}
                min="0"
                step="1"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                W
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="el-hours">{dictionary.hoursPerDay}</Label>
            <div className="relative">
              <Input
                id="el-hours"
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={dictionary.hoursPerDayPlaceholder}
                min="0"
                max="24"
                step="0.5"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                h
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="el-price">{dictionary.electricityPrice}</Label>
            <div className="relative">
              <Input
                id="el-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={dictionary.electricityPricePlaceholder}
                min="0"
                step="0.01"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                /kWh
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="el-days">{dictionary.billingPeriod}</Label>
            <div className="relative">
              <Input
                id="el-days"
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={dictionary.billingPeriodPlaceholder}
                min="1"
                max="365"
                step="1"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {dictionary.days}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleCalculate} className="flex-1" size="lg">
            <Zap className="h-4 w-4 mr-2" />
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
            <h3 className="font-semibold text-center">{dictionary.results}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {dictionary.dailyUsage}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {result.dailyKwh.toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal">kWh</span>
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-muted/30 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {dictionary.totalUsage} ({days} {dictionary.days})
                </p>
                <p className="text-2xl font-bold text-primary">
                  {result.totalKwh.toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal">kWh</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {dictionary.dailyCost}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {result.dailyCost.toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal">PLN</span>
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {dictionary.monthlyCost}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {result.monthlyCost.toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal">PLN</span>
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {dictionary.yearlyCost}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {result.yearlyCost.toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-sm font-normal">PLN</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
