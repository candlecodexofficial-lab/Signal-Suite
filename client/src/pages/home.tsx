import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Shield, Zap, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IndicatorCard } from "@/components/indicator-card";
import { Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Indicator } from "@shared/schema";

const categories = ["All", "Trend Following", "Momentum", "Volume Analysis", "Volatility", "Smart Money", "Support/Resistance"];

const features = [
  {
    icon: Shield,
    title: "Battle-Tested Strategies",
    description: "Every indicator is backtested across thousands of trades and multiple market conditions.",
  },
  {
    icon: Zap,
    title: "Real-Time Signals",
    description: "Get instant alerts on TradingView when your indicators detect high-probability setups.",
  },
  {
    icon: BarChart3,
    title: "Proven Performance",
    description: "Transparent win rates, average returns, and trade history for every indicator we offer.",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: indicators, isLoading } = useQuery<Indicator[]>({
    queryKey: ["/api/indicators"],
  });

  const filtered = activeCategory === "All"
    ? indicators
    : indicators?.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <Badge variant="secondary" className="mb-6" data-testid="badge-hero">
              Premium TradingView Indicators
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" data-testid="text-hero-title">
              Elevate Your
              <span className="text-primary"> Trading Edge</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed" data-testid="text-hero-subtitle">
              Access institutional-grade TradingView indicators designed by professional traders. 
              Backtested, optimized, and ready to deploy on your charts.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#indicators">
                <Button size="lg" data-testid="button-explore">
                  Explore Indicators <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#features">
                <Button variant="outline" size="lg" data-testid="button-learn-more">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col gap-3"
                data-testid={`feature-${i}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="indicators" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-section-title">
                Our Indicators
              </h2>
              <p className="mt-2 text-muted-foreground">
                Choose from our curated collection of high-performance indicators.
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2" data-testid="category-filters">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                data-testid={`button-category-${cat.toLowerCase().replace(/[/\s]/g, "-")}`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="indicators-grid"
            >
              {filtered?.map((indicator) => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
              {filtered?.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  No indicators found in this category.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-lg border bg-card p-8 sm:p-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-cta-title">
              Ready to Transform Your Trading?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Start with a free trial on any indicator. No credit card required. 
              See the results on your own charts before committing.
            </p>
            <div className="mt-8">
              <a href="#indicators">
                <Button size="lg" data-testid="button-get-started">
                  Get Started <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground" data-testid="text-footer">
              TradeVault. Professional TradingView Indicators.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Terms</span>
              <span>Privacy</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
