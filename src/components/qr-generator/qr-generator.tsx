"use client";

import { useState, useCallback } from "react";
import { QrCode, Download, RotateCcw } from "lucide-react";
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
import QRCode from "qrcode";

interface QRGeneratorDictionary {
  title: string;
  subtitle: string;
  inputLabel: string;
  inputPlaceholder: string;
  generate: string;
  download: string;
  size: string;
  clear: string;
  preview: string;
  noContent: string;
}

interface QRGeneratorProps {
  dictionary: QRGeneratorDictionary;
}

const SIZES = [
  { value: 128, label: "128×128" },
  { value: 256, label: "256×256" },
  { value: 512, label: "512×512" },
  { value: 1024, label: "1024×1024" },
];

export function QRGenerator({ dictionary }: QRGeneratorProps) {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError(dictionary.noContent);
      setQrDataUrl(null);
      return;
    }

    try {
      const dataUrl = await QRCode.toDataURL(text.trim(), {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });
      setQrDataUrl(dataUrl);
      setError(null);
      trackToolEvent("qr-generator", "generators", "use");
    } catch (err) {
      console.error("QR generation error:", err);
      setError("Nie udało się wygenerować kodu QR. Spróbuj ponownie.");
      setQrDataUrl(null);
    }
  }, [text, size, dictionary.noContent]);

  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.download = `qr-code-${size}x${size}.png`;
    link.href = qrDataUrl;
    link.click();
    trackToolEvent("qr-generator", "generators", "copy");
  }, [qrDataUrl, size]);

  const handleClear = useCallback(() => {
    setText("");
    setQrDataUrl(null);
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleGenerate();
    },
    [handleGenerate]
  );

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle>{dictionary.title}</CardTitle>
        <CardDescription>{dictionary.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <Label htmlFor="qr-input">{dictionary.inputLabel}</Label>
          <Input
            id="qr-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={dictionary.inputPlaceholder}
            className="text-base"
          />
        </div>

        {/* Size Selector */}
        <div className="space-y-2">
          <Label>{dictionary.size}</Label>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((s) => (
              <Button
                key={s.value}
                variant={size === s.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSize(s.value)}
                className="text-xs"
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleGenerate} className="flex-1" size="lg">
            <QrCode className="h-4 w-4 mr-2" />
            {dictionary.generate}
          </Button>
          <Button variant="outline" onClick={handleClear} size="lg">
            <RotateCcw className="h-4 w-4 mr-2" />
            {dictionary.clear}
          </Button>
        </div>

        {/* QR Preview */}
        {qrDataUrl && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-xl border bg-white">
                <img
                  src={qrDataUrl}
                  alt="Kod QR"
                  width={Math.min(size, 300)}
                  height={Math.min(size, 300)}
                  className="block"
                />
              </div>
            </div>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <Download className="h-4 w-4" />
              {dictionary.download} ({size}×{size})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
