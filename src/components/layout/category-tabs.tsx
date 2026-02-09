"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolCard } from "@/components/layout/tool-card";
import { Tool, getToolsByCategory, getAvailableTools, getToolUrl } from "@/lib/tools";
import { Wrench, ArrowRightLeft, Dices, CheckCircle, Calculator, Sparkles } from "lucide-react";

interface CategoryTabsProps {
  locale: string;
  dictionary: {
    categories: {
      available: string;
      tools: string;
      generators: string;
      converters: string;
      randomizers: string;
      calculators: string;
    };
    tools: Record<string, { name: string; description: string }>;
    common: {
      comingSoon: string;
    };
  };
}

const TABS = [
  { value: "available", icon: CheckCircle, labelKey: "available" as const },
  { value: "generators", icon: Sparkles, labelKey: "generators" as const },
  { value: "tools", icon: Wrench, labelKey: "tools" as const },
  { value: "converters", icon: ArrowRightLeft, labelKey: "converters" as const },
  { value: "randomizers", icon: Dices, labelKey: "randomizers" as const },
  { value: "calculators", icon: Calculator, labelKey: "calculators" as const },
] as const;

export function CategoryTabs({ locale, dictionary }: CategoryTabsProps) {
  const categoryTools: Record<string, Tool[]> = {
    available: getAvailableTools(),
    generators: getToolsByCategory("generators"),
    tools: getToolsByCategory("tools"),
    converters: getToolsByCategory("converters"),
    randomizers: getToolsByCategory("randomizers"),
    calculators: getToolsByCategory("calculators"),
  };

  const renderToolGrid = (tools: Tool[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.filter((t) => t.isReady).map((tool) => {
        const toolDict = dictionary.tools[tool.id];
        return (
          <ToolCard
            key={tool.id}
            href={getToolUrl(tool, locale)}
            icon={tool.icon}
            name={toolDict?.name || tool.id}
            description={toolDict?.description || ""}
          />
        );
      })}
    </div>
  );

  return (
    <Tabs defaultValue="available" className="w-full">
      {/* Scrollable tab strip on mobile, centered grid on desktop */}
      <div className="relative mb-8">
        {/* Fade hints for scroll on mobile */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 md:hidden" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 md:hidden" />
        
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible">
          <TabsList className="inline-flex h-11 w-max gap-1 p-1 md:grid md:w-full md:max-w-4xl md:mx-auto md:grid-cols-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 px-4 py-2 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{dictionary.categories[tab.labelKey]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>

      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {renderToolGrid(categoryTools[tab.value])}
        </TabsContent>
      ))}
    </Tabs>
  );
}
