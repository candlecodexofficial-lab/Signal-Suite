import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/components/cart-provider";
import { Navbar } from "@/components/navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import IndicatorsPage from "@/pages/indicators";
import IndicatorDetail from "@/pages/indicator-detail";
import CartPage from "@/pages/cart";
import Checkout from "@/pages/checkout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/indicators" component={IndicatorsPage} />
      <Route path="/indicator/:slug" component={IndicatorDetail} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <Router />
          </div>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
