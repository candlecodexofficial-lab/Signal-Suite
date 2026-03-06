import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IndicatorCard } from "@/components/indicator-card";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Indicator } from "@shared/schema";

const categories = ["All", "Trend Following", "Momentum", "Volume Analysis", "Volatility", "Smart Money", "Support/Resistance"];

export default function IndicatorsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: indicators, isLoading } = useQuery<Indicator[]>({
    queryKey: ["/api/indicators"],
  });

  const filtered = activeCategory === "All"
    ? indicators
    : indicators?.filter((i) => i.category === activeCategory);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" data-testid="text-indicators-title">
            Our Indicators
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Choose from our curated collection of high-performance indicators.
          </p>
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
    </div>
  );
}
