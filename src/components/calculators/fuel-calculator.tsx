"use client";

import { useState, useCallback } from "react";
import { Fuel, Zap, RotateCcw, Car } from "lucide-react";
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
  calculateFuelConsumption,
  calculateEvConsumption,
  validateFuelInputs,
  validateEvInputs,
  FuelConsumptionResult,
  milesToKm,
  gallonsToLiters,
  lPer100kmToMpg,
  kmToMiles,
} from "@/lib/calculators";

interface FuelCalculatorDictionary {
  title: string;
  subtitle: string;
  fuelMode: string;
  evMode: string;
  distance: string;
  distancePlaceholder: string;
  fuelAmount: string;
  fuelAmountPlaceholder: string;
  fuelPrice: string;
  fuelPricePlaceholder: string;
  energyAmount: string;
  energyAmountPlaceholder: string;
  electricityPrice: string;
  electricityPricePlaceholder: string;
  calculate: string;
  clear: string;
  consumptionPer100km: string;
  costPerKm: string;
  totalCost: string;
  kmPerLiter: string;
  kmPerKwh: string;
  lPer100km: string;
  kwhPer100km: string;
  results: string;
  comparison: string;
  fuelVehicle: string;
  electricVehicle: string;
  savingsEv: string;
  savingsFuel: string;
  perKm: string;
  currency: string;
  optional: string;
  distanceMiles: string;
  fuelGallons: string;
  milesPerGallon: string;
  mpg: string;
  unitMetric: string;
  unitImperial: string;
  milesPerKwh: string;
}

interface FuelCalculatorProps {
  dictionary: FuelCalculatorDictionary;
  locale?: string;
}

type Mode = "fuel" | "ev";

