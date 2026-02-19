"use client";

import { useState, useCallback, useMemo } from "react";
import { Coins, RotateCcw, History, Trash2 } from "lucide-react";
import { trackToolEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface CoinFlipperDictionary {
  title: string;
  subtitle: string;
  flip: string;
  flipping: string;
  heads: string;
  tails: string;
  result: string;
  flipAgain: string;
  numberOfCoins: string;
  history: string;
  clearHistory: string;
  total: string;
  headsCount: string;
  tailsCount: string;
}

interface CoinFlipperProps {
  dictionary: CoinFlipperDictionary;
}

type CoinSide = "heads" | "tails";

interface FlipResult {
  id: string;
  coins: CoinSide[];
  headsCount: number;
  tailsCount: number;
  coinCount: number;
  timestamp: Date;
}

function flipCoin(): CoinSide {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % 2 === 0 ? "heads" : "tails";
  }
  return Math.random() < 0.5 ? "heads" : "tails";
}

function CoinDisplay({
  side,
  isFlipping,
  label,
  size = "large",
}: {
  side: CoinSide;
  isFlipping: boolean;
  label: string;
  size?: "large" | "small";
}) {
  const containerSize =
    size === "large" ? "w-24 h-24" : "w-10 h-10";
  const fontSize = size === "large" ? "text-sm font-bold" : "text-[10px] font-semibold";
  const iconSize = size === "large" ? "text-3xl" : "text-base";

  return (
    <div className="[perspective:600px]">
      <div
        className={`${containerSize} rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 ${
          isFlipping ? "[animation:coin-spin_0.15s_linear_infinite]" : ""
        } ${
          side === "heads"
            ? "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300"
            : "bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300"
        } shadow-lg`}
      >
        <span className={iconSize}>{side === "heads" ? "👑" : "🌿"}</span>
        {size === "large" && (
          <span className={fontSize}>{label}</span>
        )}
      </div>
    </div>
  );
}

export function CoinFlipper({ dictionary }: CoinFlipperProps) {
  const [coinCount, setCoinCount] = useState(1);
  const [currentFlip, setCurrentFlip] = useState<CoinSide[] | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<FlipResult[]>([]);

  const doFlip = useCallback(() => {
    setIsFlipping(true);

    let animCount = 0;
    const interval = setInterval(() => {
      const temp = Array.from({ length: coinCount }, () => flipCoin());
      setCurrentFlip(temp);
      animCount++;

      if (animCount >= 14) {
        clearInterval(interval);

        const final = Array.from({ length: coinCount }, () => flipCoin());
        setCurrentFlip(final);
        setIsFlipping(false);
        trackToolEvent("coin-flip", "randomizers", "use");

        const hc = final.filter((c) => c === "heads").length;
        const result: FlipResult = {
          id: Math.random().toString(36).substring(2, 9),
          coins: final,
          headsCount: hc,
          tailsCount: final.length - hc,
          coinCount,
          timestamp: new Date(),
        };
        setHistory((prev) => [result, ...prev.slice(0, 19)]);
      }
    }, 80);
  }, [coinCount]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const totalHeads = history.reduce((acc, r) => acc + r.headsCount, 0);
    const totalCoins = history.reduce((acc, r) => acc + r.coinCount, 0);
    return {
      totalFlips: history.length,
      totalHeads,
      totalTails: totalCoins - totalHeads,
    };
  }, [history]);

  const currentHeads = currentFlip?.filter((c) => c === "heads").length ?? 0;
  const currentTails = currentFlip ? currentFlip.length - currentHeads : 0;

  return (
    <>
      <style jsx global>{`
        @keyframes coin-spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
      `}</style>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{dictionary.title}</CardTitle>
              <CardDescription>{dictionary.subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Coin count */}
          <div className="space-y-2">
            <Label>
              {dictionary.numberOfCoins}: {coinCount}
            </Label>
            <Slider
              value={[coinCount]}
              onValueChange={(value) => setCoinCount(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Flip button */}
          <Button
            onClick={doFlip}
            disabled={isFlipping}
            size="lg"
            className="w-full text-lg py-6"
          >
            <RotateCcw
              className={`h-5 w-5 mr-2 ${isFlipping ? "animate-spin" : ""}`}
            />
            {isFlipping
              ? dictionary.flipping
              : currentFlip
                ? dictionary.flipAgain
                : dictionary.flip}
          </Button>

          {/* Result display */}
          {currentFlip && (
            <div className="p-6 rounded-lg bg-muted/50 space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                {currentFlip.map((side, i) => (
                  <CoinDisplay
                    key={i}
                    side={side}
                    isFlipping={isFlipping}
                    label={side === "heads" ? dictionary.heads : dictionary.tails}
                    size={coinCount > 5 ? "small" : "large"}
                  />
                ))}
              </div>

              {!isFlipping && (
                <div className="flex justify-center gap-6 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {dictionary.headsCount}
                    </div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {currentHeads}
                    </div>
                  </div>
                  {coinCount > 1 && (
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {dictionary.tailsCount}
                      </div>
                      <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                        {currentTails}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <History className="h-4 w-4" />
                  {dictionary.history}
                </div>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  {dictionary.clearHistory}
                </Button>
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="p-2 rounded bg-muted">
                    <div className="text-muted-foreground">
                      {dictionary.headsCount}
                    </div>
                    <div className="font-bold text-amber-600 dark:text-amber-400">
                      {stats.totalHeads}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-muted">
                    <div className="text-muted-foreground">
                      {dictionary.tailsCount}
                    </div>
                    <div className="font-bold text-slate-600 dark:text-slate-400">
                      {stats.totalTails}
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-40 overflow-y-auto space-y-1">
                {history.map((flip) => (
                  <div
                    key={flip.id}
                    className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {flip.coinCount}× 🪙
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        [{flip.coins
                          .map((c) =>
                            c === "heads" ? dictionary.heads[0] : dictionary.tails[0]
                          )
                          .join(", ")}]
                      </span>
                      <span className="font-bold">
                        {dictionary.headsCount}: {flip.headsCount},{" "}
                        {dictionary.tailsCount}: {flip.tailsCount}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
