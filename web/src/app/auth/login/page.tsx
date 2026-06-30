"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Linkedin,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const otpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type LoginForm = z.infer<typeof loginSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: "", otp: "" },
  });

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    await login(data);
    setIsLoading(false);
  };

  const onOtpSubmit = async (_data: OtpForm) => {
    setIsLoading(true);
    const email = otpForm.getValues("email");
    const otpValue = otpForm.getValues("otp");
    try {
      const res = await api.post('/api/v1/auth/login/otp/verify', { email, otp: otpValue });
      if (res.data) {
        const { user, tokens } = res.data.data;
        useAuthStore.getState().login(user, tokens);
        router.push(user.profileCompleted ? "/dashboard" : "/profile/wizard");
      }
    } catch {
      // handled by api interceptor toast
    }
    setIsLoading(false);
  };

  const sendOtp = async () => {
    const email = otpForm.getValues("email");
    if (!email || !z.string().email().safeParse(email).success) {
      otpForm.setError("email", { message: "Please enter a valid email" });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/api/v1/auth/login/otp', { email });
      setOtpSent(true);
    } catch {
      // handled by api interceptor toast
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">IT</span>
            </div>
            <span className="font-bold text-xl">
              IT Connect <span className="text-primary">Matrimony</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to continue your journey
          </p>
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="pb-4">
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="password" className="flex-1">
                  <Lock className="h-4 w-4 mr-2" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="otp" className="flex-1">
                  <Smartphone className="h-4 w-4 mr-2" />
                  OTP Login
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="mt-4">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="you@company.com"
                              type="email"
                              icon={<Mail className="h-4 w-4" />}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              icon={<Lock className="h-4 w-4" />}
                              {...field}
                              suffix={
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-end">
                      <Link
                        href="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      size="lg"
                      loading={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="otp" className="mt-4">
                <Form {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={otpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="you@company.com"
                              type="email"
                              icon={<Mail className="h-4 w-4" />}
                              disabled={otpSent}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {otpSent && (
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>OTP</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {!otpSent ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        size="lg"
                        onClick={sendOtp}
                        loading={isLoading}
                      >
                        {isLoading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="w-full gap-2"
                        size="lg"
                        loading={isLoading}
                      >
                        {isLoading ? "Verifying..." : "Verify & Sign In"}
                        {!isLoading && <ArrowRight className="h-4 w-4" />}
                      </Button>
                    )}

                    {otpSent && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="w-full"
                        onClick={() => setOtpSent(false)}
                      >
                        Change email
                      </Button>
                    )}
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardHeader>

          <CardContent className="pb-4">
            <div className="relative my-2">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button variant="outline" className="gap-2" size="lg" onClick={() => {}}>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="gap-2" size="lg" onClick={() => {}}>
                <Linkedin className="h-5 w-5 text-blue-600" />
                LinkedIn
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-medium hover:underline"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