export function FuelCalculator({ dictionary, locale = "pl" }: FuelCalculatorProps) {
  const [mode, setMode] = useState<Mode>("fuel");
  const [useImperial, setUseImperial] = useState(false);

  // Fuel inputs
  const [fuelDistance, setFuelDistance] = useState("");
  const [fuelAmount, setFuelAmount] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [fuelResult, setFuelResult] = useState<FuelConsumptionResult | null>(null);
  const [fuelError, setFuelError] = useState<string | null>(null);

  // EV inputs
  const [evDistance, setEvDistance] = useState("");
  const [evAmount, setEvAmount] = useState("");
  const [evPrice, setEvPrice] = useState("");
  const [evResult, setEvResult] = useState<FuelConsumptionResult | null>(null);
  const [evError, setEvError] = useState<string | null>(null);

  const showImperialToggle = locale === "en";

  const handleCalculateFuel = useCallback(() => {
    let d = parseFloat(fuelDistance);
    let a = parseFloat(fuelAmount);
    const p = fuelPrice.trim() !== "" ? parseFloat(fuelPrice) : NaN;

    // Convert imperial to metric for calculation
    if (useImperial) {
      d = milesToKm(d);
      a = gallonsToLiters(a);
    }

    const validation = validateFuelInputs(d, a, !isNaN(p) ? p : undefined);
    if (!validation.valid) {
      setFuelError(validation.error || "Invalid data");
      setFuelResult(null);
      return;
    }

    const result = calculateFuelConsumption(d, a, !isNaN(p) && p > 0 ? p : 0);
    setFuelResult(result);
    setFuelError(null);
    trackToolEvent("fuel-calculator", "calculators", "use");
  }, [fuelDistance, fuelAmount, fuelPrice, useImperial]);

  const handleCalculateEv = useCallback(() => {
    let d = parseFloat(evDistance);
    const a = parseFloat(evAmount);
    const p = evPrice.trim() !== "" ? parseFloat(evPrice) : NaN;

    // Convert miles to km for calculation
    if (useImperial) {
      d = milesToKm(d);
    }

    const validation = validateEvInputs(d, a, !isNaN(p) ? p : undefined);
    if (!validation.valid) {
      setEvError(validation.error || "Invalid data");
      setEvResult(null);
      return;
    }

    const result = calculateEvConsumption(d, a, !isNaN(p) && p > 0 ? p : 0);
    setEvResult(result);
    setEvError(null);
    trackToolEvent("fuel-calculator", "calculators", "use");
  }, [evDistance, evAmount, evPrice, useImperial]);

  const handleClearFuel = useCallback(() => {
    setFuelDistance("");
    setFuelAmount("");
    setFuelPrice("");
    setFuelResult(null);
    setFuelError(null);
  }, []);

  const handleClearEv = useCallback(() => {
    setEvDistance("");
    setEvAmount("");
    setEvPrice("");
    setEvResult(null);
    setEvError(null);
  }, []);

  const handleKeyDownFuel = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleCalculateFuel();
    },
    [handleCalculateFuel]
  );

  const handleKeyDownEv = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleCalculateEv();
    },
    [handleCalculateEv]
  );

  // Comparison: only when both have cost data
  const showComparison =
    fuelResult?.costPerKm !== null &&
    fuelResult?.costPerKm !== undefined &&
    evResult?.costPerKm !== null &&
    evResult?.costPerKm !== undefined;

  // Helper: format consumption for display
  const formatFuelConsumption = (result: FuelConsumptionResult) => {
    if (useImperial) {
      return lPer100kmToMpg(result.consumptionPer100km);
    }
    return result.consumptionPer100km;
  };

  const formatFuelEfficiency = (result: FuelConsumptionResult) => {
    if (useImperial) {
      // miles per gallon = MPG (same as consumption in imperial)
      return lPer100kmToMpg(result.consumptionPer100km);
    }
    return result.kmPerUnit;
  };

  const formatEvEfficiency = (result: FuelConsumptionResult) => {
    if (useImperial) {
      // miles per kWh
      return Math.round(kmToMiles(result.kmPerUnit) * 100) / 100;
    }
    return result.kmPerUnit;
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Car className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Imperial / Metric Radio Toggle (EN only) */}
        {showImperialToggle && (
          <fieldset className="space-y-2">
            <Label asChild>
              <legend>{dictionary.unitMetric.split(" (")[0]}</legend>
            </Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="unit-system"
                  checked={!useImperial}
                  onChange={() => setUseImperial(false)}
                  className="h-4 w-4 accent-primary"
                />
                <span className={`text-sm ${!useImperial ? "font-medium" : "text-muted-foreground"}`}>
                  {dictionary.unitMetric}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="unit-system"
                  checked={useImperial}
                  onChange={() => setUseImperial(true)}
                  className="h-4 w-4 accent-primary"
                />
                <span className={`text-sm ${useImperial ? "font-medium" : "text-muted-foreground"}`}>
                  {dictionary.unitImperial}
                </span>
              </label>
            </div>
          </fieldset>
        )}

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={mode === "fuel" ? "default" : "outline"}
            onClick={() => setMode("fuel")}
            className="gap-2"
          >
            <Fuel className="h-4 w-4" />
            {dictionary.fuelMode}
          </Button>
          <Button
            variant={mode === "ev" ? "default" : "outline"}
            onClick={() => setMode("ev")}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {dictionary.evMode}
          </Button>
        </div>

        {/* Fuel Mode */}
        {mode === "fuel" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fuel-distance">
                {useImperial ? dictionary.distanceMiles : dictionary.distance}
              </Label>
              <Input
                id="fuel-distance"
                type="number"
                placeholder={dictionary.distancePlaceholder}
                value={fuelDistance}
                onChange={(e) => setFuelDistance(e.target.value)}
                onKeyDown={handleKeyDownFuel}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-amount">
                {useImperial ? dictionary.fuelGallons : dictionary.fuelAmount}
              </Label>
              <Input
                id="fuel-amount"
                type="number"
                placeholder={dictionary.fuelAmountPlaceholder}
                value={fuelAmount}
                onChange={(e) => setFuelAmount(e.target.value)}
                onKeyDown={handleKeyDownFuel}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuel-price">
                {dictionary.fuelPrice}{" "}
                <span className="text-muted-foreground font-normal">
                  {dictionary.optional}
                </span>
              </Label>
              <Input
                id="fuel-price"
                type="number"
                placeholder={dictionary.fuelPricePlaceholder}
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                onKeyDown={handleKeyDownFuel}
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCalculateFuel} className="flex-1" size="lg">
                <Fuel className="h-4 w-4 mr-2" />
                {dictionary.calculate}
              </Button>
              <Button variant="outline" onClick={handleClearFuel} size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                {dictionary.clear}
              </Button>
            </div>

            {fuelError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-center text-sm">
                {fuelError}
              </div>
            )}

            {fuelResult && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-center text-muted-foreground">
                  {dictionary.results}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {useImperial
                        ? dictionary.milesPerGallon
                        : dictionary.consumptionPer100km}
                    </p>
                    <p className="text-2xl font-bold text-primary font-mono">
                      {formatFuelConsumption(fuelResult)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {useImperial ? dictionary.mpg : dictionary.lPer100km}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {useImperial
                        ? dictionary.milesPerGallon
                        : dictionary.kmPerLiter}
                    </p>
                    <p className="text-2xl font-bold text-primary font-mono">
                      {formatFuelEfficiency(fuelResult)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {useImperial ? "mi/gal" : "km/l"}
                    </p>
                  </div>
                  {fuelResult.costPerKm !== null && (
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dictionary.costPerKm}
                      </p>
                      <p className="text-2xl font-bold text-primary font-mono">
                        {fuelResult.costPerKm}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dictionary.currency}/{useImperial ? "mi" : dictionary.perKm}
                      </p>
                    </div>
                  )}
                  {fuelResult.totalCost !== null && (
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dictionary.totalCost}
                      </p>
                      <p className="text-2xl font-bold text-primary font-mono">
                        {fuelResult.totalCost}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dictionary.currency}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EV Mode */}
        {mode === "ev" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ev-distance">
                {useImperial ? dictionary.distanceMiles : dictionary.distance}
              </Label>
              <Input
                id="ev-distance"
                type="number"
                placeholder={dictionary.distancePlaceholder}
                value={evDistance}
                onChange={(e) => setEvDistance(e.target.value)}
                onKeyDown={handleKeyDownEv}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-amount">{dictionary.energyAmount}</Label>
              <Input
                id="ev-amount"
                type="number"
                placeholder={dictionary.energyAmountPlaceholder}
                value={evAmount}
                onChange={(e) => setEvAmount(e.target.value)}
                onKeyDown={handleKeyDownEv}
                min="0"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-price">
                {dictionary.electricityPrice}{" "}
                <span className="text-muted-foreground font-normal">
                  {dictionary.optional}
                </span>
              </Label>
              <Input
                id="ev-price"
                type="number"
                placeholder={dictionary.electricityPricePlaceholder}
                value={evPrice}
                onChange={(e) => setEvPrice(e.target.value)}
                onKeyDown={handleKeyDownEv}
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCalculateEv} className="flex-1" size="lg">
                <Zap className="h-4 w-4 mr-2" />
                {dictionary.calculate}
              </Button>
              <Button variant="outline" onClick={handleClearEv} size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                {dictionary.clear}
              </Button>
            </div>

            {evError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-center text-sm">
                {evError}
              </div>
            )}

            {evResult && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-center text-muted-foreground">
                  {dictionary.results}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {dictionary.consumptionPer100km}
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                      {evResult.consumptionPer100km}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dictionary.kwhPer100km}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {useImperial ? dictionary.milesPerKwh : dictionary.kmPerKwh}
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                      {formatEvEfficiency(evResult)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {useImperial ? "mi/kWh" : "km/kWh"}
                    </p>
                  </div>
                  {evResult.costPerKm !== null && (
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dictionary.costPerKm}
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                        {evResult.costPerKm}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dictionary.currency}/{useImperial ? "mi" : dictionary.perKm}
                      </p>
                    </div>
                  )}
                  {evResult.totalCost !== null && (
                    <div className="p-4 rounded-lg bg-muted text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dictionary.totalCost}
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
                        {evResult.totalCost}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dictionary.currency}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comparison — only when both have cost data */}
        {showComparison && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-sm font-semibold text-center">
              {dictionary.comparison}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* Fuel side */}
              <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 text-center">
                <Fuel className="h-5 w-5 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                <p className="text-xs text-muted-foreground mb-1">
                  {dictionary.fuelVehicle}
                </p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400 font-mono">
                  {fuelResult!.costPerKm} {dictionary.currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  {useImperial ? "/mi" : `/${dictionary.perKm}`}
                </p>
              </div>
              {/* EV side */}
              <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-center">
                <Zap className="h-5 w-5 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="text-xs text-muted-foreground mb-1">
                  {dictionary.electricVehicle}
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 font-mono">
                  {evResult!.costPerKm} {dictionary.currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  {useImperial ? "/mi" : `/${dictionary.perKm}`}
                </p>
              </div>
            </div>
            {/* Savings note */}
            {fuelResult!.costPerKm !== evResult!.costPerKm && (
              <div className="p-3 rounded-lg bg-muted text-center text-sm">
                {evResult!.costPerKm! < fuelResult!.costPerKm! ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {dictionary.savingsEv}:{" "}
                    {(
                      ((fuelResult!.costPerKm! - evResult!.costPerKm!) /
                        fuelResult!.costPerKm!) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                ) : (
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    {dictionary.savingsFuel}:{" "}
                    {(
                      ((evResult!.costPerKm! - fuelResult!.costPerKm!) /
                        evResult!.costPerKm!) *
                      100
                    ).toFixed(0)}
                    %
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
