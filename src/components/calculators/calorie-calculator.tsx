"use client";

import { useState, useCallback } from "react";
import { Flame, RotateCcw, User, UserRound } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateCalories,
  validateCalorieInputs,
  CalorieCalculationResult,
  CalorieGoalType,
  Gender,
  ActivityLevel,
} from "@/lib/calculators";

interface CalorieCalculatorDictionary {
  title: string;
  subtitle: string;
  gender: string;
  male: string;
  female: string;
  age: string;
  weight: string;
  height: string;
  activityLevel: string;
  sedentary: string;
  lightlyActive: string;
  moderatelyActive: string;
  veryActive: string;
  extremelyActive: string;
  calculate: string;
  clear: string;
  bmr: string;
  bmrDesc: string;
  tdee: string;
  tdeeDesc: string;
  loseWeight: string;
  slowCut: string;
  maintenance: string;
  leanBulk: string;
  bulk: string;
  protein: string;
  carbs: string;
  fat: string;
  kcalPerDay: string;
  weeklyChange: string;
  goalResults: string;
  macros: string;
}

interface CalorieCalculatorProps {
  dictionary: CalorieCalculatorDictionary;
}

const GOAL_COLORS: Record<CalorieGoalType, { text: string; bg: string; border: string }> = {
  loseWeight: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
  },
  slowCut: {
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
  },
  maintenance: {
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
  },
  leanBulk: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  bulk: {
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-800",
  },
};

export function CalorieCalculator({ dictionary }: CalorieCalculatorProps) {
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderatelyActive");
  const [result, setResult] = useState<CalorieCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goalLabels: Record<CalorieGoalType, string> = {
    loseWeight: dictionary.loseWeight,
    slowCut: dictionary.slowCut,
    maintenance: dictionary.maintenance,
    leanBulk: dictionary.leanBulk,
    bulk: dictionary.bulk,
  };

  const handleCalculate = useCallback(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);

    const validation = validateCalorieInputs(w, h, a);
    if (!validation.valid) {
      setError(validation.error || "Nieprawidłowe dane");
      setResult(null);
      return;
    }

    const calcResult = calculateCalories(w, h, a, gender, activityLevel);
    setResult(calcResult);
    setError(null);
    trackToolEvent("calorie-calculator", "calculators", "use");
  }, [weight, height, age, gender, activityLevel]);

  const handleClear = useCallback(() => {
    setAge("");
    setWeight("");
    setHeight("");
    setGender("male");
    setActivityLevel("moderatelyActive");
    setResult(null);
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

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Flame className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Toggle */}
        <div className="space-y-2">
          <Label>{dictionary.gender}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={gender === "male" ? "default" : "outline"}
              onClick={() => setGender("male")}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              {dictionary.male}
            </Button>
            <Button
              variant={gender === "female" ? "default" : "outline"}
              onClick={() => setGender("female")}
              className="gap-2"
            >
              <UserRound className="h-4 w-4" />
              {dictionary.female}
            </Button>
          </div>
        </div>

        {/* Age, Weight, Height */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cal-age">{dictionary.age}</Label>
            <Input
              id="cal-age"
              type="number"
              placeholder="np. 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              onKeyDown={handleKeyDown}
              min="1"
              max="120"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cal-weight">{dictionary.weight}</Label>
            <Input
              id="cal-weight"
              type="number"
              placeholder="np. 75"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={handleKeyDown}
              min="1"
              max="500"
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cal-height">{dictionary.height}</Label>
            <Input
              id="cal-height"
              type="number"
              placeholder="np. 178"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              onKeyDown={handleKeyDown}
              min="1"
              max="300"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div className="space-y-2">
          <Label>{dictionary.activityLevel}</Label>
          <Select
            value={activityLevel}
            onValueChange={(val) => setActivityLevel(val as ActivityLevel)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">{dictionary.sedentary}</SelectItem>
              <SelectItem value="lightlyActive">{dictionary.lightlyActive}</SelectItem>
              <SelectItem value="moderatelyActive">{dictionary.moderatelyActive}</SelectItem>
              <SelectItem value="veryActive">{dictionary.veryActive}</SelectItem>
              <SelectItem value="extremelyActive">{dictionary.extremelyActive}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Calculate & Clear */}
        <div className="flex gap-3">
          <Button onClick={handleCalculate} className="flex-1" size="lg">
            <Flame className="h-4 w-4 mr-2" />
            {dictionary.calculate}
          </Button>
          <Button variant="outline" onClick={handleClear} size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            {dictionary.clear}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* BMR & TDEE Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-xs text-muted-foreground mb-1">{dictionary.bmr}</p>
                <p className="text-3xl font-bold text-primary font-mono">
                  {result.bmr}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{dictionary.kcalPerDay}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-xs text-muted-foreground mb-1">{dictionary.tdee}</p>
                <p className="text-3xl font-bold text-primary font-mono">
                  {result.tdee}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{dictionary.kcalPerDay}</p>
              </div>
            </div>

            {/* Goal Results */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-center text-muted-foreground">
                {dictionary.goalResults}
              </h3>
              {result.goals.map((goalResult) => {
                const colors = GOAL_COLORS[goalResult.goal];
                return (
                  <div
                    key={goalResult.goal}
                    className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${colors.text}`}>
                        {goalLabels[goalResult.goal]}
                      </span>
                      <span className={`text-2xl font-bold font-mono ${colors.text}`}>
                        {goalResult.calories}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>
                        {goalResult.adjustment > 0 ? "+" : ""}
                        {goalResult.adjustment} kcal/dzień
                      </span>
                      <span>
                        {dictionary.weeklyChange}:{" "}
                        {goalResult.weeklyKgChange > 0 ? "+" : ""}
                        {goalResult.weeklyKgChange} kg
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-current/10">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{dictionary.protein}</p>
                        <p className="text-sm font-medium">{goalResult.macros.protein}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{dictionary.carbs}</p>
                        <p className="text-sm font-medium">{goalResult.macros.carbs}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{dictionary.fat}</p>
                        <p className="text-sm font-medium">{goalResult.macros.fat}g</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
