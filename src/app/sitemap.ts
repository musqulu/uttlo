import { MetadataRoute } from "next";
import { i18n } from "@/lib/i18n/config";
import { getLocalePath } from "@/lib/i18n/config";
import { tools, allCategoryIds, getToolUrl, getCategoryUrl } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://utllo.com";

  const routes: MetadataRoute.Sitemap = [];

  // ---------------------------------------------------------------
  // Home pages — one entry per locale.
  // Polish uses root (/), English uses /en.
  // No /pl/ prefix must appear anywhere in the sitemap.
  // ---------------------------------------------------------------
  for (const locale of i18n.locales) {
    const localePath = getLocalePath(locale);
    const url = localePath ? `${baseUrl}${localePath}` : baseUrl;

    const alternates: Record<string, string> = {};
    for (const loc of i18n.locales) {
      const lp = getLocalePath(loc);
      alternates[loc] = lp ? `${baseUrl}${lp}` : baseUrl;
    }
    alternates["x-default"] = baseUrl;

    routes.push({
      url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: alternates },
    });
  }

  // ---------------------------------------------------------------
  // Category pages
  // ---------------------------------------------------------------
  for (const locale of i18n.locales) {
    for (const categoryId of allCategoryIds) {
      const categoryPath = getCategoryUrl(categoryId, locale);

      const alternates: Record<string, string> = {};
      for (const loc of i18n.locales) {
        alternates[loc] = `${baseUrl}${getCategoryUrl(categoryId, loc)}`;
      }
      alternates["x-default"] = `${baseUrl}${getCategoryUrl(categoryId, i18n.defaultLocale)}`;

      routes.push({
        url: `${baseUrl}${categoryPath}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: { languages: alternates },
      });
    }
  }

  // ---------------------------------------------------------------
  // Tool pages
  // ---------------------------------------------------------------
  for (const locale of i18n.locales) {
    for (const tool of tools) {
      const toolPath = getToolUrl(tool, locale);

      const alternates: Record<string, string> = {};
      for (const loc of i18n.locales) {
        alternates[loc] = `${baseUrl}${getToolUrl(tool, loc)}`;
      }
      alternates["x-default"] = `${baseUrl}${getToolUrl(tool, i18n.defaultLocale)}`;

      routes.push({
        url: `${baseUrl}${toolPath}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  // ---------------------------------------------------------------
  // Static pages
  // ---------------------------------------------------------------
  const staticPages = ["kontakt", "o-nas", "regulamin", "polityka-prywatnosci"];
  for (const locale of i18n.locales) {
    for (const page of staticPages) {
      const localePath = getLocalePath(locale);
      const pagePath = `${localePath}/${page}`;

      const alternates: Record<string, string> = {};
      for (const loc of i18n.locales) {
        alternates[loc] = `${baseUrl}${getLocalePath(loc)}/${page}`;
      }
      alternates["x-default"] = `${baseUrl}/${page}`;

      routes.push({
        url: `${baseUrl}${pagePath}`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.3,
        alternates: { languages: alternates },
      });
    }
  }

  return routes;
}
