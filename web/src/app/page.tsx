import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Building2,
  Search,
  Shield,
  Users,
  Upload,
  Sparkles,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description:
      "Semantic search goes beyond keywords to understand skills and experience, matching candidates to the right roles.",
  },
  {
    icon: Search,
    title: "Smart Job Search",
    description:
      "Upload your resume and let AI find the most relevant opportunities with ranked match percentages.",
  },
  {
    icon: Users,
    title: "Auto-Ranked Candidates",
    description:
      "Companies see applicants automatically ranked by how well their resume matches the job description.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Enterprise-grade security with role-based access control, encrypted data, and secure file storage.",
  },
];

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Create Your Profile",
    description: "Sign up and upload your resume. Our AI parses and understands your skills and experience.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "AI Matches You",
    description: "Our semantic engine finds jobs that truly fit your profile, not just keyword matches.",
  },
  {
    icon: CheckCircle2,
    number: "03",
    title: "Get Hired",
    description: "Apply with one click. Companies see your match score and fast-track top candidates.",
  },
];

const stats = [
  { label: "AI Match Accuracy", value: "95%", icon: TrendingUp },
  { label: "Active Jobs", value: "500+", icon: Briefcase },
  { label: "Companies Hiring", value: "200+", icon: Building2 },
  { label: "Fast Shortlisting", value: "10x", icon: Zap },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary/5 py-24 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Matching Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Find Your Perfect
              <span className="text-primary block mt-2">Career Match</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Upload your resume and let our AI find the best opportunities.
              Companies get auto-ranked candidates with match scores — hiring made smarter.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="rounded-full px-8 h-12 text-base" asChild>
                <Link href="/jobs">
                  Find Jobs <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base" asChild>
                <Link href="/register/company">
                  <Building2 className="mr-2 h-4 w-4" />
                  Post a Job
                </Link>
              </Button>
            </div>

            {/* Stats Row */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center gap-1 rounded-2xl bg-background border p-4">
                  <stat.icon className="h-5 w-5 text-primary mb-1" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Three simple steps to your next career move
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Why JobPortal?</h2>
              <p className="mt-4 text-muted-foreground">
                Powered by cutting-edge AI to make hiring smarter and job
                searching easier
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-primary py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">Ready to Get Started?</h2>
            <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
              Whether you&apos;re looking for your next opportunity or searching
              for the perfect candidate, JobPortal has you covered.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 text-base" asChild>
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
