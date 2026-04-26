import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/auth-provider";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Timer,
  TrendingUp,
  Bookmark,
  Star,
  MessageCircle,
  User as UserIcon,
  ShoppingBag,
  Radio,
  Save,
  HelpCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { updateUserProfileSchema, type Indicator } from "@shared/schema";

const SUPPORT_WHATSAPP_NUMBER = "918920167711";
const PENDING_SUPPORT_THRESHOLD_MS = 24 * 60 * 60 * 1000;

function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const WATCHLIST_KEY = "pinesignallab.watchlist";
type DashView = "active" | "pending" | "orders" | "saved";
type DashSection = "account" | "myOrders" | "signals";

function readWatchlistIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

interface DashboardOrderItem {
  id: number;
  orderId: number;
  indicatorId: number;
  duration: number;
  price: string;
  isTrial: boolean | null;
  version: string | null;
  indicatorName: string;
  indicatorSlug: string;
  indicatorCategory: string;
  daysRemaining: number | null;
  accessStatus: "pending" | "active" | "expired" | "rejected";
}

interface DashboardOrder {
  id: number;
  userId: number;
  status: string;
  totalAmount: string;
  rejectionReason: string | null;
  createdAt: string;
  approvedAt: string | null;
  items: DashboardOrderItem[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  pending: { label: "Pending Approval", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

function getAccessBadge(status: string) {
  if (status === "active") return { label: "Active", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  if (status === "expired") return { label: "Expired", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" };
  if (status === "rejected") return { label: "Rejected", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" };
  return { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
}

const sectionNav: { key: DashSection; label: string; description: string; Icon: typeof UserIcon; testId: string }[] = [
  { key: "account", label: "My Account", description: "Profile & details", Icon: UserIcon, testId: "nav-account" },
  { key: "myOrders", label: "My Orders", description: "Subscriptions & history", Icon: ShoppingBag, testId: "nav-my-orders" },
  { key: "signals", label: "Live Signals", description: "Real-time alerts", Icon: Radio, testId: "nav-live-signals" },
];

const accountFormSchema = updateUserProfileSchema.extend({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  mobileNumber: z
    .string()
    .min(10, "Please enter a valid mobile number")
    .regex(/^[+]?[\d\s()-]+$/, "Invalid mobile number format"),
  tradingViewUsername: z.string().min(2, "TradingView username is required"),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function Dashboard() {
  const { user, isLoading: authLoading, openAuthModal, updateProfile } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: orders, isLoading } = useQuery<DashboardOrder[]>({
    queryKey: ["/api/dashboard"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  const { data: allIndicators } = useQuery<Indicator[]>({
    queryKey: ["/api/indicators"],
    enabled: !!user,
  });

  const [section, setSection] = useState<DashSection>("myOrders");
  const [view, setView] = useState<DashView>("active");
  const [watchlistIds, setWatchlistIds] = useState<number[]>(() => readWatchlistIds());
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const sync = () => setWatchlistIds(readWatchlistIds());
    window.addEventListener("storage", sync);
    window.addEventListener("watchlist-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("watchlist-updated", sync);
    };
  }, []);

  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      mobileNumber: "",
      tradingViewUsername: "",
    },
  });

  useEffect(() => {
    if (user) {
      accountForm.reset({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        mobileNumber: user.mobileNumber ?? "",
        tradingViewUsername: user.tradingViewUsername ?? "",
      });
    }
  }, [user, accountForm]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-2xl font-bold" data-testid="text-login-required">Sign in to view your dashboard</h2>
          <p className="mt-2 text-muted-foreground">
            Access your orders, indicator subscriptions, and account details.
          </p>
          <Button
            className="mt-6"
            size="lg"
            onClick={() => openAuthModal({ onSuccess: () => navigate("/dashboard") })}
            data-testid="button-dashboard-signin"
          >
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  const allItems = orders?.flatMap((o) => o.items.map((item) => ({ ...item, orderStatus: o.status, orderId: o.id, orderCreatedAt: o.createdAt }))) || [];
  const activeIndicators = allItems.filter((i) => i.accessStatus === "active");
  const pendingItems = allItems.filter((i) => i.accessStatus === "pending");
  const totalOrders = orders?.length || 0;
  const savedIndicators = (allIndicators || []).filter((ind) => watchlistIds.includes(ind.id));

  const stats: { key: DashView; label: string; count: number; Icon: typeof TrendingUp; iconWrap: string; iconColor: string; testId: string }[] = [
    { key: "active", label: "Active Indicators", count: activeIndicators.length, Icon: TrendingUp, iconWrap: "bg-emerald-500/10", iconColor: "text-emerald-600 dark:text-emerald-400", testId: "stat-active-indicators" },
    { key: "pending", label: "Pending Requests", count: pendingItems.length, Icon: Timer, iconWrap: "bg-amber-500/10", iconColor: "text-amber-600 dark:text-amber-400", testId: "stat-pending-requests" },
    { key: "orders", label: "Total Orders", count: totalOrders, Icon: Package, iconWrap: "bg-primary/10", iconColor: "text-primary", testId: "stat-total-orders" },
    { key: "saved", label: "Saved Indicators", count: savedIndicators.length, Icon: Bookmark, iconWrap: "bg-blue-500/10", iconColor: "text-blue-600 dark:text-blue-400", testId: "stat-saved-indicators" },
  ];

  async function onSubmitProfile(values: AccountFormValues) {
    setSavingProfile(true);
    try {
      await updateProfile(values);
      accountForm.reset(values);
      toast({ title: "Profile updated", description: "Your account details have been saved." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not update your profile. Please try again.";
      toast({ title: "Update failed", description: message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {user.firstName}. Here's an overview of your account.
          </p>
        </div>

        <div className="space-y-6">
          <nav
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            aria-label="Dashboard sections"
          >
            {sectionNav.map((s) => {
              const active = section === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSection(s.key)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all hover-elevate ${
                    active
                      ? "border-primary/60 bg-primary/[0.06] ring-1 ring-primary/40"
                      : "border-card-border bg-card"
                  }`}
                  data-testid={s.testId}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                      active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <s.Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold tracking-tight">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="min-w-0">
            {section === "account" && (
              <section data-testid="section-account">
                <Card className="border-card-border p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold" data-testid="text-account-heading">My Account</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Update the details you provided when signing up. Username and email cannot be changed.
                      </p>
                    </div>
                  </div>

                  <Form {...accountForm}>
                    <form onSubmit={accountForm.handleSubmit(onSubmitProfile)} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={accountForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="First name" data-testid="input-first-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Last name" data-testid="input-last-name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input value={user.email} readOnly disabled data-testid="input-email-readonly" />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Email is locked after signup.</p>
                        </FormItem>
                        <FormField
                          control={accountForm.control}
                          name="mobileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+91 98765 43210" data-testid="input-mobile-number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="my-2" />

                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={accountForm.control}
                          name="tradingViewUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>TradingView User Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your TradingView handle" data-testid="input-tradingview-username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1.5 text-left text-sm text-primary underline-offset-4 hover:underline"
                              data-testid="button-tv-username-help"
                            >
                              <HelpCircle className="h-4 w-4" />
                              I don't know my TradingView user name
                            </button>
                          </DialogTrigger>
                          <DialogContent data-testid="dialog-tv-username-help">
                            <DialogHeader>
                              <DialogTitle>How to find your TradingView username</DialogTitle>
                              <DialogDescription>
                                Follow these steps on tradingview.com to copy your exact username.
                              </DialogDescription>
                            </DialogHeader>
                            <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
                              <li>
                                Open <span className="font-medium">tradingview.com</span> and sign in to your account.
                              </li>
                              <li>
                                Click your profile avatar at the top-right corner.
                              </li>
                              <li>
                                Choose <span className="font-medium">Profile</span> from the dropdown.
                              </li>
                              <li>
                                Your username appears just below your display name (it starts with the URL{" "}
                                <span className="font-mono text-xs">tradingview.com/u/&lt;username&gt;</span>).
                              </li>
                              <li>
                                Copy that username exactly (case-sensitive) and paste it into the field.
                              </li>
                            </ol>
                            <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                              Tip: Without the correct username we cannot grant you indicator access on TradingView.
                            </p>
                          </DialogContent>
                        </Dialog>

                        <Button
                          type="submit"
                          disabled={savingProfile || !accountForm.formState.isDirty}
                          className="bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60"
                          data-testid="button-save-profile"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {savingProfile ? "Saving..." : "Edit or Save New Change"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </Card>
              </section>
            )}

            {section === "myOrders" && (
              <section data-testid="section-my-orders">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  {stats.map((s) => {
                    const active = view === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setView(s.key)}
                        aria-pressed={active}
                        className={`text-left rounded-lg border p-5 transition-all hover-elevate ${
                          active ? "border-primary/60 bg-primary/[0.04] ring-1 ring-primary/40" : "border-card-border bg-card"
                        }`}
                        data-testid={s.testId}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${s.iconWrap}`}>
                            <s.Icon className={`h-5 w-5 ${s.iconColor}`} />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{s.count}</p>
                            <p className="text-sm text-muted-foreground">{s.label}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {view === "active" && (
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold mb-4" data-testid="text-active-heading">Active Indicators</h2>
                    {activeIndicators.length === 0 ? (
                      <Card className="border-card-border p-8 text-center" data-testid="empty-active">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <TrendingUp className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-base font-medium">No active indicators yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Once your order is approved, your indicators will appear here.</p>
                        <Link href="/indicators">
                          <Button className="mt-4" size="sm" data-testid="button-active-browse">
                            Browse Indicators <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </Card>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {activeIndicators.map((item) => {
                          const badge = getAccessBadge(item.accessStatus);
                          return (
                            <Card key={`active-${item.id}`} className="border-card-border p-4" data-testid={`active-indicator-${item.id}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Link href={`/indicator/${item.indicatorSlug}`} className="font-medium hover:underline truncate" data-testid={`link-indicator-${item.id}`}>
                                      {item.indicatorName}
                                    </Link>
                                    <Badge variant="outline" className={`shrink-0 text-xs ${badge.className}`}>
                                      {badge.label}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {item.indicatorCategory} · {item.version === "strategy" ? "Strategy" : "Indicator"}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  {item.daysRemaining !== null ? (
                                    <div>
                                      <p className="text-lg font-bold" data-testid={`days-remaining-${item.id}`}>{item.daysRemaining}</p>
                                      <p className="text-xs text-muted-foreground">days left</p>
                                    </div>
                                  ) : (
                                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Lifetime</p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {view === "pending" && (
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold mb-4" data-testid="text-pending-heading">Pending Access Requests</h2>
                    {pendingItems.length === 0 ? (
                      <Card className="border-card-border p-8 text-center" data-testid="empty-pending">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Timer className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-base font-medium">No pending requests</h3>
                        <p className="mt-1 text-sm text-muted-foreground">All your access requests have been processed.</p>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {pendingItems.map((item) => {
                          const ageMs = Date.now() - new Date(item.orderCreatedAt).getTime();
                          const isStale = ageMs > PENDING_SUPPORT_THRESHOLD_MS;
                          return (
                            <Card key={`pending-${item.id}`} className="border-card-border p-4" data-testid={`pending-item-${item.id}`}>
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                  </div>
                                  <div className="min-w-0">
                                    <Link href={`/indicator/${item.indicatorSlug}`} className="font-medium hover:underline truncate block" data-testid={`link-pending-${item.id}`}>
                                      {item.indicatorName}
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                      {item.isTrial ? "15-Day Trial" : `${item.duration} month${item.duration !== 1 ? "s" : ""}`} — Order #{item.orderId}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="shrink-0">
                                  <Clock className="mr-1 h-3 w-3" /> Awaiting Approval
                                </Badge>
                              </div>
                              {isStale && (
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5">
                                  <p className="text-[11.5px] leading-snug text-amber-700 dark:text-amber-300">
                                    This request has been pending for over 24 hours. Reach out and we'll prioritize it.
                                  </p>
                                  <a
                                    href={buildWhatsAppUrl(`Hi Pine Signal Lab team, my order #${item.orderId} for "${item.indicatorName}" has been pending for over 24 hours. Please help.`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-testid={`button-pending-support-${item.id}`}
                                  >
                                    <Button size="sm" variant="outline" className="h-7 gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-300">
                                      <MessageCircle className="h-3.5 w-3.5" /> Contact Support Team
                                    </Button>
                                  </a>
                                </div>
                              )}
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {view === "saved" && (
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold mb-4" data-testid="text-saved-heading">Saved Indicators</h2>
                    {savedIndicators.length === 0 ? (
                      <Card className="border-card-border p-8 text-center" data-testid="empty-saved">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Bookmark className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-base font-medium">No saved indicators yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Tap the bookmark on any indicator card to save it for later.
                        </p>
                        <Link href="/indicators">
                          <Button className="mt-4" size="sm" data-testid="button-saved-browse">
                            Browse Indicators <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </Card>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {savedIndicators.map((ind) => (
                          <Card key={`saved-${ind.id}`} className="border-card-border p-4" data-testid={`saved-indicator-${ind.id}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Link href={`/indicator/${ind.slug}`} className="font-medium hover:underline truncate" data-testid={`link-saved-${ind.id}`}>
                                    {ind.name}
                                  </Link>
                                  <Badge variant="outline" className={`shrink-0 text-[10px] capitalize ${ind.tier === "free" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"}`}>
                                    {ind.tier}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ind.description}</p>
                                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {ind.rating}
                                  </span>
                                  <span>·</span>
                                  <span>{ind.category}</span>
                                </div>
                              </div>
                              <Link href={`/indicator/${ind.slug}`}>
                                <Button variant="outline" size="sm" data-testid={`button-saved-view-${ind.id}`}>
                                  View <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {view === "orders" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4" data-testid="text-orders-heading">Order History</h2>

                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                      </div>
                    ) : !orders || orders.length === 0 ? (
                      <Card className="border-card-border p-8 text-center" data-testid="empty-orders">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-base font-medium">No orders yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Browse our indicators and place your first order.
                        </p>
                        <Link href="/indicators">
                          <Button className="mt-4" size="sm" data-testid="button-browse-indicators">
                            Browse Indicators <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => {
                          const config = statusConfig[order.status] || statusConfig.pending;
                          const StatusIcon = config.icon;
                          const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          });

                          return (
                            <Card key={order.id} className="border-card-border overflow-hidden" data-testid={`order-${order.id}`}>
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold" data-testid={`order-id-${order.id}`}>
                                    Order #{order.id}
                                  </span>
                                  <Badge variant={config.variant} className="text-xs" data-testid={`order-status-${order.id}`}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {config.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span data-testid={`order-date-${order.id}`}>{orderDate}</span>
                                  <span className="font-medium text-foreground" data-testid={`order-total-${order.id}`}>
                                    ${parseFloat(order.totalAmount).toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              {order.status === "rejected" && (
                                <div className="border-b bg-red-500/5 px-5 py-3" data-testid={`rejection-reason-${order.id}`}>
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-start gap-2 min-w-0">
                                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                                          {order.rejectionReason ? "Reason for rejection" : "Order rejected"}
                                        </p>
                                        {order.rejectionReason && (
                                          <p className="mt-0.5 text-sm text-foreground">{order.rejectionReason}</p>
                                        )}
                                      </div>
                                    </div>
                                    <a
                                      href={buildWhatsAppUrl(`Hi Pine Signal Lab team, my order #${order.id} was rejected. Could you help me understand why and how to proceed?`)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      data-testid={`button-rejected-support-${order.id}`}
                                    >
                                      <Button size="sm" variant="outline" className="h-7 gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-300">
                                        <MessageCircle className="h-3.5 w-3.5" /> Contact Support Team
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              )}

                              {order.status === "pending" && Date.now() - new Date(order.createdAt).getTime() > PENDING_SUPPORT_THRESHOLD_MS && (
                                <div className="border-b bg-amber-500/5 px-5 py-3" data-testid={`pending-stale-${order.id}`}>
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-start gap-2">
                                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                      <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Pending for over 24 hours. Reach out and we'll prioritize it.
                                      </p>
                                    </div>
                                    <a
                                      href={buildWhatsAppUrl(`Hi Pine Signal Lab team, my order #${order.id} has been pending for over 24 hours. Please help.`)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      data-testid={`button-order-pending-support-${order.id}`}
                                    >
                                      <Button size="sm" variant="outline" className="h-7 gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-300">
                                        <MessageCircle className="h-3.5 w-3.5" /> Contact Support Team
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              )}

                              <div className="divide-y">
                                {order.items.map((item) => {
                                  const accessBadge = getAccessBadge(item.accessStatus);
                                  return (
                                    <div key={item.id} className="flex items-center justify-between gap-3 px-5 py-3" data-testid={`order-item-${item.id}`}>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <Link href={`/indicator/${item.indicatorSlug}`} className="text-sm font-medium hover:underline" data-testid={`link-order-item-${item.id}`}>
                                            {item.indicatorName}
                                          </Link>
                                          {order.status === "approved" && (
                                            <Badge variant="outline" className={`text-xs ${accessBadge.className}`}>
                                              {accessBadge.label}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                          {item.isTrial ? "15-Day Trial" : `${item.duration} month${item.duration !== 1 ? "s" : ""}`}
                                          {" · "}
                                          {item.indicatorCategory}
                                        </p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        {item.isTrial ? (
                                          <span className="text-sm font-medium text-primary">₹5,250</span>
                                        ) : (
                                          <span className="text-sm font-medium">₹{parseFloat(item.price).toLocaleString("en-IN")}</span>
                                        )}
                                        {item.accessStatus === "active" && item.daysRemaining !== null && (
                                          <p className="text-xs text-muted-foreground">{item.daysRemaining}d remaining</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {section === "signals" && (
              <section data-testid="section-live-signals">
                <Card className="border-card-border p-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Radio className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold" data-testid="text-signals-heading">Live Signals</h2>
                  <Badge variant="secondary" className="mt-3" data-testid="badge-coming-soon">
                    <Timer className="mr-1 h-3 w-3" /> Coming Soon
                  </Badge>
                  <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                    Real-time alerts from your active indicators will stream right here. We're polishing the experience and will roll it out to subscribers shortly.
                  </p>
                  <Link href="/indicators">
                    <Button variant="outline" className="mt-6" data-testid="button-signals-browse">
                      Browse Indicators <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </Card>
              </section>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
