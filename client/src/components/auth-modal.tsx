import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, AtSign, Monitor, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, loginSchema } from "@shared/schema";
import type { SignupInput, LoginInput } from "@shared/schema";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";

type Step = "email" | "login" | "signup";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalOnSuccess, signup, login } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      mobileNumber: "",
      tradingViewUsername: "",
      password: "",
    },
  });

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep("email");
      setEmail("");
      setEmailError(null);
      signupForm.reset();
      loginForm.reset();
    }
  }, [isAuthModalOpen, signupForm, loginForm]);

  const handleEmailContinue = async () => {
    setEmailError(null);
    const trimmed = email.trim();
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!emailValid) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(trimmed)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.exists && data.hasPassword) {
        loginForm.reset({ email: trimmed, password: "" });
        setStep("login");
      } else if (data.exists && !data.hasPassword) {
        setEmailError(
          "This account predates the new authentication system. Please contact support to reset your password.",
        );
      } else {
        signupForm.reset({
          firstName: "",
          lastName: "",
          username: "",
          email: trimmed,
          mobileNumber: "",
          tradingViewUsername: "",
          password: "",
        });
        setStep("signup");
      }
    } catch {
      setEmailError("Could not check email. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const onSignup = async (data: SignupInput) => {
    setIsSubmitting(true);
    try {
      const result = await signup(data);
      toast({
        title: "Account created",
        description: `Welcome, ${result.user.firstName}! Your account has been created.`,
      });
      closeAuthModal();
      authModalOnSuccess?.();
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onLogin = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      const result = await login(data);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${result.user.firstName} ${result.user.lastName}`,
      });
      closeAuthModal();
      authModalOnSuccess?.();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const signupFields = [
    { name: "firstName" as const, label: "First Name", placeholder: "John", icon: User, type: "text" },
    { name: "lastName" as const, label: "Last Name", placeholder: "Doe", icon: User, type: "text" },
    { name: "username" as const, label: "Username", placeholder: "johndoe", icon: AtSign, type: "text" },
    { name: "mobileNumber" as const, label: "Mobile Number", placeholder: "+1 234 567 8901", icon: Phone, type: "tel" },
    { name: "tradingViewUsername" as const, label: "TradingView Username", placeholder: "Your TradingView handle", icon: Monitor, type: "text" },
  ];

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="auth-modal">
        <DialogHeader>
          <DialogTitle className="text-xl" data-testid="text-auth-title">
            {step === "email" && "Sign In or Sign Up"}
            {step === "login" && "Welcome Back"}
            {step === "signup" && "Create Your Account"}
          </DialogTitle>
          <DialogDescription>
            {step === "email" && "Enter your email to continue."}
            {step === "login" && "Enter your password to log in."}
            {step === "signup" && "Fill in your details and choose a password."}
          </DialogDescription>
        </DialogHeader>

        {step === "email" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEmailContinue();
                  }}
                  data-testid="input-auth-email"
                  autoFocus
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive" data-testid="text-email-error">{emailError}</p>
              )}
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={emailLoading}
              onClick={handleEmailContinue}
              data-testid="button-auth-continue"
            >
              {emailLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        )}

        {step === "login" && (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div className="rounded-md bg-muted px-3 py-2 text-sm flex items-center justify-between">
                <span data-testid="text-login-email">{loginForm.getValues("email")}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("email")}
                  data-testid="button-change-email"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" /> Change
                </Button>
              </div>

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="Your password"
                          className="pl-10"
                          autoFocus
                          data-testid="input-auth-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-auth-login"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>
          </Form>
        )}

        {step === "signup" && (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <div className="rounded-md bg-muted px-3 py-2 text-sm flex items-center justify-between">
                <span data-testid="text-signup-email">{signupForm.getValues("email")}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("email")}
                  data-testid="button-change-email"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" /> Change
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {signupFields.map((field) => (
                  <FormField
                    key={field.name}
                    control={signupForm.control}
                    name={field.name}
                    render={({ field: fieldProps }) => (
                      <FormItem className={field.name === "tradingViewUsername" ? "sm:col-span-2" : ""}>
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <field.icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...fieldProps}
                              type={field.type}
                              placeholder={field.placeholder}
                              className="pl-10"
                              data-testid={`input-auth-${field.name}`}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="At least 8 characters"
                            className="pl-10"
                            data-testid="input-auth-password"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-auth-signup"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
