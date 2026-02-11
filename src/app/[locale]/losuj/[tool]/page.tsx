import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { i18n, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getToolsByCategory, getToolByCategoryAndSlug, categoryMeta, getToolUrl, getRelatedTools } from "@/lib/tools";
import { JsonLd, generateWebApplicationSchema, generateBreadcrumbSchema } from "@/components/seo/json-ld";
import { ToolPlaceholder } from "@/components/layout/tool-placeholder";

// Tool Components
import { NumberGenerator } from "@/components/random-number/number-generator";
import { NumbersGenerator } from "@/components/random-numbers/numbers-generator";
import { YesNoGenerator } from "@/components/random-yesno/yesno-generator";
import { DiceRoller } from "@/components/dice/dice-roller";
import { TarotReader } from "@/components/tarot/tarot-reader";

const BASE_URL = "https://utllo.com";
const CATEGORY = "randomizers";
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
  const toolDict = dict.tools[tool.id as keyof typeof dict.tools] as any;
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
      case "random-number":
        return (
          <NumberGenerator
            dictionary={{
              min: toolDict.min || "Minimum",
              max: toolDict.max || "Maksimum",
              result: toolDict.result || "Wynik",
              generate: toolDict.generate || "Losuj",
              copy: dict.common.copy,
              copied: dict.common.copied,
            }}
          />
        );
      case "random-numbers":
        return (
          <NumbersGenerator
            dictionary={{
              min: toolDict.min || "Minimum",
              max: toolDict.max || "Maksimum",
              count: toolDict.count || "Ilość",
              unique: toolDict.unique || "Unikalne",
              sorted: toolDict.sorted || "Posortowane",
              results: toolDict.results || "Wyniki",
              generate: toolDict.generate || "Losuj",
              copyAll: toolDict.copyAll || "Kopiuj wszystkie",
              copy: dict.common.copy,
              copied: dict.common.copied,
            }}
          />
        );
      case "random-yesno":
        return (
          <YesNoGenerator
            dictionary={{
              yes: toolDict.yes || "TAK",
              no: toolDict.no || "NIE",
              askQuestion: toolDict.askQuestion || "Zadaj pytanie",
              questionPlaceholder: toolDict.questionPlaceholder || "Wpisz swoje pytanie...",
              generate: toolDict.generate || "Losuj",
              result: toolDict.result || "Wynik",
              tryAgain: toolDict.tryAgain || "Spróbuj ponownie",
            }}
          />
        );
      case "dice-roll":
        return (
          <DiceRoller
            dictionary={{
              title: (toolDict as any).title || "Rzut Kostką",
              subtitle: (toolDict as any).subtitle || "Wirtualna kostka do gry online",
              roll: (toolDict as any).roll || "Rzuć kostką",
              rolling: (toolDict as any).rolling || "Rzucam...",
              result: (toolDict as any).result || "Wynik",
              total: (toolDict as any).total || "Suma",
              numberOfDice: (toolDict as any).numberOfDice || "Liczba kostek",
              diceType: (toolDict as any).diceType || "Typ kostki",
              history: (toolDict as any).history || "Historia rzutów",
              clearHistory: (toolDict as any).clearHistory || "Wyczyść historię",
              sides: (toolDict as any).sides || "ścianek",
              average: (toolDict as any).average || "Średnia",
              min: (toolDict as any).min || "Min",
              max: (toolDict as any).max || "Max",
            }}
          />
        );
      case "random-tarot":
        return (
          <TarotReader
            dictionary={{
              title: toolDict.title || "Losuj Kartę Tarota",
              subtitle: toolDict.subtitle || "Wylosuj kartę z pełnej talii 78 kart",
              draw: toolDict.draw || "Wylosuj Kartę",
              drawAnother: toolDict.drawAnother || "Losuj Kolejną",
              upright: toolDict.upright || "Pozycja prosta",
              reversed: toolDict.reversed || "Pozycja odwrócona",
              meaning: toolDict.meaning || "Znaczenie",
              keywords: toolDict.keywords || "Słowa kluczowe",
              history: toolDict.history || "Historia losowań",
              clearHistory: toolDict.clearHistory || "Wyczyść historię",
              majorArcana: toolDict.majorArcana || "Wielkie Arkana",
              minorArcana: toolDict.minorArcana || "Małe Arkana",
              cardOf: toolDict.cardOf || "Karta",
              of78: toolDict.of78 || "z 78",
              clickToReveal: toolDict.clickToReveal || "Kliknij, aby obrócić",
              noHistory: toolDict.noHistory || "Brak historii",
              imageDesc: toolDict.imageDesc || "Opis karty",
              love: toolDict.love || "Miłość",
              health: toolDict.health || "Zdrowie",
              work: toolDict.work || "Praca",
              adviceLabel: toolDict.adviceLabel || "Rada",
              element: toolDict.element || "Żywioł",
              zodiacLabel: toolDict.zodiacLabel || "Zodiak",
              planetLabel: toolDict.planetLabel || "Planeta",
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
      case "random-number":
        return (
          <section className="max-w-2xl mx-auto mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Generator Liczb Losowych Online
            </h2>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                Nasz generator liczb losowych używa kryptograficznie bezpiecznego 
                algorytmu do generowania prawdziwie losowych wyników.
              </p>
              <p>
                Idealne do gier, konkursów, podejmowania decyzji i wszelkich 
                sytuacji wymagających losowego wyboru liczby.
              </p>
            </div>
          </section>
        );
      case "random-numbers":
        return (
          <section className="max-w-2xl mx-auto mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Losuj Wiele Liczb Jednocześnie
            </h2>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                Generator pozwala na losowanie wielu liczb na raz. Możesz wybrać 
                czy liczby mają być unikalne czy mogą się powtarzać.
              </p>
              <p>
                Idealny do loterii, losowania nagród, wybierania grup i innych 
                zastosowań wymagających wielu losowych wartości.
              </p>
            </div>
          </section>
        );
      case "random-yesno":
        return (
          <section className="max-w-2xl mx-auto mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Generator Decyzji Tak/Nie
            </h2>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                Nie możesz się zdecydować? Pozwól losowi wybrać za Ciebie! 
                Nasz generator daje szansę 50/50 na każdy wynik.
              </p>
              <p>
                Animowany interfejs sprawia, że podejmowanie decyzji jest 
                przyjemne i ekscytujące. Idealne do codziennych dylematów.
              </p>
            </div>
          </section>
        );
      case "dice-roll":
        return (
          <section className="max-w-3xl mx-auto mt-16 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">
                Rzut Kostką Online - Wirtualna Kostka do Gry
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Nasz darmowy symulator rzutu kostką to idealne narzędzie do gier planszowych, 
                  RPG, losowań i zabaw. Wybierz liczbę kostek i ich typ (D4, D6, D8, D10, D12, D20, D100) 
                  i rzucaj bez ograniczeń. Wyniki są w pełni losowe i uczciwe.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Dostępne typy kostek</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">D4</div>
                  <div className="text-sm text-muted-foreground">Czworościan</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">D6</div>
                  <div className="text-sm text-muted-foreground">Klasyczna kostka</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">D8</div>
                  <div className="text-sm text-muted-foreground">Ośmiościan</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">D10</div>
                  <div className="text-sm text-muted-foreground">Dziesięciościan</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">D12</div>
                  <div className="text-sm text-muted-foreground">Dwunastościan</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-1">D20</div>
                  <div className="text-sm text-muted-foreground">Dwudziestościan</div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center col-span-2">
                  <div className="text-2xl font-bold text-primary mb-1">D100</div>
                  <div className="text-sm text-muted-foreground">Procentówka (1-100)</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Do czego służy wirtualna kostka?</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Gry planszowe</strong> - Nie masz przy sobie prawdziwej kostki? Użyj naszej!</li>
                <li><strong>Gry RPG</strong> - D&D, Warhammer i inne systemy wymagające różnych kostek</li>
                <li><strong>Losowania</strong> - Uczciwe losowanie kolejności, nagród, zadań</li>
                <li><strong>Edukacja</strong> - Nauka prawdopodobieństwa i statystyki</li>
                <li><strong>Podejmowanie decyzji</strong> - Niech kostka zdecyduje!</li>
                <li><strong>Zabawy i gry online</strong> - Grasz zdalnie z przyjaciółmi</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Funkcje naszego generatora</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Wiele kostek naraz</h4>
                  <p className="text-sm text-muted-foreground">
                    Rzucaj od 1 do 10 kostek jednocześnie i zobacz sumę wszystkich wyników.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Historia rzutów</h4>
                  <p className="text-sm text-muted-foreground">
                    Przeglądaj historię poprzednich rzutów wraz ze statystykami.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Animacja rzutu</h4>
                  <p className="text-sm text-muted-foreground">
                    Realistyczna animacja zwiększa napięcie przed zobaczeniem wyniku.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Statystyki</h4>
                  <p className="text-sm text-muted-foreground">
                    Zobacz średnią, minimum i maksimum z wszystkich rzutów.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Czy wyniki są naprawdę losowe?</h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Tak! Nasz generator wykorzystuje JavaScript Math.random(), który zapewnia 
                  pseudolosowe wyniki o wysokiej jakości. Każda ścianka kostki ma identyczne 
                  prawdopodobieństwo wylosowania, więc wyniki są tak samo uczciwe jak rzut 
                  prawdziwą kostką.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Często zadawane pytania</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Co oznacza D6, D20 itp.?</h4>
                  <p className="text-sm text-muted-foreground">
                    Litera &quot;D&quot; pochodzi od angielskiego &quot;dice&quot; (kostka), a liczba oznacza 
                    ilość ścianek. D6 to klasyczna sześcienna kostka (1-6), D20 to 
                    dwudziestościan (1-20) popularny w grach RPG.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Jak rzucić wieloma kostkami?</h4>
                  <p className="text-sm text-muted-foreground">
                    Użyj suwaka &quot;Liczba kostek&quot; aby wybrać od 1 do 10 kostek. 
                    Wszystkie kostki będą tego samego typu i zostaną rzucone jednocześnie.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy mogę używać tej kostki do gier na pieniądze?</h4>
                  <p className="text-sm text-muted-foreground">
                    Ten generator jest przeznaczony wyłącznie do celów rozrywkowych i edukacyjnych. 
                    Nie zalecamy używania go do gier hazardowych.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Nasz symulator kostki działa całkowicie w przeglądarce. Nie wymaga instalacji, 
                rejestracji ani połączenia z internetem po załadowaniu strony.
              </p>
            </div>
          </section>
        );
      case "random-tarot":
        return (
          <section className="max-w-2xl mx-auto mt-16 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Czym jest tarot?</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Tarot to system 78 kart używanych od wieków do refleksji, medytacji i poszukiwania 
                wewnętrznych odpowiedzi. Talia dzieli się na dwie główne grupy: 22 karty Wielkich 
                Arkanów (Major Arcana), które symbolizują ważne życiowe tematy i archetypy, oraz 
                56 kart Małych Arkanów (Minor Arcana), podzielonych na cztery kolory: Kielichy, 
                Pentakle, Miecze i Różdżki.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nasze narzędzie losuje kartę z pełnej talii 78 kart, w pozycji prostej lub odwróconej, 
                i wyświetla jej znaczenie. Każda karta posiada piękną ilustrację w akwarelowym stylu, 
                polskie nazwy i szczegółowe opisy interpretacji.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Wielkie Arkana — 22 karty losu</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Wielkie Arkana to 22 karty numerowane od 0 (Głupiec) do 21 (Świat). Reprezentują 
                one wielkie tematy życiowe, duchowe lekcje i archetypy — od niewinności Głupca, 
                przez transformację Śmierci, po spełnienie Świata. Wylosowanie karty z Wielkich 
                Arkanów sugeruje, że masz do czynienia z ważnym, głębokim tematem.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Do Wielkich Arkanów należą m.in.: Głupiec, Mag, Najwyższa Kapłanka, Cesarzowa, 
                Cesarz, Hierofant, Kochankowie, Rydwan, Siła, Pustelnik, Koło Fortuny, 
                Sprawiedliwość, Wisielec, Śmierć, Umiarkowanie, Diabeł, Wieża, Gwiazda, 
                Księżyc, Słońce, Sąd Ostateczny i Świat.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Małe Arkana — 56 kart codzienności</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Małe Arkana dzielą się na cztery kolory po 14 kart (As do Króla):
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Kielichy</strong> — emocje, uczucia, relacje, intuicja (żywioł wody)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Pentakle</strong> — finanse, praca, zdrowie, materia (żywioł ziemi)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Miecze</strong> — myśli, konflikty, komunikacja, intelekt (żywioł powietrza)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Różdżki</strong> — pasja, energia, kreatywność, działanie (żywioł ognia)</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Pozycja prosta vs odwrócona</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Każda karta tarota może pojawić się w dwóch pozycjach: prostej (upright) i odwróconej 
                (reversed). Pozycja prosta zazwyczaj wskazuje na pozytywne lub bezpośrednie znaczenie karty, 
                natomiast pozycja odwrócona może sugerować blokady, wyzwania, opóźnienia lub wewnętrzne 
                aspekty danego tematu.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Odwrócona karta nie oznacza automatycznie czegoś negatywnego — często zachęca do głębszej 
                refleksji i spojrzenia na temat z innej perspektywy. Nasze narzędzie losuje pozycję 
                karty z równym prawdopodobieństwem 50/50.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Jak korzystać z losowania kart tarota?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Skup się na pytaniu lub temacie, który Cię nurtuje</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Kliknij „Wylosuj Kartę" — zostanie wybrana losowa karta z pełnej talii 78 kart</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Kliknij kartę, aby ją obrócić i zobaczyć, którą wylosowałeś</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Przeczytaj znaczenie karty w wylosowanej pozycji (prostej lub odwróconej)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">5.</span>
                  <span>Zastanów się, jak przesłanie karty odnosi się do Twojego pytania</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Najczęściej zadawane pytania</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Czy losowanie kart tarota jest darmowe?</h3>
                  <p className="text-muted-foreground text-sm">
                    Tak, narzędzie jest całkowicie darmowe i nie wymaga rejestracji. Możesz losować karty 
                    bez ograniczeń.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ile kart zawiera talia?</h3>
                  <p className="text-muted-foreground text-sm">
                    Nasza talia zawiera pełne 78 kart — 22 karty Wielkich Arkanów i 56 kart Małych 
                    Arkanów (Kielichy, Pentakle, Miecze, Różdżki).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Jak działa losowanie?</h3>
                  <p className="text-muted-foreground text-sm">
                    Używamy kryptograficznie bezpiecznego generatora liczb losowych (crypto.getRandomValues), 
                    który zapewnia w pełni losowy wybór karty i jej pozycji.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Czy tarot przepowiada przyszłość?</h3>
                  <p className="text-muted-foreground text-sm">
                    Tarot jest narzędziem do refleksji i samopoznania, a nie przepowiadania przyszłości. 
                    Karty mogą pomóc spojrzeć na sytuację z nowej perspektywy i zachęcić do głębszego 
                    namysłu nad ważnymi kwestiami.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Nasze losowanie kart tarota działa całkowicie w przeglądarce — nie wymaga 
                rejestracji ani połączenia z internetem po załadowaniu strony. 
                Każda karta posiada unikatową ilustrację w stylu akwarelowym.
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
