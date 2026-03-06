import { Link } from "wouter";
import { ArrowUpRight, Zap, TrendingUp, BarChart3, Activity, Brain, Target, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import type { Indicator } from "@shared/schema";

const categoryGradients: Record<string, string> = {
  "Trend Following": "from-blue-600/20 to-cyan-600/20",
  "Momentum": "from-violet-600/20 to-purple-600/20",
  "Volume Analysis": "from-emerald-600/20 to-teal-600/20",
  "Volatility": "from-amber-600/20 to-orange-600/20",
  "Smart Money": "from-rose-600/20 to-pink-600/20",
  "Support/Resistance": "from-indigo-600/20 to-blue-600/20",
};

const categoryIcons: Record<string, typeof TrendingUp> = {
  "Trend Following": TrendingUp,
  "Momentum": Zap,
  "Volume Analysis": BarChart3,
  "Volatility": Activity,
  "Smart Money": Brain,
  "Support/Resistance": Target,
};

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const { addItem, addTrial, isInCart } = useCart();
  const gradient = categoryGradients[indicator.category] || "from-gray-600/20 to-slate-600/20";
  const Icon = categoryIcons[indicator.category] || TrendingUp;
  const inCart = isInCart(indicator.id);
  const isFree = indicator.tier === "free";

  return (
    <Card className="group flex flex-col border-card-border transition-colors duration-200 hover-elevate" data-testid={`card-indicator-${indicator.id}`}>
      <div className={`relative flex items-center justify-center rounded-t-md bg-gradient-to-br ${gradient} p-8`}>
        <Icon className="h-12 w-12 text-foreground/60" />
        {isFree ? (
          <Badge variant="secondary" className="absolute left-3 top-3 text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" data-testid={`badge-tier-${indicator.id}`}>
            Free
          </Badge>
        ) : (
          <Badge variant="secondary" className="absolute left-3 top-3 text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" data-testid={`badge-tier-${indicator.id}`}>
            <Crown className="mr-1 h-3 w-3" /> Premium
          </Badge>
        )}
        <Badge variant="secondary" className="absolute right-3 top-3 text-xs">
          {indicator.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight" data-testid={`text-indicator-name-${indicator.id}`}>
            {indicator.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {indicator.shortDescription}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {indicator.winRate && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Win Rate</span>
              <span className="font-medium text-emerald-500 dark:text-emerald-400" data-testid={`text-winrate-${indicator.id}`}>{indicator.winRate}</span>
            </div>
          )}
          {indicator.avgReturn && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Avg Return</span>
              <span className="font-medium text-emerald-500 dark:text-emerald-400" data-testid={`text-avgreturn-${indicator.id}`}>{indicator.avgReturn}</span>
            </div>
          )}
          {indicator.totalTrades && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs">Trades</span>
              <span className="font-medium" data-testid={`text-trades-${indicator.id}`}>{indicator.totalTrades}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div>
            {isFree ? (
              <span className="text-2xl font-bold tracking-tight text-emerald-500 dark:text-emerald-400" data-testid={`text-price-${indicator.id}`}>Free</span>
            ) : (
              <>
                <span className="text-2xl font-bold tracking-tight" data-testid={`text-price-${indicator.id}`}>${indicator.price}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!inCart && !isFree && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTrial({
                    indicatorId: indicator.id,
                    name: indicator.name,
                    slug: indicator.slug,
                    price: indicator.price,
                  });
                }}
                data-testid={`button-trial-${indicator.id}`}
              >
                Free Trial
              </Button>
            )}
            {!inCart && isFree && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({
                    indicatorId: indicator.id,
                    name: indicator.name,
                    slug: indicator.slug,
                    price: "0",
                  });
                }}
                data-testid={`button-get-free-${indicator.id}`}
              >
                Get Access
              </Button>
            )}
            <Link href={`/indicator/${indicator.slug}`}>
              <Button size="sm" data-testid={`button-view-${indicator.id}`}>
                View <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
