/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle pdf.js worker
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
  async redirects() {
    // =================================================================
    // 1. Legacy flat-URL redirects (old: /:locale/:tool-slug)
    //    Redirect to the new category-based structure.
    //    These run BEFORE middleware, so they still match /:locale/...
    // =================================================================
    const legacyToolRedirects = [
      // Generatory (Generators)
      { old: 'generator-hasel', category: 'generatory' },
      { old: 'lorem-ipsum', category: 'generatory' },
      { old: 'generator-lorem-ipsum', category: 'generatory' },
      { old: 'generator-czcionek', category: 'generatory' },
      { old: 'generator-qr', category: 'generatory' },

      // Narzędzia (Tools)
      { old: 'licznik-znakow', category: 'narzedzia' },
      { old: 'licznik-slow', category: 'narzedzia' },
      { old: 'rzut-kostka', category: 'losuj' },
      { old: 'odliczanie-do-wakacji', category: 'narzedzia' },
      { old: 'odliczanie-do-swiat', category: 'narzedzia' },
      { old: 'odliczanie-do-daty', category: 'narzedzia' },
      { old: 'bialy-ekran', category: 'narzedzia' },
      { old: 'kwota-slownie', category: 'narzedzia' },
      { old: 'szyfr-cezara', category: 'narzedzia' },
      { old: 'metronom', category: 'narzedzia' },
      
      // Konwertery (Converters)
      { old: 'pdf-na-word', category: 'konwertery' },
      { old: 'pdf-na-jpg', category: 'konwertery' },
      { old: 'pdf-na-png', category: 'konwertery' },
      
      // Losuj (Randomizers)
      { old: 'losuj-liczbe', category: 'losuj' },
      { old: 'losuj-liczby', category: 'losuj' },
      { old: 'losuj-karte-tarota', category: 'losuj' },
      { old: 'losuj-tak-nie', category: 'losuj' },
      
      // Kalkulatory (Calculators)
      { old: 'kalkulator-proporcji', category: 'kalkulatory' },
      { old: 'kalkulator-bmi', category: 'kalkulatory' },
      { old: 'srednia-wazona', category: 'kalkulatory' },
      { old: 'kalkulator-snu', category: 'kalkulatory' },
      { old: 'kalkulator-kalorii', category: 'kalkulatory' },
      { old: 'kalkulator-grupy-krwi', category: 'kalkulatory' },
      { old: 'kalkulator-inflacji', category: 'kalkulatory' },
      { old: 'kalkulator-psich-lat', category: 'kalkulatory' },
      { old: 'kalkulator-cyfr-rzymskich', category: 'kalkulatory' },
      { old: 'kalkulator-kocich-lat', category: 'kalkulatory' },
      { old: 'kalkulator-spalania', category: 'kalkulatory' },
    ];

    const redirects = [];

    // Legacy tool redirects for /en/:tool-slug → /en/:category/:tool-slug
    // (for /pl/:tool-slug, middleware will 301 to /:tool-slug first,
    //  then /:tool-slug hits the root-level legacy redirect below)
    for (const { old, category } of legacyToolRedirects) {
      redirects.push({
        source: `/en/${old}`,
        destination: `/en/${category}/${old}`,
        permanent: true,
      });
    }

    // Root-level legacy tool redirects (Polish, no prefix)
    // These catch /:tool-slug → /:category/:tool-slug after middleware rewrites
    // Since next.config redirects run BEFORE middleware, these won't actually
    // fire for rewritten URLs. But they catch direct visits.
    // Middleware rewrite handles these internally, so this is a safety net.

    // =================================================================
    // 2. Old category moves (tools that changed categories)
    //    Now with root paths (no /pl prefix) for Polish
    // =================================================================
    redirects.push(
      // Root (Polish) category moves
      { source: '/narzedzia/generator-hasel', destination: '/generatory/generator-hasel', permanent: true },
      { source: '/narzedzia/lorem-ipsum', destination: '/generatory/generator-lorem-ipsum', permanent: true },
      { source: '/narzedzia/generator-czcionek', destination: '/generatory/generator-czcionek', permanent: true },
      { source: '/narzedzia/rzut-kostka', destination: '/losuj/rzut-kostka', permanent: true },
      { source: '/narzedzia/generator-qr', destination: '/generatory/generator-qr', permanent: true },

      // English category moves (keep /en prefix)
      { source: '/en/narzedzia/generator-hasel', destination: '/en/generators/generator-hasel', permanent: true },
      { source: '/en/narzedzia/lorem-ipsum', destination: '/en/generators/generator-lorem-ipsum', permanent: true },
      { source: '/en/narzedzia/generator-czcionek', destination: '/en/generators/generator-czcionek', permanent: true },
      { source: '/en/narzedzia/rzut-kostka', destination: '/en/randomizers/rzut-kostka', permanent: true },
      { source: '/en/narzedzia/generator-qr', destination: '/en/generators/generator-qr', permanent: true },
    );

    // =================================================================
    // 3. Cross-locale slug redirects
    //    If someone visits English slug at root (Polish context),
    //    redirect to the correct Polish slug. And vice versa for /en/.
    // =================================================================
    const crossLocaleMap = [
      // English slugs at root → correct Polish slugs (root = Polish)
      { source: '/tools', destination: '/narzedzia', permanent: true },
      { source: '/generators', destination: '/generatory', permanent: true },
      { source: '/converters', destination: '/konwertery', permanent: true },
      { source: '/randomizers', destination: '/losuj', permanent: true },
      { source: '/calculators', destination: '/kalkulatory', permanent: true },

      // English slugs at root with tool path
      { source: '/tools/:tool', destination: '/narzedzia/:tool', permanent: true },
      { source: '/generators/:tool', destination: '/generatory/:tool', permanent: true },
      { source: '/converters/:tool', destination: '/konwertery/:tool', permanent: true },
      { source: '/randomizers/:tool', destination: '/losuj/:tool', permanent: true },
      { source: '/calculators/:tool', destination: '/kalkulatory/:tool', permanent: true },

      // Polish slugs under /en/ → correct English slugs
      { source: '/en/narzedzia', destination: '/en/tools', permanent: true },
      { source: '/en/generatory', destination: '/en/generators', permanent: true },
      { source: '/en/konwertery', destination: '/en/converters', permanent: true },
      { source: '/en/losuj', destination: '/en/randomizers', permanent: true },
      { source: '/en/kalkulatory', destination: '/en/calculators', permanent: true },

      // Polish slugs under /en/ with tool path
      { source: '/en/narzedzia/:tool', destination: '/en/tools/:tool', permanent: true },
      { source: '/en/generatory/:tool', destination: '/en/generators/:tool', permanent: true },
      { source: '/en/konwertery/:tool', destination: '/en/converters/:tool', permanent: true },
      { source: '/en/losuj/:tool', destination: '/en/randomizers/:tool', permanent: true },
      { source: '/en/kalkulatory/:tool', destination: '/en/calculators/:tool', permanent: true },

      // English slugs under /pl/ → correct Polish slugs under /pl/
      // (middleware will then 301 /pl/... to root anyway, but this prevents 404 mid-chain)
      { source: '/pl/tools', destination: '/narzedzia', permanent: true },
      { source: '/pl/generators', destination: '/generatory', permanent: true },
      { source: '/pl/converters', destination: '/konwertery', permanent: true },
      { source: '/pl/randomizers', destination: '/losuj', permanent: true },
      { source: '/pl/calculators', destination: '/kalkulatory', permanent: true },
      { source: '/pl/tools/:tool', destination: '/narzedzia/:tool', permanent: true },
      { source: '/pl/generators/:tool', destination: '/generatory/:tool', permanent: true },
      { source: '/pl/converters/:tool', destination: '/konwertery/:tool', permanent: true },
      { source: '/pl/randomizers/:tool', destination: '/losuj/:tool', permanent: true },
      { source: '/pl/calculators/:tool', destination: '/kalkulatory/:tool', permanent: true },
    ];

    redirects.push(...crossLocaleMap);

    return redirects;
  },
};

export default nextConfig;
