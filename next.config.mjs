/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle pdf.js worker
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    return config;
  },
  async redirects() {
    // Redirects from old URL structure to new category-based URLs
    // Old: /:locale/:tool-slug
    // New: /:locale/:category-slug/:tool-slug
    
    const toolRedirects = [
      // Generatory (Generators)
      { old: 'generator-hasel', category: 'generatory' },
      { old: 'lorem-ipsum', category: 'generatory' },
      { old: 'generator-lorem-ipsum', category: 'generatory' },
      { old: 'generator-czcionek', category: 'generatory' },

      // Narzędzia (Tools)
      { old: 'generator-uuid', category: 'narzedzia' },
      { old: 'konwerter-kolorow', category: 'narzedzia' },
      { old: 'formatter-json', category: 'narzedzia' },
      { old: 'base64', category: 'narzedzia' },
      { old: 'generator-hashy', category: 'narzedzia' },
      { old: 'generator-qr', category: 'narzedzia' },
      { old: 'licznik-znakow', category: 'narzedzia' },
      { old: 'licznik-slow', category: 'narzedzia' },
      { old: 'rzut-kostka', category: 'narzedzia' },
      { old: 'odliczanie-do-wakacji', category: 'narzedzia' },
      { old: 'odliczanie-do-swiat', category: 'narzedzia' },
      { old: 'odliczanie-do-daty', category: 'narzedzia' },
      
      // Konwertery (Converters)
      { old: 'pdf-na-word', category: 'konwertery' },
      { old: 'word-na-pdf', category: 'konwertery' },
      { old: 'pdf-na-jpg', category: 'konwertery' },
      { old: 'pdf-na-png', category: 'konwertery' },
      
      // Losuj (Randomizers)
      { old: 'losuj-liczbe', category: 'losuj' },
      { old: 'losuj-liczby', category: 'losuj' },
      { old: 'losuj-cytat', category: 'losuj' },
      { old: 'losuj-cytat-biblia', category: 'losuj' },
      { old: 'losuj-karte-tarota', category: 'losuj' },
      { old: 'losuj-tak-nie', category: 'losuj' },
      
      // Kalkulatory (Calculators)
      { old: 'kalkulator-proporcji', category: 'kalkulatory' },
      { old: 'kalkulator-bmi', category: 'kalkulatory' },
      { old: 'srednia-wazona', category: 'kalkulatory' },
    ];

    const redirects = toolRedirects.map(({ old, category }) => ({
      source: `/:locale/${old}`,
      destination: `/:locale/${category}/${old}`,
      permanent: true,
    }));

    // Redirects for tools that moved from narzedzia to generatory
    redirects.push(
      { source: '/:locale/narzedzia/generator-hasel', destination: '/:locale/generatory/generator-hasel', permanent: true },
      { source: '/:locale/narzedzia/lorem-ipsum', destination: '/:locale/generatory/generator-lorem-ipsum', permanent: true },
      { source: '/:locale/narzedzia/generator-czcionek', destination: '/:locale/generatory/generator-czcionek', permanent: true },
      { source: '/:locale/narzedzia/rzut-kostka', destination: '/:locale/losuj/rzut-kostka', permanent: true },
    );

    return redirects;
  },
};

export default nextConfig;
