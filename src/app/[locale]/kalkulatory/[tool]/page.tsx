import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { i18n, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getToolsByCategory, getToolByCategoryAndSlug, categoryMeta, getToolUrl, getRelatedTools } from "@/lib/tools";
import { JsonLd, generateWebApplicationSchema, generateBreadcrumbSchema } from "@/components/seo/json-ld";
import { ToolPlaceholder } from "@/components/layout/tool-placeholder";

// Tool Components
import { BMICalculator } from "@/components/calculators/bmi-calculator";
import { ProportionCalculator } from "@/components/calculators/proportion-calculator";
import { WeightedAverageCalculator } from "@/components/calculators/weighted-average-calculator";
import { SleepCalculator } from "@/components/calculators/sleep-calculator";
import { CalorieCalculator } from "@/components/calculators/calorie-calculator";

const BASE_URL = "https://utllo.com";
const CATEGORY = "calculators";
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
      case "bmi-calculator":
        return (
          <BMICalculator
            dictionary={{
              title: toolDict.title || "Kalkulator BMI",
              subtitle: toolDict.subtitle || "Oblicz swój wskaźnik masy ciała",
              weight: toolDict.weight || "Waga (kg)",
              height: toolDict.height || "Wzrost (cm)",
              calculate: toolDict.calculate || "Oblicz BMI",
              result: toolDict.result || "Twoje BMI",
              category: toolDict.category || "Kategoria",
              underweight: toolDict.underweight || "Niedowaga",
              normal: toolDict.normal || "Waga prawidłowa",
              overweight: toolDict.overweight || "Nadwaga",
              obese: toolDict.obese || "Otyłość I stopnia",
              severelyObese: toolDict.severelyObese || "Otyłość II stopnia",
              morbidlyObese: toolDict.morbidlyObese || "Otyłość III stopnia",
              clear: toolDict.clear || "Wyczyść",
            }}
          />
        );
      case "proportion-calculator":
        return (
          <ProportionCalculator
            dictionary={{
              title: toolDict.title || "Kalkulator Proporcji",
              subtitle: toolDict.subtitle || "Rozwiąż równanie proporcji",
              formula: toolDict.formula || "A / B = C / X",
              valueA: toolDict.valueA || "Wartość A",
              valueB: toolDict.valueB || "Wartość B",
              valueC: toolDict.valueC || "Wartość C",
              valueX: toolDict.valueX || toolDict.result || "Wynik (X)",
              calculate: toolDict.calculate || "Oblicz",
              result: toolDict.result || "Wynik",
              copy: dict.common.copy,
              clear: toolDict.clear || "Wyczyść",
            }}
          />
        );
      case "weighted-average":
        return (
          <WeightedAverageCalculator
            dictionary={{
              title: toolDict.title || "Kalkulator Średniej Ważonej",
              subtitle: toolDict.subtitle || "Oblicz średnią ważoną z uwzględnieniem wag",
              value: toolDict.value || "Wartość",
              weight: toolDict.weight || "Waga",
              addRow: toolDict.addRow || "Dodaj wiersz",
              removeRow: toolDict.removeRow || "Usuń",
              calculate: toolDict.calculate || "Oblicz średnią",
              result: toolDict.result || "Średnia ważona",
              sumOfWeights: toolDict.sumOfWeights || "Suma wag",
              clear: toolDict.clear || "Wyczyść wszystko",
              copy: toolDict.copy || "Kopiuj wynik",
              example: toolDict.example || "Przykład",
              loadExample: toolDict.loadExample || "Załaduj przykład ocen",
            }}
          />
        );
      case "sleep-calculator":
        return (
          <SleepCalculator
            dictionary={{
              title: toolDict.title || "Kalkulator Snu",
              subtitle: toolDict.subtitle || "Oblicz optymalną godzinę snu lub budzenia",
              wakeUpAt: toolDict.wakeUpAt || "Chcę wstać o...",
              fallAsleepAt: toolDict.fallAsleepAt || "Chcę zasnąć o...",
              calculate: toolDict.calculate || "Oblicz",
              clear: toolDict.clear || "Wyczyść",
              cycles: toolDict.cycles || "cykli",
              hours: toolDict.hours || "godzin",
              optimal: toolDict.optimal || "Optymalnie",
              good: toolDict.good || "Dobrze",
              minimum: toolDict.minimum || "Minimum",
              timeToFallAsleep: toolDict.timeToFallAsleep || "Czas zasypiania",
              results: toolDict.results || "Wyniki",
              bedtimeResults: toolDict.bedtimeResults || "Powinieneś położyć się spać o:",
              wakeUpResults: toolDict.wakeUpResults || "Powinieneś wstać o:",
            }}
          />
        );
      case "calorie-calculator":
        return (
          <CalorieCalculator
            dictionary={{
              title: toolDict.title || "Kalkulator Kalorii",
              subtitle: toolDict.subtitle || "Oblicz dzienne zapotrzebowanie kaloryczne",
              gender: toolDict.gender || "Płeć",
              male: toolDict.male || "Mężczyzna",
              female: toolDict.female || "Kobieta",
              age: toolDict.age || "Wiek (lat)",
              weight: toolDict.weight || "Waga (kg)",
              height: toolDict.height || "Wzrost (cm)",
              activityLevel: toolDict.activityLevel || "Poziom aktywności",
              sedentary: toolDict.sedentary || "Siedzący (brak ćwiczeń)",
              lightlyActive: toolDict.lightlyActive || "Lekko aktywny (1-3 dni/tydzień)",
              moderatelyActive: toolDict.moderatelyActive || "Umiarkowanie aktywny (3-5 dni/tydzień)",
              veryActive: toolDict.veryActive || "Bardzo aktywny (6-7 dni/tydzień)",
              extremelyActive: toolDict.extremelyActive || "Ekstremalnie aktywny (sportowiec)",
              calculate: toolDict.calculate || "Oblicz kalorie",
              clear: toolDict.clear || "Wyczyść",
              bmr: toolDict.bmr || "BMR",
              bmrDesc: toolDict.bmrDesc || "Podstawowa przemiana materii",
              tdee: toolDict.tdee || "TDEE",
              tdeeDesc: toolDict.tdeeDesc || "Całkowity dzienny wydatek energetyczny",
              loseWeight: toolDict.loseWeight || "Odchudzanie",
              slowCut: toolDict.slowCut || "Wolna redukcja",
              maintenance: toolDict.maintenance || "Utrzymanie wagi",
              leanBulk: toolDict.leanBulk || "Czysta masa",
              bulk: toolDict.bulk || "Budowa masy",
              protein: toolDict.protein || "Białko",
              carbs: toolDict.carbs || "Węglowodany",
              fat: toolDict.fat || "Tłuszcze",
              kcalPerDay: toolDict.kcalPerDay || "kcal/dzień",
              weeklyChange: toolDict.weeklyChange || "Tygodniowo",
              goalResults: toolDict.goalResults || "Zapotrzebowanie kaloryczne wg celu",
              macros: toolDict.macros || "Makroskładniki",
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
      case "bmi-calculator":
        return (
          <section className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Kalkulator BMI Online - Oblicz Swój Wskaźnik Masy Ciała
            </h2>
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">Czym jest BMI?</h3>
              <p className="text-muted-foreground mb-4">
                BMI (Body Mass Index), czyli wskaźnik masy ciała, to międzynarodowa
                miara używana do oceny, czy masa ciała osoby dorosłej jest prawidłowa
                w stosunku do jej wzrostu.
              </p>
              <div className="p-4 bg-muted rounded-lg text-center font-mono">
                <p className="text-lg mb-2">BMI = waga (kg) ÷ wzrost² (m)</p>
                <p className="text-sm text-muted-foreground">
                  Przykład: 70 kg ÷ (1.75 m)² = 70 ÷ 3.0625 = 22.9
                </p>
              </div>
            </div>
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4">Kategorie BMI według WHO</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Kategoria</th>
                      <th className="border p-3 text-left">Zakres BMI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border p-3 text-blue-500">Niedowaga</td><td className="border p-3">&lt; 18.5</td></tr>
                    <tr><td className="border p-3 text-green-500">Waga prawidłowa</td><td className="border p-3">18.5 - 24.9</td></tr>
                    <tr><td className="border p-3 text-yellow-500">Nadwaga</td><td className="border p-3">25 - 29.9</td></tr>
                    <tr><td className="border p-3 text-orange-500">Otyłość I stopnia</td><td className="border p-3">30 - 34.9</td></tr>
                    <tr><td className="border p-3 text-red-500">Otyłość II stopnia</td><td className="border p-3">35 - 39.9</td></tr>
                    <tr><td className="border p-3 text-red-700">Otyłość III stopnia</td><td className="border p-3">&ge; 40</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
      case "proportion-calculator":
        return (
          <section className="max-w-2xl mx-auto mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Kalkulator Proporcji Online
            </h2>
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                Nasz kalkulator proporcji rozwiązuje równania w formie A/B = C/X. 
                Wystarczy wprowadzić trzy znane wartości, a kalkulator obliczy czwartą.
              </p>
              <p>
                Proporcje są używane w wielu dziedzinach: matematyce, gotowaniu, 
                fotografii, budownictwie i projektowaniu. Ten kalkulator ułatwia 
                szybkie obliczenia bez konieczności ręcznych przekształceń.
              </p>
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">Wzór:</p>
                <p className="font-mono">X = (B × C) / A</p>
              </div>
            </div>
          </section>
        );
      case "weighted-average":
        return (
          <section className="max-w-3xl mx-auto mt-16 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">
                Kalkulator Średniej Ważonej Online
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Średnia ważona to specjalny rodzaj średniej, w której każda wartość ma 
                  przypisaną wagę określającą jej znaczenie. Jest szeroko stosowana w 
                  szkołach, na uczelniach, w finansach i analizie danych.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Jak obliczyć średnią ważoną?</h3>
              <div className="p-6 bg-muted rounded-lg space-y-4">
                <p className="text-center font-mono text-lg">
                  x̄ = (w₁·x₁ + w₂·x₂ + ... + wₙ·xₙ) / (w₁ + w₂ + ... + wₙ)
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  gdzie x to wartości, a w to odpowiadające im wagi
                </p>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Przykład - oceny szkolne:</h4>
                <p className="text-sm text-muted-foreground">
                  Sprawdzian (waga 3): 5<br />
                  Kartkówka (waga 2): 4<br />
                  Odpowiedź (waga 1): 5<br /><br />
                  Średnia ważona = (3×5 + 2×4 + 1×5) / (3+2+1) = (15 + 8 + 5) / 6 = 28/6 ≈ <strong>4.67</strong>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Gdzie stosuje się średnią ważoną?</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Szkoła i studia</strong> - obliczanie średniej ocen z różnymi wagami (sprawdziany, kartkówki, odpowiedzi)</li>
                <li><strong>Finanse</strong> - obliczanie średniej ważonej kosztu kapitału (WACC)</li>
                <li><strong>Inwestycje</strong> - obliczanie średniej ceny zakupu akcji</li>
                <li><strong>Statystyka</strong> - analiza danych z różną istotnością obserwacji</li>
                <li><strong>Ocena pracowników</strong> - ważone kryteria oceny</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Średnia ważona vs zwykła średnia</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Cecha</th>
                      <th className="border p-3 text-left">Średnia arytmetyczna</th>
                      <th className="border p-3 text-left">Średnia ważona</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3">Wagi</td>
                      <td className="border p-3">Wszystkie równe (1)</td>
                      <td className="border p-3">Różne dla każdej wartości</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Wzór</td>
                      <td className="border p-3 font-mono text-sm">Σx / n</td>
                      <td className="border p-3 font-mono text-sm">Σ(w·x) / Σw</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Zastosowanie</td>
                      <td className="border p-3">Równoważne dane</td>
                      <td className="border p-3">Dane o różnej ważności</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Często zadawane pytania</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy wagi muszą sumować się do 1 lub 100%?</h4>
                  <p className="text-sm text-muted-foreground">
                    Nie, wagi mogą być dowolnymi liczbami dodatnimi. Kalkulator automatycznie 
                    dzieli sumę iloczynów przez sumę wag, więc wynik będzie poprawny niezależnie 
                    od skali wag.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Jak obliczyć średnią ważoną ocen w dzienniku?</h4>
                  <p className="text-sm text-muted-foreground">
                    Wprowadź każdą ocenę jako wartość, a przypisaną jej wagę (np. sprawdzian = 3, 
                    kartkówka = 2, odpowiedź = 1). Kalkulator automatycznie obliczy średnią ważoną.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy mogę użyć wag ujemnych?</h4>
                  <p className="text-sm text-muted-foreground">
                    Nie, wagi muszą być liczbami dodatnimi. Waga oznacza znaczenie danej wartości, 
                    więc nie ma sensu stosować wartości ujemnych.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Nasz kalkulator średniej ważonej działa całkowicie w przeglądarce. 
                Twoje dane nie są wysyłane na żaden serwer - wszystkie obliczenia 
                wykonywane są lokalnie na Twoim urządzeniu.
              </p>
            </div>
          </section>
        );
      case "sleep-calculator":
        return (
          <section className="max-w-3xl mx-auto mt-16 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">
                Kalkulator Snu Online - Oblicz Optymalny Czas Snu
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Nasz darmowy kalkulator snu pomoże Ci obliczyć idealną godzinę zasypiania lub 
                  budzenia na podstawie naturalnych cykli snu. Dzięki niemu wstaniesz wypoczęty 
                  i pełen energii każdego dnia, bez uczucia zmęczenia i senności.
                </p>
                <p>
                  Kalkulator uwzględnia średni czas zasypiania (~14 minut) oraz 90-minutowe cykle snu, 
                  co pozwala na precyzyjne zaplanowanie odpoczynku nocnego.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Czym są cykle snu?</h3>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Sen nie jest jednorodnym procesem. Każdej nocy Twój mózg przechodzi przez 
                  powtarzające się cykle, z których każdy trwa około <strong>90 minut</strong>. 
                  Jeden cykl składa się z kilku faz:
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Faza 1 - Zasypianie</h4>
                  <p className="text-sm text-muted-foreground">
                    Lekki sen, łatwo się obudzić. Trwa 5-10 minut. Ciało zwalnia, mięśnie się rozluźniają.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Faza 2 - Sen lekki</h4>
                  <p className="text-sm text-muted-foreground">
                    Tętno zwalnia, temperatura ciała spada. Trwa około 20 minut. Mózg generuje wrzeciona snu.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Faza 3 - Sen głęboki</h4>
                  <p className="text-sm text-muted-foreground">
                    Najważniejsza faza regeneracji. Ciało naprawia tkanki, wzmacnia układ odpornościowy. 
                    Trudno się obudzić.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Faza REM</h4>
                  <p className="text-sm text-muted-foreground">
                    Faza marzeń sennych. Mózg konsoliduje wspomnienia i przetwarza emocje. 
                    Szybkie ruchy gałek ocznych.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Ile snu potrzebujesz?</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Grupa wiekowa</th>
                      <th className="border p-3 text-left">Zalecany czas snu</th>
                      <th className="border p-3 text-left">Cykle snu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3">Noworodki (0-3 mies.)</td>
                      <td className="border p-3">14-17 godzin</td>
                      <td className="border p-3">-</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Niemowlęta (4-11 mies.)</td>
                      <td className="border p-3">12-15 godzin</td>
                      <td className="border p-3">-</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Małe dzieci (1-2 lat)</td>
                      <td className="border p-3">11-14 godzin</td>
                      <td className="border p-3">-</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Przedszkolaki (3-5 lat)</td>
                      <td className="border p-3">10-13 godzin</td>
                      <td className="border p-3">7-9</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Dzieci szkolne (6-13 lat)</td>
                      <td className="border p-3">9-11 godzin</td>
                      <td className="border p-3">6-7</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Nastolatkowie (14-17 lat)</td>
                      <td className="border p-3">8-10 godzin</td>
                      <td className="border p-3">5-7</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Dorośli (18-64 lat)</td>
                      <td className="border p-3 font-medium">7-9 godzin</td>
                      <td className="border p-3 font-medium">5-6</td>
                    </tr>
                    <tr>
                      <td className="border p-3">Seniorzy (65+ lat)</td>
                      <td className="border p-3">7-8 godzin</td>
                      <td className="border p-3">5-6</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Źródło: National Sleep Foundation
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Jak działa kalkulator snu?</h3>
              <div className="p-6 bg-muted rounded-lg space-y-4">
                <p className="text-muted-foreground">
                  Kalkulator snu oblicza optymalne godziny na podstawie prostego wzoru:
                </p>
                <div className="text-center">
                  <p className="font-mono text-lg mb-2">
                    Czas budzenia = Czas zaśnięcia + (N × 90 min)
                  </p>
                  <p className="font-mono text-lg">
                    Czas zaśnięcia = Czas położenia się + ~14 min
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  gdzie N to liczba pełnych cykli snu (zwykle 3-6)
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Wskazówki dotyczące higieny snu</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Regularność</strong> - Kładź się i wstawaj o tych samych godzinach, także w weekendy</li>
                <li><strong>Temperatura</strong> - Utrzymuj temperaturę sypialni na poziomie 18-20°C</li>
                <li><strong>Ciemność</strong> - Używaj zasłon zaciemniających lub maski na oczy</li>
                <li><strong>Bez ekranów</strong> - Unikaj niebieskiego światła (telefon, komputer) 1h przed snem</li>
                <li><strong>Kofeina</strong> - Ogranicz kawę i herbatę po godzinie 14:00</li>
                <li><strong>Aktywność fizyczna</strong> - Ćwicz regularnie, ale nie tuż przed snem</li>
                <li><strong>Relaksacja</strong> - Wprowadź rytuał wieczorny: książka, ciepła kąpiel, medytacja</li>
                <li><strong>Alkohol</strong> - Unikaj alkoholu przed snem - zaburza fazę REM</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Dlaczego budzenie się między cyklami jest ważne?</h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  Kiedy budzik wyrwie Cię ze snu głębokiego (faza 3), czujesz się ospały, 
                  zdezorientowany i zmęczony - to zjawisko nazywa się <strong>bezwładnością snu</strong> 
                  (sleep inertia). Może trwać nawet do 30 minut. Natomiast gdy budzisz się na końcu 
                  cyklu (w fazie lekkiego snu), wstajesz naturalnie wypoczęty i pełen energii. 
                  Dlatego czasem 6 godzin snu (4 cykle) pozwala czuć się lepiej niż 7 godzin, 
                  jeśli budzik zadzwoni w środku głębokiego snu.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Często zadawane pytania</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Dlaczego kalkulator dodaje 14 minut?</h4>
                  <p className="text-sm text-muted-foreground">
                    Średni czas potrzebny dorosłemu człowiekowi na zaśnięcie to około 10-20 minut. 
                    Nasz kalkulator przyjmuje wartość 14 minut jako średnią. Jeśli wiesz, że zasypiasz 
                    szybciej lub wolniej, możesz odpowiednio skorygować godzinę.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy 3 cykle snu (4,5h) wystarczą?</h4>
                  <p className="text-sm text-muted-foreground">
                    Trzy cykle snu to absolutne minimum i nie powinny być stosowane regularnie. 
                    Dla dorosłych zaleca się 5-6 cykli (7,5-9h). Przewlekły niedobór snu prowadzi 
                    do problemów zdrowotnych, obniżonej koncentracji i osłabienia odporności.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">O której powinienem iść spać?</h4>
                  <p className="text-sm text-muted-foreground">
                    Zależy to od godziny, o której musisz wstać. Jeśli musisz wstać o 7:00, 
                    optymalnie powinieneś zasnąć o 21:46 (6 cykli = 9h) lub o 23:16 (5 cykli = 7,5h). 
                    Skorzystaj z kalkulatora powyżej, aby obliczyć dokładne godziny.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy każdy cykl snu trwa dokładnie 90 minut?</h4>
                  <p className="text-sm text-muted-foreground">
                    Nie, 90 minut to wartość średnia. W rzeczywistości cykl snu trwa od 80 do 120 minut 
                    i zmienia się w ciągu nocy - pierwsze cykle mają więcej snu głębokiego, 
                    a późniejsze więcej snu REM. Kalkulator używa średniej wartości 90 minut, 
                    która sprawdza się u większości osób.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Nasz kalkulator snu działa całkowicie w przeglądarce. Nie wymaga instalacji 
                ani rejestracji. Twoje dane nie są nigdzie wysyłane - wszystkie obliczenia 
                wykonywane są lokalnie na Twoim urządzeniu.
              </p>
            </div>
          </section>
        );
      case "calorie-calculator":
        return (
          <section className="max-w-3xl mx-auto mt-16 space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-center mb-6">
                Kalkulator Kalorii Online - Oblicz Dzienne Zapotrzebowanie Kaloryczne
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Nasz darmowy kalkulator kalorii pomoże Ci obliczyć dzienne zapotrzebowanie 
                  kaloryczne na podstawie Twojej wagi, wzrostu, wieku, płci i poziomu aktywności 
                  fizycznej. Kalkulator wykorzystuje uznaną formułę Mifflin-St Jeor, która jest 
                  rekomendowana przez dietetyków i organizacje zdrowotne na całym świecie.
                </p>
                <p>
                  Niezależnie od tego, czy chcesz schudnąć, utrzymać wagę, czy zbudować masę 
                  mięśniową - nasz kalkulator poda Ci optymalne zapotrzebowanie kaloryczne 
                  oraz rozkład makroskładników (białko, węglowodany, tłuszcze) dla każdego celu.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Czym jest BMR i TDEE?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">BMR (Basal Metabolic Rate)</h4>
                  <p className="text-sm text-muted-foreground">
                    Podstawowa przemiana materii - to ilość kalorii, jaką Twój organizm spala 
                    w stanie całkowitego spoczynku, aby utrzymać podstawowe funkcje życiowe: 
                    oddychanie, krążenie krwi, pracę narządów wewnętrznych i termoregulację. 
                    BMR stanowi 60-75% całkowitego dziennego wydatku energetycznego.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">TDEE (Total Daily Energy Expenditure)</h4>
                  <p className="text-sm text-muted-foreground">
                    Całkowity dzienny wydatek energetyczny - to łączna ilość kalorii, jaką 
                    spalasz w ciągu dnia, uwzględniając aktywność fizyczną, trawienie pokarmu 
                    i codzienne czynności. TDEE = BMR × współczynnik aktywności. To wartość, 
                    na podstawie której planuje się dietę.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Wzór Mifflin-St Jeor</h3>
              <div className="p-6 bg-muted rounded-lg space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Formuła Mifflin-St Jeor (1990) jest uznawana za najdokładniejszą metodę 
                  obliczania BMR dla osób dorosłych. Została potwierdzona wieloma badaniami 
                  klinicznymi i jest zalecana przez American Dietetic Association.
                </p>
                <div className="text-center space-y-2">
                  <p className="font-mono">
                    <strong>Mężczyźni:</strong> BMR = 10 × waga(kg) + 6,25 × wzrost(cm) − 5 × wiek + 5
                  </p>
                  <p className="font-mono">
                    <strong>Kobiety:</strong> BMR = 10 × waga(kg) + 6,25 × wzrost(cm) − 5 × wiek − 161
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Następnie TDEE = BMR × współczynnik aktywności fizycznej
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Poziomy aktywności fizycznej</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Poziom</th>
                      <th className="border p-3 text-left">Opis</th>
                      <th className="border p-3 text-left">Mnożnik</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 font-medium">Siedzący</td>
                      <td className="border p-3 text-sm">Praca biurowa, brak ćwiczeń</td>
                      <td className="border p-3 font-mono">×1,2</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Lekko aktywny</td>
                      <td className="border p-3 text-sm">Lekkie ćwiczenia 1-3 razy w tygodniu</td>
                      <td className="border p-3 font-mono">×1,375</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Umiarkowanie aktywny</td>
                      <td className="border p-3 text-sm">Ćwiczenia 3-5 razy w tygodniu</td>
                      <td className="border p-3 font-mono">×1,55</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Bardzo aktywny</td>
                      <td className="border p-3 text-sm">Intensywne ćwiczenia 6-7 razy w tygodniu</td>
                      <td className="border p-3 font-mono">×1,725</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Ekstremalnie aktywny</td>
                      <td className="border p-3 text-sm">Sportowiec, ciężka praca fizyczna + trening</td>
                      <td className="border p-3 font-mono">×1,9</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Zapotrzebowanie kaloryczne wg celu</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 text-red-600 dark:text-red-400">Odchudzanie (−500 kcal/dzień)</h4>
                  <p className="text-sm text-muted-foreground">
                    Deficyt kaloryczny 500 kcal dziennie pozwala tracić około 0,45 kg tygodniowo. 
                    To bezpieczne i zrównoważone tempo redukcji, które minimalizuje utratę masy mięśniowej. 
                    Zaleca się wyższe spożycie białka (35% kalorii) i regularne ćwiczenia siłowe.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 text-orange-600 dark:text-orange-400">Wolna redukcja (−250 kcal/dzień)</h4>
                  <p className="text-sm text-muted-foreground">
                    Łagodniejszy deficyt kaloryczny, idealny dla osób aktywnych fizycznie lub 
                    początkujących. Pozwala tracić około 0,23 kg tygodniowo, zachowując energię 
                    na treningi i codzienne aktywności.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">Utrzymanie wagi (0 kcal)</h4>
                  <p className="text-sm text-muted-foreground">
                    Spożywanie kalorii na poziomie TDEE utrzymuje obecną masę ciała. 
                    Idealne dla osób zadowolonych ze swojej wagi, które chcą utrzymać zdrowy 
                    tryb życia i optymalną wydolność fizyczną.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">Czysta masa (+250 kcal/dzień)</h4>
                  <p className="text-sm text-muted-foreground">
                    Lekka nadwyżka kaloryczna pozwala budować masę mięśniową przy minimalnym 
                    przyroście tkanki tłuszczowej. Wymaga regularnych treningów siłowych 
                    i odpowiedniego spożycia białka (minimum 1,6-2,2 g/kg masy ciała).
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2 text-indigo-600 dark:text-indigo-400">Budowa masy (+500 kcal/dzień)</h4>
                  <p className="text-sm text-muted-foreground">
                    Większa nadwyżka kaloryczna dla szybszego przyrostu masy. Zalecana dla 
                    osób szczupłych, początkujących na siłowni lub sportowców wymagających 
                    dużych zasobów energetycznych. Ważne jest uzupełnianie nadwyżki z wartościowych źródeł.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Makroskładniki - co oznaczają wyniki?</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-3 text-left">Makroskładnik</th>
                      <th className="border p-3 text-left">Kalorie/gram</th>
                      <th className="border p-3 text-left">Rola w organizmie</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-3 font-medium">Białko</td>
                      <td className="border p-3 font-mono">4 kcal/g</td>
                      <td className="border p-3 text-sm">Budowa i regeneracja mięśni, enzymy, hormony, odporność</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Węglowodany</td>
                      <td className="border p-3 font-mono">4 kcal/g</td>
                      <td className="border p-3 text-sm">Główne źródło energii, paliwo dla mózgu i mięśni</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-medium">Tłuszcze</td>
                      <td className="border p-3 font-mono">9 kcal/g</td>
                      <td className="border p-3 text-sm">Hormony, wchłanianie witamin, ochrona narządów, energia</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Wskazówki dotyczące zdrowego odżywiania</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Jedz regularnie</strong> - 3-5 posiłków dziennie w stałych odstępach czasu</li>
                <li><strong>Białko w każdym posiłku</strong> - pomaga utrzymać masę mięśniową i sytość</li>
                <li><strong>Pij wodę</strong> - minimum 2 litry dziennie, więcej przy aktywności fizycznej</li>
                <li><strong>Jedz warzywa i owoce</strong> - bogate w błonnik, witaminy i minerały</li>
                <li><strong>Wybieraj pełnoziarniste</strong> - chleb, makaron, ryż - dostarczają wolno trawionych węglowodanów</li>
                <li><strong>Zdrowe tłuszcze</strong> - oliwa z oliwek, orzechy, awokado, ryby</li>
                <li><strong>Ogranicz cukier i przetworzoną żywność</strong> - „puste" kalorie bez wartości odżywczej</li>
                <li><strong>Nie głodź się</strong> - drastyczne diety spowalniają metabolizm i prowadzą do efektu jo-jo</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Często zadawane pytania</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czym różni się BMR od TDEE?</h4>
                  <p className="text-sm text-muted-foreground">
                    BMR to kalorie spalane w stanie całkowitego spoczynku (leżąc w łóżku cały dzień). 
                    TDEE to BMR powiększone o kalorie spalane podczas aktywności fizycznej, trawienia 
                    i codziennych czynności. Do planowania diety zawsze używamy TDEE, nie BMR.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Jak dokładny jest kalkulator kalorii?</h4>
                  <p className="text-sm text-muted-foreground">
                    Formuła Mifflin-St Jeor ma dokładność około ±10% w porównaniu z pomiarami 
                    laboratoryjnymi. Wynik powinien być traktowany jako punkt wyjścia - obserwuj 
                    swoją wagę przez 2-3 tygodnie i dostosuj kalorie w górę lub w dół o 100-200 kcal.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Ile białka powinienem jeść?</h4>
                  <p className="text-sm text-muted-foreground">
                    Dla osób aktywnych fizycznie zaleca się 1,6-2,2 g białka na kg masy ciała dziennie. 
                    Przy odchudzaniu warto zwiększyć spożycie białka do 2,0-2,4 g/kg, aby chronić 
                    masę mięśniową podczas deficytu kalorycznego.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Czy mogę jeść poniżej BMR?</h4>
                  <p className="text-sm text-muted-foreground">
                    Nie jest to zalecane. Jedzenie poniżej BMR przez dłuższy czas spowalnia 
                    metabolizm, prowadzi do utraty masy mięśniowej, niedoborów witamin i minerałów, 
                    zmęczenia i pogorszenia samopoczucia. Bezpieczny deficyt to 300-500 kcal poniżej TDEE.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Jak wybrać odpowiedni poziom aktywności?</h4>
                  <p className="text-sm text-muted-foreground">
                    Większość osób przeszacowuje swoją aktywność. Jeśli pracujesz przy biurku 
                    i ćwiczysz 3 razy w tygodniu po 45 minut, wybierz &quot;Lekko aktywny&quot; lub 
                    &quot;Umiarkowanie aktywny&quot;. &quot;Bardzo aktywny&quot; to osoby trenujące intensywnie 
                    niemal codziennie.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Nasz kalkulator kalorii działa całkowicie w przeglądarce. Nie wymaga 
                rejestracji ani wysyłania danych. Wszystkie obliczenia wykonywane są 
                lokalnie na Twoim urządzeniu. Wyniki mają charakter orientacyjny - 
                w przypadku wątpliwości skonsultuj się z dietetykiem.
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
        <div className="max-w-lg mx-auto">
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
