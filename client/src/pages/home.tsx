import { ArrowRight, Shield, Zap, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";

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
              <Link href="/indicators">
                <Button size="lg" data-testid="button-explore">
                  Explore Indicators <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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
              <Link href="/indicators">
                <Button size="lg" data-testid="button-get-started">
                  Get Started <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
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
