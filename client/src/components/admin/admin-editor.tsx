import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings2, Plus, Search, Trash2, Save, X, IndianRupee, Tag, Crown, Gift,
  Edit3, Copy as CopyIcon, AlertTriangle,
} from "lucide-react";
import type { Indicator, InsertIndicator } from "@shared/schema";

type Tier = "free" | "premium";

interface FormState extends Omit<InsertIndicator, "trialDays"> {
  trialDays: number;
}

const EMPTY: FormState = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  tier: "premium",
  price: "9000",
  videoUrl: "",
  imageUrl: "",
  features: [],
  winRate: "",
  avgReturn: "",
  totalTrades: "",
  trialDays: 15,
  markets: [],
  bestTimeframes: [],
  signalLogic: "",
  entryConditions: "",
  exitConditions: "",
  stopLossStrategy: "",
  targetStrategy: "",
  recommendedSettings: "",
  nonRepainting: false,
  faqs: [],
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function arrToText(arr: string[] | null | undefined) {
  return (arr || []).join("\n");
}
function textToArr(t: string): string[] {
  return t.split("\n").map((x) => x.trim()).filter(Boolean);
}

export function AdminEditor() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | Tier>("all");
  const [editing, setEditing] = useState<Indicator | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Indicator | null>(null);

  const { data: indicators, isLoading } = useQuery<Indicator[]>({
    queryKey: ["/api/indicators"],
  });

  const filtered = useMemo(() => {
    if (!indicators) return [];
    const q = search.trim().toLowerCase();
    return indicators.filter((i) => {
      if (tierFilter !== "all" && i.tier !== tierFilter) return false;
      if (!q) return true;
      return i.name.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    });
  }, [indicators, search, tierFilter]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/indicators/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      setDeleteTarget(null);
      toast({ title: "Indicator deleted" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Delete failed", description: e.message }),
  });

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold tracking-tight sm:text-xl" data-testid="text-editor-title">Editor</h1>
            </div>
            <p className="text-xs text-muted-foreground">Manage indicators, pricing, and content shown across the marketplace.</p>
          </div>
          <Button onClick={() => { setCreating(true); setEditing(null); }} data-testid="button-create-indicator">
            <Plus className="mr-1.5 h-4 w-4" /> New Indicator
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-card-border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{filtered.length} of {indicators?.length || 0}</Badge>
              <Select value={tierFilter} onValueChange={(v) => setTierFilter(v as any)}>
                <SelectTrigger className="h-8 w-32 text-xs" data-testid="select-tier-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free Only</SelectItem>
                  <SelectItem value="premium">Premium Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search indicators…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-sm" data-testid="input-search-indicators"
              />
            </div>
          </div>
        </Card>

        {/* List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-card-border p-12 text-center" data-testid="empty-indicators">
            <Settings2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {indicators && indicators.length > 0 ? "No indicators match your filters." : "No indicators yet. Create your first one."}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {filtered.map((ind) => (
              <Card
                key={ind.id}
                className="border-card-border p-4 hover-elevate"
                data-testid={`card-indicator-${ind.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                    ind.tier === "free"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}>
                    {ind.tier === "free" ? <Gift className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-bold truncate" data-testid={`indicator-name-${ind.id}`}>{ind.name}</h3>
                      <Badge variant="outline" className={`text-[10px] ${
                        ind.tier === "free"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}>
                        {ind.tier === "free" ? "Free" : "Premium"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{ind.category}</Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground font-mono truncate">/{ind.slug}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{ind.shortDescription}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <IndianRupee className="h-3 w-3" /> {ind.tier === "free" ? "Free" : `${ind.price}/mo`}
                      </span>
                      {ind.winRate && <span className="text-muted-foreground">Win {ind.winRate}</span>}
                      {ind.avgReturn && <span className="text-muted-foreground">Return {ind.avgReturn}</span>}
                      {ind.markets && ind.markets.length > 0 && (
                        <span className="text-muted-foreground">· {ind.markets.length} markets</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t pt-2.5">
                  <Button size="sm" variant="outline" className="h-7 flex-1 text-xs"
                    onClick={() => { setEditing(ind); setCreating(false); }}
                    data-testid={`button-edit-${ind.id}`}
                  >
                    <Edit3 className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs"
                    onClick={() => {
                      const copy = { ...ind, id: undefined as any, name: `${ind.name} (Copy)`, slug: `${ind.slug}-copy` };
                      setEditing(copy as any); setCreating(true);
                    }}
                    data-testid={`button-duplicate-${ind.id}`}
                  >
                    <CopyIcon className="mr-1 h-3 w-3" /> Duplicate
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 dark:text-red-400 hover:text-red-700"
                    onClick={() => setDeleteTarget(ind)}
                    data-testid={`button-delete-${ind.id}`}
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Dialog */}
      <IndicatorFormDialog
        open={creating || !!editing}
        initial={editing}
        isCreate={creating}
        onClose={() => { setEditing(null); setCreating(false); }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent data-testid="dialog-delete">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" /> Delete Indicator
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>?
              This action cannot be undone. Existing user orders for this indicator will remain in history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}

function IndicatorFormDialog({
  open, initial, isCreate, onClose,
}: { open: boolean; initial: Indicator | null; isCreate: boolean; onClose: () => void; }) {
  const { toast } = useToast();
  const buildState = (): FormState => {
    if (!initial) return { ...EMPTY };
    return {
      name: initial.name,
      slug: initial.slug,
      shortDescription: initial.shortDescription,
      description: initial.description,
      category: initial.category,
      tier: initial.tier,
      price: initial.price,
      videoUrl: initial.videoUrl || "",
      imageUrl: initial.imageUrl || "",
      features: initial.features || [],
      winRate: initial.winRate || "",
      avgReturn: initial.avgReturn || "",
      totalTrades: initial.totalTrades || "",
      trialDays: initial.trialDays ?? 15,
      markets: initial.markets || [],
      bestTimeframes: initial.bestTimeframes || [],
      signalLogic: initial.signalLogic || "",
      entryConditions: initial.entryConditions || "",
      exitConditions: initial.exitConditions || "",
      stopLossStrategy: initial.stopLossStrategy || "",
      targetStrategy: initial.targetStrategy || "",
      recommendedSettings: initial.recommendedSettings || "",
    };
  };

  const [form, setForm] = useState<FormState>(buildState);
  const [featuresText, setFeaturesText] = useState(arrToText(initial?.features));
  const [marketsText, setMarketsText] = useState(arrToText(initial?.markets));
  const [timeframesText, setTimeframesText] = useState(arrToText(initial?.bestTimeframes));

  // Reset state when dialog opens with different indicator
  useMemo(() => {
    if (open) {
      const next = buildState();
      setForm(next);
      setFeaturesText(arrToText(next.features));
      setMarketsText(arrToText(next.markets));
      setTimeframesText(arrToText(next.bestTimeframes));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: InsertIndicator = {
        ...form,
        features: textToArr(featuresText),
        markets: textToArr(marketsText),
        bestTimeframes: textToArr(timeframesText),
        videoUrl: form.videoUrl || null,
        imageUrl: form.imageUrl || null,
        winRate: form.winRate || null,
        avgReturn: form.avgReturn || null,
        totalTrades: form.totalTrades || null,
        signalLogic: form.signalLogic || null,
        entryConditions: form.entryConditions || null,
        exitConditions: form.exitConditions || null,
        stopLossStrategy: form.stopLossStrategy || null,
        targetStrategy: form.targetStrategy || null,
        recommendedSettings: form.recommendedSettings || null,
      };
      if (isCreate || !initial?.id) {
        const res = await apiRequest("POST", "/api/admin/indicators", payload);
        return res.json();
      } else {
        const res = await apiRequest("PATCH", `/api/admin/indicators/${initial.id}`, payload);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({
        title: isCreate ? "Indicator created" : "Indicator updated",
        description: `${form.name} has been saved.`,
      });
      onClose();
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Save failed", description: e.message }),
  });

  const validationError = useMemo(() => {
    if (!form.name.trim()) return "Name is required";
    if (!form.slug.trim()) return "Slug is required";
    if (!/^[a-z0-9-]+$/.test(form.slug)) return "Slug must be lowercase letters, numbers, and dashes only";
    if (!form.shortDescription.trim()) return "Short description is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.category.trim()) return "Category is required";
    if (!form.price.trim()) return "Price is required";
    if (textToArr(featuresText).length === 0) return "At least one feature is required";
    return null;
  }, [form, featuresText]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" data-testid="dialog-edit-indicator">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreate ? <Plus className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
            {isCreate ? "Create Indicator" : `Edit: ${initial?.name}`}
          </DialogTitle>
          <DialogDescription>
            All fields are saved to the database and reflect immediately on the marketplace.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-3 -mr-3">
          <div className="space-y-5 pb-2">
            {/* Section: Basic */}
            <Section title="Basic Info" icon={Tag}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Name *">
                  <Input value={form.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      update("name", val);
                      if (isCreate && !form.slug) update("slug", slugify(val));
                    }}
                    placeholder="Smart Trend Pro" data-testid="input-name"
                  />
                </Field>
                <Field label="Slug *" hint="URL identifier (lowercase, dashes)">
                  <div className="flex gap-1.5">
                    <Input value={form.slug}
                      onChange={(e) => update("slug", slugify(e.target.value))}
                      placeholder="smart-trend-pro" className="font-mono text-xs" data-testid="input-slug"
                    />
                    <Button type="button" variant="outline" size="sm"
                      onClick={() => update("slug", slugify(form.name))}
                      className="shrink-0" data-testid="button-regen-slug"
                    >Auto</Button>
                  </div>
                </Field>
                <Field label="Category *">
                  <Input value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="Trend Following / Scalping / Reversal" data-testid="input-category"
                  />
                </Field>
                <Field label="Tier *">
                  <Select value={form.tier} onValueChange={(v) => update("tier", v as Tier)}>
                    <SelectTrigger data-testid="select-tier"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Short Description *" hint="Shown on cards (1-2 sentences)">
                <Textarea value={form.shortDescription}
                  onChange={(e) => update("shortDescription", e.target.value)}
                  rows={2} placeholder="Brief tagline shown in marketplace cards" data-testid="input-short-desc"
                />
              </Field>
              <Field label="Description *" hint="Full marketing description">
                <Textarea value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4} placeholder="Detailed description shown on the indicator detail page" data-testid="input-desc"
                />
              </Field>
            </Section>

            {/* Section: Pricing */}
            <Section title="Pricing & Trial" icon={IndianRupee}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Price (₹) *" hint={form.tier === "free" ? "Set 0 for free indicators" : "Monthly price in INR"}>
                  <Input type="number" min="0" value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="9000" data-testid="input-price"
                  />
                </Field>
                <Field label="Trial Days" hint="Premium only — typically 15">
                  <Input type="number" min="0" value={form.trialDays}
                    onChange={(e) => update("trialDays", parseInt(e.target.value) || 0)}
                    data-testid="input-trial-days"
                  />
                </Field>
              </div>
            </Section>

            {/* Section: Performance */}
            <Section title="Performance Stats">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Win Rate" hint="e.g. 78%">
                  <Input value={form.winRate || ""}
                    onChange={(e) => update("winRate", e.target.value)}
                    placeholder="78%" data-testid="input-win-rate"
                  />
                </Field>
                <Field label="Avg Return" hint="e.g. +24%">
                  <Input value={form.avgReturn || ""}
                    onChange={(e) => update("avgReturn", e.target.value)}
                    placeholder="+24%" data-testid="input-avg-return"
                  />
                </Field>
                <Field label="Total Trades" hint="e.g. 1,200">
                  <Input value={form.totalTrades || ""}
                    onChange={(e) => update("totalTrades", e.target.value)}
                    placeholder="1,200" data-testid="input-total-trades"
                  />
                </Field>
              </div>
            </Section>

            {/* Section: Media */}
            <Section title="Media">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Image URL">
                  <Input value={form.imageUrl || ""}
                    onChange={(e) => update("imageUrl", e.target.value)}
                    placeholder="https://…" data-testid="input-image-url"
                  />
                </Field>
                <Field label="Video URL" hint="YouTube / Vimeo">
                  <Input value={form.videoUrl || ""}
                    onChange={(e) => update("videoUrl", e.target.value)}
                    placeholder="https://youtube.com/…" data-testid="input-video-url"
                  />
                </Field>
              </div>
            </Section>

            {/* Section: Lists */}
            <Section title="Features & Markets">
              <Field label="Features *" hint="One per line">
                <Textarea value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={5} placeholder={"Real-time signals\nMulti-timeframe analysis\nNo repaint"}
                  className="font-mono text-xs" data-testid="input-features"
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Markets" hint="One per line (Forex, Crypto, Stocks…)">
                  <Textarea value={marketsText}
                    onChange={(e) => setMarketsText(e.target.value)}
                    rows={4} placeholder={"Forex\nCrypto\nIndian Stocks"}
                    className="font-mono text-xs" data-testid="input-markets"
                  />
                </Field>
                <Field label="Best Timeframes" hint="One per line (5m, 15m, 1h…)">
                  <Textarea value={timeframesText}
                    onChange={(e) => setTimeframesText(e.target.value)}
                    rows={4} placeholder={"15m\n1h\n4h"}
                    className="font-mono text-xs" data-testid="input-timeframes"
                  />
                </Field>
              </div>
            </Section>

            {/* Section: Strategy */}
            <Section title="Strategy Details">
              <Field label="Signal Logic">
                <Textarea value={form.signalLogic || ""}
                  onChange={(e) => update("signalLogic", e.target.value)}
                  rows={3} placeholder="How signals are generated…" data-testid="input-signal-logic"
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Entry Conditions">
                  <Textarea value={form.entryConditions || ""}
                    onChange={(e) => update("entryConditions", e.target.value)}
                    rows={3} data-testid="input-entry-conditions"
                  />
                </Field>
                <Field label="Exit Conditions">
                  <Textarea value={form.exitConditions || ""}
                    onChange={(e) => update("exitConditions", e.target.value)}
                    rows={3} data-testid="input-exit-conditions"
                  />
                </Field>
                <Field label="Stop Loss Strategy">
                  <Textarea value={form.stopLossStrategy || ""}
                    onChange={(e) => update("stopLossStrategy", e.target.value)}
                    rows={3} data-testid="input-stop-loss"
                  />
                </Field>
                <Field label="Target Strategy">
                  <Textarea value={form.targetStrategy || ""}
                    onChange={(e) => update("targetStrategy", e.target.value)}
                    rows={3} data-testid="input-target"
                  />
                </Field>
              </div>
              <Field label="Recommended Settings">
                <Textarea value={form.recommendedSettings || ""}
                  onChange={(e) => update("recommendedSettings", e.target.value)}
                  rows={3} placeholder="Suggested parameters / settings for traders"
                  data-testid="input-settings"
                />
              </Field>
            </Section>
          </div>
        </ScrollArea>

        {validationError && (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400" data-testid="validation-error">
            <AlertTriangle className="h-3.5 w-3.5" /> {validationError}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-edit">
            <X className="mr-1.5 h-4 w-4" /> Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()}
            disabled={!!validationError || saveMutation.isPending}
            data-testid="button-save-indicator"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {saveMutation.isPending ? "Saving…" : isCreate ? "Create Indicator" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: typeof Tag; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-primary" />}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      </div>
      <div className="space-y-3 rounded-md border bg-muted/20 p-3">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
