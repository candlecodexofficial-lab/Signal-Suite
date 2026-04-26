import { ArrowRight, Shield, Zap, BarChart3, ChevronRight, Activity, Droplets, Target, BellRing, Check, Clock, Sparkles } from "lucide-react";
import { SiFacebook, SiX, SiYoutube, SiWhatsapp, SiTelegram, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { IndicatorCard } from "@/components/indicator-card";
import type { Indicator } from "@shared/schema";
import supportWomanImg from "@assets/generated_images/footer_support_woman.png";

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com", icon: SiFacebook, bg: "bg-[#1877F2]" },
  { name: "Twitter", href: "https://x.com", icon: SiX, bg: "bg-black" },
  { name: "YouTube", href: "https://youtube.com", icon: SiYoutube, bg: "bg-[#FF0000]" },
  { name: "WhatsApp", href: "https://wa.me/918920167711", icon: SiWhatsapp, bg: "bg-[#25D366]" },
  { name: "Telegram", href: "https://t.me/tradevault", icon: SiTelegram, bg: "bg-[#229ED9]" },
  { name: "Instagram", href: "https://instagram.com", icon: SiInstagram, bg: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]" },
];

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

      <SystemFramework />

      <IndicatorMarquee />

      <PricingPlans />

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

      <section className="relative overflow-hidden bg-black border-t border-white/5" data-testid="section-connect">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute -top-32 right-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 shadow-2xl"
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-25"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1.2px)",
                backgroundSize: "14px 14px",
                maskImage:
                  "linear-gradient(to right, black 30%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, black 30%, transparent 100%)",
              }}
            />
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

            <div className="relative grid grid-cols-1 items-end gap-6 md:grid-cols-2 md:items-center md:gap-0">
              <div className="relative flex items-end justify-center md:justify-start md:pl-6 lg:pl-12">
                <img
                  src={supportWomanImg}
                  alt="TradeVault community support representative"
                  className="h-72 w-auto object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] sm:h-80 md:h-96 lg:h-[28rem]"
                  data-testid="img-connect-support"
                />
              </div>

              <div className="relative px-6 pb-10 pt-2 md:px-10 md:py-12 lg:pr-16">
                <h2
                  className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                  data-testid="text-connect-title"
                >
                  Or connect with us on<span className="text-primary">/.</span>
                </h2>
                <p
                  className="mt-3 max-w-md text-base text-zinc-400"
                  data-testid="text-connect-subtitle"
                >
                  Join thousands of traders in the TradeVault community. Get started today!
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3" data-testid="list-social">
                  {socialLinks.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      title={s.name}
                      className={`group inline-flex h-11 w-11 items-center justify-center rounded-md ${s.bg} text-white shadow-lg shadow-black/30 transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900`}
                      data-testid={`link-social-${s.name.toLowerCase()}`}
                    >
                      <s.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t" id="footer">
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

function IndicatorMarquee() {
  const { data: indicators, isLoading } = useQuery<Indicator[]>({
    queryKey: ["/api/indicators"],
  });

  const items = (indicators ?? []).slice(0, 12);
  // Duplicate the list so the keyframe -50% translation produces a
  // perfectly seamless infinite scroll.
  const track = items.length > 0 ? [...items, ...items] : [];
  // Slow the animation down as the catalog grows so the visible speed
  // stays consistent regardless of how many cards are in the row.
  const durationSeconds = Math.max(35, items.length * 6);

  return (
    <section
      className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black py-16 sm:py-20"
      data-testid="section-indicator-marquee"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-3 border-primary/20 bg-primary/10 text-primary" data-testid="badge-marquee">
              Featured
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl" data-testid="text-marquee-title">
              Our Premium Indicators
            </h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              A live look at what's trending in the TradeVault catalog. Hover to pause.
            </p>
          </div>
          <Link href="/indicators">
            <Button variant="ghost" className="hidden text-primary hover:text-primary sm:inline-flex" data-testid="link-marquee-view-all">
              View All Indicators <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-zinc-950 to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent sm:w-24" />

        {isLoading && (
          <div className="flex gap-5 overflow-hidden px-6 sm:px-10" data-testid="marquee-skeleton">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-72 w-[300px] shrink-0 animate-pulse rounded-lg border border-white/5 bg-white/[0.02] sm:w-[320px]"
              />
            ))}
          </div>
        )}

        {!isLoading && track.length > 0 && (
          <div className="marquee-pause-on-hover overflow-hidden">
            <div
              className="animate-marquee-x flex w-max"
              style={{ ["--marquee-duration" as string]: `${durationSeconds}s` }}
              data-testid="marquee-track"
            >
              {track.map((ind, i) => {
                const isClone = i >= items.length;
                return (
                  <div
                    key={`${ind.id}-${i}`}
                    className="w-[300px] shrink-0 pr-5 sm:w-[320px]"
                    aria-hidden={isClone || undefined}
                    {...(isClone ? { inert: "" as unknown as boolean } : {})}
                  >
                    <IndicatorCard indicator={ind} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isLoading && track.length === 0 && (
          <div className="px-6 text-center text-sm text-zinc-500 sm:px-10" data-testid="marquee-empty">
            No indicators available yet.
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center sm:hidden">
        <Link href="/indicators">
          <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" data-testid="link-marquee-view-all-mobile">
            View All Indicators <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

const frameworkSteps = [
  {
    icon: Activity,
    title: "Market Structure",
    description: "Identify trend and key structure in market",
    accent: "from-sky-500/30 to-blue-600/10",
    ring: "ring-sky-400/40",
    iconColor: "text-sky-300",
    glow: "shadow-[0_0_40px_-10px_rgba(56,189,248,0.55)]",
    topLineColor: "rgba(56,189,248,0.65)",
  },
  {
    icon: Droplets,
    title: "Liquidity Sweep",
    description: "Detect liquidity grab and stop hunts",
    accent: "from-violet-500/30 to-fuchsia-600/10",
    ring: "ring-violet-400/40",
    iconColor: "text-violet-300",
    glow: "shadow-[0_0_40px_-10px_rgba(167,139,250,0.55)]",
    topLineColor: "rgba(167,139,250,0.65)",
  },
  {
    icon: Target,
    title: "Confirmation",
    description: "Multi-factor confirmation for high probability",
    accent: "from-amber-500/30 to-orange-600/10",
    ring: "ring-amber-400/40",
    iconColor: "text-amber-300",
    glow: "shadow-[0_0_40px_-10px_rgba(251,191,36,0.55)]",
    topLineColor: "rgba(251,191,36,0.65)",
  },
  {
    icon: BellRing,
    title: "Signal Generated",
    description: "High probability signal with entry, SL, targets",
    accent: "from-emerald-500/30 to-green-600/10",
    ring: "ring-emerald-400/40",
    iconColor: "text-emerald-300",
    glow: "shadow-[0_0_40px_-10px_rgba(52,211,153,0.55)]",
    topLineColor: "rgba(52,211,153,0.65)",
  },
];

function SystemFramework() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-black via-zinc-950 to-zinc-950 py-20 sm:py-24"
      data-testid="section-framework"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="secondary" className="mb-3 border-primary/20 bg-primary/10 text-primary" data-testid="badge-framework">
            How It Works
          </Badge>
          <h2
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            data-testid="text-framework-title"
          >
            Our System Framework
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            A disciplined four-stage process behind every TradeVault signal — from raw market structure to a high-probability trade plan.
          </p>
        </motion.div>

        <div className="relative mt-14">
          <motion.div
            aria-hidden
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
            className="pointer-events-none absolute left-6 right-6 top-9 hidden h-px origin-left bg-gradient-to-r from-sky-400/0 via-white/30 to-emerald-400/0 lg:block"
          />

          <ol className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {frameworkSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: "easeOut" }}
                  className="relative"
                  data-testid={`framework-step-${i}`}
                >
                  <div className="group relative h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]">
                    <div
                      className="absolute inset-x-6 -top-px h-px opacity-70"
                      style={{
                        backgroundImage: `linear-gradient(to right, transparent, ${step.topLineColor}, transparent)`,
                      }}
                    />

                    <div className="mb-5 flex items-center gap-3">
                      <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${step.accent} ring-1 ${step.ring} ${step.glow} transition-transform duration-300 group-hover:scale-105`}>
                        <Icon className={`h-6 w-6 ${step.iconColor}`} strokeWidth={2.2} />
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-zinc-900 text-[10px] font-semibold text-zinc-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-white" data-testid={`text-framework-step-title-${i}`}>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400" data-testid={`text-framework-step-desc-${i}`}>
                      {step.description}
                    </p>

                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{
                      background:
                        "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.06), transparent 60%)",
                    }} />
                  </div>

                  {i < frameworkSteps.length - 1 && (
                    <div
                      aria-hidden
                      className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 lg:flex"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 backdrop-blur"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </div>
                  )}

                  {i < frameworkSteps.length - 1 && (
                    <div aria-hidden className="flex justify-center pt-4 sm:hidden">
                      <ArrowRight className="h-5 w-5 rotate-90 text-zinc-500" />
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

const pricingPlans = [
  {
    name: "Starter",
    price: 999,
    description: "Get started with a single premium tool.",
    features: [
      { icon: Check, label: "1 Premium Indicator" },
      { icon: Check, label: "Access to Live Signals" },
      { icon: Check, label: "Basic Support" },
      { icon: Clock, label: "Cancel Anytime" },
    ],
    popular: false,
    cta: "Start Now",
  },
  {
    name: "Pro",
    price: 2499,
    description: "Everything serious traders need, day in and day out.",
    features: [
      { icon: Check, label: "All Premium Indicators" },
      { icon: Check, label: "Real-time Signals" },
      { icon: Check, label: "Priority Support" },
      { icon: Check, label: "Cancel Anytime" },
    ],
    popular: true,
    cta: "Start Now",
  },
  {
    name: "Elite",
    price: 4999,
    description: "White-glove access for funded and full-time traders.",
    features: [
      { icon: Check, label: "All Pro Features" },
      { icon: Check, label: "Private Telegram Channel" },
      { icon: Check, label: "Advanced Analytics" },
      { icon: Check, label: "1-on-1 Support" },
    ],
    popular: false,
    cta: "Start Now",
  },
];

function PricingPlans() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black py-20 sm:py-24"
      data-testid="section-pricing"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="secondary" className="mb-3 border-primary/20 bg-primary/10 text-primary" data-testid="badge-pricing">
            Pricing
          </Badge>
          <h2
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
            data-testid="text-pricing-title"
          >
            Choose Your Plan
          </h2>
          <p className="mt-3 text-base text-zinc-400">
            Simple, transparent pricing. Upgrade, downgrade, or cancel any time — no questions asked.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
          {pricingPlans.map((plan, i) => {
            const isPopular = plan.popular;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: 0.12 + i * 0.12, ease: "easeOut" }}
                className={`relative ${isPopular ? "md:-my-3 md:scale-[1.03]" : ""}`}
                data-testid={`pricing-card-${plan.name.toLowerCase()}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 z-20 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-zinc-950 px-3 py-1 text-xs font-semibold text-primary shadow-[0_0_24px_-4px_hsl(var(--primary)/0.55)]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 ${
                    isPopular
                      ? "border-primary/50 bg-gradient-to-b from-primary/[0.08] via-zinc-900 to-zinc-950 shadow-[0_0_60px_-15px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_80px_-15px_hsl(var(--primary)/0.65)]"
                      : "border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-x-7 -top-px h-px ${
                      isPopular
                        ? "bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
                        : "bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50"
                    }`}
                  />

                  <div className="mb-5">
                    <h3
                      className={`text-xl font-semibold ${isPopular ? "text-primary" : "text-white"}`}
                      data-testid={`text-plan-name-${plan.name.toLowerCase()}`}
                    >
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
                  </div>

                  <div className="mb-6 flex items-baseline gap-1">
                    <span
                      className="text-5xl font-bold tracking-tight text-white"
                      data-testid={`text-plan-price-${plan.name.toLowerCase()}`}
                    >
                      <span className="text-3xl align-top mr-0.5 text-zinc-300">₹</span>
                      {plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm font-medium text-zinc-400">/month</span>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((f, fi) => {
                      const FIcon = f.icon;
                      return (
                        <li
                          key={f.label}
                          className="flex items-start gap-3 text-sm text-zinc-200"
                          data-testid={`feature-${plan.name.toLowerCase()}-${fi}`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              isPopular
                                ? "bg-primary/15 text-primary"
                                : "bg-white/5 text-zinc-300"
                            }`}
                          >
                            <FIcon className="h-3.5 w-3.5" strokeWidth={2.6} />
                          </span>
                          <span>{f.label}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-auto">
                    <Button
                      asChild
                      size="lg"
                      className={`w-full ${
                        isPopular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30"
                          : "bg-white/5 text-white hover:bg-white/10 border border-white/15"
                      }`}
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      <Link href="/indicators" aria-label={`${plan.cta} with the ${plan.name} plan`}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </div>

                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.06), transparent 60%)",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          All prices in INR. Taxes may apply. Cancel anytime from your account.
        </p>
      </div>
    </section>
  );
}
