import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { getQueryFn } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { motion } from "framer-motion";

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

export default function Dashboard() {
  const { user, isLoading: authLoading, openAuthModal } = useAuth();
  const [, navigate] = useLocation();

  const { data: orders, isLoading } = useQuery<DashboardOrder[]>({
    queryKey: ["/api/dashboard"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
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

  const allItems = orders?.flatMap((o) => o.items.map((item) => ({ ...item, orderStatus: o.status, orderId: o.id }))) || [];
  const activeIndicators = allItems.filter((i) => i.accessStatus === "active");
  const pendingItems = allItems.filter((i) => i.accessStatus === "pending");
  const totalOrders = orders?.length || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {user.firstName}. Here's an overview of your account.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card className="border-card-border p-5" data-testid="stat-active-indicators">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeIndicators.length}</p>
                <p className="text-sm text-muted-foreground">Active Indicators</p>
              </div>
            </div>
          </Card>

          <Card className="border-card-border p-5" data-testid="stat-pending-requests">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                <Timer className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingItems.length}</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </Card>

          <Card className="border-card-border p-5" data-testid="stat-total-orders">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </Card>
        </div>

        {activeIndicators.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4" data-testid="text-active-heading">Active Indicators</h2>
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
          </section>
        )}

        {pendingItems.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4" data-testid="text-pending-heading">Pending Access Requests</h2>
            <div className="space-y-3">
              {pendingItems.map((item) => (
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
                </Card>
              ))}
            </div>
          </section>
        )}

        <section>
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

                    {order.status === "rejected" && order.rejectionReason && (
                      <div className="border-b bg-red-500/5 px-5 py-3" data-testid={`rejection-reason-${order.id}`}>
                        <div className="flex items-start gap-2">
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">Reason for rejection</p>
                            <p className="mt-0.5 text-sm text-foreground">{order.rejectionReason}</p>
                          </div>
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
        </section>
      </motion.div>
    </div>
  );
}
