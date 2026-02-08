"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Monitor, Maximize, X, Play, Square } from "lucide-react";
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

interface WhiteScreenDictionary {
  title: string;
  subtitle: string;
  fullscreen: string;
  exitFullscreen: string;
  pixelTest: string;
  stopTest: string;
  customColor: string;
  clickToExit: string;
  presets: string;
  currentColor: string;
}

interface WhiteScreenProps {
  dictionary: WhiteScreenDictionary;
}

const COLOR_PRESETS = [
  { hex: "#FFFFFF", name: "Biały" },
  { hex: "#000000", name: "Czarny" },
  { hex: "#FF0000", name: "Czerwony" },
  { hex: "#00FF00", name: "Zielony" },
  { hex: "#0000FF", name: "Niebieski" },
  { hex: "#FFFF00", name: "Żółty" },
  { hex: "#00FFFF", name: "Cyjan" },
  { hex: "#FF00FF", name: "Magenta" },
  { hex: "#FF8C00", name: "Pomarańczowy" },
  { hex: "#8B00FF", name: "Fioletowy" },
  { hex: "#FF69B4", name: "Różowy" },
  { hex: "#808080", name: "Szary" },
];

const PIXEL_TEST_COLORS = ["#FFFFFF", "#000000", "#FF0000", "#00FF00", "#0000FF"];
const PIXEL_TEST_INTERVAL = 3000;

export function WhiteScreenTool({ dictionary }: WhiteScreenProps) {
  const [currentColor, setCurrentColor] = useState("#FFFFFF");
  const [hexInput, setHexInput] = useState("#FFFFFF");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCycling, setIsCycling] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const cyclingRef = useRef<NodeJS.Timeout | null>(null);
  const cycleIndexRef = useRef(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync hex input when preset is clicked
  const selectColor = useCallback((hex: string) => {
    setCurrentColor(hex);
    setHexInput(hex);
  }, []);

  // Handle custom hex input
  const handleHexChange = useCallback((value: string) => {
    setHexInput(value);
    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setCurrentColor(value);
    }
  }, []);

  // Enter fullscreen overlay
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    setShowHint(true);
    trackToolEvent("white-screen", "tools", "use");
    // Hide hint after 2.5 seconds
    setTimeout(() => setShowHint(false), 2500);
    // Try native fullscreen API
    try {
      document.documentElement.requestFullscreen?.();
    } catch {
      // Fallback: overlay still works without native fullscreen
    }
  }, []);

  // Exit fullscreen overlay
  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setIsCycling(false);
    if (cyclingRef.current) {
      clearInterval(cyclingRef.current);
      cyclingRef.current = null;
    }
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    } catch {
      // ignore
    }
  }, []);

  // Pixel test cycling
  const startCycling = useCallback(() => {
    setIsCycling(true);
    cycleIndexRef.current = 0;
    setCurrentColor(PIXEL_TEST_COLORS[0]);
    setHexInput(PIXEL_TEST_COLORS[0]);
    enterFullscreen();

    cyclingRef.current = setInterval(() => {
      cycleIndexRef.current =
        (cycleIndexRef.current + 1) % PIXEL_TEST_COLORS.length;
      const nextColor = PIXEL_TEST_COLORS[cycleIndexRef.current];
      setCurrentColor(nextColor);
      setHexInput(nextColor);
    }, PIXEL_TEST_INTERVAL);
  }, [enterFullscreen]);

  const stopCycling = useCallback(() => {
    setIsCycling(false);
    if (cyclingRef.current) {
      clearInterval(cyclingRef.current);
      cyclingRef.current = null;
    }
  }, []);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exitFullscreen();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [exitFullscreen]);

  // Listen for fullscreenchange (user presses Escape via browser)
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        exitFullscreen();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isFullscreen, exitFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyclingRef.current) {
        clearInterval(cyclingRef.current);
      }
    };
  }, []);

  // Determine if color is dark (for contrast on overlay text)
  const isDark = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] cursor-pointer transition-colors duration-300"
          style={{ backgroundColor: currentColor }}
          onClick={() => {
            if (!isCycling) {
              exitFullscreen();
            }
          }}
        >
          {/* Hint text */}
          <div
            className={`absolute inset-x-0 bottom-8 text-center transition-opacity duration-500 ${
              showHint || isCycling ? "opacity-70" : "opacity-0"
            }`}
          >
            <p
              className={`text-sm ${
                isDark(currentColor) ? "text-white" : "text-black"
              }`}
            >
              {isCycling
                ? dictionary.stopTest
                : dictionary.clickToExit}{" "}
              {isCycling && "(Escape)"}
            </p>
          </div>

          {/* Stop cycling button in corner */}
          {isCycling && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                stopCycling();
              }}
              className={`absolute top-4 right-4 p-2 rounded-full transition-opacity hover:opacity-100 opacity-50 ${
                isDark(currentColor)
                  ? "bg-white/20 text-white"
                  : "bg-black/20 text-black"
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {/* Main Card */}
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Monitor className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{dictionary.title}</CardTitle>
          <CardDescription>{dictionary.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Preview */}
          <div
            className="w-full h-32 rounded-lg border-2 border-border transition-colors duration-300 relative overflow-hidden"
            style={{ backgroundColor: currentColor }}
          >
            <div
              className={`absolute bottom-2 right-2 text-xs font-mono px-2 py-1 rounded ${
                isDark(currentColor)
                  ? "bg-white/20 text-white"
                  : "bg-black/10 text-black"
              }`}
            >
              {currentColor}
            </div>
          </div>

          {/* Color Presets */}
          <div className="space-y-2">
            <Label>{dictionary.presets}</Label>
            <div className="grid grid-cols-6 gap-1.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => selectColor(preset.hex)}
                  className={`h-8 w-full rounded-md border-2 transition-all hover:scale-110 ${
                    currentColor === preset.hex
                      ? "border-primary ring-2 ring-primary/30 scale-110"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Custom HEX Input */}
          <div className="space-y-2">
            <Label htmlFor="hex-input">{dictionary.customColor}</Label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-md border border-border shrink-0"
                style={{ backgroundColor: currentColor }}
              />
              <Input
                id="hex-input"
                type="text"
                placeholder="#FFFFFF"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value.toUpperCase())}
                maxLength={7}
                className="font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={enterFullscreen} size="lg" className="gap-2">
              <Maximize className="h-4 w-4" />
              {dictionary.fullscreen}
            </Button>
            <Button
              onClick={isCycling ? stopCycling : startCycling}
              size="lg"
              variant={isCycling ? "destructive" : "outline"}
              className="gap-2"
            >
              {isCycling ? (
                <Square className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isCycling ? dictionary.stopTest : dictionary.pixelTest}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
