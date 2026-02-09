import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { i18n, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getToolsByCategory, getToolByCategoryAndSlug, categoryMeta, getToolUrl, getRelatedTools } from "@/lib/tools";
import { JsonLd, generateWebApplicationSchema, generateBreadcrumbSchema } from "@/components/seo/json-ld";
import { ToolPlaceholder } from "@/components/layout/tool-placeholder";

// Tool Components
import { GeneratorCard as PasswordGenerator } from "@/components/password-generator/generator-card";
import { LoremGenerator } from "@/components/lorem-ipsum/lorem-generator";
import { FontGenerator } from "@/components/fonts/font-generator";
import { QRGenerator } from "@/components/qr-generator/qr-generator";

const BASE_URL = "https://utllo.com";
const CATEGORY = "generators" as const;
const CATEGORY_SLUG = categoryMeta[CATEGORY].slug;

interface PageProps {
  params: Promise<{ locale: Locale; tool: string }>;
}

export async function generateStaticParams() {
  const tools = getToolsByCategory(CATEGORY);
  const params: { locale: string; tool: string }[] = [];
  
  for (const locale of i18n.locales) {
    for (const tool of tools) {
      params.push({ locale, tool: tool.slug });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, tool: toolSlug } = await params;
  const tool = getToolByCategoryAndSlug(CATEGORY_SLUG, toolSlug);
  
  if (!tool) return { title: "Not Found" };
  
  const dict = await getDictionary(locale);
  const toolDict = dict.tools[tool.id as keyof typeof dict.tools];

  return {
    title: toolDict?.seoTitle || tool.id,
    description: toolDict?.seoDescription || "",
    alternates: {
      canonical: `${BASE_URL}${getToolUrl(tool, locale)}`,
    },
    openGraph: {
      title: toolDict?.seoTitle || tool.id,
      description: toolDict?.seoDescription || "",
      url: `${BASE_URL}${getToolUrl(tool, locale)}`,
      siteName: dict.brand,
      locale: locale,
      type: "website",
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { locale, tool: toolSlug } = await params;
  const tool = getToolByCategoryAndSlug(CATEGORY_SLUG, toolSlug);
  
  if (!tool) notFound();
  
  const dict = await getDictionary(locale);
  const toolDict = dict.tools[tool.id as keyof typeof dict.tools];
  const categoryPage = dict.categoryPages[CATEGORY];
  const relatedTools = getRelatedTools(tool.id, 3);

  const webAppSchema = generateWebApplicationSchema({
    name: toolDict?.seoTitle || tool.id,
    description: toolDict?.seoDescription || "",
    url: `${BASE_URL}${getToolUrl(tool, locale)}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: dict.categoryPages.breadcrumbs.home, url: `${BASE_URL}/${locale}` },
    { name: categoryPage.title, url: `${BASE_URL}/${locale}/${CATEGORY_SLUG}` },
    { name: toolDict?.name || tool.id, url: `${BASE_URL}${getToolUrl(tool, locale)}` },
  ]);

  // Render the appropriate tool component
  const renderToolComponent = () => {
    if (!tool.isReady) {
      return <ToolPlaceholder name={toolDict?.name || tool.id} />;
    }

    switch (tool.id) {
      case "password-generator":
        return <PasswordGenerator />;
      case "lorem-ipsum":
        return (
          <LoremGenerator
            dictionary={{
              paragraphs: (toolDict as any).paragraphs || "Akapity",
              sentences: (toolDict as any).sentences || "Zdania",
              words: (toolDict as any).words || "Słowa",
              count: (toolDict as any).count || "Ilość",
              generate: (toolDict as any).generate || "Generuj",
              copy: dict.common.copy,
              copied: dict.common.copied,
            }}
          />
        );
      case "font-generator":
        return (
          <FontGenerator
            dictionary={{
              title: (toolDict as any).title || "Generator Czcionek",
              subtitle: (toolDict as any).subtitle || "Podgląd tekstu w różnych czcionkach",
              placeholder: (toolDict as any).placeholder || "Wpisz swój tekst...",
              defaultText: (toolDict as any).defaultText || "Twój tekst tutaj",
              fontSize: (toolDict as any).fontSize || "Rozmiar czcionki",
              allFonts: (toolDict as any).allFonts || "Wszystkie czcionki",
              serif: (toolDict as any).serif || "Szeryfowe",
              sansSerif: (toolDict as any).sansSerif || "Bezszeryfowe",
              display: (toolDict as any).display || "Dekoracyjne",
              handwriting: (toolDict as any).handwriting || "Odręczne",
              monospace: (toolDict as any).monospace || "Monospace",
              copyFont: (toolDict as any).copyFont || "Kopiuj nazwę",
              copied: (toolDict as any).copied || "Skopiowano!",
              fontPairings: (toolDict as any).fontPairings || "Kombinacje czcionek",
              heading: (toolDict as any).heading || "Nagłówek",
              body: (toolDict as any).body || "Treść",
              searchFonts: (toolDict as any).searchFonts || "Szukaj czcionek...",
              noResults: (toolDict as any).noResults || "Nie znaleziono czcionek",
              googleFonts: (toolDict as any).googleFonts || "Google Fonts",
            }}
          />
        );
      case "qr-generator":
        return (
          <QRGenerator
            dictionary={{
              title: (toolDict as any).title || "Generator Kodów QR",
              subtitle: (toolDict as any).subtitle || "Twórz kody QR dla linków, tekstu i danych",
              inputLabel: (toolDict as any).inputLabel || "Tekst lub URL",
              inputPlaceholder: (toolDict as any).inputPlaceholder || "Wpisz tekst, URL, numer telefonu...",
              generate: (toolDict as any).generate || "Generuj kod QR",
              download: (toolDict as any).download || "Pobierz PNG",
              size: (toolDict as any).size || "Rozmiar",
              clear: (toolDict as any).clear || "Wyczyść",
              preview: (toolDict as any).preview || "Podgląd kodu QR",
              noContent: (toolDict as any).noContent || "Wpisz treść, aby wygenerować kod QR",
            }}
          />
        );
      default:
        return <ToolPlaceholder name={toolDict?.name || tool.id} />;
    }
  };

  // Render SEO content based on tool
  const renderSeoContent = () => {
    switch (tool.id) {
      case "password-generator":
        return (
          <section className="max-w-2xl mx-auto mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Bezpieczny Generator Haseł Online
            </h2>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                Nasz generator haseł tworzy silne i bezpieczne hasła bezpośrednio w
                Twojej przeglądarce. Hasła nie są nigdzie wysyłane ani zapisywane.
              </p>
              <p>
                Używamy kryptograficznie bezpiecznego generatora liczb losowych
                (crypto.getRandomValues) dla maksymalnego bezpieczeństwa Twoich haseł.
              </p>
              <p>
                Możesz dostosować długość hasła od 8 do 64 znaków oraz wybrać, jakie
                typy znaków mają być uwzględnione: wielkie litery, małe litery,
                cyfry i symbole specjalne.
              </p>
            </div>
          </section>
        );
      case "lorem-ipsum":
        return (
          <section className="max-w-2xl mx-auto mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Czym jest Lorem Ipsum?
            </h2>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                Lorem Ipsum to standardowy tekst zastępczy używany w przemyśle
                poligraficznym i typograficznym od XVI wieku. Jest to zniekształcony
                fragment traktatu Cycerona &quot;De finibus bonorum et malorum&quot;.
              </p>
              <p>
                Nasz generator tworzy losowy tekst Lorem Ipsum w trzech formatach:
                akapity, zdania i pojedyncze słowa. Możesz dostosować ilość
                generowanego tekstu za pomocą suwaka.
              </p>
              <p>
                Tekst Lorem Ipsum jest powszechnie używany przez projektantów
                i deweloperów do wypełniania makiet i prototypów przed dodaniem
                właściwej treści.
              </p>
            </div>
          </section>
        );
      case "qr-generator":
        return (
          <section className="max-w-3xl mx-auto mt-16 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">
                Darmowy Generator Kodów QR Online
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Nasz generator kodów QR pozwala na szybkie i bezpłatne tworzenie kodów QR 
                  bezpośrednio w przeglądarce. Wystarczy wpisać tekst, adres URL, numer telefonu 
                  lub dowolne dane, a narzędzie wygeneruje gotowy kod QR do pobrania jako PNG.
                </p>
                <p>
                  Kod QR (Quick Response) to dwuwymiarowy kod kreskowy, który przechowuje informacje 
                  w postaci czarno-białego wzoru. Kody QR mogą być odczytywane przez aparaty 
                  smartfonów i skanery kodów kreskowych, co czyni je idealnym narzędziem do szybkiego 
                  przekazywania informacji.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Do czego służą kody QR?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Linki i strony WWW</h4>
                  <p className="text-sm text-muted-foreground">
                    Zakoduj adres URL, aby użytkownicy mogli szybko otworzyć stronę internetową 
                    po zeskanowaniu kodu.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">WiFi</h4>
                  <p className="text-sm text-muted-foreground">
                    Udostępnij dane sieci WiFi gościom - po zeskanowaniu kodu telefon automatycznie 
                    połączy się z siecią.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Dane kontaktowe</h4>
                  <p className="text-sm text-muted-foreground">
                    Zakoduj wizytówkę vCard z imieniem, numerem telefonu i adresem email 
                    w jednym kodzie QR.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Marketing i reklama</h4>
                  <p className="text-sm text-muted-foreground">
                    Umieść kody QR na ulotkach, plakatach i opakowaniach, aby kierować klientów 
                    do ofert, stron produktów lub mediów społecznościowych.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Kod QR vs kod kreskowy</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Cecha</th>
                      <th className="text-left p-3 font-semibold">Kod QR</th>
                      <th className="text-left p-3 font-semibold">Kod kreskowy</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="p-3">Wymiary</td>
                      <td className="p-3">Dwuwymiarowy (2D)</td>
                      <td className="p-3">Jednowymiarowy (1D)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Pojemność danych</td>
                      <td className="p-3">Do 4 296 znaków</td>
                      <td className="p-3">Zwykle 20-25 znaków</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Typy danych</td>
                      <td className="p-3">Tekst, URL, email, WiFi, vCard</td>
                      <td className="p-3">Głównie numery</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Korekcja błędów</td>
                      <td className="p-3">Tak (do 30%)</td>
                      <td className="p-3">Nie</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Jak tworzyć skuteczne kody QR?</h3>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li><strong>Odpowiedni rozmiar</strong> - kod QR powinien mieć co najmniej 2×2 cm do druku. Dla billboardów użyj minimum 256×256 px.</li>
                <li><strong>Wysoki kontrast</strong> - zachowaj ciemny wzór na jasnym tle. Unikaj niskiego kontrastu kolorów.</li>
                <li><strong>Testuj przed drukiem</strong> - zawsze zeskanuj kod różnymi urządzeniami przed wydrukowaniem.</li>
                <li><strong>Krótkie URL-e</strong> - im mniej danych, tym prostszy i bardziej czytelny kod QR.</li>
                <li><strong>Margines (quiet zone)</strong> - zostaw pusty margines wokół kodu, aby skanery mogły go łatwo odczytać.</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Często zadawane pytania</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy kody QR wygasają?</h4>
                  <p className="text-sm text-muted-foreground">
                    Statyczne kody QR (jak te generowane przez nasze narzędzie) nigdy nie wygasają. 
                    Zawierają dane bezpośrednio w kodzie, więc działają tak długo, jak długo 
                    zakodowane dane są aktualne.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Jaka jest maksymalna pojemność kodu QR?</h4>
                  <p className="text-sm text-muted-foreground">
                    Kod QR może przechowywać do 4 296 znaków alfanumerycznych, 7 089 cyfr 
                    lub 2 953 bajty danych binarnych. Jednak krótsze dane dają prostszy 
                    i łatwiejszy do zeskanowania kod.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy generator jest darmowy?</h4>
                  <p className="text-sm text-muted-foreground">
                    Tak, nasz generator kodów QR jest całkowicie darmowy i bez ograniczeń. 
                    Możesz tworzyć dowolną liczbę kodów QR bez rejestracji.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy mogę używać kodów QR komercyjnie?</h4>
                  <p className="text-sm text-muted-foreground">
                    Oczywiście! Wygenerowane kody QR możesz używać do dowolnych celów - 
                    osobistych i komercyjnych, na materiałach drukowanych i cyfrowych.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Nasz generator kodów QR działa całkowicie w przeglądarce. Twoje dane nie są 
                wysyłane na żaden serwer - generowanie odbywa się lokalnie na Twoim urządzeniu.
              </p>
            </div>
          </section>
        );
      case "font-generator":
        return (
          <section className="max-w-3xl mx-auto mt-16 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">
                Generator Stylowych Czcionek Online - Kopiuj i Wklej
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Nasz darmowy generator czcionek zamienia zwykły tekst na stylowe fonty Unicode, 
                  które możesz skopiować i wkleić wszędzie - na Instagram, Facebook, Twitter, 
                  TikTok, Discord i w innych miejscach. Ponad 25 unikalnych stylów do wyboru!
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Dostępne style czcionek</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Podstawowe</h4>
                  <p className="text-sm text-muted-foreground">
                    𝗣𝗼𝗴𝗿𝘂𝗯𝗶𝗼𝗻𝘆, 𝘒𝘶𝘳𝘴𝘺𝘸𝘢, 𝙋𝙤𝙜𝙧𝙪𝙗𝙞𝙤𝙣𝙖 𝙠𝙪𝙧𝙨𝙮𝙬𝙖, 𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Dekoracyjne</h4>
                  <p className="text-sm text-muted-foreground">
                    𝒮𝓀𝓇𝓎𝓅𝓉, 𝔉𝔯𝔞𝔨𝔱𝔲𝔯𝔞, 𝔾𝕠𝕥𝕙𝕚𝕔, 𝕯𝖔𝖚𝖇𝖑𝖊
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Symbole</h4>
                  <p className="text-sm text-muted-foreground">
                    Ⓦ ⓚⓞⓛⓚⓤ, 🅦 🅝🅔🅖🅐🅣🅨🅦, 🄺🅆🄰🄳🅁🄰🅃
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Jak używać generatora?</h3>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li><strong>Wpisz tekst</strong> - wprowadź tekst, który chcesz przekształcić</li>
                <li><strong>Wybierz styl</strong> - przeglądaj dostępne style czcionek</li>
                <li><strong>Kopiuj</strong> - kliknij przycisk &quot;Kopiuj&quot; przy wybranym stylu</li>
                <li><strong>Wklej</strong> - wklej tekst w dowolnym miejscu (Ctrl+V / Cmd+V)</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Gdzie możesz użyć stylowych czcionek?</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Instagram</strong> - bio, posty, stories, komentarze</li>
                <li><strong>Facebook</strong> - posty, komentarze, nazwa profilu</li>
                <li><strong>Twitter/X</strong> - tweety, bio, nazwa użytkownika</li>
                <li><strong>TikTok</strong> - bio, komentarze</li>
                <li><strong>Discord</strong> - wiadomości, nazwa serwera</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Często zadawane pytania</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Jak to działa?</h4>
                  <p className="text-sm text-muted-foreground">
                    Generator używa specjalnych znaków Unicode, które wyglądają jak stylowe czcionki. 
                    To nie są prawdziwe fonty, ale znaki z różnych alfabetów i symboli matematycznych, 
                    które można kopiować i wklejać jako zwykły tekst.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy polskie znaki są obsługiwane?</h4>
                  <p className="text-sm text-muted-foreground">
                    Niektóre style mogą nie obsługiwać polskich znaków diakrytycznych (ą, ę, ó, itd.). 
                    W takim przypadku polskie litery pozostaną w oryginalnej formie.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Nasz generator czcionek działa całkowicie w przeglądarce. Twój tekst nie jest 
                wysyłany na żaden serwer - wszystkie przekształcenia wykonywane są lokalnie.
              </p>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-muted-foreground max-w-2xl mx-auto">
          <ol className="flex items-center gap-2">
            <li>
              <Link href={`/${locale}`} className="hover:text-foreground transition-colors">
                {dict.categoryPages.breadcrumbs.home}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/${locale}/${CATEGORY_SLUG}`} className="hover:text-foreground transition-colors">
                {categoryPage.title}
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{toolDict?.name || tool.id}</li>
          </ol>
        </nav>

        {/* Tool Component */}
        <div className="max-w-2xl mx-auto">
          {renderToolComponent()}
        </div>

        {/* SEO Content */}
        {renderSeoContent()}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="max-w-2xl mx-auto mt-16">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {dict.categoryPages.relatedTools}
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedTools.map((relTool) => {
                const relToolDict = dict.tools[relTool.id as keyof typeof dict.tools];
                const Icon = relTool.icon;
                return (
                  <Link
                    key={relTool.id}
                    href={getToolUrl(relTool, locale)}
                    className="p-4 rounded-lg border hover:border-primary/50 hover:shadow-md transition-all text-center"
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <span className="text-sm font-medium">{relToolDict?.name || relTool.id}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
