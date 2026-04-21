import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Crown, Code2, CalendarDays, Check, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { Indicator } from "@shared/schema";

export function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const { addItem, addTrial, isInCart, getCartItem, canAddVersion, cartVersion } = useCart();
  const { toast } = useToast();
  const inCart = isInCart(indicator.id);
  const cartItem = getCartItem(indicator.id);
  const isFree = indicator.tier === "free";
  const [justAdded, setJustAdded] = useState(false);
  const blockedByMix = !canAddVersion("indicator");

  const triggerAddAnimation = () => {
    setJustAdded(true);
    window.dispatchEvent(new CustomEvent("cart-item-added"));
    setTimeout(() => setJustAdded(false), 1500);
  };

  const showMixToast = () => {
    toast({
      variant: "destructive",
      title: "Can't mix Indicators and Strategies",
      description: `Your cart already has ${cartVersion === "strategy" ? "Strategies" : "Indicators"}. Clear your cart or check out first.`,
    });
  };

  const handleTrial = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addTrial({
      indicatorId: indicator.id,
      name: indicator.name,
      slug: indicator.slug,
      price: indicator.price,
    });
    if (!result.ok) {
      if (result.reason === "mixed") showMixToast();
      return;
    }
    triggerAddAnimation();
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addItem({
      indicatorId: indicator.id,
      name: indicator.name,
      slug: indicator.slug,
      price: isFree ? "0" : indicator.price,
    });
    if (!result.ok) {
      if (result.reason === "mixed") showMixToast();
      return;
    }
    triggerAddAnimation();
  };

  return (
    <motion.div
      animate={justAdded ? { scale: [1, 1.03, 0.98, 1] } : {}}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Card
        className={`group relative flex flex-col transition-all duration-300 hover-elevate ${
          inCart
            ? "border-primary/40 bg-primary/[0.03]"
            : "border-card-border"
        }`}
        data-testid={`card-indicator-${indicator.id}`}
      >
        <AnimatePresence>
          {justAdded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/90 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10"
              >
                <Check className="h-7 w-7 text-primary" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-3 text-sm font-semibold"
              >
                Added to Cart
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

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

          <div className="relative overflow-hidden rounded-md">
            <svg
              aria-hidden="true"
              viewBox="0 0 320 120"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18] dark:opacity-25"
            >
              <defs>
                <linearGradient id={`chart-fill-${indicator.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
                <pattern id={`chart-grid-${indicator.id}`} width="32" height="24" patternUnits="userSpaceOnUse">
                  <path d="M32 0 L0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />
                </pattern>
              </defs>
              <rect width="320" height="120" fill={`url(#chart-grid-${indicator.id})`} className="text-muted-foreground" />
              <path
                d="M0,90 L24,82 L48,88 L72,70 L96,75 L120,55 L144,62 L168,42 L192,48 L216,30 L240,38 L264,22 L288,28 L312,15 L320,18 L320,120 L0,120 Z"
                fill={`url(#chart-fill-${indicator.id})`}
              />
              <path
                d="M0,90 L24,82 L48,88 L72,70 L96,75 L120,55 L144,62 L168,42 L192,48 L216,30 L240,38 L264,22 L288,28 L312,15 L320,18"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g className="text-emerald-500">
                <circle cx="120" cy="55" r="2" fill="currentColor" />
                <circle cx="216" cy="30" r="2" fill="currentColor" />
                <circle cx="288" cy="28" r="2" fill="currentColor" />
              </g>
            </svg>
            <div className="relative z-[1] py-2">
              <h3 className="text-lg font-semibold tracking-tight" data-testid={`text-indicator-name-${indicator.id}`}>
                {indicator.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {indicator.shortDescription}
              </p>
            </div>
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

          {inCart && !justAdded ? (
            <div className="mt-auto pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs font-medium text-primary" data-testid={`text-in-cart-${indicator.id}`}>
                  {cartItem?.version === "strategy" ? "Strategy" : "Indicator"}
                  {cartItem?.isTrial ? " · Trial" : ""} — Added to Cart
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/cart" className="w-full">
                  <Button variant="outline" size="sm" className="w-full" data-testid={`button-go-cart-${indicator.id}`}>
                    <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Go to Cart
                  </Button>
                </Link>
                <Link href={`/indicator/${indicator.slug}`} className="w-full">
                  <Button size="sm" className="w-full" data-testid={`button-view-${indicator.id}`}>
                    View <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-auto pt-2">
              {blockedByMix && (
                <p className="mb-2 text-[10.5px] leading-tight text-amber-600 dark:text-amber-400" data-testid={`text-mix-warn-${indicator.id}`}>
                  Cart has Strategies — open this indicator to switch versions.
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {!isFree && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleTrial}
                    disabled={blockedByMix}
                    data-testid={`button-trial-${indicator.id}`}
                  >
                    Get Trial
                  </Button>
                )}
                {isFree && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleAdd}
                    disabled={blockedByMix}
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
          )}
        </div>
      </Card>
    </motion.div>
  );
}
