import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldAlert,
  Package,
  Mail,
  Phone,
  User as UserIcon,
  Crown,
} from "lucide-react";
import Forbidden from "./forbidden";

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
  indicatorCategory: string;
}

interface AdminOrderBuyer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  tradingViewUsername: string;
}

interface AdminOrder {
  id: number;
  userId: number;
  status: string;
  totalAmount: string;
  createdAt: string;
  approvedAt: string | null;
  buyer: AdminOrderBuyer | null;
  items: AdminOrderItem[];
  itemCount: number;
}

const statusFilters = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting Approval" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
        <XCircle className="mr-1 h-3 w-3" /> Rejected
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
      <Clock className="mr-1 h-3 w-3" /> Pending
    </Badge>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatINR(amount: string | number) {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function AdminOrders() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const queryKey = useMemo(
    () => ["/api/admin/orders", { status: statusFilter, q: search }],
    [statusFilter, search]
  );

  const { data: orders, isLoading, error } = useQuery<AdminOrder[]>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`/api/admin/orders?${params.toString()}`, {
        credentials: "include",
      });
      if (res.status === 403) throw new Error("forbidden");
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
    enabled: !!user?.isAdmin,
    retry: false,
  });

  if (error && (error as Error).message === "forbidden") {
    return <Forbidden />;
  }

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    const arr = [...orders];
    arr.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount-desc":
          return parseFloat(b.totalAmount) - parseFloat(a.totalAmount);
        case "amount-asc":
          return parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
        case "date-desc":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return arr;
  }, [orders, sortBy]);

  const selectedOrder = sortedOrders.find((o) => o.id === selectedOrderId) || null;

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("POST", `/api/admin/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Order updated",
        description: `Order #${vars.id} is now ${vars.status}.`,
      });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.message || "Could not update order.",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Forbidden />;
  }

  const totalCount = orders?.length || 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-admin-title">
              Admin · Orders
            </h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Review buyer orders and approve, reject, or revoke access.
          </p>
        </div>
        <Badge variant="secondary" data-testid="badge-order-count">
          {totalCount} order{totalCount === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={statusFilter === f.key ? "default" : "outline"}
              onClick={() => setStatusFilter(f.key)}
              data-testid={`filter-${f.key}`}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email, name, or TradingView username"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="amount-desc">Amount (high to low)</SelectItem>
              <SelectItem value="amount-asc">Amount (low to high)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <Card className="border-card-border p-10 text-center" data-testid="empty-orders">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-medium">No orders match your filters</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try changing the status filter or clearing your search.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="border-card-border p-4 hover-elevate cursor-pointer"
              onClick={() => setSelectedOrderId(order.id)}
              data-testid={`admin-order-${order.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold" data-testid={`admin-order-id-${order.id}`}>
                        Order #{order.id}
                      </span>
                      <StatusBadge status={order.status} />
                      <Badge variant="outline" className="text-xs">
                        {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground truncate" data-testid={`admin-order-buyer-${order.id}`}>
                      {order.buyer
                        ? `${order.buyer.firstName} ${order.buyer.lastName} · ${order.buyer.email}`
                        : "Unknown buyer"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground" data-testid={`admin-order-date-${order.id}`}>
                    {formatDate(order.createdAt)}
                  </span>
                  <span className="font-semibold" data-testid={`admin-order-total-${order.id}`}>
                    {formatINR(order.totalAmount)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto" data-testid="sheet-order-detail">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  Order #{selectedOrder.id}
                  <StatusBadge status={selectedOrder.status} />
                </SheetTitle>
                <SheetDescription>
                  Placed {formatDate(selectedOrder.createdAt)}
                  {selectedOrder.approvedAt &&
                    ` · Approved ${formatDate(selectedOrder.approvedAt)}`}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Buyer
                  </h3>
                  {selectedOrder.buyer ? (
                    <Card className="border-card-border p-4 space-y-2 text-sm" data-testid="buyer-info">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {selectedOrder.buyer.firstName} {selectedOrder.buyer.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="buyer-email">{selectedOrder.buyer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span data-testid="buyer-mobile">{selectedOrder.buyer.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">TradingView:</span>
                        <span className="font-medium" data-testid="buyer-tv">
                          {selectedOrder.buyer.tradingViewUsername}
                        </span>
                      </div>
                    </Card>
                  ) : (
                    <p className="text-sm text-muted-foreground">Buyer info unavailable.</p>
                  )}
                </section>

                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    Items
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => {
                      const lineTotal = parseFloat(item.price);
                      const unitPrice = item.isTrial
                        ? lineTotal
                        : item.duration > 0
                        ? lineTotal / item.duration
                        : lineTotal;
                      return (
                        <Card key={item.id} className="border-card-border p-3" data-testid={`detail-item-${item.id}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{item.indicatorName}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.indicatorCategory} · {item.version === "strategy" ? "Strategy" : "Indicator"}
                                {" · "}
                                {item.isTrial
                                  ? "15-Day Trial"
                                  : `${item.duration} month${item.duration !== 1 ? "s" : ""}`}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold" data-testid={`detail-line-total-${item.id}`}>
                                {formatINR(lineTotal)}
                              </p>
                              <p className="text-[11px] text-muted-foreground" data-testid={`detail-unit-price-${item.id}`}>
                                {item.isTrial
                                  ? "Trial price"
                                  : `${formatINR(unitPrice)} × ${item.duration}`}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total</span>
                    <span className="font-bold" data-testid="detail-total">
                      {formatINR(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </section>

                <section className="flex flex-wrap gap-2 pt-2">
                  {selectedOrder.status === "pending" && (
                    <>
                      <Button
                        onClick={() =>
                          updateStatus.mutate({ id: selectedOrder.id, status: "approved" })
                        }
                        disabled={updateStatus.isPending}
                        data-testid="button-approve"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          updateStatus.mutate({ id: selectedOrder.id, status: "rejected" })
                        }
                        disabled={updateStatus.isPending}
                        data-testid="button-reject"
                      >
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === "approved" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateStatus.mutate({ id: selectedOrder.id, status: "pending" })
                      }
                      disabled={updateStatus.isPending}
                      data-testid="button-revoke"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Revoke (back to Pending)
                    </Button>
                  )}
                  {selectedOrder.status === "rejected" && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateStatus.mutate({ id: selectedOrder.id, status: "pending" })
                      }
                      disabled={updateStatus.isPending}
                      data-testid="button-reopen"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" /> Re-open
                    </Button>
                  )}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
