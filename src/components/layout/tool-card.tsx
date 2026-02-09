import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  name: string;
  description: string;
}

export function ToolCard({
  href,
  icon: Icon,
  name,
  description,
}: ToolCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="rounded-full p-3 transition-colors bg-primary/10 group-hover:bg-primary/20">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
