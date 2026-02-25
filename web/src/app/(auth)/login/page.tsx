"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useLogin } from "@/hooks/use-auth";

function LoginForm() {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Login failed. Please check your credentials.";
        toast.error(message);
      },
    });
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
          </Button>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
