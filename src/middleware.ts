import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Determine if the pathname starts with any known locale
  const pathnameLocale = i18n.locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameLocale) {
    // ---------------------------------------------------------------
    // MIGRATION: /pl/... → 301 permanent redirect to root equivalent
    // Preserves full path and query parameters. Single hop, no chain.
    // Must remain active for minimum 12 months (preferably permanent).
    // ---------------------------------------------------------------
    if (pathnameLocale === i18n.defaultLocale) {
      const newPath = pathname.replace(new RegExp(`^/${i18n.defaultLocale}`), "") || "/";
      const url = new URL(newPath, request.url);
      url.search = request.nextUrl.search;
      return NextResponse.redirect(url, 301);
    }

    // ---------------------------------------------------------------
    // ENGLISH PROTECTION: /en/... passes through completely untouched.
    // No redirect, no rewrite, no structural modification.
    // Only set x-locale header so root layout can set <html lang>.
    // ---------------------------------------------------------------
    const response = NextResponse.next();
    response.headers.set("x-locale", pathnameLocale);
    return response;
  }

  // -----------------------------------------------------------------
  // NO LOCALE PREFIX: rewrite internally to /pl/... (invisible to user)
  // The URL stays as-is (e.g. / or /generatory/generator-hasel).
  // Internally serves the [locale] route with locale = "pl".
  // Returns 200, never a redirect.
  // -----------------------------------------------------------------
  const rewriteUrl = new URL(`/${i18n.defaultLocale}${pathname}`, request.url);
  rewriteUrl.search = request.nextUrl.search;

  const response = NextResponse.rewrite(rewriteUrl);

  // Set x-locale header so root layout can read the active locale
  response.headers.set("x-locale", i18n.defaultLocale);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
