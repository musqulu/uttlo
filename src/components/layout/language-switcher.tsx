"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { i18n } from "@/lib/i18n/config";
import {
  tools,
  categoryMeta,
  getCategoryBySlug,
  getToolSlug,
  getCategorySlug,
  ToolCategory,
} from "@/lib/tools";

const LOCALE_LABELS: Record<string, string> = {
  pl: "Polski",
  en: "English",
};

const LOCALE_FLAGS: Record<string, string> = {
  pl: "PL",
  en: "EN",
};

interface LanguageSwitcherProps {
  locale: string;
}

/**
 * Detects the current locale from the pathname.
 * If the path starts with a known non-default locale prefix (e.g. /en/...),
 * returns that locale. Otherwise returns the default locale (pl).
 */
function detectLocaleFromPath(pathname: string): string {
  for (const locale of i18n.locales) {
    if (locale === i18n.defaultLocale) continue;
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return i18n.defaultLocale;
}

/**
 * Strips the locale prefix from a pathname.
 * /en/tools/password-generator -> ["tools", "password-generator"]
 * /generatory/generator-hasel -> ["generatory", "generator-hasel"] (root = PL, no prefix)
 */
function getPathSegments(pathname: string, currentLocale: string): string[] {
  const segments = pathname.split("/").filter(Boolean);

  // If path starts with a non-default locale prefix, strip it
  if (currentLocale !== i18n.defaultLocale && segments[0] === currentLocale) {
    return segments.slice(1);
  }

  return segments;
}

/**
 * Translates path segments from one locale to another and builds the target URL.
 * Handles category slugs, tool slugs, and static pages.
 * Default locale (pl) uses root paths; non-default locales use /{locale}/... prefix.
 */
function translatePath(pathname: string, fromLocale: string, toLocale: string): string {
  const segments = getPathSegments(pathname, fromLocale);

  // Home page
  if (segments.length === 0) {
    return toLocale === i18n.defaultLocale ? "/" : `/${toLocale}`;
  }

  const translated = [...segments];

  // Try to translate category slug (first segment)
  if (translated[0]) {
    const categoryId = getCategoryBySlug(translated[0], fromLocale);
    if (categoryId) {
      translated[0] = getCategorySlug(categoryId, toLocale);

      // Try to translate tool slug (second segment)
      if (translated[1]) {
        const tool = tools.find((t) => {
          return t.category === categoryId && t.slugs[fromLocale] === translated[1];
        });
        if (tool) {
          translated[1] = getToolSlug(tool, toLocale);
        }
      }
    }
  }

  // Build final path: default locale → root, non-default → /{locale}/...
  const prefix = toLocale === i18n.defaultLocale ? "" : `/${toLocale}`;
  return `${prefix}/${translated.join("/")}`;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Detect the actual locale from the URL (since PL pages have no prefix)
  const detectedLocale = detectLocaleFromPath(pathname);

  const switchLocale = (targetLocale: string) => {
    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${targetLocale};path=/;max-age=${60 * 60 * 24 * 365}`;

    // Translate the current path to the target locale
    const newPath = translatePath(pathname, detectedLocale, targetLocale);
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium">
          <Globe className="h-4 w-4" />
          <span>{LOCALE_FLAGS[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {i18n.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`gap-2 ${loc === locale ? "font-semibold" : ""}`}
          >
            <span className="text-xs font-mono w-6">{LOCALE_FLAGS[loc]}</span>
            <span>{LOCALE_LABELS[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
