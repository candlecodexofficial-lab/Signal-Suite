import { Link } from "wouter";
import { ArrowUpRight, Crown, Code2, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart-provider";
import type { Indicator } from "@shared/schema";

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const { addItem, addTrial, isInCart } = useCart();
  const inCart = isInCart(indicator.id);
  const isFree = indicator.tier === "free";

  return (
    <Card className="group flex flex-col border-card-border transition-colors duration-200 hover-elevate" data-testid={`card-indicator-${indicator.id}`}>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          {isFree ? (
            <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" data-testid={`badge-tier-${indicator.id}`}>
              Free
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" data-testid={`badge-tier-${indicator.id}`}>
              <Crown className="mr-1 h-3 w-3" /> Premium
            </Badge>
          )}
          <div data-testid={`text-price-${indicator.id}`}>
            {isFree ? (
              <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400">Free</span>
            ) : (
              <>
                <span className="text-sm font-bold">₹{Number(indicator.price).toLocaleString("en-IN")}</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold tracking-tight" data-testid={`text-indicator-name-${indicator.id}`}>
            {indicator.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {indicator.shortDescription}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
          <div data-testid={`text-version-${indicator.id}`}>
            <Code2 className="mx-auto mb-0.5 h-3 w-3 opacity-60" />
            <span className="font-medium text-foreground/80">v1.1 Beta</span>
          </div>
          <div data-testid={`text-updated-${indicator.id}`}>
            <CalendarDays className="mx-auto mb-0.5 h-3 w-3 opacity-60" />
            <span className="font-medium text-foreground/80">Mar 2026</span>
          </div>
          <div data-testid={`text-developer-${indicator.id}`}>
            <span className="block mb-0.5 text-[10px] uppercase tracking-wider opacity-60">By</span>
            <span className="font-medium text-foreground/80">Candle Codex</span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          {!inCart && !isFree && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
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
              Get Trial
            </Button>
          )}
          {!inCart && isFree && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
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
          <Link href={`/indicator/${indicator.slug}`} className="w-full">
            <Button size="sm" className="w-full" data-testid={`button-view-${indicator.id}`}>
              View <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
