"use client";

import Link from "next/link";
import { Building2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Choose how you want to use JobPortal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Link href="/register/candidate">
          <Button
            variant="outline"
            className="flex h-auto w-full items-center gap-4 p-6"
          >
            <User className="h-8 w-8 text-primary" />
            <div className="text-left">
              <div className="font-semibold">I&apos;m looking for a job</div>
              <div className="text-sm text-muted-foreground">
                Browse jobs, apply, and get matched with opportunities
              </div>
            </div>
          </Button>
        </Link>
        <Link href="/register/company">
          <Button
            variant="outline"
            className="flex h-auto w-full items-center gap-4 p-6 mt-3"
          >
            <Building2 className="h-8 w-8 text-primary" />
            <div className="text-left">
              <div className="font-semibold">I&apos;m hiring</div>
              <div className="text-sm text-muted-foreground">
                Post jobs, find candidates, and manage applications
              </div>
            </div>
          </Button>
        </Link>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
