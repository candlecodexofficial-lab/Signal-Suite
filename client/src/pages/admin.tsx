import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  TrendingUp,
  Calendar,
  CreditCard,
  Package,
  User as UserIcon,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

interface AdminOrderItem {
  id: number;
  orderId: number;
  indicatorId: number;
  duration: number;
  price: string;
  isTrial: boolean | null;
  version: string | null;
  indicatorName: string;
  indicatorSlug: string;
  indicatorTier: string;
  daysRemaining: number | null;
  accessStatus: "pending" | "active" | "expired" | "rejected";
}

interface AdminOrder {
  id: number;
  userId: number;
  status: string;
  totalAmount: string;
  rejectionReason: string | null;
  createdAt: string;
  approvedAt: string | null;
  items: AdminOrderItem[];
}

interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobileNumber: string;
  tradingViewUsername: string;
  isAdmin: boolean | null;
  createdAt: string;
  orders: AdminOrder[];
  hasActivePlan: boolean;
  planType: "paid" | "trial" | "free" | "none";
  daysRemaining: number | null;
  totalOrders: number;
  totalSpent: number;
}

const planBadge: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid Plan", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  trial: { label: "On Trial", className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  free: { label: "Free Plan", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  none: { label: "No Active Plan", className: "bg-muted text-muted-foreground border-border" },
};

const orderStatusBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2; label: string }> = {
  pending: { variant: "secondary", icon: Clock, label: "Awaiting Approval" },
  approved: { variant: "default", icon: CheckCircle2, label: "Approved" },
  rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [rejectOrder, setRejectOrder] = useState<{ id: number; userName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: users, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user?.isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", `/api/admin/orders/${orderId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Order approved", description: "User access has been granted." });
    },
    onError: (e: Error) => {
      toast({ variant: "destructive", title: "Failed to approve", description: e.message });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number; reason: string }) => {
      const res = await apiRequest("POST", `/api/admin/orders/${orderId}/reject`, { reason });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setRejectOrder(null);
      setRejectReason("");
      toast({ title: "Order rejected", description: "The user will see your reason on their dashboard." });
    },
    onError: (e: Error) => {
      toast({ variant: "destructive", title: "Failed to reject", description: e.message });
    },
  });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Sign in required</h2>
        <p className="mt-1 text-muted-foreground">Please sign in to access the admin panel.</p>
        <Button className="mt-6" onClick={() => navigate("/")} data-testid="button-admin-go-home">Go Home</Button>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6" data-testid="admin-denied">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-2xl font-bold">Access denied</h2>
        <p className="mt-1 text-muted-foreground">You don't have permission to view this page.</p>
        <Button className="mt-6" onClick={() => navigate("/dashboard")} data-testid="button-admin-back-dashboard">Back to Dashboard</Button>
      </div>
    );
  }

  const filteredUsers = (users || []).filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.tradingViewUsername.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  });

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.hasActivePlan).length || 0;
  const pendingOrdersCount =
    users?.reduce((sum, u) => sum + u.orders.filter((o) => o.status === "pending").length, 0) || 0;
  const totalRevenue =
    users?.reduce((sum, u) => sum + u.totalSpent, 0) || 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-admin-title">
                Admin Panel
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Approve or reject orders and manage users.
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
            <ShieldCheck className="mr-1 h-3 w-3" /> Admin: {user.email}
          </Badge>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={UserIcon} label="Total Users" value={String(totalUsers)} testId="stat-total-users" />
          <StatCard icon={TrendingUp} label="Active Plans" value={String(activeUsers)} testId="stat-active-users" tone="emerald" />
          <StatCard icon={Clock} label="Pending Orders" value={String(pendingOrdersCount)} testId="stat-pending-orders" tone="amber" />
          <StatCard icon={CreditCard} label="Approved Revenue" value={formatINR(totalRevenue)} testId="stat-revenue" />
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, username, TradingView ID, or user ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-card-border p-10 text-center" data-testid="empty-users">
            <UserIcon className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {users && users.length > 0 ? "No users match your search." : "No users registered yet."}
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            {filteredUsers.map((u) => {
              const plan = planBadge[u.planType];
              return (
                <Card key={u.id} className="border-card-border overflow-hidden" data-testid={`admin-user-${u.id}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 px-5 py-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold" data-testid={`admin-user-name-${u.id}`}>
                          {u.firstName} {u.lastName}
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          ID #{u.id}
                        </Badge>
                        {u.isAdmin && (
                          <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20 text-primary">
                            <ShieldCheck className="mr-1 h-3 w-3" /> Admin
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-[10px] ${plan.className}`} data-testid={`admin-user-plan-${u.id}`}>
                          {plan.label}
                        </Badge>
                        {u.hasActivePlan && u.daysRemaining !== null && u.daysRemaining > 0 && (
                          <Badge variant="outline" className="text-[10px]" data-testid={`admin-user-days-${u.id}`}>
                            {u.daysRemaining}d remaining
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                    <DetailLine icon={Mail} label="Email" value={u.email} testId={`admin-user-email-${u.id}`} />
                    <DetailLine icon={Phone} label="Mobile" value={u.mobileNumber} testId={`admin-user-mobile-${u.id}`} />
                    <DetailLine icon={TrendingUp} label="TradingView ID" value={u.tradingViewUsername} testId={`admin-user-tv-${u.id}`} mono />
                    <DetailLine icon={Calendar} label="Joined" value={formatDate(u.createdAt)} testId={`admin-user-joined-${u.id}`} />
                    <DetailLine icon={Package} label="Total Orders" value={String(u.totalOrders)} testId={`admin-user-orders-count-${u.id}`} />
                    <DetailLine icon={CreditCard} label="Total Spent" value={formatINR(u.totalSpent)} testId={`admin-user-spent-${u.id}`} />
                  </div>

                  <Separator />

                  <div className="px-5 py-4">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Orders ({u.orders.length})
                    </h4>
                    {u.orders.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic" data-testid={`admin-no-orders-${u.id}`}>No orders yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {u.orders.map((order) => {
                          const meta = orderStatusBadge[order.status] || orderStatusBadge.pending;
                          const StatusIcon = meta.icon;
                          return (
                            <div key={order.id} className="rounded-md border border-card-border bg-background" data-testid={`admin-order-${order.id}`}>
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold" data-testid={`admin-order-id-${order.id}`}>
                                    Order #{order.id}
                                  </span>
                                  <Badge variant={meta.variant} className="text-[10px]" data-testid={`admin-order-status-${order.id}`}>
                                    <StatusIcon className="mr-1 h-3 w-3" /> {meta.label}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Placed {formatDate(order.createdAt)}
                                  </span>
                                  {order.approvedAt && (
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                      · Approved {formatDate(order.approvedAt)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold" data-testid={`admin-order-total-${order.id}`}>
                                    {formatINR(parseFloat(order.totalAmount))}
                                  </span>
                                  {order.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => approveMutation.mutate(order.id)}
                                        disabled={approveMutation.isPending}
                                        data-testid={`button-approve-${order.id}`}
                                      >
                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          setRejectOrder({ id: order.id, userName: `${u.firstName} ${u.lastName}` });
                                          setRejectReason("");
                                        }}
                                        data-testid={`button-reject-${order.id}`}
                                      >
                                        <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>

                              {order.status === "rejected" && order.rejectionReason && (
                                <div className="border-b bg-red-500/5 px-4 py-2.5" data-testid={`admin-rejection-${order.id}`}>
                                  <div className="flex items-start gap-2">
                                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
                                    <div>
                                      <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">Rejection reason</p>
                                      <p className="text-xs text-foreground">{order.rejectionReason}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="divide-y">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5" data-testid={`admin-order-item-${item.id}`}>
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <Link href={`/indicator/${item.indicatorSlug}`} className="text-sm font-medium hover:underline">
                                          {item.indicatorName}
                                          <ExternalLink className="ml-1 inline h-3 w-3 opacity-60" />
                                        </Link>
                                        <Badge variant="outline" className="text-[10px]">
                                          {item.version === "strategy" ? "Strategy" : "Indicator"}
                                        </Badge>
                                        {item.isTrial && (
                                          <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                                            Trial
                                          </Badge>
                                        )}
                                        <Badge variant="outline" className={`text-[10px] ${item.indicatorTier === "free" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"}`}>
                                          {item.indicatorTier === "free" ? "Free Tier" : "Premium"}
                                        </Badge>
                                      </div>
                                      <p className="mt-0.5 text-xs text-muted-foreground">
                                        {item.isTrial
                                          ? "15-day trial"
                                          : `${item.duration} month${item.duration !== 1 ? "s" : ""}`}
                                        {item.daysRemaining !== null && item.accessStatus === "active" && (
                                          <> · <span className="text-emerald-600 dark:text-emerald-400">{item.daysRemaining}d remaining</span></>
                                        )}
                                        {item.accessStatus === "expired" && <> · <span className="text-red-600 dark:text-red-400">Expired</span></>}
                                      </p>
                                    </div>
                                    <span className="text-sm font-medium">
                                      {formatINR(parseFloat(item.price))}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>

      <Dialog open={!!rejectOrder} onOpenChange={(open) => { if (!open) { setRejectOrder(null); setRejectReason(""); } }}>
        <DialogContent data-testid="dialog-reject">
          <DialogHeader>
            <DialogTitle>Reject Order #{rejectOrder?.id}</DialogTitle>
            <DialogDescription>
              {rejectOrder ? `This reason will be visible to ${rejectOrder.userName} on their dashboard.` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="reject-reason-input" className="text-sm font-medium">Rejection reason</label>
            <Textarea
              id="reject-reason-input"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Payment not received, invalid TradingView username, etc."
              rows={4}
              data-testid="input-reject-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectOrder(null); setRejectReason(""); }} data-testid="button-cancel-reject">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectOrder && rejectReason.trim().length >= 3) {
                  rejectMutation.mutate({ orderId: rejectOrder.id, reason: rejectReason.trim() });
                }
              }}
              disabled={rejectReason.trim().length < 3 || rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              <XCircle className="mr-1.5 h-4 w-4" /> Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, testId, tone,
}: { icon: typeof UserIcon; label: string; value: string; testId: string; tone?: "emerald" | "amber" }) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      : tone === "amber"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "bg-primary/10 text-primary";
  return (
    <Card className="border-card-border p-4" data-testid={testId}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold leading-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function DetailLine({
  icon: Icon, label, value, testId, mono,
}: { icon: typeof UserIcon; label: string; value: string; testId?: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2" data-testid={testId}>
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`truncate text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
