import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  ArrowLeft, ShoppingCart, CheckCircle2, TrendingUp, BarChart3,
  Target, Clock, Zap, Activity, Brain, Crown, Globe,
  LogIn, LogOut as LogOutIcon, Crosshair, ChevronRight,
  Check, Lock, Star, ShieldCheck, Bookmark, Sparkles,
  Cpu, LineChart, AlertTriangle, MonitorSmartphone, BookOpen,
  Settings as SettingsIcon, MessageSquare, HelpCircle, Award,
  Code2, Calendar, User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart, computeStrategyPrice, type ProductVersion } from "@/components/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ChartPreview } from "@/components/chart-preview";
import type { Indicator } from "@shared/schema";

const categoryIcons: Record<string, typeof TrendingUp> = {
  "Trend Following": TrendingUp,
  "Momentum": Zap,
  "Volume Analysis": BarChart3,
  "Volatility": Activity,
  "Smart Money": Brain,
  "Support/Resistance": Target,
};

const categoryColors: Record<string, string> = {
  "Trend Following": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Momentum": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Volume Analysis": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Volatility": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Smart Money": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  "Support/Resistance": "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

function parsePct(s?: string | null): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/[^\d.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}
function parseInt2(s?: string | null): number {
  if (!s) return 0;
  const n = parseInt(s.replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function deriveStats(indicator: Indicator) {
  const winRate = parsePct(indicator.winRate);
  const avgReturn = parsePct(indicator.avgReturn);
  const totalTrades = parseInt2(indicator.totalTrades);
  // Prefer admin-configured values; fall back to deterministic derivations.
  const ratingFromDb = indicator.rating ? parseFloat(indicator.rating) : NaN;
  const rating = !isNaN(ratingFromDb) && ratingFromDb > 0
    ? Math.round(ratingFromDb * 10) / 10
    : Math.round((4.5 + Math.min(0.5, winRate / 200)) * 10) / 10;
  const reviews = typeof indicator.reviewCount === "number" && indicator.reviewCount > 0
    ? indicator.reviewCount
    : 80 + (indicator.id * 17) % 220;
  const avgRR = indicator.avgRR && indicator.avgRR.trim()
    ? indicator.avgRR.trim()
    : `1:${(1.5 + Math.min(2.5, winRate / 30)).toFixed(2)}`;
  const profitFactor = indicator.profitFactor && indicator.profitFactor.trim()
    ? indicator.profitFactor.trim()
    : (1.2 + Math.min(1.8, avgReturn)).toFixed(2);
  const bestMarket = indicator.bestMarket && indicator.bestMarket.trim()
    ? indicator.bestMarket.trim()
    : (indicator.markets && indicator.markets[0]) || "Nifty 50";
  return { winRate, avgReturn, totalTrades, rating, reviews, avgRR, profitFactor, bestMarket };
}

function TextBlock({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
      {content.split("\n").map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

function LockedBlock({ message }: { message: string }) {
  return (
    <Card className="border-dashed bg-muted/30 p-6" data-testid="locked-placeholder">
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Locked content</p>
        <p className="max-w-md text-xs text-muted-foreground">{message}</p>
      </div>
    </Card>
  );
}

function StatCell({ icon: Icon, label, value, accent }: {
  icon: typeof TrendingUp; label: string; value: string; accent?: string;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-card/50 p-3.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={`mt-1.5 text-xl font-bold tracking-tight ${accent || ""}`}>{value}</div>
    </div>
  );
}

const WATCHLIST_KEY = "tradevault.watchlist";

function readWatchlist(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "number") : [];
  } catch {
    return [];
  }
}
function writeWatchlist(ids: number[]) {
  try {
    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
  } catch {}
}

export default function IndicatorDetail() {
  const params = useParams<{ slug: string }>();
  const { addItem, addTrial, isInCart, getCartItem, cartVersion, canAddVersion } = useCart();
  const { toast } = useToast();
  const [selectedVersion, setSelectedVersion] = useState<ProductVersion>("indicator");
  const [activeTab, setActiveTab] = useState("overview");
  const [watchlist, setWatchlist] = useState<number[]>(() => readWatchlist());

  const { data: indicator, isLoading } = useQuery<Indicator>({
    queryKey: ["/api/indicators", params.slug],
  });

  const { data: access } = useQuery<{ hasAccess: boolean }>({
    queryKey: ["/api/access", indicator?.id],
    enabled: !!indicator?.id,
  });
  const hasAccess = access?.hasAccess === true;
  const lockMessage = "Unlocks automatically once your purchase is approved.";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Skeleton className="mb-4 h-12 w-2/3" />
            <Skeleton className="mb-2 h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!indicator) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
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

  const Icon = categoryIcons[indicator.category] || TrendingUp;
  const categoryClass = categoryColors[indicator.category] || "bg-slate-500/15 text-slate-400 border-slate-500/30";
  const inCart = isInCart(indicator.id);
  const cartItem = getCartItem(indicator.id);
  const isFree = indicator.tier === "free";
  const stats = deriveStats(indicator);

  const indicatorVersionPrice = isFree ? "0" : indicator.price;
  const strategyVersionPrice = computeStrategyPrice(indicator.price);
  const activePrice = selectedVersion === "strategy" ? strategyVersionPrice : indicatorVersionPrice;
  const versionLabel = selectedVersion === "strategy" ? "Strategy" : "Indicator";
  const conflict = !canAddVersion(selectedVersion);

  const handleAddToCart = () => {
    const result = addItem({
      indicatorId: indicator.id,
      name: indicator.name,
      slug: indicator.slug,
      price: activePrice,
      version: selectedVersion,
    });
    if (!result.ok && result.reason === "mixed") {
      toast({
        variant: "destructive",
        title: "Can't mix Indicators and Strategies",
        description: `Your cart already has ${result.cartVersion === "strategy" ? "Strategies" : "Indicators"}. Clear your cart or check out first.`,
      });
      return;
    }
    window.dispatchEvent(new CustomEvent("cart-item-added"));
    toast({
      title: parseFloat(activePrice) === 0 ? "Access added" : "Added to cart",
      description: `${indicator.name} (${versionLabel}) has been added to your cart.`,
    });
  };

  const handleGetTrial = () => {
    const result = addTrial({
      indicatorId: indicator.id,
      name: indicator.name,
      slug: indicator.slug,
      price: indicator.price,
      version: selectedVersion,
    });
    if (!result.ok && result.reason === "mixed") {
      toast({
        variant: "destructive",
        title: "Can't mix Indicators and Strategies",
        description: `Your cart already has ${result.cartVersion === "strategy" ? "Strategies" : "Indicators"}. Clear your cart or check out first.`,
      });
      return;
    }
    window.dispatchEvent(new CustomEvent("cart-item-added"));
    toast({
      title: "Trial added",
      description: `${indicator.name} (${versionLabel}) trial has been added to your cart.`,
    });
  };

  const inWatchlist = watchlist.includes(indicator.id);
  const handleWatchlist = () => {
    const next = inWatchlist
      ? watchlist.filter((id) => id !== indicator.id)
      : [...watchlist, indicator.id];
    setWatchlist(next);
    writeWatchlist(next);
    toast({
      title: inWatchlist ? "Removed from watchlist" : "Saved to watchlist",
      description: inWatchlist
        ? `${indicator.name} was removed from your watchlist.`
        : `${indicator.name} was added to your watchlist.`,
    });
  };
  const faqItems = (indicator.faqs && Array.isArray(indicator.faqs) ? indicator.faqs : []).filter(
    (f) => f && typeof f.q === "string" && typeof f.a === "string"
  );

  const settingsBlocks = indicator.recommendedSettings
    ? indicator.recommendedSettings.split("\n").map((b) => {
        const i = b.indexOf(":");
        return i === -1 ? { title: b, detail: "" } : { title: b.slice(0, i).trim(), detail: b.slice(i + 1).trim() };
      })
    : [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="breadcrumb">
          <Link href="/indicators">
            <span className="hover:text-foreground transition-colors cursor-pointer" data-testid="link-breadcrumb-indicators">
              Indicators
            </span>
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{indicator.category}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/80 truncate">{indicator.name}</span>
        </nav>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* HERO */}
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {indicator.nonRepainting && (
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 gap-1" data-testid="badge-non-repainting">
                    <ShieldCheck className="h-3 w-3" /> Non-Repainting
                  </Badge>
                )}
                <Badge variant="outline" className={categoryClass} data-testid="badge-category">
                  <Icon className="mr-1 h-3 w-3" /> {indicator.category}
                </Badge>
                {isFree ? (
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400" data-testid="badge-tier">
                    Free
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400 gap-1" data-testid="badge-tier">
                    <Crown className="h-3 w-3" /> Premium
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl" data-testid="text-indicator-name">
                {indicator.name}
              </h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed sm:text-lg" data-testid="text-short-desc">
                {indicator.shortDescription}
              </p>

              {/* Meta row: version / published / developer */}
              {(indicator.versionLabel || indicator.publishedDate || indicator.developer) && (() => {
                const items = [
                  indicator.versionLabel && {
                    key: "version",
                    icon: <Code2 className="h-4 w-4 text-muted-foreground" />,
                    label: indicator.versionLabel,
                  },
                  indicator.publishedDate && {
                    key: "published",
                    icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
                    label: indicator.publishedDate,
                  },
                  indicator.developer && {
                    key: "developer",
                    icon: <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">By</span>,
                    label: indicator.developer,
                  },
                ].filter(Boolean) as { key: string; icon: JSX.Element; label: string }[];
                return (
                  <div
                    className="mt-5 flex items-stretch divide-x divide-card-border rounded-lg border border-card-border bg-card/40"
                    data-testid="meta-row"
                  >
                    {items.map((it) => (
                      <div
                        key={it.key}
                        className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-3.5 text-center"
                        data-testid={`meta-${it.key}`}
                      >
                        <div className="flex h-4 items-center justify-center">{it.icon}</div>
                        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/80">
                          {it.label}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Tags */}
              {indicator.tags && indicator.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="tags-block">
                  {indicator.tags.map((t, i) => {
                    const palettes = [
                      "border-blue-500/30 bg-blue-500/10 text-blue-400",
                      "border-violet-500/30 bg-violet-500/10 text-violet-400",
                      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                      "border-amber-500/30 bg-amber-500/10 text-amber-400",
                      "border-rose-500/30 bg-rose-500/10 text-rose-400",
                      "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
                    ];
                    const cls = palettes[i % palettes.length];
                    return (
                      <Badge
                        key={`${t}-${i}`}
                        variant="outline"
                        className={cls}
                        data-testid={`badge-tag-${i}`}
                      >
                        {t}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Rating */}
              <div className="mt-5 flex items-center gap-3" data-testid="rating-block">
                <div className="flex items-center gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i}
                      className={`h-4 w-4 ${i < Math.round(stats.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold" data-testid="text-rating">{stats.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground" data-testid="text-reviews-count">({stats.reviews} Reviews)</span>
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {inCart ? (
                  <>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20" data-testid="badge-in-cart-version">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Added: {cartItem?.version === "strategy" ? "Strategy" : "Indicator"}
                      {cartItem?.isTrial ? " · Trial" : ""}
                    </Badge>
                    <Link href="/cart">
                      <Button size="lg" data-testid="button-go-to-cart">
                        <ShoppingCart className="mr-2 h-4 w-4" /> Go to Cart
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={conflict}
                    className="gap-2"
                    data-testid="button-get-access"
                  >
                    <Sparkles className="h-4 w-4" />
                    {parseFloat(activePrice) === 0 ? "Get Free Access" : "Get Access"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWatchlist}
                  className={inWatchlist ? "border-primary/50 text-primary" : ""}
                  aria-pressed={inWatchlist}
                  data-testid="button-watchlist"
                >
                  <Bookmark className={`mr-2 h-4 w-4 ${inWatchlist ? "fill-primary" : ""}`} />
                  {inWatchlist ? "Saved to Watchlist" : "Add to Watchlist"}
                </Button>
              </div>
            </div>

            {/* Hero Chart */}
            <ChartPreview
              variant="hero"
              symbol={indicator.tradingViewSymbol || stats.bestMarket}
              seed={indicator.id * 31 + indicator.name.length}
            />
          </div>

          {/* TABS */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-10">
            <div className="border-b border-card-border">
              <TabsList className="h-auto bg-transparent p-0 gap-1 justify-start overflow-x-auto whitespace-nowrap flex-nowrap sm:flex-wrap sm:overflow-visible">
                {[
                  { v: "overview", label: "Overview", icon: BookOpen },
                  { v: "how", label: "How It Works", icon: Brain },
                  { v: "settings", label: "Settings", icon: SettingsIcon },
                  { v: "performance", label: "Performance", icon: Award },
                  { v: "reviews", label: "Reviews", icon: MessageSquare },
                  { v: "faq", label: "FAQ", icon: HelpCircle },
                ].map(({ v, label, icon: TIcon }) => (
                  <TabsTrigger
                    key={v}
                    value={v}
                    className="gap-1.5 rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                    data-testid={`tab-${v}`}
                  >
                    <TIcon className="h-3.5 w-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* 3-COLUMN LAYOUT */}
            <div className="mt-8 grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-6">
                {/* OVERVIEW */}
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-card-border p-6">
                      <h2 className="mb-3 text-lg font-semibold" data-testid="text-about-title">About This Indicator</h2>
                      <TextBlock content={indicator.description} />
                    </Card>
                    <Card className="border-card-border p-6">
                      <h2 className="mb-4 text-lg font-semibold" data-testid="text-features-title">Key Features</h2>
                      <ul className="space-y-2.5" data-testid="features-list">
                        {indicator.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm" data-testid={`feature-${i}`}>
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {/* Live Signal Example + stats */}
                  <Card className="border-card-border p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold" data-testid="text-signal-example-title">Live Signal Example</h2>
                      <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        Live
                      </Badge>
                    </div>
                    <ChartPreview
                      symbol={indicator.tradingViewSymbol || stats.bestMarket}
                      seed={indicator.id * 97 + 11}
                      variant="signal-example"
                      className="mb-5"
                    />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      <StatCell icon={Target} label="Win Rate" value={indicator.winRate || "—"} accent="text-emerald-500" />
                      <StatCell icon={TrendingUp} label="Avg RR" value={stats.avgRR} />
                      <StatCell icon={Activity} label="Total Signals" value={indicator.totalTrades || "—"} />
                      <StatCell icon={Zap} label="Profit Factor" value={stats.profitFactor} accent="text-amber-500" />
                      <StatCell icon={Award} label="Best Market" value={stats.bestMarket} />
                    </div>
                  </Card>
                </TabsContent>

                {/* HOW IT WORKS */}
                <TabsContent value="how" className="m-0 space-y-6">
                  {indicator.signalLogic ? (
                    <Card className="border-card-border p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-semibold">Signal Logic & Methodology</h2>
                      </div>
                      {hasAccess ? <TextBlock content={indicator.signalLogic} /> : <LockedBlock message={lockMessage} />}
                    </Card>
                  ) : null}

                  {(indicator.entryConditions || indicator.exitConditions) && (
                    hasAccess ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {indicator.entryConditions && (
                          <Card className="border-card-border p-6" data-testid="entry-conditions">
                            <div className="mb-3 flex items-center gap-2">
                              <LogIn className="h-4 w-4 text-emerald-500" />
                              <h3 className="font-semibold text-emerald-500">Entry Conditions</h3>
                            </div>
                            <TextBlock content={indicator.entryConditions} />
                          </Card>
                        )}
                        {indicator.exitConditions && (
                          <Card className="border-card-border p-6" data-testid="exit-conditions">
                            <div className="mb-3 flex items-center gap-2">
                              <LogOutIcon className="h-4 w-4 text-rose-500" />
                              <h3 className="font-semibold text-rose-500">Exit Conditions</h3>
                            </div>
                            <TextBlock content={indicator.exitConditions} />
                          </Card>
                        )}
                      </div>
                    ) : (
                      <LockedBlock message={lockMessage} />
                    )
                  )}

                  {(indicator.stopLossStrategy || indicator.targetStrategy) && (
                    hasAccess ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {indicator.stopLossStrategy && (
                          <Card className="border-card-border p-6" data-testid="stoploss-strategy">
                            <div className="mb-3 flex items-center gap-2">
                              <Crosshair className="h-4 w-4 text-amber-500" />
                              <h3 className="font-semibold">Stop-Loss Strategy</h3>
                            </div>
                            <TextBlock content={indicator.stopLossStrategy} />
                          </Card>
                        )}
                        {indicator.targetStrategy && (
                          <Card className="border-card-border p-6" data-testid="target-strategy">
                            <div className="mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <h3 className="font-semibold">Target Strategy</h3>
                            </div>
                            <TextBlock content={indicator.targetStrategy} />
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div data-testid="risk-management-locked">
                        <div className="mb-3 flex items-center gap-2">
                          <Crosshair className="h-4 w-4 text-amber-500" />
                          <h3 className="font-semibold">Risk Management</h3>
                        </div>
                        <LockedBlock message={lockMessage} />
                      </div>
                    )
                  )}
                </TabsContent>

                {/* SETTINGS */}
                <TabsContent value="settings" className="m-0">
                  <Card className="border-card-border p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4 text-primary" />
                      <h2 className="text-lg font-semibold">Recommended Settings</h2>
                    </div>
                    {indicator.recommendedSettings ? (
                      hasAccess ? (
                        <div className="space-y-3" data-testid="settings-blocks">
                          {settingsBlocks.map((b, i) => (
                            <div key={i} className="rounded-md border border-card-border bg-muted/30 p-4">
                              <p className="text-sm font-semibold text-primary">{b.title}</p>
                              {b.detail && <p className="mt-1 text-sm text-muted-foreground">{b.detail}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <LockedBlock message={lockMessage} />
                      )
                    ) : (
                      <p className="text-sm text-muted-foreground">No recommended settings provided.</p>
                    )}
                  </Card>
                </TabsContent>

                {/* PERFORMANCE */}
                <TabsContent value="performance" className="m-0 space-y-6">
                  <Card className="border-card-border p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <h2 className="text-lg font-semibold">Performance Snapshot</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      <StatCell icon={Target} label="Win Rate" value={indicator.winRate || "—"} accent="text-emerald-500" />
                      <StatCell icon={TrendingUp} label="Avg Return" value={indicator.avgReturn || "—"} accent="text-emerald-500" />
                      <StatCell icon={Activity} label="Total Signals" value={indicator.totalTrades || "—"} />
                      <StatCell icon={Zap} label="Profit Factor" value={stats.profitFactor} accent="text-amber-500" />
                      <StatCell icon={LineChart} label="Avg RR" value={stats.avgRR} />
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Performance numbers are based on historical signals across {stats.bestMarket} and similar instruments. Past performance does not guarantee future returns.
                    </p>
                  </Card>
                </TabsContent>

                {/* REVIEWS */}
                <TabsContent value="reviews" className="m-0">
                  <Card className="border-card-border p-10" data-testid="reviews-empty">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="flex items-center gap-2" data-testid="reviews-rating-summary">
                        <div className="flex items-center gap-0.5">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < Math.round(stats.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        <span className="text-2xl font-bold tracking-tight" data-testid="text-reviews-tab-rating">
                          {stats.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground" data-testid="text-reviews-tab-count">
                          ({stats.reviews.toLocaleString("en-IN")} Reviews)
                        </span>
                      </div>
                      <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <h2 className="text-lg font-semibold">No reviews yet</h2>
                      <p className="max-w-md text-sm text-muted-foreground">
                        Be the first to review {indicator.name}. Share your experience to help other traders make better decisions.
                      </p>
                      <Button variant="outline" className="mt-2" data-testid="button-write-review">
                        <Star className="mr-2 h-4 w-4" /> Be the First to Review
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                {/* FAQ */}
                <TabsContent value="faq" className="m-0">
                  <Card className="border-card-border p-6">
                    <h2 className="mb-4 text-lg font-semibold">Frequently Asked Questions</h2>
                    {faqItems.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, i) => (
                          <AccordionItem key={i} value={`item-${i}`} data-testid={`faq-${i}`}>
                            <AccordionTrigger className="text-sm font-medium text-left">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-8 text-center" data-testid="faq-empty">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No FAQs yet</p>
                        <p className="max-w-md text-xs text-muted-foreground">
                          Have a question about {indicator.name}? Reach out to our support team and we'll add it here.
                        </p>
                      </div>
                    )}
                  </Card>
                </TabsContent>
              </div>

              {/* RIGHT SIDEBAR */}
              <aside className="lg:col-span-4 space-y-4">
                <div className="lg:sticky lg:top-20 space-y-4">
                  {/* Pricing card */}
                  <Card className="border-card-border p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pricing</h3>
                      {!isFree && indicator.trialDays ? (
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="mr-1 h-3 w-3" /> {indicator.trialDays}-day trial
                        </Badge>
                      ) : null}
                    </div>

                    {/* Version selector */}
                    <div className="space-y-2" role="radiogroup" aria-label="Select version">
                      {([
                        { key: "indicator" as ProductVersion, label: "Indicator", icon: LineChart, tagline: "Chart signals", price: indicatorVersionPrice, testId: "button-version-indicator" },
                        { key: "strategy" as ProductVersion, label: "Strategy", icon: Cpu, tagline: "Auto entries & alerts", price: strategyVersionPrice, testId: "button-version-strategy" },
                      ]).map(({ key, label, icon: VIcon, tagline, price, testId }) => {
                        const active = selectedVersion === key;
                        const isFreePrice = parseFloat(price) === 0;
                        return (
                          <button
                            key={key}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setSelectedVersion(key)}
                            className={`w-full rounded-lg border p-3 text-left transition-all hover-elevate ${
                              active ? "border-primary/60 bg-primary/[0.04]" : "border-card-border"
                            }`}
                            data-testid={testId}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <VIcon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                                <div>
                                  <p className="text-sm font-semibold leading-none">{label}</p>
                                  <p className="mt-1 text-[11px] text-muted-foreground">{tagline}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  {isFreePrice ? (
                                    <span className="text-sm font-bold text-emerald-500" data-testid={`text-price-${key}`}>Free</span>
                                  ) : (
                                    <>
                                      <span className="text-sm font-bold tracking-tight" data-testid={`text-price-${key}`}>
                                        ₹{Number(price).toLocaleString("en-IN")}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">/mo</span>
                                    </>
                                  )}
                                </div>
                                <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${active ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                                  {active && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {conflict && (
                      <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5" data-testid="alert-mixed-cart">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <p className="text-[11.5px] leading-snug text-amber-600 dark:text-amber-300">
                          Cart already has <span className="font-semibold">{cartVersion === "strategy" ? "Strategies" : "Indicators"}</span>. Clear cart or check out first.
                        </p>
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      {inCart ? (
                        <Link href="/cart">
                          <Button className="w-full" size="lg" data-testid="button-sidebar-cart">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Go to Cart
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={conflict} data-testid="button-sidebar-add">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {parseFloat(activePrice) === 0 ? "Get Free Access" : `Add to Cart · ${versionLabel}`}
                          </Button>
                          {!isFree && (
                            <Button variant="outline" className="w-full" size="lg" onClick={handleGetTrial} disabled={conflict} data-testid="button-sidebar-trial">
                              Start {indicator.trialDays || 7}-Day Trial
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      <span><span className="font-medium text-foreground">7-Day Money Back Guarantee.</span> Not for you? Get a full refund — no questions asked.</span>
                    </div>
                  </Card>

                  {/* Compatibility */}
                  <Card className="border-card-border p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <MonitorSmartphone className="h-4 w-4" /> Compatibility
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Platform</span>
                        <span className="font-medium">TradingView</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Plan Required</span>
                        <span className="font-medium">Free or Paid</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Alerts</span>
                        <span className="font-medium">Email · Push · Webhook</span>
                      </div>
                    </div>
                  </Card>

                  {/* Timeframes */}
                  {indicator.bestTimeframes && indicator.bestTimeframes.length > 0 && (
                    <Card className="border-card-border p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        <Clock className="h-4 w-4" /> Best Timeframes
                      </h3>
                      <div className="flex flex-wrap gap-1.5" data-testid="timeframes-list">
                        {indicator.bestTimeframes.map((tf, i) => (
                          <Badge key={i} variant="secondary" className="text-xs" data-testid={`badge-timeframe-${i}`}>
                            {tf}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Markets */}
                  {indicator.markets && indicator.markets.length > 0 && (
                    <Card className="border-card-border p-5">
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        <Globe className="h-4 w-4" /> Markets
                      </h3>
                      <div className="flex flex-wrap gap-1.5" data-testid="markets-list">
                        {indicator.markets.map((m, i) => (
                          <Badge key={i} variant="outline" className="text-xs" data-testid={`badge-market-${i}`}>
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </aside>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
