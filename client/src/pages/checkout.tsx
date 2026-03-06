import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, User, Mail, Phone, AtSign, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRegistrationSchema } from "@shared/schema";
import type { InsertRegistration } from "@shared/schema";
import { useCart } from "@/components/cart-provider";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [orderComplete, setOrderComplete] = useState(false);

  const form = useForm<InsertRegistration>({
    resolver: zodResolver(insertRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      mobileNumber: "",
      tradingViewUsername: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertRegistration) => {
      const regRes = await apiRequest("POST", "/api/registrations", data);
      const registration = await regRes.json();

      const orderData = {
        registrationId: registration.id,
        status: "pending",
        totalAmount: totalPrice.toFixed(2),
        items: items.map((item) => ({
          indicatorId: item.indicatorId,
          duration: item.duration,
          price: item.isTrial ? "0" : (parseFloat(item.price) * item.duration).toFixed(2),
          isTrial: item.isTrial,
        })),
      };

      await apiRequest("POST", "/api/orders", orderData);
      return registration;
    },
    onSuccess: () => {
      clearCart();
      setOrderComplete(true);
      toast({ title: "Order submitted", description: "Your order has been placed successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (items.length === 0 && !orderComplete) {
    navigate("/cart");
    return null;
  }

  if (orderComplete) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-bold" data-testid="text-order-complete">Order Submitted</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Your order has been received. You will receive a confirmation email with instructions to access your indicators on TradingView.
          </p>
          <Link href="/">
            <Button className="mt-8" size="lg" data-testid="button-back-home">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const formFields = [
    { name: "firstName" as const, label: "First Name", placeholder: "John", icon: User, type: "text" },
    { name: "lastName" as const, label: "Last Name", placeholder: "Doe", icon: User, type: "text" },
    { name: "username" as const, label: "Username", placeholder: "johndoe", icon: AtSign, type: "text" },
    { name: "email" as const, label: "Email Address", placeholder: "john@example.com", icon: Mail, type: "email" },
    { name: "mobileNumber" as const, label: "Mobile Number", placeholder: "+1 234 567 8901", icon: Phone, type: "tel" },
    { name: "tradingViewUsername" as const, label: "TradingView Username", placeholder: "Your TradingView handle", icon: Monitor, type: "text" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/cart">
        <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-cart">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
        </Button>
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" data-testid="text-checkout-title">
          Complete Your Order
        </h1>
        <p className="mt-2 text-muted-foreground">
          Fill in your details below to get access to your selected indicators.
        </p>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <Card className="border-card-border p-6 sm:p-8" data-testid="registration-form">
              <h2 className="text-lg font-semibold mb-6">Your Information</h2>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {formFields.map((field) => (
                      <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({ field: fieldProps }) => (
                          <FormItem className={field.name === "email" || field.name === "tradingViewUsername" ? "sm:col-span-2" : ""}>
                            <FormLabel>{field.label}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <field.icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  {...fieldProps}
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  className="pl-10"
                                  data-testid={`input-${field.name}`}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-order"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Order"}
                  </Button>
                </form>
              </Form>
            </Card>
          </div>

          <div className="lg:w-80">
            <Card className="sticky top-24 border-card-border p-6" data-testid="order-summary">
              <h3 className="text-base font-semibold">Order Summary</h3>
              <Separator className="my-4" />

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.indicatorId} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate mr-2 font-medium">{item.name}</span>
                      <span className="shrink-0">
                        {item.isTrial ? (
                          <Badge variant="secondary" className="text-xs">Trial</Badge>
                        ) : (
                          `$${(parseFloat(item.price) * item.duration).toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {!item.isTrial && (
                      <p className="text-xs text-muted-foreground">
                        {item.duration} month{item.duration !== 1 ? "s" : ""} x ${item.price}/mo
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold" data-testid="text-checkout-total">${totalPrice.toFixed(2)}</span>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
