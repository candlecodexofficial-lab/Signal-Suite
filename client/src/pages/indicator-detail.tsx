import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  ArrowLeft, ShoppingCart, Play, CheckCircle2, TrendingUp, BarChart3,
  Target, Clock, Zap, Activity, Brain, Crown, Globe, Settings,
  LogIn, LogOut as LogOutIcon, Crosshair, Shield, ChevronRight,
  Code2, CalendarDays, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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

function SectionHeading({ icon: Icon, title, id }: { icon: typeof TrendingUp; title: string; id?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <h2 className="text-xl font-semibold" data-testid={id}>{title}</h2>
    </div>
  );
}

function TextBlock({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {content.split("\n").map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function IndicatorDetail() {
  const params = useParams<{ slug: string }>();
  const { addItem, addTrial, isInCart } = useCart();
  const { toast } = useToast();

  const { data: indicator, isLoading } = useQuery<Indicator>({
    queryKey: ["/api/indicators", params.slug],
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-4 h-12 w-2/3" />
        <Skeleton className="mb-8 h-6 w-1/2" />
        <Skeleton className="h-80 w-full rounded-md" />
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Indicator not found</h2>
        <p className="mt-2 text-muted-foreground">The indicator you're looking for doesn't exist.</p>
        <Link href="/indicators">
          <Button className="mt-6" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Indicators
          </Button>
        </Link>
      </div>
    );
  }

  const gradient = categoryGradients[indicator.category] || "from-gray-600/20 to-slate-600/20";
  const Icon = categoryIcons[indicator.category] || TrendingUp;
  const inCart = isInCart(indicator.id);
  const isFree = indicator.tier === "free";

  const handleAddToCart = () => {
    addItem({
      indicatorId: indicator.id,
      name: indicator.name,
      slug: indicator.slug,
      price: isFree ? "0" : indicator.price,
    });
    toast({ title: isFree ? "Access added" : "Added to cart", description: `${indicator.name} has been added to your cart.` });
  };

  const handleGetTrial = () => {
    addTrial({
      indicatorId: indicator.id,
      name: indicator.name,
      slug: indicator.slug,
      price: indicator.price,
    });
    toast({ title: "Trial added", description: `${indicator.name} free trial has been added to your cart.` });
  };

  const settingsBlocks = indicator.recommendedSettings
    ? indicator.recommendedSettings.split("\n").map((block) => {
        const colonIdx = block.indexOf(":");
        if (colonIdx === -1) return { title: block, detail: "" };
        return { title: block.slice(0, colonIdx).trim(), detail: block.slice(colonIdx + 1).trim() };
      })
    : [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/indicators">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Indicators
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2">
                <Badge variant="secondary" data-testid="badge-category">{indicator.category}</Badge>
                {isFree ? (
                  <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" data-testid="badge-tier">
                    Free
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20" data-testid="badge-tier">
                    <Crown className="mr-1 h-3 w-3" /> Premium
                  </Badge>
                )}
                {!isFree && indicator.trialDays && (
                  <Badge variant="outline" data-testid="badge-trial">
                    <Clock className="mr-1 h-3 w-3" /> {indicator.trialDays}-day trial
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-indicator-name">
                {indicator.name}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground leading-relaxed" data-testid="text-short-desc">
                {indicator.shortDescription}
              </p>

              <div className="mt-4 inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-card-border bg-muted/40 px-4 py-2.5 text-sm">
                <div className="flex items-center gap-1.5" data-testid="text-version">
                  <Code2 className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">1.1 Beta</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5" data-testid="text-updated">
                  <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">Mar 2026</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1.5" data-testid="text-developer">
                  <User className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-muted-foreground">By</span>
                  <span className="font-medium">Candle Codex</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {isFree ? (
                  <span className="text-3xl font-bold text-emerald-500 dark:text-emerald-400" data-testid="text-price">Free</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold" data-testid="text-price">₹{Number(indicator.price).toLocaleString("en-IN")}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {inCart ? (
                  <Link href="/cart">
                    <Button size="lg" data-testid="button-go-to-cart">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Go to Cart
                    </Button>
                  </Link>
                ) : isFree ? (
                  <Button size="lg" onClick={handleAddToCart} data-testid="button-add-to-cart">
                    Get Free Access
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={handleAddToCart} data-testid="button-add-to-cart">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleGetTrial} data-testid="button-get-trial">
                      Get Trial
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="w-full lg:w-96 shrink-0">
              {indicator.videoUrl ? (
                <div className="relative aspect-video rounded-lg border bg-card overflow-hidden">
                  <iframe
                    src={indicator.videoUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${indicator.name} introduction`}
                    data-testid="video-hero"
                  />
                </div>
              ) : (
                <div className={`flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br ${gradient} border overflow-hidden`}>
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Play className="h-12 w-12" />
                    <p className="text-sm font-medium">Video Coming Soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-10" />

          {indicator.imageUrl && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold" data-testid="text-screenshot-title">Indicator Preview</h2>
              <div className="rounded-lg border bg-card overflow-hidden">
                <img
                  src={indicator.imageUrl}
                  alt={`${indicator.name} chart preview`}
                  className="w-full object-cover"
                  data-testid="img-preview"
                />
              </div>
            </div>
          )}

          {!indicator.imageUrl && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold">Indicator Preview</h2>
              <div className={`flex h-56 items-center justify-center rounded-lg border bg-gradient-to-br ${gradient}`}>
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Icon className="h-16 w-16 opacity-40" />
                  <p className="text-sm">Chart preview coming soon</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10">
            <SectionHeading icon={Icon} title="About This Indicator" id="text-description-title" />
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed" data-testid="text-description">
              {indicator.description.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {indicator.markets && indicator.markets.length > 0 && (
            <div className="mt-10">
              <SectionHeading icon={Globe} title="Supported Markets & Instruments" id="text-markets-title" />
              <div className="flex flex-wrap gap-2" data-testid="markets-list">
                {indicator.markets.map((market, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm" data-testid={`badge-market-${i}`}>
                    {market}
                  </Badge>
                ))}
              </div>
              {indicator.bestTimeframes && indicator.bestTimeframes.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Best Timeframes</p>
                  <div className="flex flex-wrap gap-2" data-testid="timeframes-list">
                    {indicator.bestTimeframes.map((tf, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm" data-testid={`badge-timeframe-${i}`}>
                        <Clock className="mr-1.5 h-3 w-3" /> {tf}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {indicator.signalLogic && (
            <div className="mt-10">
              <SectionHeading icon={Brain} title="Signal Logic & Methodology" id="text-signal-logic-title" />
              <Card className="border-card-border p-6" data-testid="signal-logic-content">
                <TextBlock content={indicator.signalLogic} />
              </Card>
            </div>
          )}

          {(indicator.entryConditions || indicator.exitConditions) && (
            <div className="mt-10">
              <SectionHeading icon={Crosshair} title="Entry & Exit Rules" id="text-entry-exit-title" />
              <div className="grid gap-4 lg:grid-cols-2">
                {indicator.entryConditions && (
                  <Card className="border-card-border p-6" data-testid="entry-conditions">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
                        <LogIn className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">Entry Conditions</h3>
                    </div>
                    <TextBlock content={indicator.entryConditions} />
                  </Card>
                )}
                {indicator.exitConditions && (
                  <Card className="border-card-border p-6" data-testid="exit-conditions">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10">
                        <LogOutIcon className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="font-semibold text-red-600 dark:text-red-400">Exit Conditions</h3>
                    </div>
                    <TextBlock content={indicator.exitConditions} />
                  </Card>
                )}
              </div>
            </div>
          )}

          {(indicator.stopLossStrategy || indicator.targetStrategy) && (
            <div className="mt-10">
              <SectionHeading icon={Shield} title="Risk Management" id="text-risk-title" />
              <div className="grid gap-4 lg:grid-cols-2">
                {indicator.stopLossStrategy && (
                  <Card className="border-card-border p-6" data-testid="stop-loss-strategy">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10">
                        <Shield className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="font-semibold">Stop-Loss Strategy</h3>
                    </div>
                    <TextBlock content={indicator.stopLossStrategy} />
                  </Card>
                )}
                {indicator.targetStrategy && (
                  <Card className="border-card-border p-6" data-testid="target-strategy">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
                        <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-semibold">Target & Take-Profit</h3>
                    </div>
                    <TextBlock content={indicator.targetStrategy} />
                  </Card>
                )}
              </div>
            </div>
          )}

          {settingsBlocks.length > 0 && (
            <div className="mt-10">
              <SectionHeading icon={Settings} title="Recommended Settings" id="text-settings-title" />
              <div className="grid gap-3 sm:grid-cols-2" data-testid="settings-grid">
                {settingsBlocks.map((block, i) => (
                  <Card key={i} className="border-card-border p-5" data-testid={`settings-block-${i}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                      <h4 className="text-sm font-semibold">{block.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{block.detail}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {indicator.features && indicator.features.length > 0 && (
            <div className="mt-10">
              <SectionHeading icon={Zap} title="Key Features" id="text-features-title" />
              <div className="grid gap-3 sm:grid-cols-2">
                {indicator.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-md border border-card-border p-4" data-testid={`feature-item-${i}`}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 rounded-lg border bg-card p-6 sm:p-8 text-center">
            <h3 className="text-xl font-semibold">Ready to Get Started?</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              {isFree
                ? `Get free access to ${indicator.name} and start trading with confidence.`
                : `Try ${indicator.name} for ${indicator.trialDays} days at just ₹5,250. Start trading with confidence.`}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {inCart ? (
                <Link href="/cart">
                  <Button size="lg" data-testid="button-bottom-cart">
                    <ShoppingCart className="mr-2 h-4 w-4" /> View Cart
                  </Button>
                </Link>
              ) : isFree ? (
                <Button size="lg" onClick={handleAddToCart} data-testid="button-bottom-add">
                  Get Free Access
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={handleAddToCart} data-testid="button-bottom-add">
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleGetTrial} data-testid="button-bottom-trial">
                    Get Trial
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
