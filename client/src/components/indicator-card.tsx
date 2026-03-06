import { Link } from "wouter";
import { ArrowUpRight, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import type { Indicator } from "@shared/schema";

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const { addItem, addTrial, isInCart } = useCart();
  const inCart = isInCart(indicator.id);
  const isFree = indicator.tier === "free";

  return (
    <Card className="group flex flex-col border-card-border transition-colors duration-200 hover-elevate" data-testid={`card-indicator-${indicator.id}`}>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-2">
          {isFree ? (
            <Badge variant="secondary" className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" data-testid={`badge-tier-${indicator.id}`}>
              Free
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" data-testid={`badge-tier-${indicator.id}`}>
              <Crown className="mr-1 h-3 w-3" /> Premium
            </Badge>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold tracking-tight" data-testid={`text-indicator-name-${indicator.id}`}>
            {indicator.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            {indicator.shortDescription}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div>
            {isFree ? (
              <span className="text-2xl font-bold tracking-tight text-emerald-500 dark:text-emerald-400" data-testid={`text-price-${indicator.id}`}>Free</span>
            ) : (
              <>
                <span className="text-2xl font-bold tracking-tight" data-testid={`text-price-${indicator.id}`}>₹{Number(indicator.price).toLocaleString("en-IN")}</span>
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
                Get Trial
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
