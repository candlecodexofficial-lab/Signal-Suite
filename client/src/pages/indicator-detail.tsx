import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, ShoppingCart, Play, CheckCircle2, TrendingUp, BarChart3, Target, Clock, Zap, Activity, Brain } from "lucide-react";
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
        <Link href="/">
          <Button className="mt-6" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const gradient = categoryGradients[indicator.category] || "from-gray-600/20 to-slate-600/20";
  const Icon = categoryIcons[indicator.category] || TrendingUp;
  const inCart = isInCart(indicator.id);

  const handleAddToCart = () => {
    addItem({
      indicatorId: indicator.id,
      name: indicator.name,
      slug: indicator.slug,
      price: indicator.price,
    });
    toast({ title: "Added to cart", description: `${indicator.name} has been added to your cart.` });
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

  const stats = [
    { label: "Win Rate", value: indicator.winRate, color: "text-emerald-500 dark:text-emerald-400" },
    { label: "Avg Return", value: indicator.avgReturn, color: "text-emerald-500 dark:text-emerald-400" },
    { label: "Total Trades", value: indicator.totalTrades, color: "text-foreground" },
    { label: "Trial Period", value: `${indicator.trialDays} days`, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Indicators
          </Button>
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <Badge variant="secondary" data-testid="badge-category">{indicator.category}</Badge>
                {indicator.trialDays && (
                  <Badge variant="outline" data-testid="badge-trial">
                    <Clock className="mr-1 h-3 w-3" /> {indicator.trialDays}-day free trial
                  </Badge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-indicator-name">
                {indicator.name}
              </h1>
              <p className="mt-3 text-lg text-muted-foreground leading-relaxed" data-testid="text-short-desc">
                {indicator.shortDescription}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold" data-testid="text-price">${indicator.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {inCart ? (
                  <Link href="/cart">
                    <Button size="lg" data-testid="button-go-to-cart">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Go to Cart
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button size="lg" onClick={handleAddToCart} data-testid="button-add-to-cart">
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleGetTrial} data-testid="button-get-trial">
                      Get Free Trial
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className={`flex h-48 w-full items-center justify-center rounded-md bg-gradient-to-br lg:h-auto lg:w-80 ${gradient}`}>
              <Icon className="h-20 w-20 text-foreground/40" />
            </div>
          </div>

          <Separator className="my-10" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="stats-grid">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-card-border p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className={`mt-1 text-2xl font-bold ${stat.color}`} data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                  {stat.value || "N/A"}
                </p>
              </Card>
            ))}
          </div>

          {indicator.videoUrl && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold" data-testid="text-video-title">Introduction Video</h2>
              <div className="relative aspect-video rounded-md border bg-card">
                <iframe
                  src={indicator.videoUrl}
                  className="h-full w-full rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${indicator.name} introduction`}
                  data-testid="video-intro"
                />
              </div>
            </div>
          )}

          {!indicator.videoUrl && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold">Introduction Video</h2>
              <div className="flex aspect-video items-center justify-center rounded-md border bg-card">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Play className="h-12 w-12" />
                  <p className="text-sm">Video coming soon</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold" data-testid="text-description-title">About This Indicator</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed" data-testid="text-description">
              {indicator.description.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {indicator.features && indicator.features.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold" data-testid="text-features-title">Key Features</h2>
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
              Try {indicator.name} free for {indicator.trialDays} days. No credit card required.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {inCart ? (
                <Link href="/cart">
                  <Button size="lg" data-testid="button-bottom-cart">
                    <ShoppingCart className="mr-2 h-4 w-4" /> View Cart
                  </Button>
                </Link>
              ) : (
                <>
                  <Button size="lg" onClick={handleAddToCart} data-testid="button-bottom-add">
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleGetTrial} data-testid="button-bottom-trial">
                    Start Free Trial
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
