import { ArrowRight, Shield, Zap, BarChart3, ChevronRight } from "lucide-react";
import { SiFacebook, SiX, SiYoutube, SiWhatsapp, SiTelegram, SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
