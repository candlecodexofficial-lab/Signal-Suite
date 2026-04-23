import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { IndicatorCard } from "@/components/indicator-card";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Indicator } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldCheck, BarChart3, Plug } from "lucide-react";

type MarketKey = "all" | "nifty" | "forex" | "crypto" | "stocks" | "commodities";
type TimeframeKey = "all" | "scalping" | "intraday" | "swing";

const MARKET_OPTIONS: { key: Exclude<MarketKey, "all">; label: string; match: RegExp }[] = [
  { key: "nifty", label: "NIFTY / BANKNIFTY", match: /nifty|bank ?nifty/i },
  { key: "forex", label: "Forex", match: /usd|jpy|gbp|eur|forex/i },
  { key: "crypto", label: "Crypto", match: /btc|eth|sol|bitcoin|ether|crypto/i },
  { key: "stocks", label: "Stocks", match: /tesla|apple|s&p|nasdaq|dow|nas100|stocks/i },
  { key: "commodities", label: "Commodities", match: /gold|crude|oil|commodit/i },
];

const TIMEFRAME_OPTIONS: { key: Exclude<TimeframeKey, "all">; label: string; match: RegExp }[] = [
  { key: "scalping", label: "Scalping (1m – 15m)", match: /1 ?min|5 ?min|15 ?min/i },
  { key: "intraday", label: "Intraday (15m – 1H)", match: /15 ?min|30 ?min|1 ?hour/i },
  { key: "swing", label: "Swing (1H – 1D)", match: /1 ?hour|2 ?hour|4 ?hour|daily|weekly/i },
];

export default function IndicatorsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [marketFilters, setMarketFilters] = useState<Set<Exclude<MarketKey, "all">>>(new Set());
  const [timeframeFilters, setTimeframeFilters] = useState<Set<Exclude<TimeframeKey, "all">>>(new Set());

  const { data: indicators, isLoading } = useQuery<Indicator[]>({
    queryKey: ["/api/indicators"],
  });

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    (indicators ?? []).forEach((i) => counts.set(i.category, (counts.get(i.category) ?? 0) + 1));
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [indicators]);

  const filtered = useMemo(() => {
    let list = indicators ?? [];
    if (activeCategory !== "All") list = list.filter((i) => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.shortDescription.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    if (marketFilters.size > 0) {
      list = list.filter((i) => {
        const ms = i.markets ?? [];
        return Array.from(marketFilters).some((key) => {
          const opt = MARKET_OPTIONS.find((o) => o.key === key);
          return opt ? ms.some((m) => opt.match.test(m)) : false;
        });
      });
    }
    if (timeframeFilters.size > 0) {
      list = list.filter((i) => {
        const tfs = i.bestTimeframes ?? [];
        return Array.from(timeframeFilters).some((key) => {
          const opt = TIMEFRAME_OPTIONS.find((o) => o.key === key);
          return opt ? tfs.some((t) => opt.match.test(t)) : false;
        });
      });
    }
    const sorted = [...list];
    if (sortBy === "rating") sorted.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    else if (sortBy === "popular") sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    else if (sortBy === "price-low") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price-high") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    else sorted.sort((a, b) => b.id - a.id);
    return sorted;
  }, [indicators, activeCategory, search, marketFilters, timeframeFilters, sortBy]);

  const toggleMarket = (key: Exclude<MarketKey, "all">) => {
    const next = new Set(marketFilters);
    if (next.has(key)) next.delete(key); else next.add(key);
    setMarketFilters(next);
  };
  const toggleTimeframe = (key: Exclude<TimeframeKey, "all">) => {
    const next = new Set(timeframeFilters);
    if (next.has(key)) next.delete(key); else next.add(key);
    setTimeframeFilters(next);
  };
  const resetFilters = () => {
    setActiveCategory("All");
    setSearch("");
    setMarketFilters(new Set());
    setTimeframeFilters(new Set());
    setSortBy("newest");
  };

  const trustBadges = [
    { Icon: ShieldCheck, title: "Non-Repainting", subtitle: "100% reliable signals" },
    { Icon: BarChart3, title: "Proven Results", subtitle: "Backtested performance" },
    { Icon: Plug, title: "Easy to Use", subtitle: "Plug & play on TradingView" },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-indicators-title">
              Our Trading Indicators
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Powerful, non-repainting TradingView indicators built for precision, confluence and consistent results.
            </p>
          </div>
          <Card className="flex flex-wrap items-center gap-5 border-card-border bg-card/60 px-5 py-4 backdrop-blur">
            {trustBadges.map(({ Icon, title, subtitle }) => (
              <div key={title} className="flex items-center gap-3" data-testid={`trust-${title.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">{title}</div>
                  <div className="text-[11px] text-muted-foreground">{subtitle}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card className="border-card-border p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide">Filter</h2>
                <button
                  onClick={resetFilters}
                  className="text-xs font-medium text-primary hover:underline"
                  data-testid="button-reset-filters"
                >
                  Reset
                </button>
              </div>

              <div className="mb-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveCategory("All")}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover-elevate ${
                        activeCategory === "All" ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80"
                      }`}
                      data-testid="filter-cat-all"
                    >
                      <span>All Indicators</span>
                      <span className="text-xs text-muted-foreground">{indicators?.length ?? 0}</span>
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c.name}>
                      <button
                        onClick={() => setActiveCategory(c.name)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover-elevate ${
                          activeCategory === c.name ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80"
                        }`}
                        data-testid={`filter-cat-${c.name.toLowerCase().replace(/\s/g, "-")}`}
                      >
                        <span>{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Markets
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={marketFilters.size === 0}
                      onCheckedChange={() => setMarketFilters(new Set())}
                      data-testid="filter-market-all"
                    />
                    <span>All Markets</span>
                  </label>
                  {MARKET_OPTIONS.map((m) => (
                    <label key={m.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={marketFilters.has(m.key)}
                        onCheckedChange={() => toggleMarket(m.key)}
                        data-testid={`filter-market-${m.key}`}
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timeframes
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={timeframeFilters.size === 0}
                      onCheckedChange={() => setTimeframeFilters(new Set())}
                      data-testid="filter-tf-all"
                    />
                    <span>All Timeframes</span>
                  </label>
                  {TIMEFRAME_OPTIONS.map((t) => (
                    <label key={t.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={timeframeFilters.has(t.key)}
                        onCheckedChange={() => toggleTimeframe(t.key)}
                        data-testid={`filter-tf-${t.key}`}
                      />
                      <span>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          </aside>

          <section>
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2" data-testid="category-tabs">
                {["All", ...categories.map((c) => c.name)].map((name) => (
                  <Button
                    key={name}
                    size="sm"
                    variant={activeCategory === name ? "default" : "outline"}
                    onClick={() => setActiveCategory(name)}
                    className="rounded-full"
                    data-testid={`tab-cat-${name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {name}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search indicators..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-[220px] pl-8"
                    data-testid="input-search"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[140px]" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-md border border-card-border p-5">
                    <Skeleton className="mb-4 h-32 w-full rounded-md" />
                    <Skeleton className="mb-2 h-5 w-2/3" />
                    <Skeleton className="mb-4 h-4 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                data-testid="indicators-grid"
              >
                {filtered.map((indicator) => (
                  <IndicatorCard key={indicator.id} indicator={indicator} />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full py-20 text-center text-muted-foreground">
                    No indicators match your filters.
                  </div>
                )}
              </motion.div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
